"""
Astrological Knowledge Base
Contains static data for Planet Significations, Remedies, and Rules.
"""

PLANET_SIGNIFICATIONS = {
    "Sun": {
        "natural_significator": [
            "Soul", "Father", "Authority", "Government", "Power",
            "Leadership", "Confidence", "Ego", "Health", "Vitality",
            "Spirituality", "Dignity", "Fame", "Administrative ability"
        ],
        "career_fields": [
            "Government service", "Administration", "Politics",
            "Medical (especially bones, heart)", "Pharmacy",
            "Gold/Copper trading", "Forest officer", "Leadership roles"
        ],
        "body_parts": ["Heart", "Right eye (males)", "Bones", "Stomach"],
        "gemstone": "Ruby",
        "metal": "Gold",
        "color": ["Red", "Orange", "Saffron"],
        "day": "Sunday",
        "direction": "East",
        "element": "Fire",
        "remedies": {
            "gemstone": "Ruby (Manikya) in Gold, Ring finger, Sunday sunrise",
            "mantra": "Om Suryaya Namaha",
            "donation": "Wheat, Jaggery, Copper, Red cloth",
            "fasting": "Sunday"
        }
    },
    "Moon": {
        "natural_significator": [
            "Mind", "Mother", "Emotions", "Intuition", "Memory",
            "Public", "Masses", "Liquids", "Nurturing", "Comfort"
        ],
        "career_fields": [
            "Psychology", "Counseling", "Hospitality", "Food industry",
            "Dairy", "Liquor", "Shipping", "Water resources",
            "Public relations", "Nursing", "Child care"
        ],
        "body_parts": ["Mind", "Left eye (males)", "Breasts", "Stomach", "Blood", "Lymphatic system"],
        "gemstone": "Pearl",
        "metal": "Silver",
        "color": ["White", "Cream"],
        "day": "Monday",
        "direction": "Northwest",
        "element": "Water",
        "remedies": {
            "gemstone": "Pearl (Moti) in Silver, Little finger, Monday morning",
            "mantra": "Om Chandraya Namaha",
            "donation": "Rice, Milk, White cloth, Silver",
            "fasting": "Monday"
        }
    },
    "Mars": {
        "natural_significator": [
            "Energy", "Courage", "Brothers", "Property", "Passion",
            "Aggression", "Sports", "Military", "Surgery", "Violence",
            "Technical skills", "Engineering"
        ],
        "career_fields": [
            "Military", "Police", "Sports", "Surgery", "Engineering",
            "Real estate", "Construction", "Mechanical work"
        ],
        "body_parts": ["Blood", "Muscles", "Bone marrow", "Head", "Genitals"],
        "gemstone": "Red Coral",
        "metal": "Copper",
        "color": ["Red", "Maroon"],
        "day": "Tuesday",
        "direction": "South",
        "element": "Fire",
        "remedies": {
            "gemstone": "Red Coral (Moonga) in Gold/Copper, Ring finger, Tuesday morning",
            "mantra": "Om Angarakaya Namaha",
            "donation": "Red Masoor Dal, Jaggery, Copper",
            "fasting": "Tuesday"
        }
    },
    "Mercury": {
        "natural_significator": [
            "Intelligence", "Communication", "Business", "Education",
            "Writing", "Mathematics", "Logic", "Wit", "Nervous system",
            "Commerce", "Accounting", "Publishing", "Technology"
        ],
        "career_fields": [
            "Accounting", "Teaching", "Writing", "Publishing",
            "IT/Software", "Business", "Trading", "Mathematics",
            "Astrology", "Journalism", "Sales", "Marketing"
        ],
        "body_parts": ["Nervous system", "Skin", "Lungs", "Tongue", "Speech", "Hands"],
        "gemstone": "Emerald",
        "metal": "Bronze/Brass",
        "color": ["Green", "Light green"],
        "day": "Wednesday",
        "direction": "North",
        "element": "Earth",
        "remedies": {
            "gemstone": "Emerald (Panna) in Gold, Little finger, Wednesday morning",
            "mantra": "Om Budhaya Namaha",
            "donation": "Green Moong Dal, Green cloth",
            "fasting": "Wednesday"
        }
    },
    "Jupiter": {
        "natural_significator": [
            "Wisdom", "Wealth", "Children", "Guru", "Law",
            "Religion", "Philosophy", "Optimism", "Expansion",
            "Liver", "Fat", "Gold", "Husband (in female chart)"
        ],
        "career_fields": [
            "Teaching", "Law/Judiciary", "Banking", "Finance",
            "Religion/Spirituality", "Advisory", "Counseling"
        ],
        "body_parts": ["Liver", "Hips", "Thighs", "Arteries", "Fat tissue"],
        "gemstone": "Yellow Sapphire",
        "metal": "Gold",
        "color": ["Yellow", "Golden"],
        "day": "Thursday",
        "direction": "Northeast",
        "element": "Ether",
        "remedies": {
            "gemstone": "Yellow Sapphire (Pukhraj) in Gold, Index finger, Thursday morning",
            "mantra": "Om Gurave Namaha",
            "donation": "Chana Dal, Turmeric, Yellow cloth, Gold",
            "fasting": "Thursday"
        }
    },
    "Venus": {
        "natural_significator": [
            "Love", "Marriage", "Beauty", "Luxury", "Arts",
            "Music", "Vehicles", "Flowers", "Seminal fluid",
            "Wife (in male chart)"
        ],
        "career_fields": [
            "Arts", "Music", "Cinema", "Fashion", "Jewelry",
            "Automobiles", "Hospitality", "Design", "Perfumes"
        ],
        "body_parts": ["Reproductive system", "Kidneys", "Face", "Throat (Singing)", "Eyes (Luster)"],
        "gemstone": "Diamond",
        "metal": "Silver/Platinum",
        "color": ["White", "Pink", "Variegated"],
        "day": "Friday",
        "direction": "Southeast",
        "element": "Water/Air",
        "remedies": {
            "gemstone": "Diamond/White Sapphire in Silver/Platinum, Middle/Little finger, Friday morning",
            "mantra": "Om Shukraya Namaha",
            "donation": "Rice, Sugar, Ghee, White cloth",
            "fasting": "Friday"
        }
    },
    "Saturn": {
        "natural_significator": [
            "Longevity", "Death", "Sorrow", "Discipline", "Delay",
            "Hard work", "Servants", "Oil", "Iron", "Minerals",
            "Separation", "Asceticism"
        ],
        "career_fields": [
            "Mining", "Oil & Gas", "Labor", "Agriculture",
            "Service industry", "Leather", "Iron/Steel", "Monk"
        ],
        "body_parts": ["Legs", "Knees", "Bones", "Teeth", "Nerves (Chronic)"],
        "gemstone": "Blue Sapphire",
        "metal": "Iron",
        "color": ["Black", "Dark Blue"],
        "day": "Saturday",
        "direction": "West",
        "element": "Air",
        "remedies": {
            "gemstone": "Blue Sapphire (Neelam) in Silver/Iron, Middle finger, Saturday evening",
            "mantra": "Om Shanaishcharaya Namaha",
            "donation": "Black Sesame, Urad Dal, Iron, Black cloth, Oil",
            "fasting": "Saturday"
        }
    },
    "Rahu": {
        "natural_significator": [
            "Obsession", "Illusion", "Foreign lands", "Technology",
            "Poison", "Snakes", "Innovation", "Rebellion", "Sudden gains/losses"
        ],
        "career_fields": [
            "IT/Technology", "Space", "Research", "Aviation",
            "Politics", "Gambling", "Foreign trade"
        ],
        "body_parts": ["Feet", "Breathing", "Phobia", "Skin diseases"],
        "gemstone": "Hessonite",
        "metal": "Lead",
        "color": ["Smoke", "Blue"],
        "day": "Saturday",
        "direction": "Southwest",
        "element": "Air",
        "remedies": {
            "gemstone": "Hessonite (Gomed) in Silver, Middle finger, Saturday night",
            "mantra": "Om Rahave Namaha",
            "donation": "Mustard Oil, Iron, Black Blanket",
            "fasting": "Saturday"
        }
    },
    "Ketu": {
        "natural_significator": [
            "Detachment", "Spirituality", "Moksha", "Occult",
            "Confusion", "Headless", "Flag", "Grandfather"
        ],
        "career_fields": [
            "Astrology", "Spirituality", "Programming", "Languages",
            "Microbiology", "Healing"
        ],
        "body_parts": ["Spine", "Nerves", "Mysterious diseases"],
        "gemstone": "Cat's Eye",
        "metal": "Iron",
        "color": ["Multi-color"],
        "day": "Tuesday",
        "direction": "Northeast",
        "element": "Fire",
        "remedies": {
            "gemstone": "Cat's Eye (Lehsunia) in Silver, Middle finger, Tuesday/Thursday night",
            "mantra": "Om Ketave Namaha",
            "donation": "Seven Grains (Satnaja), Blanket",
            "fasting": "Tuesday"
        }
    }
}
