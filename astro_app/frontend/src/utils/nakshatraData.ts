export interface NakshatraInfo {
  name: string;
  deity: string;
  symbol: string;
  planet: string;
  power: string;
  traits: string[];
  purpose: string;
  description: string;
  quality: string;
}

export const NAKSHATRA_DATA: Record<string, NakshatraInfo> = {
  "Ashwini": {
    name: "Ashwini",
    deity: "Ashwini Kumaras (Physicians of Gods)",
    symbol: "Horse's Head",
    planet: "Ketu",
    power: "Shidravyapani Shakti (Power to Quickly Heal)",
    traits: ["Pioneering", "Healing", "Speed", "Impulsive", "Independent"],
    purpose: "Dharma",
    description: "The Star of Transport. You are quick, energetic, and always ready to initiate new ventures. Healing and movement are central themes.",
    quality: "Light/Swift"
  },
  "Bharani": {
    name: "Bharani",
    deity: "Yama (God of Death/Dharma)",
    symbol: "Yoni (Female Reproductive Organ)",
    planet: "Venus",
    power: "Apabharani Shakti (Power to Take Things Away)",
    traits: ["Transformative", "Extreme", "Creative", "Determined", "Sexual"],
    purpose: "Artha",
    description: "The Star of Restraint. You undergo cycles of struggle and breakthrough. You have immense creative potential and strong willpower.",
    quality: "Fierce/Severe"
  },
  "Krittika": {
    name: "Krittika",
    deity: "Agni (God of Fire)",
    symbol: "Razor or Knife",
    planet: "Sun",
    power: "Dahana Shakti (Power to Burn/Purify)",
    traits: ["Sharp", "Critical", "Ambitious", "Purifying", "Protective"],
    purpose: "Kama",
    description: "The Star of Fire. You have a cutting intellect and a desire to purify or change things. You are direct and protective of your loved ones.",
    quality: "Mixed"
  },
  "Rohini": {
    name: "Rohini",
    deity: "Brahma (Creator)",
    symbol: "Chariot, Temple, Banyan Tree",
    planet: "Moon",
    power: "Rohana Shakti (Power to Grow)",
    traits: ["Creative", "Nurturing", "Aesthetic", "Possessive", "Stable"],
    purpose: "Moksha",
    description: "The Star of Ascent. You are driven by growth, beauty, and creativity. You have a magnetic presence and deep emotional desires.",
    quality: "Fixed"
  },
  "Mrigashirsha": {
    name: "Mrigashirsha",
    deity: "Soma (Moon God)",
    symbol: "Deer's Head",
    planet: "Mars",
    power: "Prinana Shakti (Power to Give Fulfillment)",
    traits: ["Curious", "Searching", "Gentle", "Restless", "Intelligent"],
    purpose: "Moksha",
    description: "The Searching Star. You are constantly seeking new experiences and knowledge. You have a gentle yet restless nature.",
    quality: "Soft/Mild"
  },
  "Ardra": {
    name: "Ardra",
    deity: "Rudra (Storm God)",
    symbol: "Teardrop, Diamond, Human Head",
    planet: "Rahu",
    power: "Yatna Shakti (Power to Make Effort)",
    traits: ["Intense", "Transforming", "Emotional", "Analytical", "Stormy"],
    purpose: "Kama",
    description: "The Star of Sorrow. You learn through emotional storms and transformation. Your intellect is sharp, like a diamond formed under pressure.",
    quality: "Sharp/Dreadful"
  },
  "Punarvasu": {
    name: "Punarvasu",
    deity: "Aditi (Mother of Gods)",
    symbol: "Bow and Quiver",
    planet: "Jupiter",
    power: "Vasutva Prapana Shakti (Power to Gain Substance)",
    traits: ["Nurturing", "Renewing", "Optimistic", "Forgiving", "Philosophical"],
    purpose: "Artha",
    description: "The Star of Renewal. You have the ability to bounce back from failure. You are protective and believe in the return of light.",
    quality: "Movable"
  },
  "Pushya": {
    name: "Pushya",
    deity: "Brihaspati (Guru of Gods)",
    symbol: "Cow's Udder, Lotus, Circle",
    planet: "Saturn",
    power: "Brahmavarchasa Shakti (Power to Create Spiritual Energy)",
    traits: ["Nourishing", "Spiritual", "Reliable", "Generous", "Teacher"],
    purpose: "Dharma",
    description: "The Star of Nourishment. You are a natural caregiver and teacher. You provide stability and wisdom to those around you.",
    quality: "Light/Swift"
  },
  "Ashlesha": {
    name: "Ashlesha",
    deity: "Nagas (Serpents)",
    symbol: "Coiled Serpent",
    planet: "Mercury",
    power: "Vis Ashleshana Shakti (Power to Inflict Poison)",
    traits: ["Intuitive", "Mystical", "Clinging", "Sharp", "Secretive"],
    purpose: "Dharma",
    description: "The Clinging Star. You have deep psychological insight and mystical ability. You can be intense and protective of your inner circle.",
    quality: "Sharp/Dreadful"
  },
  "Magha": {
    name: "Magha",
    deity: "Pitris (Ancestors)",
    symbol: "Royal Throne",
    planet: "Ketu",
    power: "Tyage Kshepani Shakti (Power to Leave the Body)",
    traits: ["Royal", "Traditional", "Authoritative", "Loyal", "Proud"],
    purpose: "Artha",
    description: "The Star of Power. You are connected to lineage and tradition. You naturally assume positions of authority and respect.",
    quality: "Fierce/Severe"
  },
  "Purva Phalguni": {
    name: "Purva Phalguni",
    deity: "Bhaga (God of Prosperity)",
    symbol: "Front Legs of a Bed, Hammock",
    planet: "Venus",
    power: "Prajanana Shakti (Power of Procreation)",
    traits: ["Creative", "Social", "Relaxed", "Sensual", "Charismatic"],
    purpose: "Kama",
    description: "The Star of Fruitfulness. You value rest, relaxation, and social connection. You have a natural charm and artistic flair.",
    quality: "Fierce/Severe"
  },
  "Uttara Phalguni": {
    name: "Uttara Phalguni",
    deity: "Aryaman (God of Contracts)",
    symbol: "Back Legs of a Bed",
    planet: "Sun",
    power: "Chayani Shakti (Power of Accumulation)",
    traits: ["Helpful", "Friendly", "Reliable", "Independent", "Structured"],
    purpose: "Moksha",
    description: "The Star of Patronage. You are dependable and value relationships based on honor and duty. You are a pillar of support.",
    quality: "Fixed"
  },
  "Hasta": {
    name: "Hasta",
    deity: "Savitar (Sun God)",
    symbol: "Hand or Fist",
    planet: "Moon",
    power: "Hasta Sthapaniya Shakti (Power to Put in Hand)",
    traits: ["Skillful", "Dexterous", "Witty", "Healing", "Detail-oriented"],
    purpose: "Moksha",
    description: "The Hand. You are skilled with your hands and mind. You have a quick wit and a talent for healing or craftsmanship.",
    quality: "Light/Swift"
  },
  "Chitra": {
    name: "Chitra",
    deity: "Vishwakarma (Celestial Architect)",
    symbol: "Pearl, Gem",
    planet: "Mars",
    power: "Punya Chayani Shakti (Power to Accumulate Merit)",
    traits: ["Artistic", "Visual", "Architectural", "Charming", "Perfectionist"],
    purpose: "Kama",
    description: "The Star of Wonder. You are a creator of form and beauty. You have an eye for design and a desire for perfection.",
    quality: "Soft/Mild"
  },
  "Swati": {
    name: "Swati",
    deity: "Vayu (Wind God)",
    symbol: "Shoot of Plant, Coral",
    planet: "Rahu",
    power: "Pradhvamsa Shakti (Power to Scatter like Wind)",
    traits: ["Independent", "Flexible", "Diplomatic", "Restless", "Business-minded"],
    purpose: "Artha",
    description: "The Self-Going Star. You value independence and freedom. You are adaptable and good at negotiation and trade.",
    quality: "Movable"
  },
  "Vishakha": {
    name: "Vishakha",
    deity: "Indra and Agni",
    symbol: "Triumphal Arch, Potter's Wheel",
    planet: "Jupiter",
    power: "Vyapana Shakti (Power to Achieve Many Fruits)",
    traits: ["Focused", "Ambitious", "Competitive", "Determined", "Goal-oriented"],
    purpose: "Dharma",
    description: "The Star of Purpose. You have a laser-like focus on your goals. You are driven to achieve and can be competitive.",
    quality: "Mixed"
  },
  "Anuradha": {
    name: "Anuradha",
    deity: "Mitra (God of Friendship)",
    symbol: "Lotus, Staff",
    planet: "Saturn",
    power: "Radhana Shakti (Power of Worship)",
    traits: ["Friendly", "Devoted", "Organizer", "Traveler", "Rebellious"],
    purpose: "Dharma",
    description: "The Star of Success. You value friendship and loyalty. You can organize people and often travel far from home.",
    quality: "Soft/Mild"
  },
  "Jyeshtha": {
    name: "Jyeshtha",
    deity: "Indra (King of Gods)",
    symbol: "Earring, Umbrella, Talisman",
    planet: "Mercury",
    power: "Arohana Shakti (Power to Rise/Conquer)",
    traits: ["Senior", "Protective", "Responsible", "Controlling", "Wise"],
    purpose: "Artha",
    description: "The Chief Star. You naturally take on leadership and responsibility. You protect your own but can be controlling.",
    quality: "Sharp/Dreadful"
  },
  "Mula": {
    name: "Mula",
    deity: "Nirriti (Goddess of Destruction)",
    symbol: "Roots, Tied Bunch of Roots",
    planet: "Ketu",
    power: "Barhana Shakti (Power to Ruin/Destroy)",
    traits: ["Investigative", "Deep", "Destructive", "Philosophical", "Resilient"],
    purpose: "Kama",
    description: "The Root Star. You go to the bottom of things. You may experience upheavals that lead to deep spiritual growth.",
    quality: "Sharp/Dreadful"
  },
  "Purva Ashadha": {
    name: "Purva Ashadha",
    deity: "Apah (Water Goddess)",
    symbol: "Winnowing Basket, Fan",
    planet: "Venus",
    power: "Varchograhana Shakti (Power to Invigorate)",
    traits: ["Invincible", "Proud", "Patient", "Optimistic", "Emotional"],
    purpose: "Moksha",
    description: "The Invincible Star. You have an unshakeable confidence and patience. You can purify emotions and situations.",
    quality: "Fierce/Severe"
  },
  "Uttara Ashadha": {
    name: "Uttara Ashadha",
    deity: "Vishwadevas (Universal Gods)",
    symbol: "Elephant Tusk, Small Bed",
    planet: "Sun",
    power: "Apradhrishya Shakti (Power to Give Permanent Victory)",
    traits: ["Responsible", "Enduring", "Virtuous", "Leader", "Persistent"],
    purpose: "Moksha",
    description: "The Universal Star. You are driven by duty and long-term goals. You achieve victory through perseverance and righteousness.",
    quality: "Fixed"
  },
  "Shravana": {
    name: "Shravana",
    deity: "Vishnu (Preserver)",
    symbol: "Ear, Three Footprints",
    planet: "Moon",
    power: "Samhanana Shakti (Power to Connect)",
    traits: ["Listening", "Learning", "Wise", "Traveler", "Service-oriented"],
    purpose: "Artha",
    description: "The Star of Learning. You have a great capacity for listening and acquiring knowledge. You are wise and service-oriented.",
    quality: "Movable"
  },
  "Dhanishta": {
    name: "Dhanishta",
    deity: "Ashta Vasus (Elemental Gods)",
    symbol: "Drum, Flute",
    planet: "Mars",
    power: "Khyapayitri Shakti (Power to Give Fame)",
    traits: ["Musical", "Wealthy", "Optimistic", "Rhythmic", "Ambitious"],
    purpose: "Dharma",
    description: "The Star of Symphony. You have a good sense of rhythm and timing. You are ambitious and often achieve wealth and fame.",
    quality: "Movable"
  },
  "Shatabhisha": {
    name: "Shatabhisha",
    deity: "Varuna (God of Cosmic Waters)",
    symbol: "Empty Circle, 100 Physicians",
    planet: "Rahu",
    power: "Bheshaja Shakti (Power to Heal)",
    traits: ["Healer", "Secretive", "Philosophical", "Visionary", "Solitary"],
    purpose: "Dharma",
    description: "The Veiling Star. You are secretive and have healing abilities. You see beyond the veil of reality.",
    quality: "Movable"
  },
  "Purva Bhadrapada": {
    name: "Purva Bhadrapada",
    deity: "Aja Ekapada (One-footed Goat)",
    symbol: "Front of a Funeral Cot, Two-faced Man",
    planet: "Jupiter",
    power: "Yajamana Udyamana Shakti (Power to Raise Evolutionary Level)",
    traits: ["Spiritual", "Intense", "Transformative", "Idealistic", "Eccentric"],
    purpose: "Artha",
    description: "The Burning Pair. You are passionate and transformative. You may have a dual nature, balancing the material and spiritual.",
    quality: "Fierce/Severe"
  },
  "Uttara Bhadrapada": {
    name: "Uttara Bhadrapada",
    deity: "Ahir Budhnya (Serpent of the Deep)",
    symbol: "Back of a Funeral Cot, Twins",
    planet: "Saturn",
    power: "Varshodyamana Shakti (Power to Bring Rain)",
    traits: ["Wise", "Patient", "Mystical", "Compassionate", "Renunciate"],
    purpose: "Kama",
    description: "The Warrior Star. You have deep wisdom and control over anger. You are compassionate and capable of great sacrifice.",
    quality: "Fixed"
  },
  "Revati": {
    name: "Revati",
    deity: "Pushan (Nurturer)",
    symbol: "Fish, Drum",
    planet: "Mercury",
    power: "Kshiradyapani Shakti (Power to Nourish)",
    traits: ["Nurturing", "Protective", "Wealthy", "Creative", "Dreamy"],
    purpose: "Moksha",
    description: "The Wealthy Star. You are a nurturer and protector. You support others on their journey and have a rich inner life.",
    quality: "Soft/Mild"
  }
};
