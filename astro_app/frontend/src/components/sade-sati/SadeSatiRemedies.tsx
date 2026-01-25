import React, { useState } from 'react';
import { Flower, HandHeart, Gem, Activity, Check, ArrowRight } from 'lucide-react';

const SadeSatiRemedies: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'spiritual' | 'charity' | 'gemstone' | 'lifestyle'>('spiritual');

    const tabs = [
        { id: 'spiritual', label: 'Spiritual', icon: Flower },
        { id: 'charity', label: 'Charity', icon: HandHeart },
        { id: 'gemstone', label: 'Gemstones', icon: Gem },
        { id: 'lifestyle', label: 'Lifestyle', icon: Activity },
    ];

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors
                                ${isActive 
                                    ? 'bg-indigo-500/10 text-indigo-300 border-b-2 border-indigo-500' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
                {activeTab === 'spiritual' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-indigo-900/20 rounded-xl p-5 border border-indigo-500/20">
                                <h3 className="text-lg font-bold text-white mb-4">Powerful Mantras</h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">1</div>
                                        <div>
                                            <p className="font-bold text-indigo-200">Shani Beej Mantra</p>
                                            <p className="text-sm text-slate-300 italic mb-1">"Om Sham Shanaishcharaya Namah"</p>
                                            <p className="text-xs text-slate-500">Chant 108 times daily, especially Saturdays.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">2</div>
                                        <div>
                                            <p className="font-bold text-indigo-200">Maha Mrityunjaya Mantra</p>
                                            <p className="text-sm text-slate-300 italic mb-1">For protection and health</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">3</div>
                                        <div>
                                            <p className="font-bold text-indigo-200">Hanuman Chalisa</p>
                                            <p className="text-sm text-slate-300 italic mb-1">Daily recitation for relief</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                    <h3 className="font-bold text-white mb-2">Temple Worship</h3>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Visit Shani temples on Saturdays</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Offer mustard oil & black sesame</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Light lamp with sesame oil</li>
                                    </ul>
                                </div>
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                    <h3 className="font-bold text-white mb-2">Hanuman Worship</h3>
                                    <p className="text-sm text-slate-400 mb-3">Lord Hanuman protects devotees from Saturn's harshness.</p>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Tuesday/Saturday temple visits</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Offer red flowers and sindoor</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'charity' && (
                    <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
                         <div className="bg-emerald-900/10 rounded-xl p-6 border border-emerald-500/20">
                            <h3 className="text-lg font-bold text-emerald-300 mb-4">Saturday Donations</h3>
                            <ul className="space-y-3">
                                {[
                                    'Feed crows with rice or bread',
                                    'Donate black gram & mustard oil',
                                    'Help elderly or disabled individuals',
                                    'Support orphanages or old-age homes',
                                    'Provide shoes/blankets to needy'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <HandHeart className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                         </div>
                         <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Service Activities</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Saturn represents service and labor. Serving others is the most effective remedy.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'Serve in hospitals (esp. orthopedic)',
                                    'Volunteer at addiction centers',
                                    'Care for aging parents/relatives',
                                    'Assist construction worker welfare'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <Activity className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                         </div>
                    </div>
                )}

                {activeTab === 'gemstone' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-full">
                                    <Gem className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-blue-200 mb-2">Blue Sapphire (Neelam)</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs font-bold uppercase rounded border border-red-500/30">Caution</span>
                                        <span className="text-slate-400 text-xs">Consultation Required</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        Most powerful stone for Saturn but requires expert consultation. MUST be tested before wearing permanently.
                                        Wear on middle finger, Saturday morning, in silver/platinum.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Test Method</p>
                                            <p className="text-sm text-white">Keep under pillow for 3 days</p>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Alternatives</p>
                                            <p className="text-sm text-white">Amethyst, Lapis Lazuli</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'lifestyle' && (
                    <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="font-bold text-white mb-4">Behavioral Changes</h3>
                            <ul className="space-y-3">
                                {[
                                    'Practice extreme patience',
                                    'Speak truth always',
                                    'Respect elders and authority',
                                    'Maintain discipline in routine',
                                    'Work hard without expecting results'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="font-bold text-white mb-4">Dietary & Habits</h3>
                            <ul className="space-y-3">
                                {[
                                    'Avoid excessive alcohol',
                                    'Eat sattvic (pure) foods',
                                    'Include sesame seeds in diet',
                                    'Avoid wasting food',
                                    'Simple, disciplined eating'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SadeSatiRemedies;
