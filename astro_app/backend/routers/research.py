from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import shutil
import os
import uuid
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

router = APIRouter(tags=["research"])

# Setup Vector Store (Persistent)
PERSIST_DIRECTORY = "./chroma_db"

# Lazy initialization to avoid blocking server startup
_embedding_function = None

def get_embedding_function():
    global _embedding_function
    if _embedding_function is None:
        print("🔄 Loading embedding model (first-time only, this may take a moment)...")
        _embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        print("✅ Embedding model loaded!")
    return _embedding_function

def get_vector_store():
    return Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=get_embedding_function())

class SearchResult(BaseModel):
    content: str
    metadata: dict
    score: float

class SearchRequest(BaseModel):
    query: str
    k: int = 5

@router.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    """
    Ingest a PDF document, split it into chunks, and index it in the vector store.
    """
    # Save temp file
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Load and Split
        loader = PyPDFLoader(temp_file_path)
        documents = loader.load()
        
        # Split text into chunks (approx 1 paragraph)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        
        if not chunks:
            return {"filename": file.filename, "chunks_added": 0, "status": "empty"}

        # Add metadata
        for chunk in chunks:
            chunk.metadata["source"] = file.filename
            chunk.metadata["upload_id"] = str(uuid.uuid4())
            
        # Add to Vector Store
        db = get_vector_store()
        db.add_documents(chunks)
        # Chroma automatically persists in newer versions, but we can allow it to handle
        
        return {"filename": file.filename, "chunks_added": len(chunks), "status": "success"}
    except Exception as e:
        print(f"Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.post("/search", response_model=List[SearchResult])
async def search_documents(request: SearchRequest):
    """
    Perform a semantic search on indexed documents.
    """
    try:
        db = get_vector_store()
        # similarity_search_with_score: Lower score represents more similarity (L2 distance) by default in Chroma
        # but results are usually sorted. 
        results = db.similarity_search_with_score(request.query, k=request.k)
        
        response = []
        for doc, score in results:
            response.append(SearchResult(
                content=doc.page_content,
                metadata=doc.metadata,
                score=score
            ))
        return response
    except Exception as e:
        print(f"Search Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph")
async def get_knowledge_graph():
    """
    Generate a simple Knowledge Graph connecting Documents to Astrological Concepts.
    """
    try:
        db = get_vector_store()
        # Fetch all documents (limit to 100 for performance/MVP)
        # Chroma .get() returns dict with 'ids', 'metadatas', 'documents'
        data = db.get(limit=100)
        
        nodes = []
        links = []
        existing_nodes = set()
        
        # Astrological Concepts to scan for
        concepts = [
            "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu",
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
            "Dasha", "Bhukti", "Antara", "Transit", "Nakshatra", "Retrograde", "Combust", "Exalted", "Debilitated"
        ]

        def add_node(id, label, type):
            if id not in existing_nodes:
                nodes.append({"id": id, "label": label, "type": type})
                existing_nodes.add(id)

        doc_texts = data['documents']
        metadatas = data['metadatas']
        
        if not doc_texts:
            return {"nodes": [], "links": []}

        for i, text in enumerate(doc_texts):
            source = metadatas[i].get("source", "Unknown Document")
            doc_id = f"doc_{i}"
            
            # Add Document Node
            add_node(doc_id, source, "document")
            
            # Scan for concepts
            for concept in concepts:
                if concept in text:
                    # Add Concept Node
                    concept_id = f"concept_{concept}"
                    add_node(concept_id, concept, "concept")
                    
                    # Add Link (Document -> Concept)
                    links.append({"source": doc_id, "target": concept_id})

        return {"nodes": nodes, "links": links}

    except Exception as e:
        print(f"Graph Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class AskRequest(BaseModel):
    question: str
    k: int = 5

class AskResponse(BaseModel):
    answer: str
    sources: List[str]

@router.post("/ask", response_model=AskResponse)
async def ask_knowledge_base(request: AskRequest):
    """
    RAG-based Q&A: Retrieve relevant context and generate an AI answer.
    """
    import os
    
    try:
        # 1. Retrieve relevant documents
        db = get_vector_store()
        results = db.similarity_search(request.question, k=request.k)
        
        if not results:
            return AskResponse(
                answer="No relevant information found in the knowledge base. Please upload documents first.",
                sources=[]
            )
        
        # 2. Build context from retrieved documents
        context_parts = []
        sources = set()
        for doc in results:
            context_parts.append(doc.page_content)
            if doc.metadata.get("source"):
                sources.add(doc.metadata["source"])
        
        context = "\n\n---\n\n".join(context_parts)
        
        # 3. Generate AI answer using Gemini (or fallback)
        prompt = f"""You are an expert Vedic astrologer and KP astrology specialist. Based on the following context from classical texts and astrological literature, answer the user's question.

CONTEXT FROM KNOWLEDGE BASE:
{context}

USER QUESTION: {request.question}

Please provide a clear, accurate answer based on the context. If the context doesn't contain enough information to fully answer the question, say so. Cite specific concepts or rules when applicable."""

        gemini_key = os.getenv("GEMINI_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        
        if gemini_key:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('models/gemini-flash-latest')
            response = model.generate_content(prompt)
            answer = response.text
        elif openai_key:
            import openai
            openai.api_key = openai_key
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            answer = response.choices[0].message.content
        else:
            # Mock response if no API keys
            answer = f"[AI Summary - No API Key Configured]\n\nBased on your uploaded documents, here's what I found related to '{request.question}':\n\n" + context[:500] + "...\n\n(Configure GEMINI_API_KEY or OPENAI_API_KEY in .env for full AI responses)"
        
        return AskResponse(answer=answer, sources=list(sources))
        
    except Exception as e:
        print(f"Ask Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
