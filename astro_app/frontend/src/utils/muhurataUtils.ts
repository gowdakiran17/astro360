import { formatTimeWithTimezone } from './dateUtils';

export interface MuhurataPeriod {
  name: string;
  start: number;
  end: number;
  quality: string;
  type?: string;
  ruler?: string;
}

export interface ProcessedMuhurataPeriod {
  time: string;
  name: string;
  quality: string;
  duration: string;
  description: string;
  favorability: number;
  bestFor: string[];
  avoid: string[];
  details: {
    reason: string;
    planetary?: string;
  };
}

export const processMuhurataData = (periods: MuhurataPeriod[], timezone: string): ProcessedMuhurataPeriod[] => {
  if (!periods) return [];

  return periods.map((p) => {
    const startTime = formatTimeWithTimezone(p.start, timezone);
    const endTime = formatTimeWithTimezone(p.end, timezone);

    // Map Quality to Grade
    let grade = 'B';
    let favorability = 50;
    if (p.quality === 'Excellent') { grade = 'A'; favorability = 95; }
    else if (p.quality === 'Good') { grade = 'B'; favorability = 80; }
    else if (p.quality === 'Poor') { grade = 'D'; favorability = 40; }
    else if (p.quality === 'Avoid') { grade = 'F'; favorability = 15; }

    // Generate Description based on Name
    let desc = `Period of ${p.name}`;
    let bestFor: string[] = [];
    let avoid: string[] = [];

    if (p.name.includes("Rahu")) {
        desc = "Highly inauspicious period ruled by Rahu. Avoid all major actions.";
        avoid = ["Travel", "New Ventures", "Signing Contracts"];
    } else if (p.name.includes("Yamaganda")) {
        desc = "Period of death-like delays. Good for endings, bad for beginnings.";
        avoid = ["Starting Work", "Journey"];
    } else if (p.name.includes("Gulika")) {
        desc = "Saturn's son. Events started now may repeat or have long-lasting burdens.";
        avoid = ["Loans", "New Projects"];
    } else if (p.name.includes("Abhijit")) {
        desc = "Victorious moment. Removes most doshas. Excellent for all auspicious works.";
        bestFor = ["Everything", "Travel", "Victory"];
    } else if (p.name.includes("Brahma")) {
        desc = "Excellent for creative work and learning.";
        bestFor = ["Study", "Planning", "Creative Arts"];
    } else if (p.name.includes("Amrit")) {
        desc = "Nectar-like time. Ensures longevity and success.";
        bestFor = ["Health", "Long-term investments"];
    }

    // Calculate Duration
    const durationMs = (p.end - p.start) * 86400000;
    const durationMins = Math.round(durationMs / 60000);

    return {
        time: `${startTime} – ${endTime}`,
        name: p.name,
        quality: grade,
        duration: `${durationMins}m`,
        description: desc,
        favorability,
        bestFor,
        avoid,
        details: {
            reason: `${p.quality} quality period (${p.type || 'General'})`,
            planetary: p.ruler ? `Ruled by ${p.ruler}` : undefined
        }
    };
  });
};

export const calculateSummary = (processedPeriods: ProcessedMuhurataPeriod[]) => {
    const summary = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    processedPeriods.forEach(p => {
        if (summary[p.quality as keyof typeof summary] !== undefined) {
            summary[p.quality as keyof typeof summary]++;
        }
    });
    return summary;
};
