from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import json
from datetime import datetime

from astro_app.backend.database import get_db
from astro_app.backend.models import ChatMessage, User
from astro_app.backend.auth.router import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat History"])

# Schemas
class MessageCreate(BaseModel):
    role: str
    content: str
    html_content: Optional[str] = None
    session_id: Optional[str] = None
    suggestions: Optional[List[str]] = []

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    html_content: Optional[str]
    timestamp: datetime
    session_id: Optional[str]
    suggestions: Optional[List[str]]

    class Config:
        orm_mode = True

@router.get("/history", response_model=List[MessageResponse])
def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    
    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)
        
    messages = query.order_by(ChatMessage.timestamp.asc()).limit(limit).all()
    
    # Parse suggestions JSON string back to list
    result = []
    for msg in messages:
        suggestions_list = []
        if msg.suggestions:
            try:
                suggestions_list = json.loads(msg.suggestions)
            except:
                suggestions_list = []
        
        result.append(MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            html_content=msg.html_content,
            timestamp=msg.timestamp,
            session_id=msg.session_id,
            suggestions=suggestions_list
        ))
        
    return result

@router.post("/message", response_model=MessageResponse)
def save_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    suggestions_json = json.dumps(message.suggestions) if message.suggestions else None
    
    db_msg = ChatMessage(
        user_id=current_user.id,
        role=message.role,
        content=message.content,
        html_content=message.html_content,
        session_id=message.session_id,
        suggestions=suggestions_json
    )
    
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    return MessageResponse(
        id=db_msg.id,
        role=db_msg.role,
        content=db_msg.content,
        html_content=db_msg.html_content,
        timestamp=db_msg.timestamp,
        session_id=db_msg.session_id,
        suggestions=message.suggestions
    )

@router.delete("/history")
def clear_history(
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    
    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)
    
    deleted_count = query.delete()
    db.commit()
    return {"status": "success", "deleted_count": deleted_count}

class SessionResponse(BaseModel):
    session_id: str
    title: str
    timestamp: datetime
    message_count: int

    class Config:
        orm_mode = True

@router.get("/sessions", response_model=List[SessionResponse])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a list of unique chat sessions for the current user.
    Each session includes a preview title (first user message, truncated) and timestamp.
    """
    from sqlalchemy import func, distinct
    
    # Get distinct session_ids with their earliest timestamp and first message
    sessions_query = (
        db.query(
            ChatMessage.session_id,
            func.min(ChatMessage.timestamp).label('timestamp'),
            func.count(ChatMessage.id).label('message_count')
        )
        .filter(ChatMessage.user_id == current_user.id)
        .filter(ChatMessage.session_id.isnot(None))
        .group_by(ChatMessage.session_id)
        .order_by(func.min(ChatMessage.timestamp).desc())
    )
    
    sessions = sessions_query.all()
    
    result = []
    for session in sessions:
        # Get the first user message for this session as the title
        first_msg = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == current_user.id)
            .filter(ChatMessage.session_id == session.session_id)
            .filter(ChatMessage.role == 'user')
            .order_by(ChatMessage.timestamp.asc())
            .first()
        )
        
        title = "New Chat"
        if first_msg:
            # Truncate to 50 characters
            title = first_msg.content[:50] + "..." if len(first_msg.content) > 50 else first_msg.content
        
        result.append(SessionResponse(
            session_id=session.session_id,
            title=title,
            timestamp=session.timestamp,
            message_count=session.message_count
        ))
    
    return result
