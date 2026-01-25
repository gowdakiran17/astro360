import React, { useState } from 'react';
import NorthIndianChart from '../NorthIndianChart';
import { 
    Grid, ChevronDown, ChevronUp, AlertTriangle, 
    CheckCircle, Flame, Droplets, Info, Star, Calendar, 
    Sparkles, BookOpen 
} from 'lucide-react';

// --- Interfaces ---

interface Planet {
    name: string;
    longitude: number;
    zodiac_sign: string;
    nakshatra: string;
    house: number;
    is_retrograde: boolean;
}

interface ChartData {
    ascendant: {
        zodiac_sign: string;
        nakshatra: string;
        longitude: number;
    };
    planets: Planet[];
}

interface VastuReportViewProps {
    data: ChartData | null;
}

// --- Helper Components ---

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="flex items-center justify-between mb-4 mt-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
                <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            {title}
        </h3>
        {subtitle && <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wide">{subtitle}</span>}
    </div>
);

const AccordionItem = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-3 shadow-sm">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <span className="font-semibold text-slate-800">{title}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {isOpen && <div className="p-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">{children}</div>}
        </div>
    );
};

const VisualRemedyCard = ({ 
    title, 
    description, 
    imageType, 
    steps, 
    note 
}: { 
    title: string, 
    description: string, 
    imageType: 'toilet' | 'kitchen' | 'entrance' | 'generic',
    steps: string[],
    note?: string
}) => {
    // Placeholder visuals based on type
    const renderVisual = () => {
        switch(imageType) {
            case 'toilet':
                return (
                    <div className="bg-amber-50 h-48 w-full rounded-lg flex items-center justify-center border border-amber-100 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 opacity-50"></div>
                         <div className="absolute bottom-0 w-full h-2 bg-orange-400/50 blur-sm"></div> {/* Copper strip simulation */}
                         <div className="relative z-10 flex flex-col items-center">
                             <div className="w-24 h-32 border-4 border-slate-400 rounded-t-3xl rounded-b-xl bg-white mb-2 shadow-lg"></div>
                             <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded border border-orange-200">Copper Strip Installation</span>
                         </div>
                    </div>
                );
            case 'kitchen':
                return (
                    <div className="bg-rose-50 h-48 w-full rounded-lg flex items-center justify-center border border-rose-100 relative overflow-hidden">
                        <Flame className="w-16 h-16 text-rose-400 opacity-20 absolute top-4 right-4" />
                        <div className="relative z-10 flex flex-col items-center text-center p-4">
                            <div className="w-32 h-4 bg-emerald-600 rounded shadow-md mb-2"></div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Green Stone Placement</span>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-slate-50 h-48 w-full rounded-lg flex items-center justify-center border border-slate-200">
                        <Sparkles className="w-12 h-12 text-slate-300" />
                    </div>
                );
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-bold text-lg text-slate-800 mb-2">{title}</h4>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{description}</p>
            
            <div className="mb-6">
                {renderVisual()}
            </div>

            <div className="space-y-4">
                <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Treatment Procedure</h5>
                    <ol className="space-y-2">
                        {steps.map((step, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex gap-2">
                                <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
                {note && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 flex gap-2">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <p><strong>Note:</strong> {note}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---

const VastuReportView: React.FC<VastuReportViewProps> = ({ data }) => {
    if (!data) return <div className="p-8 text-center">Loading Report Data...</div>;

    // Helper to get Rashi Lord (Simplified)
    const getRashiLord = (sign: string) => {
        const lords: Record<string, string> = {
            "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
            "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
            "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
        };
        return lords[sign] || "-";
    };

    // Helper to get Nakshatra Lord
    const getNakshatraLord = (nakshatra: string) => {
        const lordMap: Record<string, string[]> = {
            "Ketu": ["Ashwini", "Magha", "Mula", "Moola"],
            "Venus": ["Bharani", "Purva Phalguni", "Purva Ashadha"],
            "Sun": ["Krittika", "Uttara Phalguni", "Uttara Ashadha"],
            "Moon": ["Rohini", "Hasta", "Shravana"],
            "Mars": ["Mrigashira", "Chitra", "Dhanishta"],
            "Rahu": ["Ardra", "Swati", "Shatabhisha"],
            "Jupiter": ["Punarvasu", "Vishakha", "Purva Bhadrapada"],
            "Saturn": ["Pushya", "Anuradha", "Uttara Bhadrapada"],
            "Mercury": ["Ashlesha", "Jyeshtha", "Revati"]
        };

        for (const [lord, stars] of Object.entries(lordMap)) {
            if (stars.some(s => nakshatra.includes(s))) return lord;
        }
        return "-";
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* 1. Charts & Planet Data Section */}
            <SectionHeader icon={Grid} title="Astro-Vastu Charts & Planetary Details" subtitle="Module 3 Analysis" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Birth Chart */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">Birth Chart (Lagna)</h3>
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">D1</span>
                    </div>
                    <div className="aspect-square w-full max-w-[350px] mx-auto">
                        <NorthIndianChart data={data} />
                    </div>
                </div>

                {/* Cusp Chart */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">Cusp Chart (Bhava)</h3>
                        <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded">KP System</span>
                    </div>
                    <div className="aspect-square w-full max-w-[350px] mx-auto opacity-90">
                        {/* In real app, pass Bhava data here */}
                        <NorthIndianChart data={data} />
                    </div>
                </div>
            </div>

            {/* Planet Details Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-4">
                    <h3 className="text-white font-bold">Planetary Positions & Significators</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800 font-bold">
                            <tr>
                                <th className="px-6 py-3">Planet</th>
                                <th className="px-6 py-3">Degree</th>
                                <th className="px-6 py-3">Rashi</th>
                                <th className="px-6 py-3">Nakshatra</th>
                                <th className="px-6 py-3 text-indigo-300">RL (Sign)</th>
                                <th className="px-6 py-3 text-purple-300">NL (Star)</th>
                                <th className="px-6 py-3 text-emerald-300">SL (Sub)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.planets.map((p) => (
                                <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                                        {p.name}
                                        {p.is_retrograde && <span className="text-[10px] text-white bg-rose-500 px-1.5 py-0.5 rounded-full">R</span>}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{p.longitude.toFixed(2)}°</td>
                                    <td className="px-6 py-4 text-slate-700">{p.zodiac_sign}</td>
                                    <td className="px-6 py-4 text-slate-700">{p.nakshatra}</td>
                                    <td className="px-6 py-4 font-medium text-indigo-600">{getRashiLord(p.zodiac_sign)}</td>
                                    <td className="px-6 py-4 font-medium text-purple-600">{getNakshatraLord(p.nakshatra)}</td>
                                    <td className="px-6 py-4 font-medium text-emerald-600">-</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. Aspects & Analysis Section */}
            <SectionHeader icon={BookOpen} title="Detailed Analysis & Predictions" />
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical Aspect Analysis
                </h4>
                <p className="text-amber-800 mb-4 leading-relaxed">
                    Kiran, as per the analysis of your birth chart, your <strong>6th House</strong> has a negative aspect which can create financial trouble for you.
                    The 180° aspect of Mars indicates sudden expenses related to health or disputes.
                </p>
                <div className="bg-white/60 p-4 rounded-lg border border-amber-100">
                    <p className="text-sm font-medium text-amber-900">
                        <strong>Remedy:</strong> To negate the negative 180° aspect of Mars, you need to place 50 Carat of Coral dust or 2 inch idol of Shri Hanuman in the East of your house and office.
                    </p>
                </div>
            </div>

            {/* Accordions for Varshphal & Transits */}
            <div className="space-y-1">
                <AccordionItem title="Position of Moon in your Varshphal (Yearly Chart)" defaultOpen>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        In this year's Varshphal, the Moon is positioned in the 4th house, indicating a focus on domestic happiness and property matters. 
                        It suggests a good time for renovations but warns against emotional volatility.
                    </p>
                </AccordionItem>
                <AccordionItem title="Position of Rahu in your Varshphal (Yearly Chart)">
                    <p className="text-sm text-slate-600">Rahu in the 10th house brings sudden career opportunities but requires caution with authority figures.</p>
                </AccordionItem>
                <AccordionItem title="The Transit of Saturn on natal Ketu (Till 23-Feb-2028)">
                    <div className="text-sm space-y-2">
                        <p className="text-slate-700"><strong>Duration:</strong> Till 23-Feb-2028</p>
                        <p className="text-slate-600">This transit marks a period of spiritual restructuring. You may feel detached from material goals. It is excellent for deep research and occult studies.</p>
                    </div>
                </AccordionItem>
                <AccordionItem title="The Transit of Sun on natal Jupiter">
                    <p className="text-sm text-slate-600">A highly auspicious period for learning, wisdom, and receiving guidance from mentors.</p>
                </AccordionItem>
            </div>

            {/* 3. Visual Remedies Section */}
            <SectionHeader icon={Sparkles} title="Visual Remedial Guide" subtitle="Actionable Steps" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VisualRemedyCard 
                    title="Toilet Treatment in North-East"
                    description="The presence of a toilet in the North-East zone (Ishanya) is a major Vastu defect causing health issues and lack of clarity."
                    imageType="toilet"
                    steps={[
                        "Insert a Copper metal strip (0.2mm x 0.75 inch) around three sides of the toilet seat into the floor.",
                        "Make sure to conceal it completely within the flooring material.",
                        "Ensure a minimum of 1/2 inch of the metal strip goes into the back wall."
                    ]}
                    note="This treatment effectively creates a barrier to redirect and contain the negative energy associated with the toilet seat."
                />
                <VisualRemedyCard 
                    title="Kitchen Burner Balancing"
                    description="Fire element in the Water zone (North) creates conflict leading to career instability."
                    imageType="kitchen"
                    steps={[
                        "Place a slab of Baroda Green Stone below the gas burner/stove.",
                        "The stone should be at least 15mm thick and extend 2 inches beyond the burner on all sides.",
                        "This balances the Fire element without extinguishing it."
                    ]}
                />
            </div>

            {/* 4. Mantras & Rituals */}
            <SectionHeader icon={Star} title="Mantras & Daily Rituals" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5" /> Powerful Shani Mantra
                    </h4>
                    <p className="text-sm text-indigo-800 mb-4">
                        Chanting mantras is considered a way to attune oneself to cosmic vibrations. To enhance the positive influences of Saturn, recite this mantra 108 times daily in the morning.
                    </p>
                    <div className="bg-white p-6 rounded-xl text-center shadow-sm mb-4">
                        <p className="text-2xl font-serif text-indigo-900 mb-2">ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ||</p>
                        <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">Om Pram Prim Prom Sah Shanaishcharaya Namah</p>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-indigo-800">
                        <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-xs">1</div>
                        <p>Use a Rudraksha mala for counting. Face West while chanting.</p>
                    </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <Droplets className="w-5 h-5" /> Nature Offering Ritual
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                                <h5 className="font-bold text-emerald-800 text-sm">Feed Cows on Saturdays</h5>
                                <p className="text-xs text-emerald-700 mt-1">Feeding green grass or spinach to cows on Saturdays pacifies Mercury and strengthens business luck.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                                <h5 className="font-bold text-emerald-800 text-sm">Temple Visit</h5>
                                <p className="text-xs text-emerald-700 mt-1">Make a ritual of visiting a Shiva temple on Mondays to attract wish fulfillment and mental peace.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* 5. Panchang & Transits (Collapsed by default) */}
            <SectionHeader icon={Calendar} title="Panchang & Planetary Transits" />
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {['Tithi', 'Vaar', 'Yog', 'Karana', 'Nakshatra'].map((item) => (
                        <div key={item} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <span className="font-medium text-slate-700">{item}</span>
                            <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-center">
                <p className="text-slate-400 text-sm mb-4">Want a more detailed professional report?</p>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/50 flex items-center gap-2 mx-auto">
                    <Download className="w-4 h-4" /> Download Full PDF Report
                </button>
            </div>

        </div>
    );
};

// Icon for download button (re-defined locally to avoid import issues if not available)
const Download = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

export default VastuReportView;
