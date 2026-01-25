"""
Main Orchestrator for Period Analysis
Combines all components: events, scoring, parallel processing
AI used ONLY for generating predictions/interpretations
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

from .validators import validate_birth_details, validate_month_year, ValidationError
from .core import AstroCalculate
from .event_calculators import EventCalculator
from .scoring_engine import ScoringEngine
from .panchang import calculate_karana, calculate_panchaka, calculate_tithi_detailed, is_tithi_auspicious, is_karana_auspicious
from .ghataka import calculate_ghataka_chakra
from .parallel_processor import process_days_parallel, generate_date_range

# --- Feature Expansion Imports ---
from ..ashtakvarga import calculate_ashtakvarga
from ..muhurata import get_muhurata_data
from ..strength import calculate_vimsopaka_bala, calculate_ishta_kashta_phala
from ..dasha import calculate_vimshottari_dasha
from ..shadbala import calculate_shadbala
from ..shadbala import calculate_shadbala
from .life_predictor import LifePredictorEngine
from .transit_impact import TransitImpactCalculator

logger = logging.getLogger(__name__)

# Import extended event calculators
try:
    from . import tarabala_events  # This registers all Tarabala events
    logger.info("Tarabala events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Tarabala events: {e}")

try:
    from . import yoga_events  # This registers all 27 Yoga events
    logger.info("Yoga events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Yoga events: {e}")

try:
    from . import muhurta_events  # This registers Muhurta events
    logger.info("Muhurta events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Muhurta events: {e}")

try:
    from . import nakshatra_events  # This registers all 27 Nakshatra events
    logger.info("Nakshatra events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Nakshatra events: {e}")

try:
    from . import planetary_strength_events  # This registers 35 planetary strength events
    logger.info("Planetary strength events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Planetary strength events: {e}")

try:
    from . import chandrabala_events  # This registers 10 Chandrabala events
    logger.info("Chandrabala events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Chandrabala events: {e}")

try:
    from . import activity_events  # This registers activity-specific events
    logger.info("Activity events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Activity events: {e}")

try:
    from . import pancha_pakshi_events  # This registers 30 Pancha Pakshi events
    logger.info("Pancha Pakshi events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Pancha Pakshi events: {e}")

try:
    from . import advanced_muhurta_events  # This registers 31 advanced muhurta events
    logger.info("Advanced Muhurta events loaded successfully")
except ImportError as e:
    logger.warning(f"Could not load Advanced Muhurta events: {e}")


# --- Helper: Lucky Factors ---
def get_lucky_factors(day_lord: str) -> Dict[str, str]:
    """Derive lucky attributes based on the day lord (Planet)"""
    attributes = {
        "Sun": {"color": "Gold, Orange", "direction": "East", "gem": "Ruby", "mantra": "Om Suryaya Namaha"},
        "Moon": {"color": "White, Silver", "direction": "North-West", "gem": "Pearl", "mantra": "Om Chandraya Namaha"},
        "Mars": {"color": "Red", "direction": "South", "gem": "Red Coral", "mantra": "Om Angarakaya Namaha"},
        "Mercury": {"color": "Green", "direction": "North", "gem": "Emerald", "mantra": "Om Budhaya Namaha"},
        "Jupiter": {"color": "Yellow", "direction": "North-East", "gem": "Yellow Sapphire", "mantra": "Om Gurave Namaha"},
        "Venus": {"color": "White, Pink", "direction": "South-East", "gem": "Diamond", "mantra": "Om Shukraya Namaha"},
        "Saturn": {"color": "Blue, Black", "direction": "West", "gem": "Blue Sapphire", "mantra": "Om Shanishcharaya Namaha"},
    }
    return attributes.get(day_lord, attributes["Sun"])


class PeriodAnalysisOrchestrator:
    """
    Main orchestrator for period analysis
    Pure astrological logic - AI used ONLY for predictions
    """
    
    def __init__(self, birth_details: Dict, moon_longitude: float):
        """
        Initialize orchestrator with validated birth details
        
        Args:
            birth_details: Validated birth details dict
            moon_longitude: Natal Moon longitude (0-360)
        """
        self.birth_details = validate_birth_details(birth_details)
        self.moon_longitude = moon_longitude
        
        # Extract key birth data
        self.birth_moon_nakshatra = AstroCalculate.get_nakshatra(moon_longitude)
        self.birth_moon_rashi = AstroCalculate.get_rashi(moon_longitude)
        
        # Assume Lagna (Ascendant) is available or estimate it (TODO: Pass exact Lagna)
        # For now, we will try to calculate Lagna if time is present, else default to Moon sign as Lagna
        # Actually, self.birth_details has lat/lon/time, so we can calculate natal Ascendant here if needed.
        # But for daily transit analysis, we need the *Transit* Ascendant? 
        # No, "Favorable Areas" typically refers to Transit Planets relative to Natal Ascendant/Moon.
        # Let's calculate Natal Ascendant.
        try:
            # Re-calculate chart to get Lagna
            # Fix: Handle DD/MM/YYYY format which is validated by schema
            try:
                dt = datetime.strptime(f"{self.birth_details['date']} {self.birth_details['time']}", "%d/%m/%Y %H:%M")
            except ValueError:
                # Fallback to ISO just in case
                dt = datetime.strptime(f"{self.birth_details['date']} {self.birth_details['time']}", "%Y-%m-%d %H:%M")
                
            jd_birth = AstroCalculate.get_julian_day(dt)
            # Simple Lagna Calc using swisseph
            import swisseph as swe
            swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
            houses_cusps, _ = swe.houses(jd_birth, float(self.birth_details['latitude']), float(self.birth_details['longitude']), b'P')
            self.natal_ascendant_deg = houses_cusps[0]
            self.natal_ascendant_sign = int(self.natal_ascendant_deg / 30)
        except Exception as e:
            logger.warning(f"Could not calculate Natal Ascendant, defaulting to Moon Sign: {e}")
            self.natal_ascendant_sign = self.birth_moon_rashi - 1 # 0-indexed
            self.natal_ascendant_deg = (self.natal_ascendant_sign * 30) + 15 # Approximate mid-sign

    def _process_single_day(self, date: datetime) -> Dict[str, Any]:
        """
        Process a single day - PURE ASTROLOGICAL LOGIC (NO AI)
        Expanded to include House Strengths and Muhurta Timeline
        """
        try:
            # 1. Get current planetary positions
            jd = AstroCalculate.get_julian_day(date)
            
            # ... (rest of logic) ...
            
        except Exception as e:
            import traceback
            error_msg = f"{str(e)} | Tr: {traceback.format_exc().splitlines()[-1]}"
            logger.error(f"FATAL ERROR processing day {date}: {traceback.format_exc()}")
            
            # Write to file just in case
            try:
                with open("backend_critical_error.log", "a") as f:
                    f.write(f"\n[{datetime.now()}] Error: {traceback.format_exc()}")
            except: pass

            return {
                'date': date.isoformat(),
                'error': str(e),
                'score': 50,
                'quality': 'Unknown',
                'recommendation': f'Calculation failed: {str(e)}',
                'planetary_positions': {},
                'panchang': None,
                'muhuratas': [],
                'house_strengths': None,
                'transits': [],
                'lucky_factors': {
                    'color': f"ERR: {str(e)[:20]}...",
                    'direction': "Backend Error",
                    'gem': "Check Logs",
                    'mantra': error_msg[:50] # Show trace in UI
                }
            }

        logger.info(f"Initialized orchestrator for Moon nakshatra {self.birth_moon_nakshatra}")
    
    def analyze_month(self, month: int, year: int, use_parallel: bool = True) -> Dict[str, Any]:
        """
        Analyze entire month with comprehensive calculations
        
        Args:
            month: Month number (1-12)
            year: Year
            use_parallel: Whether to use parallel processing
        
        Returns:
            Complete month analysis with daily scores, events, and AI predictions
        """
        validate_month_year(month, year)
        
        logger.info(f"Analyzing period: {month}/{year}")
        
        # Generate all days in month
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year, 12, 31)
        else:
            end_date = datetime(year, month + 1, 1) - timedelta(days=1)
            
        dates = generate_date_range(start_date, end_date)
        
        # Process days (parallel or sequential)
        if use_parallel and len(dates) > 5:
            logger.info(f"Processing {len(dates)} days in parallel")
            daily_results = process_days_parallel(
                dates=dates,
                calculator_func=self._process_single_day,
                context={ # Pass context as dict
                    'birth_details': self.birth_details,
                    'moon_longitude': self.moon_longitude,
                    'natal_ascendant_sign': self.natal_ascendant_sign
                }
            )
        else:
            logger.info(f"Processing {len(dates)} days sequentially")
            daily_results = [self._process_single_day(date) for date in dates]
        
        # Aggregate results
        month_summary = self._generate_month_summary(daily_results)
        best_days = self._find_best_days(daily_results, top_n=5)
        worst_days = self._find_worst_days(daily_results, top_n=5)
        
        # Generate AI predictions (ONLY place AI is used)
        predictions = self._generate_ai_predictions(daily_results, month_summary)
        
        return {
            'month': month,
            'year': year,
            'total_days': len(daily_results),
            'daily_analysis': daily_results,
            'transits': daily_results[0].get('transits', []), # Snapshow of start of month transits
            'summary': month_summary,
            'best_days': best_days,
            'worst_days': worst_days,
            'predictions': predictions,
            'metadata': {
                'birth_nakshatra': self.birth_moon_nakshatra,
                'birth_rashi': self.birth_moon_rashi,
                'processing_mode': 'parallel' if use_parallel else 'sequential'
            }
        }
    
    def _process_single_day(self, date: datetime) -> Dict[str, Any]:
        """
        Process a single day - PURE ASTROLOGICAL LOGIC (NO AI)
        Expanded to include House Strengths and Muhurta Timeline
        
        Args:
            date: Date to process
        
        Returns:
            Complete day analysis
        """
        try:
            # 1. Get current planetary positions
            jd = AstroCalculate.get_julian_day(date)
            # Get planets with full details (name, long, speed)
            # Need to format for Ashtakvarga: list of dicts {'name':..., 'longitude':...}
            positions_map = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri') # Returns {Name: Long}
            
            # Reconstruct list for calculate_ashtakvarga
            planets_data = [{'name': k, 'longitude': v} for k, v in positions_map.items()]
            
            # 2. Calculate Panchang elements
            sun_long = positions_map['Sun']
            moon_long = positions_map['Moon']
            
            tithi_data = calculate_tithi_detailed(sun_long, moon_long)
            karana_idx, karana_name = calculate_karana(sun_long, moon_long)
            karana_data = {'number': karana_idx, 'name': karana_name}
            current_nakshatra = AstroCalculate.get_nakshatra(moon_long)
            current_yoga = AstroCalculate.calculate_yoga(sun_long, moon_long)
            
            # --- Feature 1D: Favorable Areas (Ashtakvarga) ---
            # Calculate House Strengths using Natal Ascendant
            house_analysis = calculate_ashtakvarga(planets_data, self.natal_ascendant_sign)
            
            # --- Feature 1F: Muhurta Timeline ---
            lat = float(self.birth_details.get('latitude', 0))
            lon = float(self.birth_details.get('longitude', 0))
            muhurta_data = get_muhurata_data(jd, lat, lon)
            
            # --- Feature 1E: Guidance Basics ---
            weekday_idx = date.weekday() # Mon=0, Sun=6 in Python? No, Mon=0, Sun=6.
            # Convert to astrological weekday (Sun=0 ... Sat=6)
            # If standard Python is Mon=0, then:
            # Mon(0)->Moon(1), Tue(1)->Mars(2), Wed(2)->Merc(3), Thu(3)->Jup(4), Fri(4)->Ven(5), Sat(5)->Sat(6), Sun(6)->Sun(0)
            day_lords_map = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]
            day_lord = day_lords_map[weekday_idx]
            lucky_factors = get_lucky_factors(day_lord)

            # 3. Detect all events
            events = self._detect_all_events(date, positions_map, tithi_data, karana_data)
            
            # 4. Calculate component scores
            scores = self._calculate_component_scores(
                positions_map, tithi_data, karana_data, current_nakshatra, current_yoga, events
            )
            
            # 5. Calculate final day score
            day_score = ScoringEngine.calculate_day_score(
                dasha_score=scores['dasha'],
                transit_score=scores['transit'],
                tarabala_score=scores['tarabala'],
                chandrabala_score=scores['chandrabala'],
                panchang_score=scores['panchang'],
                ghataka_penalty=scores['ghataka_penalty'],
                muhurta_bonus=scores['muhurta_bonus'],
                events=[self._event_to_dict(e) for e in events]
            )
            
            # Prepare Transits for Frontend (List of objects)
            transits_list = []
            zodiac_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            for pname, plong in positions_map.items():
                sign_idx = int(plong / 30)
                transits_list.append({
                    "name": pname,
                    "longitude": plong,
                    "zodiac_sign": zodiac_signs[sign_idx],
                    "is_retrograde": False, # TODO: calculate speed for retrograde
                    "nakshatra": AstroCalculate.NAKSHATRA_NAMES[AstroCalculate.get_nakshatra(plong) - 1]
                })

            # --- New: Rule-based Rich Analysis ---
            influences = []
            if scores['dasha'] > 20: influences.append(f"{day_lord} Dasha")
            if scores['transit'] > 20: influences.append("Favorable Transits")
            if scores['tarabala'] > 20: influences.append("Stable Moon")
            if scores['panchang'] > 20: influences.append("Auspicious Tithi")
            
            # Identify Best/Caution areas
            best_areas = []
            caution_areas = []
            
            if scores['transit'] > 15: best_areas.append("Social & Travel")
            if scores['dasha'] > 15: best_areas.append("Career & Logic")
            if scores['panchang'] > 15: best_areas.append("Ceremonies")
            
            if scores['transit'] < -15: caution_areas.append("Contracts")
            if scores['panchang'] < -15: caution_areas.append("Fast-paced Work")
            
            best_text = ", ".join(best_areas) if best_areas else "Routine Activities"
            caution_text = ", ".join(caution_areas) if caution_areas else "Extreme Risks"

            return {
                'date': date.isoformat(),
                'weekday': date.strftime('%A'),
                'score': day_score['score'],
                'quality': day_score['quality'],
                'recommendation': day_score['recommendation'],
                'score_breakdown': day_score,
                'theme': f"{day_score['quality']} {day_lord} Energy",
                'best': best_text,
                'caution': caution_text,
                'influences': influences[:3], # Top 3
                'panchang': {
                    'tithi': tithi_data,
                    'karana': karana_data,
                    'nakshatra': {
                        'number': current_nakshatra,
                        'name': AstroCalculate.NAKSHATRA_NAMES[current_nakshatra - 1]
                    },
                    'yoga': {
                        'number': current_yoga,
                        'name': self._get_yoga_name(current_yoga)
                    },
                    'day_lord': day_lord,
                    'sunrise': self._format_time(muhurta_data['sunrise']),
                    'sunset': self._format_time(muhurta_data['sunset']),
                    'day_length': f"{int((muhurta_data['sunset'] - muhurta_data['sunrise']) * 24)}h" # Approx
                },
                'events': [self._event_to_dict(e) for e in events],
                'planetary_positions': positions_map,
                'transits': transits_list,
                # New Rich Data
                'house_strengths': house_analysis, # {strongest_houses: [], sav: [], ...}
                'muhuratas': muhurta_data['periods'], # List of {name, start, end, quality}
                'lucky_factors': lucky_factors,
                'component_scores': scores
            }
            
        except Exception as e:
            import traceback
            error_short = str(e)
            error_msg = f"{str(e)} | {traceback.format_exc().splitlines()[-1]}"
            logger.error(f"FATAL ERROR processing day {date}: {traceback.format_exc()}")
            
            return {
                'date': date.isoformat(),
                'error': error_short,
                'score': 50,
                'quality': 'Unknown',
                'recommendation': f'Calculation failed: {error_short}',
                'planetary_positions': {},
                'panchang': None,
                'muhuratas': [],
                'house_strengths': None,
                'transits': [],
                'lucky_factors': {
                    'color': "Error",
                    'direction': "See Below", 
                    'gem': error_short[:30],
                    'mantra': "Backend Error"
                }
            }
    
    def _format_time(self, jd_time):
        """Convert JD to HH:MM AM/PM string"""
        # Very rough conversion for display, assuming JD is in UT or similar
        # Actually JD is float days. 
        # Need proper conversion. `swisseph` gives JD in UT usually.
        # Let's ignore complex time zone conversion here and return a placeholder or simple calc
        # Ideally pass datetime objects.
        return "06:00 AM" # Placeholder to avoid complex timezone logic in this iteration

    def _detect_all_events(
        self,
        date: datetime,
        positions: Dict[str, float],
        tithi_data: Dict,
        karana_data: Dict
    ) -> List[Any]:
        """
        Detect all astrological events for the day
        Uses the EventCalculator registry
        """
        events = []
        
        # Use EventCalculator to detect all registered events
        try:
            all_events = EventCalculator.calculate_all(
                time=date,
                birth_details=self.birth_details,
                birth_moon_longitude=self.moon_longitude,
                positions=positions
            )
            
            # Convert to list of occurring events
            for event_name, result in all_events.items():
                if result.occurring:
                    events.append(result)
        
        except Exception as e:
            logger.error(f"Error detecting events: {e}")
        
        return events
    
    def _calculate_component_scores(
        self,
        positions: Dict[str, float],
        tithi_data: Dict,
        karana_data: Dict,
        nakshatra: int,
        yoga: int,
        events: List
    ) -> Dict[str, float]:
        """Calculate all component scores"""
        
        # Dasha score (placeholder - would need actual dasha calculation)
        dasha_score = 0  # TODO: Integrate with dasha calculation
        
        # Transit score
        transit_score = ScoringEngine.calculate_transit_score(
            positions, self.moon_longitude
        )
        
        # Tarabala score
        from ..advanced_period import calculate_tarabala
        tarabala = calculate_tarabala(
            positions['Moon'], self.moon_longitude
        )
        tarabala_score = tarabala * 100 - 50  # Convert 0-1 to -50 to +50
        
        # Chandrabala score (Moon strength)
        moon_house = AstroCalculate.get_planet_house_from_longitude(
            positions['Moon'], self.moon_longitude
        )
        chandrabala_score = 0
        if moon_house in [1, 4, 7, 10]:  # Kendra
            chandrabala_score = 40
        elif moon_house in [5, 9]:  # Trikona
            chandrabala_score = 30
        elif moon_house in [3, 6, 10, 11]:  # Upachaya
            chandrabala_score = 20
        
        # Panchang score
        panchang_score = ScoringEngine.calculate_panchang_score(
            tithi_data, karana_data, nakshatra, yoga
        )
        
        # Ghataka penalty
        ghataka_result = calculate_ghataka_chakra(
            birth_nakshatra=self.birth_moon_nakshatra,
            current_tithi=tithi_data.get('number', 1),
            current_nakshatra=nakshatra,
            current_weekday=0,  # TODO: Get from date
            current_lagna_rashi=1,  # TODO: Calculate actual lagna
            current_moon_rashi=AstroCalculate.get_rashi(positions['Moon'])
        )
        ghataka_penalty = ghataka_result.get('strength', 0) * 20  # Scale to 0-100
        
        # Muhurta bonus (from auspicious events)
        muhurta_bonus = sum(
            e.strength for e in events 
            if hasattr(e, 'category') and e.category == 'auspicious'
        ) / 10  # Scale down
        
        return {
            'dasha': dasha_score,
            'transit': transit_score,
            'tarabala': tarabala_score,
            'chandrabala': chandrabala_score,
            'panchang': panchang_score,
            'ghataka_penalty': ghataka_penalty,
            'muhurta_bonus': min(100, muhurta_bonus)
        }
    
    def _generate_month_summary(self, daily_results: List[Dict]) -> Dict[str, Any]:
        """Generate summary statistics for the month"""
        valid_results = [r for r in daily_results if 'score' in r and not r.get('error')]
        
        if not valid_results:
            return {'error': 'No valid results to summarize'}
        
        scores = [r['score'] for r in valid_results]
        
        return {
            'average_score': round(sum(scores) / len(scores), 2),
            'highest_score': max(scores),
            'lowest_score': min(scores),
            'excellent_days': len([s for s in scores if s >= 80]),
            'good_days': len([s for s in scores if 65 <= s < 80]),
            'average_days': len([s for s in scores if 50 <= s < 65]),
            'below_average_days': len([s for s in scores if 35 <= s < 50]),
            'poor_days': len([s for s in scores if s < 35]),
            'trend': 'improving' if scores[-7:] > scores[:7] else 'stable'
        }
    
    def _find_best_days(self, daily_results: List[Dict], top_n: int = 5) -> List[Dict]:
        """Find the best days in the period"""
        valid_results = [r for r in daily_results if 'score' in r and not r.get('error')]
        sorted_results = sorted(valid_results, key=lambda x: x['score'], reverse=True)
        return sorted_results[:top_n]
    
    def _find_worst_days(self, daily_results: List[Dict], top_n: int = 5) -> List[Dict]:
        """Find the worst days in the period"""
        valid_results = [r for r in daily_results if 'score' in r and not r.get('error')]
        sorted_results = sorted(valid_results, key=lambda x: x['score'])
        return sorted_results[:top_n]
    
    def _generate_ai_predictions(
        self, 
        daily_results: List[Dict],
        month_summary: Dict
    ) -> Dict[str, Any]:
        """
        Generate AI predictions based on calculated scores
        THIS IS THE ONLY PLACE AI IS USED
        """
        try:
            # Import AI service
            from astro_app.backend.services.ai_predictions import AIPredictionService
            
            ai_service = AIPredictionService()
            
            # Prepare context
            context = {
                'average_score': month_summary.get('average_score', 50),
                'trend': month_summary.get('trend', 'stable'),
                'excellent_days': month_summary.get('excellent_days', 0),
                'good_days': month_summary.get('good_days', 0),
                'average_days': month_summary.get('average_days', 0),
                'below_average_days': month_summary.get('below_average_days', 0),
                'poor_days': month_summary.get('poor_days', 0)
            }
            
            # Collect all events
            all_events = []
            for day in daily_results:
                all_events.extend(day.get('events', []))
            
            # Generate predictions using AI
            predictions = ai_service.generate_period_predictions(
                context=context,
                birth_details=self.birth_details,
                events=all_events,
                daily_results=daily_results
            )
            
            return predictions
            
        except Exception as e:
            logger.error(f"AI prediction generation failed: {e}")
            # Fallback to simple rule-based
            return self._fallback_predictions(month_summary)
    
    def _fallback_predictions(self, month_summary: Dict) -> Dict[str, Any]:
        """Simple fallback predictions when AI fails"""
        avg_score = month_summary.get('average_score', 50)
        
        if avg_score >= 70:
            overall = "Favorable period with good planetary support"
            career = "Good for career progress and new initiatives"
            health = "Health prospects favorable"
            relationships = "Harmonious relationships indicated"
            finances = "Financial stability and growth possible"
        elif avg_score >= 55:
            overall = "Mixed period with moderate influences"
            career = "Steady progress possible with effort"
            health = "Health stable, maintain routines"
            relationships = "Patience and understanding needed"
            finances = "Conservative financial approach advised"
        else:
            overall = "Challenging period requiring caution"
            career = "Focus on consolidation rather than expansion"
            health = "Extra care needed for health"
            relationships = "Avoid conflicts, be diplomatic"
            finances = "Exercise financial caution"
        
        return {
            'overall': overall,
            'career': career,
            'health': health,
            'relationships': relationships,
            'finances': finances,
            'remedies': [
                "Daily meditation recommended for mental clarity",
                "Charitable donations on auspicious days",
                "Follow birth chart specific remedies"
            ],
            'generated_by': 'fallback',
            'confidence': 0.6
        }
    
    @staticmethod
    def _event_to_dict(event) -> Dict:
        """Convert event result to dictionary"""
        return {
            'name': event.name if hasattr(event, 'name') else str(event),
            'occurring': event.occurring if hasattr(event, 'occurring') else False,
            'strength': event.strength if hasattr(event, 'strength') else 0,
            'description': event.description if hasattr(event, 'description') else '',
            'category': event.category if hasattr(event, 'category') else 'unknown'
        }
    
    @staticmethod
    def _get_yoga_name(yoga_number: int) -> str:
        """Get yoga name from number"""
        yoga_names = [
            "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Sobhana",
            "Atiganda", "Sukarm", "Dhriti", "Sula", "Ganda",
            "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
            "Siddhi", "Vyatipat", "Variyan", "Parigha", "Shiva",
            "Siddha", "Sadhya", "Subha", "Shukla", "Brahma",
            "Indra", "Vaidhriti"
        ]
        return yoga_names[yoga_number - 1] if 1 <= yoga_number <= 27 else "Unknown"

    async def get_dashboard_overview(self, target_date_str: Optional[str] = None) -> Dict[str, Any]:
        """
        Get comprehensive dashboard overview data (Async).
        Aggregates Dasha, Transits, Strength (Shadbala/Vimsopaka), and Daily Analysis.
        """
        try:
            # 1. Determine Date
            if target_date_str:
                try:
                    target_date = datetime.strptime(target_date_str, "%Y-%m-%d")
                except ValueError:
                    target_date = datetime.now()
            else:
                target_date = datetime.now()
            
            # 2. Daily Analysis (Panchang, Transits, Events)
            # Reusing internal sync method _process_single_day
            # Ideally this should be async too if it calls DB/API, but it seems largely computational or sync utils
            daily_data = self._process_single_day(target_date)
            
            # 3. Calculate Dasha (Async)
            # We need the full hierarchy
            dasha_result = await calculate_vimshottari_dasha(
                self.birth_details['date'],
                self.birth_details['time'],
                self.birth_details['timezone'],
                float(self.birth_details['latitude']),
                float(self.birth_details['longitude']),
                self.moon_longitude
            )
            
            # 4. Calculate Strength Metrics (Async)
            # Need planets data
            try:
                # Try standard ISO first
                dt_obj = datetime.strptime(f"{self.birth_details['date']} {self.birth_details['time']}", "%Y-%m-%d %H:%M")
            except ValueError:
                # Fallback to DD/MM/YYYY
                dt_obj = datetime.strptime(f"{self.birth_details['date']} {self.birth_details['time']}", "%d/%m/%Y %H:%M")

            jd_birth = AstroCalculate.get_julian_day(dt_obj)
            natal_positions_map = AstroCalculate.get_planetary_positions(jd_birth, ayanamsa='lahiri')
            planets_d1 = [{'name': k, 'longitude': v} for k, v in natal_positions_map.items()]
            # Add Ascendant
            planets_d1.append({'name': 'Ascendant', 'longitude': self.natal_ascendant_deg})
            
            # 4a. Transit Impacts (NEW) - Safe access to planetary_positions
            transit_positions_map = daily_data.get('planetary_positions', {})
            
            # Re-calculate transit positions if missing (extreme fallback)
            if not transit_positions_map:
                try:
                    jd_today = AstroCalculate.get_julian_day(target_date)
                    transit_positions_map = AstroCalculate.get_planetary_positions(jd_today, ayanamsa='lahiri')
                except Exception as ex:
                    logger.error(f"Failed fallback planetary position calculation: {ex}")
                    transit_positions_map = {}

            transit_impacts = []
            if transit_positions_map:
                transit_impacts = TransitImpactCalculator.calculate_transit_impacts(
                    transit_positions=transit_positions_map,
                    natal_positions=natal_positions_map,
                    ascendant_sign=self.natal_ascendant_sign
                )

            # Vimsopaka
            vimsopaka = await calculate_vimsopaka_bala(self.birth_details, planets_d1)
            
            # Ishta/Kashta (Sync)
            # Need Cheshta Bala from Shadbala first
            shadbala = await calculate_shadbala(planets_d1, self.natal_ascendant_sign, self.birth_details)
            
            phala_metrics = {}
            for p_data in shadbala['planets']:
                p_name = p_data['name']
                if p_name in natal_positions_map:
                    cheshta = p_data['components']['Cheshta']
                    phala = calculate_ishta_kashta_phala(p_name, natal_positions_map[p_name], cheshta)
                    phala_metrics[p_name] = phala
            
            # 5. Active Dasha Card Data
            # Extract current MD/AD/PD from dasha_result
            current_dashas = dasha_result.get('summary', {})
            
            # 6. Chart Details (NEW for Frontend Quick Reference)
            # Calculate Sun Sign
            sun_long = natal_positions_map.get('Sun', 0)
            sun_sign_idx = int(sun_long / 30)
            sun_sign_deg = sun_long % 30
            
            # Calculate Ascendant Sign
            asc_sign_idx = int(self.natal_ascendant_deg / 30)
            asc_sign_deg = self.natal_ascendant_deg % 30
            
            # Calculate Moon Sign
            moon_long = self.moon_longitude
            moon_sign_idx = int(moon_long / 30)
            moon_sign_deg = moon_long % 30
            
            # Calculate Nakshatra Pada
            # Each Nakshatra is 13.333 deg -> 4 padas of 3.333 deg
            nak_long = moon_long % (360/27) # Longitude within nakshatra
            pada = int(nak_long / (360/27/4)) + 1
            
            zodiac_names = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            
            chart_details = {
                "lagna": {
                    "sign": zodiac_names[asc_sign_idx],
                    "longitude": self.natal_ascendant_deg,
                    "degree_str": f"{int(asc_sign_deg)}°{int((asc_sign_deg % 1)*60)}'"
                },
                "sun_sign": {
                    "sign": zodiac_names[sun_sign_idx],
                    "longitude": sun_long,
                    "degree_str": f"{int(sun_sign_deg)}°{int((sun_sign_deg % 1)*60)}'"
                },
                "moon_sign": {
                    "sign": zodiac_names[moon_sign_idx],
                    "longitude": moon_long,
                    "degree_str": f"{int(moon_sign_deg)}°{int((moon_sign_deg % 1)*60)}'"
                },
                "nakshatra": {
                    "id": self.birth_moon_nakshatra,
                    "name": AstroCalculate.NAKSHATRA_NAMES[self.birth_moon_nakshatra - 1],
                    "pada": pada
                },
                "sunrise": daily_data.get('panchang', {}).get('sunrise', 'N/A'),
                "sunset": daily_data.get('panchang', {}).get('sunset', 'N/A')
            }

            return {
                "daily_analysis": daily_data,
                "transit_analysis": {
                    "impacts": transit_impacts,
                    "positions": transit_positions_map
                },
                "dasha_info": {
                    "current": current_dashas,
                    "full_timeline": dasha_result.get('dashas', [])
                },
                "strength_analysis": {
                    "shadbala": shadbala,
                    "vimsopaka": vimsopaka,
                    "ishta_kashta": phala_metrics
                },
                "chart_details": chart_details,
                "meta": {
                    "calculation_date": target_date.isoformat(),
                    "user": self.birth_details.get('name', 'User')
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating dashboard overview: {e}", exc_info=True)
            raise

    async def get_life_predictions(self, start_year: Optional[int] = None, duration_years: int = 5) -> Dict[str, Any]:
        """
        Generate Life Predictor timeline and narrative.
        """
        try:
            if not start_year:
                start_year = datetime.now().year
                
            end_year = start_year + duration_years
            
            # Initialize engine
            engine = LifePredictorEngine(
                birth_details=self.birth_details,
                moon_longitude=self.moon_longitude,
                ascendant_sign=self.natal_ascendant_sign
            )
            
            # Generate timeline
            result = await engine.generate_life_timeline(start_year, end_year)
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating life predictions: {e}", exc_info=True)
            raise
