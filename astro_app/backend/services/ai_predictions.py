"""
AI Prediction Service
Generates natural language predictions using AI
This is the ONLY module that uses AI in the entire system

Supports:
- Google Gemini AI (recommended)
- OpenAI GPT-4
"""
from typing import Dict, List, Any, Optional
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class AIPredictionService:
    """
    Generate astrological predictions using AI
    Supports both Google Gemini and OpenAI GPT-4
    
    Environment Variables:
        GEMINI_API_KEY: Google Gemini API key (preferred)
        OPENAI_API_KEY: OpenAI API key (fallback)
        AI_PROVIDER: Force specific provider ('gemini' or 'openai')
    """
    
    def __init__(self):
        """Initialize AI service with automatic provider selection"""
        self.provider = None
        self.client = None
        self.enabled = False
        
        # Check for forced provider
        forced_provider = os.getenv('AI_PROVIDER', '').lower()
        
        # Try Gemini first (recommended)
        gemini_key = os.getenv('GEMINI_API_KEY')
        openai_key = os.getenv('OPENAI_API_KEY')
        
        if forced_provider == 'gemini' or (gemini_key and forced_provider != 'openai'):
            self._init_gemini(gemini_key)
        elif forced_provider == 'openai' or openai_key:
            self._init_openai(openai_key)
        
        if not self.enabled:
            logger.info("AI Prediction Service disabled (no API key found)")
    
    def _init_gemini(self, api_key: Optional[str]):
        """Initialize Google Gemini"""
        if not api_key:
            logger.warning("GEMINI_API_KEY not found")
            return
        
        try:
            # Try new package first
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                self.client = client
                self.model_name = 'gemini-2.0-flash-exp'
                self.provider = 'gemini'
                self.enabled = True
                logger.info("✅ AI Service initialized with Google Gemini (google-genai)")
                return
            except ImportError:
                pass
            
            # Fallback to old package
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            # Use gemini-2.5-flash (stable version)
            self.client = genai.GenerativeModel('gemini-2.5-flash')
            self.model_name = 'gemini-2.5-flash'
            self.provider = 'gemini'
            self.enabled = True
            logger.info("✅ AI Service initialized with Google Gemini (generativeai)")
        except ImportError:
            logger.warning("google-generativeai or google-genai package not installed. Install with: pip install google-genai")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
    
    def _init_openai(self, api_key: Optional[str]):
        """Initialize OpenAI"""
        if not api_key:
            logger.warning("OPENAI_API_KEY not found")
            return
        
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=api_key)
            self.provider = 'openai'
            self.enabled = True
            logger.info("✅ AI Service initialized with OpenAI GPT-4")
        except ImportError:
            logger.warning("openai package not installed. Install with: pip install openai")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI: {e}")
    
    def generate_period_predictions(
        self,
        context: Dict[str, Any],
        birth_details: Dict[str, Any],
        events: List[Dict[str, Any]],
        daily_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive predictions for the period
        
        Args:
            context: Summary statistics (average score, trends, etc.)
            birth_details: User's birth information
            events: All detected astrological events
            daily_results: Daily analysis results
        
        Returns:
            Dict with predictions for different life areas
        """
        if not self.enabled:
            return self._generate_rule_based_predictions(context, events)
        
        try:
            # Build prompt
            prompt = self._build_prompt(context, birth_details, events, daily_results)
            
            # Call appropriate AI provider
            if self.provider == 'gemini':
                response_text = self._call_gemini(prompt)
                model_name = getattr(self, 'model_name', 'gemini-1.5-flash')
            else:  # openai
                response_text = self._call_openai(prompt)
                model_name = 'gpt-4'
            
            # Parse response
            predictions = self._parse_ai_response(response_text)
            predictions['generated_by'] = 'ai'
            predictions['provider'] = self.provider
            predictions['model'] = model_name
            predictions['confidence'] = 0.85
            
            return predictions
            
        except Exception as e:
            logger.error(f"AI prediction failed: {e}")
            # Fallback to rule-based
            return self._generate_rule_based_predictions(context, events)
    
    def _call_gemini(self, prompt: str) -> str:
        """Call Google Gemini API"""
        full_prompt = f"{self._get_system_prompt()}\n\n{prompt}"
        
        # Check if using new google-genai package
        if hasattr(self.client, 'models'):
            # New package
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt
            )
            return response.text
        else:
            # Old package
            response = self.client.generate_content(full_prompt)
            return response.text
    
    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1200
        )
        return response.choices[0].message.content
    
    def _get_system_prompt(self) -> str:
        """System prompt for AI"""
        return """You are an expert Vedic astrologer with deep knowledge of classical texts.

Your role:
- Provide personalized astrological predictions based on the data provided
- Be specific and actionable in your advice
- Balance optimism with realism
- Reference specific astrological factors when relevant
- Suggest practical remedies based on Vedic tradition

Guidelines:
- Base predictions ONLY on the astrological data provided
- Don't make up planetary positions or events
- Be concise but comprehensive
- Use professional, respectful tone
- Avoid overly negative or alarming language
- Focus on empowerment and guidance

Structure your response with clear sections for:
1. Overall Period Assessment
2. Career & Professional Life
3. Health & Wellness
4. Relationships & Social Life
5. Financial Matters
6. Remedies & Recommendations"""
    
    def _build_prompt(
        self,
        context: Dict,
        birth_details: Dict,
        events: List[Dict],
        daily_results: List[Dict]
    ) -> str:
        """Build detailed prompt for AI"""
        
        # Format events
        occurring_events = [e for e in events if e.get('occurring', False)]
        auspicious_events = [e for e in occurring_events if e.get('category') == 'auspicious']
        inauspicious_events = [e for e in occurring_events if e.get('category') == 'inauspicious']
        
        # Find best and worst days
        sorted_days = sorted(daily_results, key=lambda x: x.get('score', 50), reverse=True)
        best_days = sorted_days[:3]
        worst_days = sorted_days[-3:]
        
        prompt = f"""Generate astrological predictions for this period:

PERIOD OVERVIEW:
- Average Score: {context.get('average_score', 50):.1f}/100
- Overall Trend: {context.get('trend', 'stable')}
- Total Days Analyzed: {len(daily_results)}

SCORE DISTRIBUTION:
- Excellent Days (80-100): {context.get('excellent_days', 0)} days
- Good Days (65-79): {context.get('good_days', 0)} days
- Average Days (50-64): {context.get('average_days', 0)} days
- Below Average (35-49): {context.get('below_average_days', 0)} days
- Challenging Days (0-34): {context.get('poor_days', 0)} days

ASTROLOGICAL EVENTS:
Favorable Events ({len(auspicious_events)}):
{self._format_events(auspicious_events[:5])}

Challenging Events ({len(inauspicious_events)}):
{self._format_events(inauspicious_events[:5])}

BEST DAYS:
{self._format_days(best_days)}

CHALLENGING DAYS:
{self._format_days(worst_days)}

Based on this astrological analysis, provide:
1. Overall assessment of the period
2. Career and professional guidance
3. Health and wellness advice
4. Relationship insights
5. Financial outlook
6. Three specific Vedic remedies

Be specific, actionable, and reference the astrological factors."""
        
        return prompt
    
    def _format_events(self, events: List[Dict]) -> str:
        """Format events for prompt"""
        if not events:
            return "- None significant"
        
        formatted = []
        for event in events:
            name = event.get('name', 'Unknown')
            desc = event.get('description', '')
            strength = event.get('strength', 0)
            formatted.append(f"- {name} (Strength: {strength}/100): {desc}")
        
        return "\n".join(formatted)
    
    def _format_days(self, days: List[Dict]) -> str:
        """Format days for prompt"""
        formatted = []
        for day in days:
            date = day.get('date', '')
            score = day.get('score', 0)
            quality = day.get('quality', '')
            formatted.append(f"- {date}: {score:.1f}/100 ({quality})")
        
        return "\n".join(formatted)
    
    def _parse_ai_response(self, response: str) -> Dict[str, str]:
        """Parse AI response into structured format"""
        # Simple parsing - split by sections
        sections = {
            'overall': '',
            'career': '',
            'health': '',
            'relationships': '',
            'finances': '',
            'remedies': []
        }
        
        # Try to extract sections (basic implementation)
        # In production, use more sophisticated parsing
        lines = response.split('\n')
        current_section = 'overall'
        
        for line in lines:
            line_lower = line.lower()
            if 'career' in line_lower or 'professional' in line_lower:
                current_section = 'career'
            elif 'health' in line_lower or 'wellness' in line_lower:
                current_section = 'health'
            elif 'relationship' in line_lower or 'social' in line_lower:
                current_section = 'relationships'
            elif 'financ' in line_lower or 'money' in line_lower:
                current_section = 'finances'
            elif 'remed' in line_lower:
                current_section = 'remedies'
            else:
                if current_section == 'remedies':
                    if line.strip() and (line.strip().startswith('-') or line.strip().startswith('•')):
                        sections['remedies'].append(line.strip().lstrip('-•').strip())
                else:
                    sections[current_section] += line + ' '
        
        # Clean up
        for key in ['overall', 'career', 'health', 'relationships', 'finances']:
            sections[key] = sections[key].strip()
        
        # Ensure we have at least 3 remedies
        if len(sections['remedies']) < 3:
            sections['remedies'].extend([
                "Perform daily meditation for mental clarity",
                "Donate to charitable causes on auspicious days",
                "Chant mantras appropriate to your birth chart"
            ])
        sections['remedies'] = sections['remedies'][:3]
        
        return sections
    
    def _generate_rule_based_predictions(
        self,
        context: Dict,
        events: List[Dict]
    ) -> Dict[str, Any]:
        """
        Fallback rule-based predictions when AI is not available
        """
        avg_score = context.get('average_score', 50)
        
        # Overall assessment
        if avg_score >= 75:
            overall = "This is an excellent period with strong planetary support. The cosmic energies are aligned favorably for progress and achievement."
            career = "Outstanding time for career advancement, new initiatives, and professional recognition. Take bold steps forward."
            health = "Health prospects are very favorable. This is an ideal time to start new health routines or treatments."
            relationships = "Harmonious period for all relationships. Good time for important commitments and social activities."
            finances = "Financial prospects are bright. Favorable for investments and financial planning."
        elif avg_score >= 60:
            overall = "A moderately favorable period with mixed planetary influences. Progress is possible with effort and planning."
            career = "Steady progress in career is indicated. Focus on consolidation rather than major changes."
            health = "Health is generally stable. Maintain current wellness routines and avoid stress."
            relationships = "Relationships require patience and understanding. Communication is key."
            finances = "Financial situation is stable. Good time for conservative financial decisions."
        else:
            overall = "A challenging period requiring caution and patience. Focus on maintaining stability rather than expansion."
            career = "Not ideal for major career moves. Focus on completing existing projects and building skills."
            health = "Take extra care of health. Avoid stress and maintain healthy lifestyle."
            relationships = "Be diplomatic in relationships. Avoid conflicts and misunderstandings."
            finances = "Exercise financial caution. Avoid major investments or expenditures."
        
        return {
            'overall': overall,
            'career': career,
            'health': health,
            'relationships': relationships,
            'finances': finances,
            'remedies': [
                "Perform daily meditation or prayer for mental clarity and spiritual strength",
                "Donate to charitable causes, especially on auspicious days indicated in the calendar",
                "Wear gemstones or perform rituals as recommended by a qualified astrologer based on your birth chart"
            ],
            'generated_by': 'rule_based',
            'confidence': 0.7
        }
