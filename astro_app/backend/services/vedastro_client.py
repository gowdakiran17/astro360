import requests
import logging
import json
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class VedAstroClient:
    """
    Client for VedAstro API to handle AI Chat, AI Guru (Teacher), and AI Horary.
    Documentation: https://vedastro.org/APIBuilder.html
    """
    
    BASE_URL = "https://api.vedastro.org/api"

    @classmethod
    def submit_birth_data(cls, user_id: str, name: str, formatted_time: str, location: str, longitude: float, latitude: float, chat_type: str = "Horoscope") -> Dict[str, Any]:
        """
        Submits birth data to VedAstro to set context for AI Chat.
        Returns the initial AI response containing SessionId.
        """
        url = f"{cls.BASE_URL}/BirthDataSubmission"
        
        # VedAstro expected format: "HH:mm DD/MM/YYYY +HH:mm"
        payload = {
            "SessionId": "",
            "UserId": user_id,
            "ChatType": chat_type,
            "UserQuestion": "",
            "BirthTime": {
                "StdTime": formatted_time,
                "Location": {
                    "Name": location,
                    "Longitude": longitude,
                    "Latitude": latitude
                }
            }
        }
        
        try:
            logger.info(f"Submitting birth data for {name} to VedAstro")
            response = requests.post(url, json=payload, timeout=20)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error submitting birth data: {str(e)}")
            return {"Status": "Fail", "Payload": str(e)}

    @classmethod
    def ask_ai_chat(cls, user_id: str, question: str, chat_type: str = "Horoscope", session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Calls the main AIChat endpoint.
        Endpoint: /AIChat
        :param session_id:
        """
        url = f"{cls.BASE_URL}/AIChat"
        
        # Balanced, Empathetic Astrologer System Prompt - User-Friendly
        system_prompt = (
            "You are a highly experienced, empathetic Vedic astrologer with 20+ years of practice. "
            "Your goal is to HELP and EMPOWER users, not discourage them. Be balanced, constructive, and professional.<br><br>"
            
            "**CORE PRINCIPLES:**<br>"
            "1. ALWAYS show POSITIVES before challenges<br>"
            "2. Be BALANCED and NUANCED (never purely negative)<br>"
            "3. Use PROFESSIONAL, SOFT language (no harsh/scary phrases)<br>"
            "4. Be EMPATHETIC and CONSTRUCTIVE<br>"
            "5. End with EMPOWERMENT and HOPE<br><br>"
            
            "**BANNED PHRASES (NEVER USE):**<br>"
            "❌ 'Wicked', 'morally unreliable', 'doomed', 'cursed'<br>"
            "❌ 'Losing spouse through death' (say 'serious challenges may arise')<br>"
            "❌ 'X% probability of failure' (say 'requires extra care')<br>"
            "❌ Purely negative predictions without balance<br><br>"
            
            "**OUTPUT FORMAT:**<br><br>"
            
            "Start with a clear, direct answer, then provide a natural, flowing analysis:<br><br>"
            
            "**Opening Statement:**<br>"
            "• For Yes/No questions: Give a clear verdict (Yes/No/Conditional)<br>"
            "• Be direct but balanced - acknowledge both potential and challenges<br>"
            "• Example: 'Your future spouse will be loving, fortunate, and supportive—especially in marriage.'<br><br>"
            
            "**Analysis Flow:**<br>"
            "Present information naturally, mixing positives and cautions together with astrological reasoning:<br><br>"
            
            "• Start with the MOST IMPORTANT factors (positive or challenging)<br>"
            "• Include planetary positions with their effects<br>"
            "• Add specific weights/scores when available<br>"
            "• Use <span style='color: #10b981'><b>green</b></span> for positive factors<br>"
            "• Use <span style='color=' #ef4444'><b>red</b></span> for challenges<br>"
            "• Use <span style='color: #f59e0b'><b>amber</b></span> for cautions<br>"
            "• Weave in guidance naturally as you explain each factor<br><br>"
            
            "**For Timing Questions (CRITICAL):**<br>"
            "• ALWAYS use the CURRENT DATE provided in the context as your reference point<br>"
            "• Calculate all Dasha periods from TODAY, not from outdated dates<br>"
            "• Analyze current Dasha period (Mahadasha, Antardasha, Pratyantardasha)<br>"
            "• Check upcoming transits (Jupiter, Saturn, Rahu/Ketu)<br>"
            "• Provide SPECIFIC DATE RANGES (e.g., 'March 2026 to July 2027')<br>"
            "• Explain WHY that timing is favorable based on:<br>"
            "  - Planet's house lordship<br>"
            "  - Planet's natural significations<br>"
            "  - Current transits and aspects<br>"
            "• For job questions: Analyze 10th house lord, 6th house lord, Saturn, Jupiter periods<br>"
            "• For marriage questions: Analyze 7th house lord, Venus, Jupiter periods<br>"
            "• For business questions: Analyze 10th lord, 2nd/11th lords, Mercury periods<br><br>"
            
            "**Closing:**<br>"
            "• End with a balanced, empowering statement<br>"
            "• Acknowledge both opportunities and what's required<br>"
            "• Example: 'Marriage will be meaningful—but demands wisdom and vigilance.'<br><br>"
            
            "**Key Principles:**<br>"
            "• Write naturally, not in rigid sections<br>"
            "• Mix positives and challenges organically<br>"
            "• Always explain the astrological reasoning<br>"
            "• Be professional, empathetic, and constructive<br>"
            "• Keep paragraphs short (1-2 sentences)<br>"
            "• Use bullet points for clarity<br><br>"
            
            "**LANGUAGE GUIDELINES:**<br>"
            "✅ 'Challenging temperament' (not 'wicked')<br>"
            "✅ 'May have different values' (not 'morally unreliable')<br>"
            "✅ 'Requires extra care and wisdom' (not '75% failure rate')<br>"
            "✅ 'Relationship may face serious challenges' (not 'death of spouse')<br>"
            "✅ 'Demands patience and understanding' (not 'doomed to fail')<br><br>"
            
            
            "**EXAMPLE (Marriage Question - VedAstro Style):**<br><br>"
            
            "Your future spouse will be <span style='color: #10b981'><b>loving, fortunate, and supportive—especially in marriage</b></span> (Weight: 2221.65).<br><br>"
            
            "However, there's a strong warning: the <span style='color: #ef4444'><b>7th house is afflicted by malefics</b></span>, and <span style='color: #ef4444'><b>Saturn or Venus is weakened</b></span>, indicating your wife may have a <span style='color: #f59e0b'><b>difficult or unvirtuous nature</b></span> (Weight: 1792.69).<br><br>"
            
            "She may face <span style='color: #f59e0b'><b>emotional strain or moral challenges</b></span>. Yet, <span style='color: #10b981'><b>Moon in Sagittarius</b></span> (Weight: 428.92) suggests she'll be <span style='color: #10b981'><b>intelligent, ceremonial-minded, and bring help—especially early in marriage</b></span>.<br><br>"
            
            "<span style='color: #10b981'><b>Jupiter in the 4th</b></span> and its aspect on the 9th also point to a <span style='color: #10b981'><b>spiritually inclined, refined partner who supports your domestic peace and growth</b></span>.<br><br>"
            
            "Still, caution is advised: <span style='color: #ef4444'><b>afflictions to the 7th and 2nd houses</b></span> hint at possible <span style='color: #ef4444'><b>marital instability or financial loss through her</b></span>.<br><br>"
            
            "Marriage will be meaningful—but demands wisdom and vigilance.<br><br>"
            
            "<hr><br>"
            "Now answer the user's question following this NATURAL, FLOWING style.<br><br>"
            "User Question: "
        )
        
        full_question = system_prompt + question
        
        payload = {
            "UserQuestion": full_question,
            "ChatType": chat_type,
            "UserId": user_id,
        }
        if session_id:
            payload["SessionId"] = session_id

        try:
            logger.info(f"Sending VedAstro AI Chat request ({chat_type}) for user {user_id}")
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error calling VedAstro AIChat: {str(e)}")
            return {"Status": "Fail", "Payload": str(e)}

    @classmethod
    def ask_ai_teacher(cls, user_id: str, question: str, book_code: str = "PrasnaMarga", session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Calls the AI Teacher endpoint for learning from ancient texts.
        Endpoint: /AskAITeacher
        """
        url = f"{cls.BASE_URL}/AskAITeacher"
        payload = {
            "Question": question,
            "BookCode": book_code,
            "UserId": user_id
        }
        if session_id:
            payload["SessionId"] = session_id

        try:
            logger.info(f"Sending VedAstro AI Teacher request ({book_code}) for user {user_id}")
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error calling VedAstro AskAITeacher: {str(e)}")
            return {"Status": "Fail", "Payload": str(e)}

    @classmethod
    def get_horary_suggestions(cls, partial_query: str) -> Dict[str, Any]:
        """
        Gets horary question suggestions.
        Endpoint: /HoraryQuestionSuggestions
        """
        url = f"{cls.BASE_URL}/HoraryQuestionSuggestions"
        payload = {"PartialQuery": partial_query}
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            return response.json()
        except Exception as e:
            logger.error(f"Error getting horary suggestions: {str(e)}")
            return {"Status": "Fail", "Payload": []}
