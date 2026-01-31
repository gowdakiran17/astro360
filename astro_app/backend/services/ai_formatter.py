"""
VedAstro-Style AI Response Formatter
Formats AI responses with color-coded insights and structured planetary analysis
"""

import re
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

# VedAstro-style system prompt
VEDASTRO_SYSTEM_PROMPT = """You are an expert Vedic astrologer providing detailed, structured analysis in the style of VedAstro.

RESPONSE FORMAT RULES:
1. Start with a clear, direct answer to the question (bold the key verdict)
2. Provide specific planetary analysis with:
   - Planet name + house position (e.g., "Saturn in the 11th house")
   - Specific effects and interpretations
   - Mark POSITIVE traits/outcomes with asterisks: *long-term vision, patience*
   - Mark NEGATIVE traits/outcomes with underscores: _impulsive, speculative_
3. Include astrological reasoning (houses, aspects, yogas)
4. End with actionable recommendations or alternatives
5. Ask if they want deeper guidance

STYLE GUIDELINES:
- Be specific and detailed with planetary positions
- Use technical terms with clear explanations
- Highlight key points (positive with *, negative with _)
- Provide practical, actionable advice
- Reference specific house placements
- Include age-based timing when relevant
- Mention planetary strengths/weights when significant

EXAMPLE OUTPUT STRUCTURE:
"You have **strong potential** for success in stock trading — but it demands discipline, continuous learning, and emotional control.

**Saturn in the 11th house** supports *long-term vision, patience, and strategic planning* — key traits for sustainable gains through careful investing rather than impulsive speculation.

**Rahu in the 11th** enhances your *intuition and insight into foreign markets or emerging trends*, offering opportunities for unexpected wealth when managed with clear boundaries and risk awareness.

**Mercury in Aries** can lead to _quick reactions and speculative urge_ — caution is needed to avoid emotional trades or chasing short-term profits without proper analysis.

**Venus in the 12th house** suggests _hidden risks or over-optimism_, making robust systems, stop-losses, and regular reviews essential for protection.

Success is very possible — especially after age **30**, when maturity and experience amplify your strengths. With consistent mentorship, structured routines, and mindful practice, your journey in trading can be both rewarding and resilient."

Remember: Be encouraging but honest. Provide specific planetary reasoning. Offer alternatives when outcomes are challenging.
"""


