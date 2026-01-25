from enum import Enum

class UserTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    ADMIN = "admin"

class Feature(str, Enum):
    # Core Astrology (Free)
    BASIC_CHART = "basic_chart"
    PLANETARY_DETAILS = "planetary_details"
    MAHADASHA = "mahadasha"
    
    # Advanced / Specialized (Premium)
    DIVISIONAL_CHARTS = "divisional_charts"
    ASTRO_VASTU = "astro_vastu"
    VEHICLE_EVALUATION = "vehicle_evaluation"
    DETAILED_INTERPRETATION = "detailed_interpretation"
    ASSET_INTELLIGENCE = "asset_intelligence"

# Feature Access Map
# Defines which features are available to which tiers.
# Note: Premium includes Free features. Admin includes everything.
TIER_ACCESS = {
    UserTier.FREE: {
        Feature.BASIC_CHART,
        Feature.PLANETARY_DETAILS,
        Feature.MAHADASHA,
        Feature.DIVISIONAL_CHARTS,
        Feature.ASSET_INTELLIGENCE,
        Feature.DETAILED_INTERPRETATION  # Enabled for testing/demo
    },
    UserTier.PREMIUM: {
        Feature.BASIC_CHART,
        Feature.PLANETARY_DETAILS,
        Feature.MAHADASHA,
        Feature.DIVISIONAL_CHARTS,
        Feature.ASTRO_VASTU,
        Feature.VEHICLE_EVALUATION,
        Feature.DETAILED_INTERPRETATION,
        Feature.ASSET_INTELLIGENCE
    },
    UserTier.ADMIN: set(Feature) # All features
}

def check_access(feature_name: Feature, user_tier: str) -> bool:
    """
    Checks if a user tier has access to a specific feature.
    Raises PermissionError if access is denied.
    Returns True if allowed.
    """
    # Normalize tier string to Enum
    try:
        tier_enum = UserTier(user_tier.lower())
    except ValueError:
        # Fallback to FREE if invalid tier
        tier_enum = UserTier.FREE

    allowed_features = TIER_ACCESS.get(tier_enum, set())
    
    if feature_name in allowed_features:
        return True
    
    # If not allowed, raise error
    raise PermissionError(
        f"Access Denied: Feature '{feature_name}' is not available for '{user_tier}' tier."
    )

def verify_user_access(user, feature_name: Feature):
    """
    Helper to check access for a database User object.
    """
    return check_access(feature_name, user.tier)


def get_available_features(user_tier: UserTier) -> list:
    """
    Returns a list of all features available to the user.
    """
    return list(TIER_ACCESS.get(user_tier, set()))
