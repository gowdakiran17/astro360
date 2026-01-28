
"""
Question Processor
Analyzes user input to detect intent, category, and entities using keyword heuristics.
"""
import re

class QuestionAnalyzer:
    def __init__(self):
        self.category_keywords = {
            "career": [
                "job", "career", "work", "business", "promotion", 
                "office", "boss", "colleague", "salary", "interview",
                "employment", "profession", "occupation", "entrepreneur",
                "startup", "company", "corporate", "resign", "transfer"
            ],
            "relationships": [
                "love", "marriage", "relationship", "partner", "spouse",
                "boyfriend", "girlfriend", "dating", "wedding", "divorce",
                "separation", "affair", "romance", "compatibility", "soulmate",
                "engagement", "husband", "wife", "breakup", "reunion"
            ],
            "finance": [
                "money", "wealth", "income", "salary", "profit", "loss",
                "investment", "stock", "trading", "business", "loan",
                "debt", "savings", "property", "inheritance", "lottery",
                "financial", "economy", "rich", "poor", "bankrupt"
            ],
            "health": [
                "health", "disease", "illness", "sick", "pain", "injury",
                "hospital", "doctor", "surgery", "medicine", "treatment",
                "recovery", "wellness", "fitness", "diet", "mental health",
                "anxiety", "depression", "stress", "healing"
            ],
            "education": [
                "study", "education", "exam", "test", "school", "college",
                "university", "degree", "course", "learning", "student",
                "admission", "scholarship", "grade", "marks", "knowledge"
            ],
            "family": [
                "family", "mother", "father", "parents", "children", "son",
                "daughter", "brother", "sister", "siblings", "relatives",
                "grandfather", "grandmother", "uncle", "aunt", "family issues"
            ],
            "spirituality": [
                "spiritual", "meditation", "god", "temple", "prayer",
                "mantra", "puja", "moksha", "karma", "dharma", "soul",
                "enlightenment", "guru", "yoga", "devotion"
            ],
            "legal": [
                "legal", "court", "case", "lawsuit", "lawyer", "judge",
                "litigation", "dispute", "settlement", "verdict", "police"
            ],
            "travel": [
                "travel", "foreign", "abroad", "relocation", "migration",
                "settlement", "visa", "immigration", "journey", "trip"
            ],
            "property": [
                "property", "house", "home", "land", "real estate",
                "construction", "purchase", "sell", "rent", "vehicle"
            ]
        }
        
        self.intent_patterns = {
            "timing": [
                r"when (will|should|can|is)",
                r"what time",
                r"which (date|month|year|period)",
                r"best time",
                r"auspicious (time|date|period)",
                r"muhurat"
            ],
            "prediction": [
                r"will (i|it|there)",
                r"is it going to",
                r"what will happen",
                r"future of",
                r"outcome of"
            ],
            "decision": [
                r"should i",
                r"is it good to",
                r"can i",
                r"advice on",
                r"what do you suggest",
                r"which (option|choice)"
            ],
            "explanation": [
                r"why (am|is|does)",
                r"what does .* mean",
                r"explain",
                r"tell me about",
                r"what is my"
            ],
            "compatibility": [
                r"compatible",
                r"match",
                r"suitable",
                r"right (person|partner)",
                r"good for me"
            ],
            "remedy": [
                r"remedy",
                r"solution",
                r"how to (improve|fix|solve)",
                r"gemstone",
                r"mantra",
                r"what can i do"
            ],
            "general_query": [
                r"tell me about my",
                r"what about my",
                r"describe my",
                r"analyze my"
            ]
        }
        
        self.entity_extractors = {
            "person": ["mother", "father", "spouse", "partner", "boss", "child"],
            "timeframe": ["today", "tomorrow", "this week", "this month", "this year", "2026"],
            "specific_planet": ["jupiter", "saturn", "mars", "venus", "mercury", "sun", "moon"],
            "specific_house": ["7th house", "10th house", "2nd house", "5th house"],
            "dasha_period": ["mahadasha", "antardasha", "dasha"]
        }
    
    def analyze(self, question):
        """Main analysis function"""
        question_lower = question.lower()
        
        # 1. Detect category
        categories = self._detect_categories(question_lower)
        
        # 2. Detect intent
        intent = self._detect_intent(question_lower)
        
        # 3. Extract entities
        entities = self._extract_entities(question_lower)
        
        # 4. Assess complexity
        complexity = self._assess_complexity(question_lower, categories, intent)
        
        # 5. Determine sentiment/emotion
        sentiment = self._detect_sentiment(question_lower)
        
        # 6. Check for multiple questions
        is_compound = self._check_compound_question(question)
        
        return {
            "original_question": question,
            "categories": categories,
            "primary_category": categories[0] if categories else "general",
            "intent": intent,
            "entities": entities,
            "complexity": complexity,
            "sentiment": sentiment,
            "is_compound": is_compound,
            "requires_timing": "timing" in intent,
            "requires_remedies": "remedy" in intent or sentiment == "anxious"
        }
    
    def _detect_categories(self, question):
        """Detect relevant categories from question"""
        detected = []
        scores = {}
        
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in question)
            if score > 0:
                scores[category] = score
        
        # Sort by score
        sorted_categories = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        detected = [cat for cat, score in sorted_categories]
        
        return detected if detected else ["general"]
    
    def _detect_intent(self, question):
        """Detect user intent"""
        
        detected_intents = []
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, question):
                    detected_intents.append(intent)
                    break
        
        return detected_intents if detected_intents else ["general_query"]
    
    def _extract_entities(self, question):
        """Extract specific entities mentioned"""
        entities = {
            "persons": [],
            "timeframes": [],
            "planets": [],
            "houses": [],
            "other": []
        }
        
        for person in self.entity_extractors["person"]:
            if person in question:
                entities["persons"].append(person)
        
        for time in self.entity_extractors["timeframe"]:
            if time in question:
                entities["timeframes"].append(time)
        
        for planet in self.entity_extractors["specific_planet"]:
            if planet in question:
                entities["planets"].append(planet)
        
        for house in self.entity_extractors["specific_house"]:
            if house in question:
                entities["houses"].append(house)
        
        return entities
    
    def _assess_complexity(self, question, categories, intent):
        """Assess question complexity"""
        complexity_score = 0
        
        # Multiple categories increase complexity
        complexity_score += len(categories) * 10
        
        # Multiple intents increase complexity
        complexity_score += len(intent) * 15
        
        # Question length
        word_count = len(question.split())
        if word_count > 20:
            complexity_score += 20
        elif word_count > 10:
            complexity_score += 10
        
        # Specific keywords that indicate complexity
        complex_keywords = ["why", "how", "explain", "detail", "analyze", "compare"]
        complexity_score += sum(5 for kw in complex_keywords if kw in question)
        
        # Classification
        if complexity_score < 25:
            return "simple"
        elif complexity_score < 50:
            return "moderate"
        else:
            return "complex"
    
    def _detect_sentiment(self, question):
        """Detect emotional tone"""
        anxious_words = ["worried", "concerned", "afraid", "scared", "anxious", "nervous"]
        hopeful_words = ["hope", "wish", "want", "desire", "dream"]
        urgent_words = ["urgent", "immediately", "asap", "quickly", "soon", "now"]
        confused_words = ["confused", "don't understand", "unclear", "not sure"]
        
        if any(word in question for word in anxious_words):
            return "anxious"
        elif any(word in question for word in urgent_words):
            return "urgent"
        elif any(word in question for word in confused_words):
            return "confused"
        elif any(word in question for word in hopeful_words):
            return "hopeful"
        else:
            return "neutral"
    
    def _check_compound_question(self, question):
        """Check if question contains multiple sub-questions"""
        question_markers = ["?", " and ", " also ", " additionally ", " moreover "]
        count = sum(1 for marker in question_markers if marker in question.lower())
        return count > 2
