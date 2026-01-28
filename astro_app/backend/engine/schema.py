from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union

class AstrologyLogic(BaseModel):
    """
    Strict contract between Python Logic Engine and AI Voice.
    The AI receives ONLY this data. It receives NO ASTROLOGY CHARTS.
    """
    intent: str  # e.g., "career_prediction", "match_compatibility"
    focus_topic: str # e.g., "job_change", "marriage_timing"
    
    # The Core Decision (Python Brain)
    main_insight: str # The definitive answer. e.g. "Good time for change."
    
    # Supporting Evidence (Abstracted)
    supporting_factors: List[str] # e.g. ["Jupiter activating 10th house indicates growth"]
    limiting_factors: List[str] # e.g. ["Saturn transit causes initial delay"]
    
    # Specific Timing (Calculated by Python)
    timing_windows: List[Dict[str, str]] # [{"phase": "Preparation", "date": "Jan-Feb 2024", "action": "Plan"}]
    
    # Actionable Advice (Rule-based)
    recommended_actions: List[str] # ["Update Resume", "Wait for offer"]
    
    # Meta
    confidence_score: float # 0.0 to 1.0 (Python logic certainty)
    visual_cues: Dict[str, str] # {"strength": "green:Jupiter", "weakness": "red:Saturn"}

    class Config:
        frozen = True
