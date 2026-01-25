import { DayData, WeeklyForecast, MonthlyForecast } from '../types/periodAnalysis';

export const defaultWeeklyData: WeeklyForecast = {
    range: "Nov 9-15, 2026",
    score: 78,
    quality: "Good Week",
    theme: "Opportunity and Growth",
    energy: 8,
    summary: "This week brings a blend of productive energy and introspective moments. The first half favors communication and learning as Mercury prepares to change signs. Thursday marks a peak with excellent opportunities for important meetings and decisions.",
    days: [
      { id: 'mon', date: 'Nov 9', day: 'Monday', score: 68, energy: 7, theme: 'Thoughtful', best: '9-11 AM', caution: 'Hasty decisions' },
      { id: 'tue', date: 'Nov 10', day: 'Tuesday', score: 82, energy: 9, theme: 'Energetic', best: '7-10 AM', caution: 'Overcommitment' },
      { id: 'wed', date: 'Nov 11', day: 'Wednesday', score: 75, energy: 8, theme: 'Communicative', best: '10 AM-2 PM', caution: 'Gossip' },
      { id: 'thu', date: 'Nov 12', day: 'Thursday', score: 91, energy: 10, theme: 'Inspired', best: '9 AM-1 PM', caution: 'Doubt' },
      { id: 'fri', date: 'Nov 13', day: 'Friday', score: 78, energy: 8, theme: 'Social', best: '4-8 PM', caution: 'Overspending' },
      { id: 'sat', date: 'Nov 14', day: 'Saturday', score: 52, energy: 5, theme: 'Serious', best: '6-9 AM', caution: 'New ventures' },
      { id: 'sun', date: 'Nov 15', day: 'Sunday', score: 84, energy: 9, theme: 'Confident', best: '8 AM-12 PM', caution: 'Ego' },
    ] as DayData[]
};

export const defaultMonthlyData: MonthlyForecast = {
    month: "November 2026",
    score: 72,
    quality: "Good Month",
    theme: "Endings and New Beginnings",
    summary: "November 2026 focuses on completion and letting go under Ketu's influence. The month begins with moderate energy, peaking around November 12th. It's a time for tying up loose ends before the Venus Pratyantardasha shift on Nov 28.",
    weeks: [
      { id: 1, range: 'Nov 1-8', score: 70, theme: 'Health Checkup & Planning' },
      { id: 2, range: 'Nov 9-15', score: 78, theme: 'Peak Opportunities (Nov 12)' },
      { id: 3, range: 'Nov 16-22', score: 64, theme: 'Patience & Remedies' },
      { id: 4, range: 'Nov 23-30', score: 75, theme: 'Financial Planning & Transition' },
    ],
    keyDates: {
      best: ['Nov 12', 'Nov 25', 'Nov 27'],
      caution: ['Nov 9', 'Nov 14', 'Nov 19']
    },
    focusAreas: [
      "Complete pending projects",
      "Spiritual practices & letting go",
      "Health checkups",
      "Prepare for social Venus period"
    ]
};

export const defaultQuarterlyData = {
    period: "Nov 2026 - Jan 2027",
    score: 74,
    quality: "Good Quarter",
    summary: "The next 90 days represent a transformative quarter. November focuses on completion (Ketu). December brings the most favorable energy (79/100) with Venus Pratyantardasha, excellent for relationships and finance. January 2027 requires discipline as Saturn's influence intensifies.",
    months: [
      { name: 'November', score: 72, theme: 'Completion & Transition', details: 'Ketu influence, endings.' },
      { name: 'December', score: 79, theme: 'Creativity & Connection', details: 'Venus influence, peak month.' },
      { name: 'January', score: 68, theme: 'Discipline & Structure', details: 'Saturn retrograde, hard work.' },
    ],
    opportunities: [
      { area: "Career", dates: "Dec 8-15, Jan 20-25" },
      { area: "Relationships", dates: "Dec 3-18 (Golden Window)" },
      { area: "Finance", dates: "Nov 21-27, Dec 10-20" }
    ]
};
