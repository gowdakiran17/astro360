
// Utility to interpret Astrological Periods (Dashas) into Life Phase Insights
// Designed for "Normal User" view - non-technical, actionable, and human-centric.

export interface LifePhaseData {
  // 1. Life Phase Overview
  phaseName: string; // e.g., "Growth & Discipline Phase"
  status: 'Smooth' | 'Mixed' | 'Demanding';
  endDate: string;
  oneLineMeaning: string;

  // 2. Life Phase Timeline
  timeline: {
    past: string;
    current: string;
    next: string;
    progress: number; // 0-100
    nextImprovement: string;
  };

  // 3. What This Phase Means for You
  areas: {
    career: { title: string; what: string; expect: string; handle: string };
    money: { title: string; what: string; expect: string; handle: string };
    relationships: { title: string; what: string; expect: string; handle: string };
    health: { title: string; what: string; expect: string; handle: string };
  };

  // 4. Phase Stability Meter
  stability: {
    level: 'Stable' | 'Moderate' | 'Temporary Unstable';
    explanation: string;
  };

  // 5. Phase Scorecard (0-100)
  scores: {
    career: number;
    money: number;
    relationships: number;
    health: number;
    mental: number;
  };

  // 6. Opportunities (3 items)
  opportunities: Array<{ title: string; why: string }>;

  // 7. Challenges (2-3 items)
  challenges: Array<{ title: string; description: string }>;

  // 8. What to Do & Avoid
  dos: string[];
  avoids: string[];

  // 9. Timing & Changes
  timing: {
    pressureReduces: string;
    improvementBegins: string;
    cautionMonth: string;
  };

  // 10. Balance & Alignment Tips
  balance: {
    habit: string;
    mindset: string;
    spiritual: string;
  };

  // 11. Personal Message
  personalMessage: string;
}

interface PlanetMeta {
  name: string;
  adjective: string;
  theme: string;
  nature: 'Smooth' | 'Mixed' | 'Demanding';
  keywords: string[];
  color: string;
}

const PLANET_DATA: Record<string, PlanetMeta> = {
  Sun: {
    name: "Vitality",
    adjective: "Radiant",
    theme: "Authority & Self",
    nature: "Demanding", // Can be intense
    keywords: ["Leadership", "Visibility", "Ego"],
    color: "amber"
  },
  Moon: {
    name: "Flow",
    adjective: "Emotional",
    theme: "Heart & Home",
    nature: "Smooth",
    keywords: ["Comfort", "Feelings", "Peace"],
    color: "slate"
  },
  Mars: {
    name: "Action",
    adjective: "Dynamic",
    theme: "Energy & Drive",
    nature: "Demanding",
    keywords: ["Courage", "Conflict", "Speed"],
    color: "red"
  },
  Rahu: {
    name: "Ambition",
    adjective: "Transformative",
    theme: "Desire & Change",
    nature: "Demanding",
    keywords: ["Innovation", "Obsession", "Foreign"],
    color: "indigo"
  },
  Jupiter: {
    name: "Wisdom",
    adjective: "Expansive",
    theme: "Growth & Luck",
    nature: "Smooth",
    keywords: ["Optimism", "Learning", "Wealth"],
    color: "yellow"
  },
  Saturn: {
    name: "Structure",
    adjective: "Disciplined",
    theme: "Karma & Focus",
    nature: "Demanding",
    keywords: ["Hard Work", "Patience", "Reality"],
    color: "blue"
  },
  Mercury: {
    name: "Intellect",
    adjective: "Mental",
    theme: "Communication",
    nature: "Smooth",
    keywords: ["Business", "Learning", "Flexibility"],
    color: "emerald"
  },
  Ketu: {
    name: "Detachment",
    adjective: "Spiritual",
    theme: "Release & Insight",
    nature: "Mixed",
    keywords: ["Intuition", "Letting Go", "Spirit"],
    color: "purple"
  },
  Venus: {
    name: "Harmony",
    adjective: "Creative",
    theme: "Love & Luxury",
    nature: "Smooth",
    keywords: ["Romance", "Comfort", "Art"],
    color: "pink"
  }
};

