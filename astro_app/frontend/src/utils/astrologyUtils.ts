import {
  User, Briefcase, Heart, Home, DollarSign,
  Shield, BookOpen, Star,
  Activity, Zap
} from 'lucide-react';
import { Transit } from '../types/periodAnalysis';

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const HOUSE_METADATA = [
  { id: 1, name: "1st House (Lagna)", lifeArea: "Self & Personality", icon: User, label: "Self & Health", brief: "Focus on self-development and vitality." },
  { id: 2, name: "2nd House (Dhana)", lifeArea: "Wealth & Family", icon: DollarSign, label: "Wealth & Family", brief: "Financial matters and family interactions." },
  { id: 3, name: "3rd House (Sahaja)", lifeArea: "Courage & Siblings", icon: Activity, label: "Courage & Communication", brief: "Short trips, siblings, and communication skills." }, // Replaced TrendingUp with Activity if icon mismatch, but keeping consistent
  { id: 4, name: "4th House (Sukha)", lifeArea: "Home & Mother", icon: Home, label: "Home & Mother", brief: "Domestic peace, property, and mother's health." },
  { id: 5, name: "5th House (Putra)", lifeArea: "Children & Creativity", icon: Zap, label: "Children & Creativity", brief: "Creative pursuits, children, and romance." },
  { id: 6, name: "6th House (Ripu)", lifeArea: "Health & Enemies", icon: Shield, label: "Health & Service", brief: "Daily routines, health, and overcoming obstacles." },
  { id: 7, name: "7th House (Kalatra)", lifeArea: "Partnerships", icon: Heart, label: "Partnerships", brief: "Relationships, marriage, and business partners." },
  { id: 8, name: "8th House (Randhra)", lifeArea: "Transformation", icon: Activity, label: "Transformation", brief: "Sudden changes, inheritance, and hidden matters." },
  { id: 9, name: "9th House (Bhagya)", lifeArea: "Fortune & Dharma", icon: BookOpen, label: "Fortune & Dharma", brief: "Higher learning, spirituality, and long travel." },
  { id: 10, name: "10th House (Karma)", lifeArea: "Career & Status", icon: Briefcase, label: "Career & Status", brief: "Professional life, reputation, and public standing." },
  { id: 11, name: "11th House (Labha)", lifeArea: "Gains & Friends", icon: Star, label: "Gains & Network", brief: "Income, social circles, and fulfilling desires." },
  { id: 12, name: "12th House (Vyaya)", lifeArea: "Losses & Liberation", icon: Activity, label: "Losses & Spirituality", brief: "Expenses, isolation, and spiritual liberation." },
];

/**
 * Calculates the house number for a planet based on the Ascendant sign.
 * 
 * @param planetSign The zodiac sign of the planet
 * @param ascSign The zodiac sign of the Ascendant
 * @returns The house number (1-12) or 0 if invalid
 */
export const getHouseNumber = (planetSign: string, ascSign: string): number => {
  if (!ascSign || !planetSign) return 0;

  const pIndex = ZODIAC_SIGNS.indexOf(planetSign);
  const aIndex = ZODIAC_SIGNS.indexOf(ascSign);

  if (pIndex === -1 || aIndex === -1) return 0;

  return ((pIndex - aIndex + 12) % 12) + 1;
};

// --- Type Guards ---

export const isValidDashaData = (data: any): boolean => {
  return data && Array.isArray(data.dashas) && data.dashas.length > 0;
};

export const isValidShadbalaData = (data: any): boolean => {
  return data && typeof data === 'object'; // Expand based on actual structure if needed
};

export const isValidTransitData = (data: any): data is Transit[] => {
  return data && Array.isArray(data) && data.every((transit: any) =>
    transit.name && transit.zodiac_sign && typeof transit.is_retrograde === 'boolean'
  );
};

// --- Helpers ---

export const BENEFIC_PLANETS = ["Jupiter", "Venus", "Moon", "Mercury"];
export const MALEFIC_PLANETS = ["Saturn", "Mars", "Rahu", "Ketu", "Sun"];

export const getPlanetNature = (planetName: string): 'benefic' | 'malefic' | 'neutral' => {
  if (BENEFIC_PLANETS.includes(planetName)) return 'benefic';
  if (MALEFIC_PLANETS.includes(planetName)) return 'malefic';
  return 'neutral';
};

export const getPlanetColor = (planet: string): string => {
  const colors: Record<string, string> = {
    Sun: "from-amber-500 to-orange-600",
    Moon: "from-slate-400 to-slate-600",
    Mars: "from-red-500 to-rose-700",
    Mercury: "from-emerald-500 to-teal-700",
    Jupiter: "from-yellow-500 to-amber-600",
    Venus: "from-pink-500 to-purple-600",
    Saturn: "from-indigo-600 to-slate-800",
    Rahu: "from-violet-600 to-indigo-800",
    Ketu: "from-orange-700 to-red-900"
  };
  return colors[planet] || "from-slate-500 to-slate-700";
};

// --- Scoring Helpers ---

// Sarvashtakavarga (SAV) Max Points Normalization Constant
// 28 is average, 30+ is strong. 35 is considered a very high strength benchmark for normalization.
export const MAX_SAV_POINTS = 35;

export const normalizeSavScore = (points: number): number => {
  return Math.min(100, Math.max(0, (points / MAX_SAV_POINTS) * 100));
};

export const getStarRating = (score: number): number => {
  return Math.ceil(score / 20);
};
