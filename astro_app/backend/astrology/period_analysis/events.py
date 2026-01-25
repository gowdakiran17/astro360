"""
Event System for Period Analysis
Implements VedAstro's event-driven architecture
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Callable, Optional, Any
import inspect


class EventName(Enum):
    """Enumeration of all astrological events"""
    
    # Moon-based events
    CHANDRASHTAMA = "Chandrashtama"
    NEW_MOON = "NewMoon"
    FULL_MOON = "FullMoon"
    
    # Ghataka events
    GHATAKA_TITHI = "GhatakaTithi"
    GHATAKA_NAKSHATRA = "GhatakaNakshatra"
    GHATAKA_WEEKDAY = "GhatakaDayOfWeek"
    GHATAKA_LAGNA = "GhatakaLagna"
    GHATAKA_RASHI = "GhatakaRashi"
    
    # Panchaka events
    PANCHAKA_GOOD = "PanchakaGood"
    PANCHAKA_BAD = "PanchakaBad"
    
    # Travel yogas
    TRAVEL_YOGA_GOOD = "TravelYogaGood"
    TRAVEL_YOGA_BAD = "TravelYogaBad"
    
    # Planetary strength events
    PLANET_EXALTED = "PlanetExalted"
    PLANET_DEBILITATED = "PlanetDebilitated"
    PLANET_IN_OWN_SIGN = "PlanetInOwnSign"
    
    # Tarabala events
    TARABALA_FAVORABLE = "TarabalaFavorable"
    TARABALA_UNFAVORABLE = "TarabalaUnfavorable"
    JANMA_TARA = "JanmaTara"
    SAMPAT_TARA = "SampatTara"
    VIPAT_TARA = "VipatTara"
    KSHEMA_TARA = "KshemaTara"
    PRATYAK_TARA = "PratyakTara"
    SADHAKA_TARA = "SadhakaTara"
    VADHA_TARA = "VadhaTara"
    MITRA_TARA = "MitraTara"
    PARAMA_MITRA_TARA = "ParamaMitraTara"
    
    # Day lord events
    DAY_LORD_FAVORABLE = "DayLordFavorable"
    DAY_LORD_UNFAVORABLE = "DayLordUnfavorable"
    
    # Yoga quality events
    YOGA_AUSPICIOUS = "YogaAuspicious"
    YOGA_INAUSPICIOUS = "YogaInauspicious"
    YOGA_HIGHLY_AUSPICIOUS = "YogaHighlyAuspicious"
    
    # Muhurta events
    ABHIJIT_MUHURTA = "AbhijitMuhurta"
    BRAHMA_MUHURTA = "BrahmaMuhurta"
    RAHU_KALA = "RahuKala"
    GULIKA_KALA = "GulikaKala"
    YAMAGHANTA = "Yamaghanta"
    AMRITA_KALA = "AmritaKala"
    SARVARTHASIDDHI_YOGA = "SarvarthasiddhiYoga"
    DURMUHURTA = "Durmuhurta"
    
    # Nakshatra quality events
    NAKSHATRA_AUSPICIOUS = "NakshatraAuspicious"
    NAKSHATRA_INAUSPICIOUS = "NakshatraInauspicious"
    NAKSHATRA_FIXED = "NakshatraFixed"
    NAKSHATRA_MOVABLE = "NakshatraMovable"
    
    # Planetary strength events
    ANY_PLANET_EXALTED = "AnyPlanetExalted"
    BENEFICS_STRONG = "BeneficsStrong"
    MALEFICS_WEAK = "MaleficsWeak"
    
    # Chandrabala events
    MOON_IN_KENDRA = "MoonInKendra"
    MOON_IN_TRIKONA = "MoonInTrikona"
    MOON_IN_UPACHAYA = "MoonInUpachaya"
    MOON_IN_DUSTHANA = "MoonInDusthana"
    MOON_WAXING = "MoonWaxing"
    MOON_WANING = "MoonWaning"
    MOON_BRIGHT = "MoonBright"
    MOON_DARK = "MoonDark"
    MOON_WITH_BENEFIC = "MoonWithBenefic"
    MOON_WITH_MALEFIC = "MoonWithMalefic"
    
    # Activity-specific events
    TRAVEL_FAVORABLE = "TravelFavorable"
    TRAVEL_UNFAVORABLE = "TravelUnfavorable"
    MARRIAGE_FAVORABLE = "MarriageFavorable"
    BUSINESS_FAVORABLE = "BusinessFavorable"
    EDUCATION_FAVORABLE = "EducationFavorable"
    MEDICAL_FAVORABLE = "MedicalFavorable"
    CONSTRUCTION_FAVORABLE = "ConstructionFavorable"
    AGRICULTURE_FAVORABLE = "AgricultureFavorable"
    
    # Pancha Pakshi events (general)
    PANCHA_PAKSHI_RULING = "PanchaPakshiRuling"
    PANCHA_PAKSHI_EATING = "PanchaPakshiEating"
    PANCHA_PAKSHI_DYING = "PanchaPakshiDying"
    PANCHA_PAKSHI_FAVORABLE = "PanchaPakshiFavorable"
    PANCHA_PAKSHI_UNFAVORABLE = "PanchaPakshiUnfavorable"
    
    # Advanced Muhurta events
    SUN_HORA = "SunHora"
    MOON_HORA = "MoonHora"
    MARS_HORA = "MarsHora"
    MERCURY_HORA = "MercuryHora"
    JUPITER_HORA = "JupiterHora"
    VENUS_HORA = "VenusHora"
    SATURN_HORA = "SaturnHora"
    VIJAYA_MUHURTA = "VijayaMuhurta"
    NISHITA_MUHURTA = "NishitaMuhurta"
    GODHULI_MUHURTA = "GodhuliMuhurta"
    PRATAH_SANDHYA = "PratahSandhya"
    SAYAM_SANDHYA = "SayamSandhya"
    MONDAY_AUSPICIOUS = "MondayAuspicious"
    WEDNESDAY_AUSPICIOUS = "WednesdayAuspicious"
    THURSDAY_AUSPICIOUS = "ThursdayAuspicious"
    FRIDAY_AUSPICIOUS = "FridayAuspicious"
    AMRIT_SIDDHI_YOGA = "AmritSiddhiYoga"
    SARVARTHA_SIDDHI_YOGA = "SarvarthaSiddhiYoga"
    MARANA_KARAK_MUHURTA = "MaranaKarakMuhurta"
    BENEFIC_HORA_ACTIVE = "BeneficHoraActive"
    MALEFIC_HORA_ACTIVE = "MaleficHoraActive"






@dataclass
class EventCalculatorResult:
    """Result from an event calculator"""
    occurred: bool = False
    strength: float = 0.0  # 0.0 to 1.0
    description: str = ""
    metadata: Dict[str, Any] = None
    
    def __init__(self, **kwargs):
        # Support both 'occurred' and 'occurring'
        self.occurred = kwargs.get('occurred', kwargs.get('occurring', False))
        self.strength = kwargs.get('strength', 0.0)
        self.description = kwargs.get('description', "")
        self.metadata = kwargs.get('metadata', {})

    @property
    def occurring(self) -> bool:
        """Alias for VedAstro compatibility"""
        return self.occurred

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class EventCalculator:
    """
    Registry and executor for astrological event calculators.
    Follows VedAstro's pattern of composable event detection.
    """
    
    # Registry of event calculators
    _calculators: Dict[EventName, Callable] = {}
    
    @classmethod
    def register(cls, event_name: EventName):
        """
        Decorator to register an event calculator function.
        
        Usage:
            @EventCalculator.register(EventName.CHANDRASHTAMA)
            def calculate_chandrashtama(time, birth_moon_longitude, ...):
                ...
        """
        def decorator(func: Callable) -> Callable:
            cls._calculators[event_name] = func
            return func
        return decorator
    
    @classmethod
    def calculate(cls, event_name: EventName, **kwargs) -> EventCalculatorResult:
        """
        Calculate a specific event.
        
        Args:
            event_name: The event to calculate
            **kwargs: Arguments to pass to the calculator
            
        Returns:
            EventCalculatorResult
            
        Raises:
            ValueError: If event calculator is not registered
        """
        if event_name not in cls._calculators:
            raise ValueError(f"No calculator registered for event: {event_name}")
        
        calculator = cls._calculators[event_name]
        
        # Get the function signature to validate arguments
        sig = inspect.signature(calculator)
        
        # Filter kwargs to only include parameters the function accepts
        valid_kwargs = {}
        for param_name in sig.parameters:
            if param_name in kwargs:
                valid_kwargs[param_name] = kwargs[param_name]
            elif param_name == 'moon_longitude' and 'birth_moon_longitude' in kwargs:
                # Support alias for backward compatibility
                valid_kwargs[param_name] = kwargs['birth_moon_longitude']
        
        try:
            return calculator(**valid_kwargs)
        except TypeError as e:
            # More helpful error message for debugging
            raise TypeError(f"Error in {event_name.value} calculator: {e}. signature={sig}, kwargs_keys={list(valid_kwargs.keys())}")
    
    @classmethod
    def calculate_all(cls, time: datetime, **context) -> Dict[EventName, EventCalculatorResult]:
        """
        Calculate all registered events for a given time.
        
        Args:
            time: The time to calculate events for
            **context: Additional context (birth details, positions, etc.)
            
        Returns:
            Dictionary mapping event names to results
        """
        results = {}
        
        # Add time to context
        context['time'] = time
        
        for event_name in cls._calculators:
            try:
                result = cls.calculate(event_name, **context)
                results[event_name] = result
            except Exception as e:
                # Log error but continue with other events
                print(f"Error calculating {event_name}: {e}")
                results[event_name] = EventCalculatorResult(
                    occurred=False,
                    description=f"Error: {str(e)}"
                )
        
        return results
    
    @classmethod
    def get_registered_events(cls) -> List[EventName]:
        """Get list of all registered event names"""
        return list(cls._calculators.keys())
    
    @classmethod
    def is_registered(cls, event_name: EventName) -> bool:
        """Check if an event calculator is registered"""
        return event_name in cls._calculators