class AIResponseFormatter:
    """Formats AI responses with VedAstro-style color coding and structure"""
    
    # Keywords to highlight in different colors
    POSITIVE_KEYWORDS = [
        'success', 'strong potential', 'suited', 'steady', 'ethical',
        'teaching', 'government service', 'spiritual', 'caution', 'delay',
        'protection', 'long-term vision', 'patience', 'strategic planning',
        'intuition', 'insight', 'opportunities', 'wealth', 'analytical thinking',
        'communication skills', 'adaptability', 'research', 'strategy',
        'maturity', 'experience', 'rewarding', 'resilient', 'sustainable',
        'careful', 'clear boundaries', 'risk awareness', 'mentorship',
        'structured routines', 'mindful practice', 'possible', 'amplify',
        'strengths', 'favorable', 'beneficial', 'auspicious', 'fortunate',
        'gains', 'profit', 'growth', 'expansion', 'wisdom', 'knowledge'
    ]
    
    NEGATIVE_KEYWORDS = [
        'unlikely', 'impulsive', 'speculative', 'unscrupulous', 'losses',
        'deception', 'poor judgment', 'unstable', 'short-lived', 'stress',
        'loss', 'compromise', 'risk', 'financial risk', 'quick reactions',
        'speculative urge', 'emotional trades', 'short-term profits',
        'hidden risks', 'over-optimism', 'unfair', 'unstable earnings',
        'moral compromise', 'challenges', 'obstacles', 'delays', 'difficulties',
        'struggles', 'setbacks', 'adversity', 'conflict', 'tension',
        'anxiety', 'confusion', 'doubt', 'fear', 'weakness'
    ]
    
    @staticmethod
    def format_for_html(response: str, include_planetary_context: bool = True) -> str:
        """
        Format AI response with HTML color coding for web display
        
        Args:
            response: Raw AI response text
            include_planetary_context: Whether to highlight planetary positions
            
        Returns:
            HTML-formatted response with color coding
        """
        formatted = response
        
        # Convert markdown-style emphasis to HTML
        # *positive text* -> green
        formatted = re.sub(
            r'\*([^*]+)\*',
            r'<span class="text-green-600 dark:text-green-400 font-medium">\1</span>',
            formatted
        )
        
        # _negative text_ -> red
        formatted = re.sub(
            r'_([^_]+)_',
            r'<span class="text-red-600 dark:text-red-400 font-medium">\1</span>',
            formatted
        )
        
        # **bold text** -> bold
        formatted = re.sub(
            r'\*\*([^*]+)\*\*',
            r'<strong class="font-bold text-slate-900 dark:text-white">\1</strong>',
            formatted
        )
        
        # Highlight planetary positions (e.g., "Saturn in the 11th house")
        if include_planetary_context:
            planet_pattern = r'\b(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Uranus|Neptune|Pluto)\s+in\s+(the\s+)?(\d+(?:st|nd|rd|th))?\s*(house|sign|[A-Z][a-z]+)\b'
            formatted = re.sub(
                planet_pattern,
                r'<span class="font-semibold text-indigo-600 dark:text-indigo-400">\g<0></span>',
                formatted
            )
        
        # Convert line breaks to paragraphs
        paragraphs = formatted.split('\n\n')
        formatted = ''.join([f'<p class="mb-3">{p.strip()}</p>' for p in paragraphs if p.strip()])
        
        return formatted
    
    @staticmethod
    def build_astrological_context(chart_data: Dict[str, Any]) -> str:
        """
        Build comprehensive astrological context string for AI prompt
        
        Args:
            chart_data: Birth chart data with planets, houses, etc.
            
        Returns:
            Formatted context string
        """
        if not chart_data:
            return "No chart data available."
        
        from datetime import datetime
        
        context_parts = []
        
        # Add current date and time (CRITICAL for timing predictions)
        current_datetime = datetime.now()
        context_parts.append("CURRENT DATE & TIME:")
        context_parts.append(f"- Today: {current_datetime.strftime('%d %B %Y (%A)')}")
        context_parts.append(f"- Current Time: {current_datetime.strftime('%I:%M %p')}")
        context_parts.append(f"- Year: {current_datetime.year}")
        context_parts.append("")
        
        # Add planetary positions
        if 'planets' in chart_data:
            context_parts.append("PLANETARY POSITIONS:")
            for planet in chart_data['planets']:
                name = planet.get('name', 'Unknown')
                sign = planet.get('sign', 'Unknown')
                house = planet.get('house', 0)
                degree = planet.get('degree', 0)
                
                context_parts.append(
                    f"- {name} in {sign} (House {house}, {degree:.2f}°)"
                )
        
        # Add house cusps
        if 'houses' in chart_data:
            context_parts.append("\nHOUSE CUSPS:")
            for i, cusp in enumerate(chart_data['houses'][:12], 1):
                context_parts.append(f"- House {i}: {cusp.get('sign', 'Unknown')}")
        
        # Add ascendant
        if 'ascendant' in chart_data:
            asc = chart_data['ascendant']
            context_parts.append(f"\nASCENDANT: {asc.get('sign', 'Unknown')} ({asc.get('degree', 0):.2f}°)")
        
        # Add current dasha if available
        if 'current_dasha' in chart_data:
            dasha = chart_data['current_dasha']
            context_parts.append(f"\nCURRENT DASHA: {dasha.get('mahadasha', 'Unknown')} / {dasha.get('antardasha', 'Unknown')}")
        
        return '\n'.join(context_parts)
    
    @staticmethod
    def enhance_prompt_with_context(user_question: str, chart_data: Dict[str, Any]) -> str:
        """
        Enhance user question with astrological context
        
        Args:
            user_question: User's original question
            chart_data: Birth chart data
            
        Returns:
            Enhanced prompt with context
        """
        from datetime import datetime
        
        context = AIResponseFormatter.build_astrological_context(chart_data)
        current_date = datetime.now().strftime('%d %B %Y')
        
        enhanced_prompt = f"""BIRTH CHART CONTEXT:
{context}

USER QUESTION: {user_question}

IMPORTANT INSTRUCTIONS:
1. Use the CURRENT DATE ({current_date}) as your reference point for all timing predictions
2. When analyzing Dasha periods, calculate from TODAY, not from outdated dates
3. For "when will" questions, provide specific future date ranges based on upcoming Dasha periods
4. Mark positive traits with asterisks (*) and negative traits with underscores (_) for color coding

Please provide a detailed VedAstro-style analysis addressing this question."""
        
        return enhanced_prompt
    
    @staticmethod
    def extract_follow_up_questions(response: str) -> List[str]:
        """
        Extract potential follow-up questions from response
        
        Args:
            response: AI response text
            
        Returns:
            List of follow-up questions
        """
        # Look for questions in the response
        questions = re.findall(r'([^.!?]*\?)', response)
        
        # Filter out the main question and keep only follow-ups
        follow_ups = [q.strip() for q in questions if len(q.strip()) > 10]
        
        return follow_ups[:3]  # Return max 3 follow-ups


# Convenience function for quick formatting
def format_vedastro_response(response: str) -> Dict[str, Any]:
    """
    Quick format function for VedAstro-style responses
    
    Args:
        response: Raw AI response
        
    Returns:
        Dict with formatted response and metadata
    """
    formatter = AIResponseFormatter()
    
    return {
        'text': response,
        'html': formatter.format_for_html(response),
        'follow_up_questions': formatter.extract_follow_up_questions(response)
    }
