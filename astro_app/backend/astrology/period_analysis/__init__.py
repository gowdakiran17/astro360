"""
Period Analysis Package
Rewritten based on VedAstro's proven architecture patterns
"""

# Core exports
from .core import AstroCalculate
from .validators import (
    validate_birth_details,
    validate_moon_longitude,
    validate_month_year,
    ValidationError
)
from .orchestrator import PeriodAnalysisOrchestrator
from .scoring_engine import ScoringEngine, ScoreComponent
from .events import EventCalculator, EventName, EventCalculatorResult

# Import from old period_analysis.py for backward compatibility
import importlib.util
import sys
from pathlib import Path

# Load the old period_analysis.py module
old_module_path = Path(__file__).parent.parent / "period_analysis.py"
if old_module_path.exists():
    spec = importlib.util.spec_from_file_location("old_period_analysis", old_module_path)
    old_period_analysis = importlib.util.module_from_spec(spec)
    sys.modules['old_period_analysis'] = old_period_analysis
    try:
        spec.loader.exec_module(old_period_analysis)
        # Import the function
        get_full_period_analysis = old_period_analysis.get_full_period_analysis
    except Exception as e:
        # If old module fails to load, create a placeholder
        def get_full_period_analysis(*args, **kwargs):
            raise NotImplementedError("Old period_analysis function not available. Use PeriodAnalysisOrchestrator instead.")
else:
    def get_full_period_analysis(*args, **kwargs):
        raise NotImplementedError("Old period_analysis function not available. Use PeriodAnalysisOrchestrator instead.")

__all__ = [
    # Core
    'AstroCalculate',
    
    # Validators
    'validate_birth_details',
    'validate_moon_longitude', 
    'validate_month_year',
    'ValidationError',
    
    # Orchestrator
    'PeriodAnalysisOrchestrator',
    
    # Scoring
    'ScoringEngine',
    'ScoreComponent',
    
    # Events
    'EventCalculator',
    'EventName',
    'EventCalculatorResult',
    
    # Backward compatibility
    'get_full_period_analysis'
]
