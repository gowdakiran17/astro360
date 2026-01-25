
// dailyAnalysis.ts

interface Planet {
  name: string;
  zodiac_sign: string;
  longitude: number;
  house?: number;
}

interface ChartData {
  planets: Planet[];
  ascendant: {
    zodiac_sign: string;
  };
}

interface DashaPeriod {
  lord: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  antardashas?: DashaPeriod[];
}

interface DashaData {
  dashas: DashaPeriod[];
}

export interface DailyReport {
  personalPrediction: string;
  planetaryInfluences: {
    planet: string;
    influence: string;
    type: 'positive' | 'negative' | 'neutral';
  }[];
  recommendations: string[];
  luckyFactors: {
    color: string;
    number: number;
    direction: string;
  };
}

// Helper to get house number from Ascendant
const getHouse = (planetSign: string, ascSign: string) => {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const pIdx = signs.indexOf(planetSign);
  const aIdx = signs.indexOf(ascSign);
  if (pIdx === -1 || aIdx === -1) return 1;
  
  let house = (pIdx - aIdx) + 1;
  if (house <= 0) house += 12;
  return house;
};

export const generateDailyReport = (
  birthChart: ChartData,
  transitChart: ChartData,
  dashaData: DashaData,
  targetDate: Date
): DailyReport => {
  if (!birthChart || !transitChart) {
    return {
      personalPrediction: "Analyzing planetary alignments...",
      planetaryInfluences: [],
      recommendations: [],
      luckyFactors: { color: "White", number: 1, direction: "East" }
    };
  }

  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
  const influences: DailyReport['planetaryInfluences'] = [];
  const recommendations: string[] = [];
  
  // 1. Analyze Moon Transit (Chandra Gochar)
  const natalMoon = birthChart.planets.find(p => p.name === "Moon");
  const transitMoon = transitChart.planets.find(p => p.name === "Moon");
  const transitSaturn = transitChart.planets.find(p => p.name === "Saturn");

  let mood = "Stable";
  let focus = "Routine";

  if (natalMoon && transitMoon) {
    const moonHouse = getHouse(transitMoon.zodiac_sign, natalMoon.zodiac_sign);
    
    // Chandrashtama (8th House Transit)
    if (moonHouse === 8) {
      influences.push({
        planet: "Moon",
        influence: "Moon is transiting your 8th house from natal Moon (Chandrashtama). You might feel emotionally sensitive or face unexpected delays.",
        type: "negative"
      });
      recommendations.push("Avoid starting major new ventures today.");
      recommendations.push("Keep conversations polite and avoid arguments.");
      mood = "Cautious";
    } 
    // 12th House (Expenses/Sleep)
    else if (moonHouse === 12) {
      influences.push({
        planet: "Moon",
        influence: "Moon in 12th house suggests high expenses or disturbed sleep. Good for spiritual practices.",
        type: "neutral"
      });
      recommendations.push("Track your spending carefully.");
    }
    // 1st House (Energy)
    else if (moonHouse === 1) {
      influences.push({
        planet: "Moon",
        influence: "Moon over your natal Moon heightens emotions and intuition.",
        type: "positive"
      });
      recommendations.push("Trust your gut feeling today.");
    }
    // Good Houses (3, 6, 10, 11)
    else if ([3, 6, 10, 11].includes(moonHouse)) {
       influences.push({
        planet: "Moon",
        influence: `Moon in the ${moonHouse}th house brings gains, success in efforts, and good health.`,
        type: "positive"
      });
      focus = "Achievement";
    }
  }

  // 2. Dasha Analysis
  let currentDashaPlanet = "Unknown";
  if (dashaData && dashaData.dashas) {
      // Helper to check if date is within range
      const isDateInDasha = (d: DashaPeriod, date: Date) => {
          if (!d.start_date || !d.end_date) return false;
          // Handle various date formats if needed, assuming ISO or standard parsable string
          const start = new Date(d.start_date);
          const end = new Date(d.end_date);
          return date >= start && date <= end;
      };

      let activeMD = dashaData.dashas.find((d) => isDateInDasha(d, targetDate));
      if (!activeMD) activeMD = dashaData.dashas.find((d) => d.is_current);

      if (activeMD) {
          let activeAD = activeMD.antardashas?.find((ad) => isDateInDasha(ad, targetDate));
          if (!activeAD) activeAD = activeMD.antardashas?.find((ad) => ad.is_current);
          
          currentDashaPlanet = activeAD ? activeAD.lord : activeMD.lord;
          
          influences.push({
              planet: currentDashaPlanet,
              influence: `You are under the influence of ${currentDashaPlanet}. This period highlights ${currentDashaPlanet}-related themes in your life.`,
              type: "neutral"
          });
          
          // Simple Dasha logic
          if (currentDashaPlanet === "Jupiter") recommendations.push("Focus on learning and wisdom.");
          if (currentDashaPlanet === "Saturn") recommendations.push("Discipline and hard work are key now.");
          if (currentDashaPlanet === "Mercury") recommendations.push("Communication and business are favored.");
          if (currentDashaPlanet === "Venus") recommendations.push("Creative and romantic pursuits are highlighted.");
          if (currentDashaPlanet === "Mars") recommendations.push("Channel your high energy into physical activities.");
      }
  }

  // 3. Saturn Transit (Sade Sati Check)
  if (natalMoon && transitSaturn) {
      const saturnHouse = getHouse(transitSaturn.zodiac_sign, natalMoon.zodiac_sign);
      if ([12, 1, 2].includes(saturnHouse)) {
          influences.push({
              planet: "Saturn",
              influence: "You are in a phase of Sade Sati. Patience and perseverance are your best allies.",
              type: "neutral"
          });
      }
  }

  // 4. Personal Prediction Synthesis
  const prediction = `Today's energy is predominantly ${mood}. With ${transitMoon?.zodiac_sign} Moon influencing your chart, your focus should be on ${focus}. The planetary alignment suggests it's a ${mood === 'Cautious' ? 'better day for planning than action' : 'good day to move forward'}.`;

  // 5. Lucky Factors
  const colors: Record<string, string> = {
      'Sunday': 'Red', 'Monday': 'White', 'Tuesday': 'Orange',
      'Wednesday': 'Green', 'Thursday': 'Yellow', 'Friday': 'Pink', 'Saturday': 'Blue'
  };
  
  return {
    personalPrediction: prediction,
    planetaryInfluences: influences,
    recommendations: recommendations.slice(0, 3), // Top 3
    luckyFactors: {
        color: colors[dayOfWeek] || 'White',
        number: Math.floor(Math.random() * 9) + 1, // Simplified
        direction: 'East'
    }
  };
};
