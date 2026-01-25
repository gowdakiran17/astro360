
from astro_app.backend.vastu.astro_vastu import analyze_home_energy, get_personal_direction_strength

# Mock Data
zones = [
    {"direction": "North-East", "type": "Toilet"},  # Critical Defect
    {"direction": "South-East", "type": "Water Tank"}, # Fire-Water Clash
    {"direction": "North", "type": "Entrance"},     # Good
    {"direction": "South-West", "type": "Master Bedroom"} # Good
]

# Mock Planetary Strength (e.g. from chart)
direction_strengths = [
    {"direction": "North", "strength": "Strong"},
    {"direction": "South-East", "strength": "Weak"}
]

# Run Analysis
result = analyze_home_energy(zones, direction_strengths)

print("Overall Score:", result["overall_score"])
print("Scores:", result["scores"])
print("Blocks found:")
for b in result["blocks"]:
    print("-", b)

print("\nZone Details:")
for z in result["zone_details"]:
    print(f"- {z['direction']}: {z['type']} -> {z['status']} ({z['reason']})")
