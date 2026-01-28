import { Star, TrendingUp, AlertCircle, ChevronDown, ChevronUp, CheckCircle, Sparkles, Zap, Shield, Flame, Gem, BookOpen } from 'lucide-react';
import { HouseStrength } from '../../types/periodAnalysis';
import { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface HouseStrengthMatrixProps {
    strengths: {
        strongest_houses: HouseStrength[];
        sav: number[]; // Array of 12 scores
    };
}

// PREMIUM DATA MODEL
const HOUSE_DATA = [
    {
        name: "Self",
        full: "Self & Vitality",
        desc: "Body, appearance, vitality",
        keywords: ["Health", "Identity"],
        remedy: "Practice Sun Salutations at sunrise.",
        mantra: "Om Suryaya Namaha",
        gemstone: "Ruby",
        archetype: "The Sovereign",
        insight: "This house governs your physical vessel and how you project yourself to the world. A strong score here indicates robust health and charismatic presence.",
        activities: ["Health routine", "Grooming"],
        cautions: ["Neglect", "Ego"],
        purushartha: "Dharma",
        karaka: "Sun"
    },
    {
        name: "Wealth",
        full: "Wealth & Family",
        desc: "Finance, speech, family",
        keywords: ["Assets", "Speech"],
        remedy: "Donate food to the needy on Thursdays.",
        mantra: "Om Brihaspataye Namaha",
        gemstone: "Yellow Sapphire",
        archetype: "The Treasurer",
        insight: "Your accumulated resources, lineage, and the power of your voice. Strength here ensures financial stability and harmonious family bonds.",
        activities: ["Investment", "Family time"],
        cautions: ["Speech", "Spending"],
        purushartha: "Artha",
        karaka: "Jupiter"
    },
    {
        name: "Siblings",
        full: "Courage & Siblings",
        desc: "Courage, communication",
        keywords: ["Bravery", "Skills"],
        remedy: "Practice silence (Mauna) for 1 hour.",
        mantra: "Om Angarakaya Namaha",
        gemstone: "Red Coral",
        archetype: "The Warrior",
        insight: "The seat of your willpower and initiative. This energy drives you to take action, communicate effectively, and defend your boundaries.",
        activities: ["Writing", "Short travel"],
        cautions: ["Arguments", "Documents"],
        purushartha: "Kama",
        karaka: "Mars"
    },
    {
        name: "Home",
        full: "Home & Happiness",
        desc: "Mother, home, peace",
        keywords: ["Property", "Comfort"],
        remedy: "Keep the North-East corner of home clean.",
        mantra: "Om Somaya Namaha",
        gemstone: "Pearl",
        archetype: "The Nurturer",
        insight: "Your emotional anchor and inner sanctuary. It reflects your peace of mind, relationship with the mother, and physical property.",
        activities: ["Buy property", "Decor"],
        cautions: ["Conflict", "Vehicle"],
        purushartha: "Moksha",
        karaka: "Moon"
    },
    {
        name: "Creativity",
        full: "Creativity & Children",
        desc: "Intelligence, progeny",
        keywords: ["Ideas", "Romance"],
        remedy: "Chant Gayatri Mantra for clarity.",
        mantra: "Om Gram Grim Grum Sah Gurave Namah",
        gemstone: "Topaz",
        archetype: "The Creator",
        insight: "The spark of divine intelligence within you. This house rules your creative output, children, and speculation/investment luck.",
        activities: ["Creative work", "Trading"],
        cautions: ["Gambling", "Ego"],
        purushartha: "Dharma",
        karaka: "Jupiter"
    },
    {
        name: "Health",
        full: "Health & Service",
        desc: "Health, enemies, service",
        keywords: ["Routine", "Service"],
        remedy: "Feed stray animals or birds.",
        mantra: "Om Shanaye Namaha",
        gemstone: "Blue Sapphire",
        archetype: "The Healer",
        insight: "Your capacity to solve problems, overcome debts/enemies, and serve others. It's the house of daily grind and resilience.",
        activities: ["Checkup", "Service"],
        cautions: ["Debt", "Diet"],
        purushartha: "Artha",
        karaka: "Mars"
    },
    {
        name: "Partner",
        full: "Partnership & Marriage",
        desc: "Spouse, business",
        keywords: ["Spouse", "Contracts"],
        remedy: "Offer flowers to clear water sources.",
        mantra: "Om Shukraya Namaha",
        gemstone: "Diamond",
        archetype: "The Lover",
        insight: "How you relate to the 'Other'. Be it a spouse or a business partner, this house governs all contractual and committed unions.",
        activities: ["Contracts", "Network"],
        cautions: ["Conflict", "Fine print"],
        purushartha: "Kama",
        karaka: "Venus"
    },
    {
        name: "Change",
        full: "Transformation & Occult",
        desc: "Sudden events, occult",
        keywords: ["Occult", "Change"],
        remedy: "Donate to medical charities.",
        mantra: "Om Namo Bhagavate Rudraya",
        gemstone: "Blue Sapphire",
        archetype: "The Mystic",
        insight: "The house of hidden depths, sudden gains/losses, and deep transformation. It rules longevity and unearned wealth.",
        activities: ["Research", "Meditation"],
        cautions: ["Risks", "Sudden events"],
        purushartha: "Moksha",
        karaka: "Saturn"
    },
    {
        name: "Fortune",
        full: "Fortune & Dharma",
        desc: "Luck, higher learning",
        keywords: ["Luck", "Philosophy"],
        remedy: "Visit a temple or spiritual place.",
        mantra: "Om Gurave Namaha",
        gemstone: "Yellow Sapphire",
        archetype: "The Sage",
        insight: "Your reservoir of past-life merit (Bagya). It attracts mentors, higher knowledge, and divine grace into your life.",
        activities: ["Scriptures", "Temple"],
        cautions: ["Elders", "Dogmatism"],
        purushartha: "Dharma",
        karaka: "Jupiter"
    },
    {
        name: "Career",
        full: "Career & Status",
        desc: "Profession, fame",
        keywords: ["Job", "Authority"],
        remedy: "Offer water to the Sun at sunrise.",
        mantra: "Om Budhaya Namaha",
        gemstone: "Emerald",
        archetype: "The Ruler",
        insight: "Your public standing and command over the world (Karma). This is the apex of the chart, ruling career and reputation.",
        activities: ["Job app", "Meet boss"],
        cautions: ["Insubordination", "Reputation"],
        purushartha: "Artha",
        karaka: "Mercury"
    },
    {
        name: "Gains",
        full: "Gains & Network",
        desc: "Profits, friends",
        keywords: ["Profits", "Wishes"],
        remedy: "Share your gains with community.",
        mantra: "Om Vishnave Namaha",
        gemstone: "Topaz",
        archetype: "The Networker",
        insight: "The fulfillment of desires and gains from your work. It rules your social circles, elder siblings, and liquidity.",
        activities: ["Socialize", "Goals"],
        cautions: ["Greed", "Friends"],
        purushartha: "Kama",
        karaka: "Jupiter"
    },
    {
        name: "Loss",
        full: "Loss & Spirituality",
        desc: "Expenses, moksha",
        keywords: ["Expenses", "Solitude"],
        remedy: "Meditation before sleep.",
        mantra: "Om Namah Shivaya",
        gemstone: "Amethyst",
        archetype: "The Ascetic",
        insight: "The house of letting go. It governs expenses, foreign lands, sleep, and final liberation (Moksha).",
        activities: ["Charity", "Retreat"],
        cautions: ["Waste", "Sleep"],
        purushartha: "Moksha",
        karaka: "Saturn"
    }
];

const DetailedHouseCard = ({ index, score, isExpanded, onToggle }: { index: number, score: number, isExpanded: boolean, onToggle: () => void }) => {
    let status = 'neutral';
    let color = 'text-slate-400';
    let borderColor = 'border-slate-800';
    let trend = 'neutral';
    if (score >= 32) {
        status = 'strong';
        color = 'text-emerald-400';
        borderColor = 'border-emerald-500/30';
        trend = 'up';
    } else if (score >= 28) {
        status = 'neutral';
        color = 'text-yellow-400';
        borderColor = 'border-yellow-500/30';
        trend = 'flat';
    } else {
        status = 'weak';
        color = 'text-rose-400';
        borderColor = 'border-rose-500/30';
        trend = 'down';
    }

    const house = HOUSE_DATA[index];

    return (
        <div className={`group rounded-xl border transition-all duration-300 relative overflow-hidden ${borderColor} ${isExpanded ? 'bg-slate-900/95 shadow-2xl ring-1 ring-white/10 z-20 col-span-1 md:col-span-2 lg:col-span-3' : 'bg-slate-800/30 hover:bg-slate-800/50'}`}>
            <button onClick={onToggle} className="p-4 w-full text-left focus:outline-none">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] bg-slate-900/50 px-1.5 py-0.5 rounded">H{index + 1}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">{house.purushartha}</span>
                        {isExpanded && <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20 flex items-center gap-1"><Sparkles className="w-2 h-2" /> {house.archetype}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        {status === 'strong' && <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />}
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h4 className={`font-bold text-sm mb-0.5 ${isExpanded ? 'text-white text-xl' : 'text-slate-200'}`}>{house.full}</h4>
                        {!isExpanded && <div className="flex gap-1 mt-1">{house.keywords.map(k => <span key={k} className="text-[8px] text-slate-500 bg-slate-900 px-1 rounded">{k}</span>)}</div>}
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                            {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                            {trend === 'down' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                            <span className={`font-bold font-display tracking-tight ${color} ${isExpanded ? 'text-4xl' : 'text-2xl'}`}>{score}</span>
                        </div>
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-white/5 animate-fade-in-down">

                    {/* 1. Deep Insight Block */}
                    <div className="mb-6 bg-slate-950/30 p-4 rounded-xl border border-white/5">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" /> Cosmic Insight
                        </h5>
                        <p className="text-sm text-slate-300 leading-relaxed font-light">
                            "{house.insight}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* 2. Action Plan Columns */}
                        <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                            <h5 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Best Alignment</h5>
                            <ul className="space-y-2">{house.activities.map((act, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500"></div> {act}</li>)}</ul>
                        </div>
                        <div className="bg-rose-500/5 rounded-xl p-3 border border-rose-500/10">
                            <h5 className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Shadows to Watch</h5>
                            <ul className="space-y-2">{house.cautions.map((c, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><div className="mt-1.5 w-1 h-1 rounded-full bg-rose-500"></div> {c}</li>)}</ul>
                        </div>

                        {/* 3. The Cosmic Apothecary (Remedies) */}
                        <div className="bg-indigo-500/5 rounded-xl p-3 border border-indigo-500/10 flex flex-col justify-between">
                            <div>
                                <h5 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Cosmic Remedy</h5>
                                <p className="text-xs text-slate-300 italic mb-3">"{house.remedy}"</p>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-indigo-500/10">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-3 h-3 text-orange-400" />
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mantra:</span>
                                    <span className="text-xs font-bold text-slate-200">{house.mantra}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gem className="w-3 h-3 text-pink-400" />
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Gem:</span>
                                    <span className="text-xs font-bold text-slate-200">{house.gemstone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const HouseStrengthMatrix = ({ strengths }: HouseStrengthMatrixProps) => {
    const [expandedHouse, setExpandedHouse] = useState<number | null>(null);
    const scores = strengths.sav || [];

    // Prepare Data for Radar Chart
    const radarData = scores.map((score, i) => ({
        subject: `H${i + 1}`,
        A: score,
        fullMark: 40
    }));

    return (
        <div className="glass-card p-6 relative overflow-visible z-10"> {/* overflow-visible for expanded cards */}
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                        <Star className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white font-display uppercase tracking-wider">Life Balance Matrix</h3>
                        <p className="text-sm text-slate-400 mt-0.5">12-Point Analysis & Strength Distribution</p>
                    </div>
                </div>
                <button className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/20 transition-colors flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> AI Insights Active
                </button>
            </div>

            {/* Radar Chart Section */}
            <div className="mb-10 h-[280px] w-full bg-slate-900/30 rounded-3xl border border-white/5 relative mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 45]} tick={false} axisLine={false} />
                        <Radar name="Strength" dataKey="A" stroke="#818cf8" strokeWidth={3} fill="#818cf8" fillOpacity={0.2} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
                {/* Overlay Title */}
                <div className="absolute top-4 left-6 pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strength Geomap</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 transition-all">
                {scores.map((score, idx) => (
                    <DetailedHouseCard
                        key={idx}
                        index={idx}
                        score={score}
                        isExpanded={expandedHouse === idx}
                        onToggle={() => setExpandedHouse(expandedHouse === idx ? null : idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HouseStrengthMatrix;