export const interpretDasha = (
  mahadasha: string, 
  antardasha: string, 
  startDate: string,
  endDate: string,
  nextDashaName: string = "Next Phase"
): LifePhaseData => {
  const md = PLANET_DATA[mahadasha] || PLANET_DATA['Sun'];
  const ad = PLANET_DATA[antardasha] || PLANET_DATA['Moon'];

  // Determine Status
  let status: 'Smooth' | 'Mixed' | 'Demanding' = 'Mixed';
  if (md.nature === 'Smooth' && ad.nature === 'Smooth') status = 'Smooth';
  else if (md.nature === 'Demanding' || ad.nature === 'Demanding') status = 'Demanding';
  else status = 'Mixed';

  // Determine Stability
  let stabilityLevel: 'Stable' | 'Moderate' | 'Temporary Unstable' = 'Moderate';
  if (status === 'Smooth') stabilityLevel = 'Stable';
  if (ad.name === 'Rahu' || ad.name === 'Ketu') stabilityLevel = 'Temporary Unstable';
  if (mahadasha === 'Saturn' && antardasha === 'Mars') stabilityLevel = 'Temporary Unstable'; // Classic friction

  // Calculate Progress
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const total = end - start;
  const elapsed = now - start;
  let progress = Math.round((elapsed / total) * 100);
  progress = Math.max(0, Math.min(100, progress));

  // Date Formatting
  const endObj = new Date(endDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const endMonth = monthNames[endObj.getMonth()];
  const endYear = endObj.getFullYear();

  return {
    // 1. Overview
    phaseName: `Phase of ${md.theme}`,
    status: status,
    endDate: `${endMonth} ${endYear}`,
    oneLineMeaning: `A transformative period inviting you to embrace ${md.keywords[0].toLowerCase()} while navigating ${ad.theme.toLowerCase()}.`,

    // 2. Timeline
    timeline: {
      past: "Previous Chapter",
      current: "Current Phase",
      next: nextDashaName,
      progress: progress,
      nextImprovement: `Early ${endMonth} ${endYear}`
    },

    // 3. Meaning (Simplified Heuristics)
    areas: {
      career: {
        title: "Career & Work",
        what: `The current energy supports ${md.keywords[0].toLowerCase()} and professional growth.`,
        expect: status === 'Demanding' ? "You may face increased responsibility or workload." : "Steady progress and potential for recognition.",
        handle: "Focus on consistency and clear communication."
      },
      money: {
        title: "Money & Wealth",
        what: `Financial ${ad.name === 'Jupiter' || ad.name === 'Venus' ? 'opportunities are' : 'discipline is'} highlighted.`,
        expect: `Be mindful of expenses related to ${ad.keywords[0].toLowerCase()} or lifestyle upgrades.`,
        handle: "Stick to a budget and avoid impulse decisions."
      },
      relationships: {
        title: "Relationships",
        what: `Emotional focus is on ${ad.theme.toLowerCase().split('&')[0].trim()}.`,
        expect: ad.nature === 'Demanding' ? "You may need to work harder to maintain harmony." : "Moments of deep connection and understanding.",
        handle: "Communicate clearly and be patient with others."
      },
      health: {
        title: "Health & Energy",
        what: `Vitality levels are ${status === 'Smooth' ? 'stable' : 'variable'} during this time.`,
        expect: "You may need more rest or mental recharge than usual.",
        handle: "Prioritize sleep and moderate, consistent exercise."
      }
    },

    // 4. Stability
    stability: {
      level: stabilityLevel,
      explanation: stabilityLevel === 'Stable' 
        ? "Things are generally calm and predictable."
        : stabilityLevel === 'Moderate'
        ? "Some ups and downs, but manageable."
        : "Expect sudden changes; stay flexible."
    },

    // 5. Scorecard (Mock Logic based on planets)
    scores: {
      career: md.name === 'Sun' || md.name === 'Mars' || md.name === 'Saturn' ? 85 : 70,
      money: md.name === 'Jupiter' || md.name === 'Venus' ? 90 : 65,
      relationships: ad.name === 'Venus' || ad.name === 'Moon' ? 85 : 60,
      health: md.name === 'Sun' || ad.name === 'Mars' ? 80 : 65,
      mental: ad.name === 'Mercury' || ad.name === 'Moon' ? 80 : 60
    },

    // 6. Opportunities
    opportunities: [
      { title: `Enhance your ${md.keywords[0].toLowerCase()}`, why: "The current energy supports growth in this area." },
      { title: `Focus on ${ad.keywords[0].toLowerCase()}`, why: `You have a natural ability to improve this right now.` },
      { title: "Personal Development", why: "A favorable time for self-improvement and learning." }
    ],

    // 7. Challenges
    challenges: [
      { title: `Managing ${md.keywords[2] || 'expectations'}`, description: "Be mindful not to overextend yourself." },
      { title: "Emotional Balance", description: "You may feel more sensitive than usual; take time to ground yourself." }
    ],

    // 8. Do's & Avoids
    dos: [
      `Prioritize ${md.keywords[1].toLowerCase()}`,
      "Maintain a consistent daily routine",
      "Seek guidance from mentors or trusted friends"
    ],
    avoids: [
      "Rushing into major life-altering decisions",
      "Ignoring physical or emotional signals",
      "Unnecessary conflicts or arguments"
    ],

    // 9. Timing
    timing: {
      pressureReduces: `Around ${endMonth} ${endYear}`,
      improvementBegins: "In the coming weeks",
      cautionMonth: endMonth // Placeholder
    },

    // 10. Balance
    balance: {
      habit: "Daily 10-min quiet reflection",
      mindset: status === 'Demanding' ? "Resilience & Patience" : "Gratitude & Flow",
      spiritual: "Light meditation, nature walks, or journaling"
    },

    // 11. Personal Message
    personalMessage: `You are currently navigating a phase centered on ${md.theme.toLowerCase()}. While there may be moments of intensity regarding ${ad.theme.toLowerCase()}, trust that this period is designed to strengthen your foundation. Focus on ${md.keywords[1].toLowerCase()}, stay patient with yourself, and remember that this energy is helping you grow.`
  };
};
