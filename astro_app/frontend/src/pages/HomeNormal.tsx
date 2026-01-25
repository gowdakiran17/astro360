import React, { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import FocusCard from '../components/home/FocusCard';
import LifeScores from '../components/home/LifeScores';
import AstroWeather from '../components/home/AstroWeather';
import RemedyCard from '../components/home/RemedyCard';
import QuickActions from '../components/home/QuickActions';
import { generateDailyReport, DailyReport } from '../utils/dailyAnalysis';
import { BookOpen, Sparkles, Compass } from 'lucide-react';

interface HomeNormalProps {
    profile: any;
    chartData: any;
    panchangData: any;
    shadbalaData: any;
    dashaData: any;
    transitData: any;
    selectedDate: Date;
    isLoading: boolean;
}

const HomeNormal: React.FC<HomeNormalProps> = ({ 
    profile,
    chartData,
    panchangData,
    shadbalaData,
    dashaData,
    transitData,
    selectedDate,
    isLoading
}) => {
    // Derived State
    const [dayRating, setDayRating] = useState(4);
    const [scores, setScores] = useState<any>({
        career: 'Neutral',
        money: 'Neutral',
        relationships: 'Neutral'
    });
    const [lifeScores, setLifeScores] = useState({
        love: 50,
        career: 50,
        money: 50,
        health: 50,
        home: 50
    });
    const [focus, setFocus] = useState({
        good: ['Planning', 'Routine work'],
        avoid: ['Risky investments', 'Conflicts']
    });
    const [weather, setWeather] = useState([
        'Energy is balanced today',
        'Good for steady progress',
        'Stay grounded'
    ]);
    const [remedies, setRemedies] = useState([
        'Offer water to the Sun',
        'Meditate for 10 minutes',
        'Help someone in need'
    ]);
    const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);

    useEffect(() => {
        if (!chartData || !panchangData) return;

        // Generate Detailed Report
        const report = generateDailyReport(chartData, transitData, dashaData, selectedDate);
        setDailyReport(report);

        // --- 1. Calculate Day Rating (1-5) ---
        let rating = 3;
        // Moon Phase Bonus
        const tithi = panchangData.tithi?.index || 1;
        if (tithi >= 1 && tithi <= 15) rating += 0.5; // Waxing (Shukla Paksha)
        
        // Shadbala Influence (General Strength)
        const avgStrength = shadbalaData?.planets 
            ? shadbalaData.planets.reduce((acc: number, p: any) => acc + p.percentage, 0) / 7 
            : 50;
        if (avgStrength > 70) rating += 1;
        if (avgStrength < 40) rating -= 1;

        setDayRating(Math.min(Math.max(Math.round(rating), 1), 5));

        // --- 2. Calculate Life Scores (0-100) ---
        // Helper to get planet strength
        const getStrength = (planetName: string) => {
            const p = shadbalaData?.planets?.find((pl: any) => pl.name === planetName);
            return p ? p.percentage : 50;
        };

        const sunStr = getStrength('Sun');
        const moonStr = getStrength('Moon');
        const marsStr = getStrength('Mars');
        const mercuryStr = getStrength('Mercury');
        const jupiterStr = getStrength('Jupiter');
        const venusStr = getStrength('Venus');
        const saturnStr = getStrength('Saturn');

        // Formulas
        const careerScore = Math.round((sunStr * 0.4) + (saturnStr * 0.3) + (marsStr * 0.3));
        const moneyScore = Math.round((jupiterStr * 0.5) + (mercuryStr * 0.3) + (venusStr * 0.2));
        const loveScore = Math.round((venusStr * 0.6) + (moonStr * 0.4));
        const healthScore = Math.round((sunStr * 0.5) + (marsStr * 0.3) + (moonStr * 0.2));
        const homeScore = Math.round((moonStr * 0.5) + (venusStr * 0.3) + (jupiterStr * 0.2));

        setLifeScores({
            career: careerScore,
            money: moneyScore,
            love: loveScore,
            health: healthScore,
            home: homeScore
        });

        // --- 3. Set Qualitative Scores ---
        const qualify = (score: number) => {
            if (score > 75) return 'Excellent';
            if (score > 60) return 'Favorable';
            if (score > 40) return 'Neutral';
            return 'Sensitive';
        };

        setScores({
            career: qualify(careerScore),
            money: qualify(moneyScore),
            relationships: qualify(loveScore)
        });

        // --- 4. Daily Focus (Based on Moon Sign & Tithi) ---
        const moonSign = chartData.planets.find((p: any) => p.name === 'Moon')?.zodiac_sign || 'Aries';
        
        // Simple mapping based on element
        const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
        const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
        const airSigns = ['Gemini', 'Libra', 'Aquarius'];
        const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

        let goodActions = ['Routine tasks'];
        let avoidActions = ['Unnecessary risks'];

        if (fireSigns.includes(moonSign)) {
            goodActions = ['Taking initiative', 'Physical activity', 'Leadership tasks'];
            avoidActions = ['Aggressive arguments', 'Impatience'];
        } else if (earthSigns.includes(moonSign)) {
            goodActions = ['Financial planning', 'Organizing', 'Long-term goals'];
            avoidActions = ['Stubbornness', 'Over-spending'];
        } else if (airSigns.includes(moonSign)) {
            goodActions = ['Communication', 'Socializing', 'Learning new things'];
            avoidActions = ['Gossip', 'Scattered focus'];
        } else if (waterSigns.includes(moonSign)) {
            goodActions = ['Self-care', 'Family time', 'Creative work'];
            avoidActions = ['Over-sensitivity', 'Emotional eating'];
        }
        setFocus({ good: goodActions, avoid: avoidActions });

        // --- 5. Astro Weather (Panchang based) ---
        const nakshatra = panchangData.nakshatra?.name || 'Unknown';
        const yoga = panchangData.yoga?.name || 'Unknown';
        
        setWeather([
            `Moon is in ${moonSign}`,
            `Star of the day: ${nakshatra}`,
            `Yoga: ${yoga}`
        ]);

        // --- 6. Remedies (Day of Week) ---
        const day = panchangData.vara?.name || selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        let dailyRemedies = ['Meditate for 5 mins'];
        
        if (day === 'Sunday') dailyRemedies = ['Offer water to Sun', 'Respect father figures', 'Wear ruby/red'];
        if (day === 'Monday') dailyRemedies = ['Offer milk to Shiva', 'Respect mother', 'Wear white'];
        if (day === 'Tuesday') dailyRemedies = ['Chant Hanuman Chalisa', 'Avoid anger', 'Wear red/orange'];
        if (day === 'Wednesday') dailyRemedies = ['Feed green grass to cows', 'Check finances', 'Wear green'];
        if (day === 'Thursday') dailyRemedies = ['Respect teachers', 'Donate yellow items', 'Wear yellow'];
        if (day === 'Friday') dailyRemedies = ['Respect women', 'Use fragrances', 'Wear white/pink'];
        if (day === 'Saturday') dailyRemedies = ['Help the poor', 'Light oil lamp', 'Wear blue/black'];

        setRemedies(dailyRemedies);

    }, [chartData, panchangData, shadbalaData]);

    if (isLoading && !chartData && !panchangData) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-slate-500 text-sm">Analyzing stars...</p>
            </div>
        </div>;
    }

    if (!isLoading && !chartData && !panchangData) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <p className="text-slate-500 text-sm">Unable to load your astrological overview.</p>
                <p className="text-slate-400 text-xs">Please check your connection and try again.</p>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Header Removed (Handled by HomeDashboard) */}
            
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Hero Section - Spans full width */}
                    <div className="md:col-span-3">
                        <HeroSection 
                            name={profile?.name || "Kiran"} 
                            dayRating={dayRating} 
                            scores={scores} 
                        />

                        {/* NEW: Daily Detailed Analysis */}
                        {dailyReport && (
                            <div className="mt-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                    Daily Cosmic Report
                                </h2>
                                
                                <div className="space-y-8">
                                    {/* Personal Prediction */}
                                    <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                                        <p className="text-slate-700 leading-relaxed font-medium text-lg">
                                            "{dailyReport.personalPrediction}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Influences */}
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                Planetary Influences
                                            </h3>
                                            <div className="space-y-4">
                                                {dailyReport.planetaryInfluences.map((inf, i) => (
                                                    <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                                            inf.type === 'positive' ? 'bg-emerald-500' : 
                                                            inf.type === 'negative' ? 'bg-rose-500' : 'bg-slate-400'
                                                        }`} />
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm mb-1">{inf.planet}</div>
                                                            <div className="text-slate-600 text-sm leading-snug">{inf.influence}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {dailyReport.planetaryInfluences.length === 0 && (
                                                    <div className="text-slate-400 text-sm italic">No major planetary shifts today.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Compass className="w-4 h-4 text-emerald-600" />
                                                Recommendations
                                            </h3>
                                            <ul className="space-y-3">
                                                {dailyReport.recommendations.map((rec, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                                                            {i+1}
                                                        </div>
                                                        <span className="font-medium">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            
                                            <div className="mt-6 pt-6 border-t border-slate-100 flex gap-8">
                                                <div>
                                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Lucky Color</div>
                                                    <div className="text-lg font-bold text-slate-900">{dailyReport.luckyFactors.color}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Lucky Number</div>
                                                    <div className="text-lg font-bold text-slate-900">{dailyReport.luckyFactors.number}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Direction</div>
                                                    <div className="text-lg font-bold text-slate-900">{dailyReport.luckyFactors.direction}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Row 2: Life Scores (Wide) & Focus (Narrow) */}
                    <div className="md:col-span-2">
                        <LifeScores scores={lifeScores} />
                    </div>
                    <div className="md:col-span-1">
                        <FocusCard 
                            goodActions={focus.good} 
                            avoidActions={focus.avoid} 
                        />
                    </div>

                    {/* Row 3: Three Equal Columns */}
                    <div className="md:col-span-1">
                        <AstroWeather weather={weather} />
                    </div>
                    <div className="md:col-span-1">
                        <RemedyCard remedies={remedies} />
                    </div>
                    <div className="md:col-span-1">
                        <QuickActions />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeNormal;
