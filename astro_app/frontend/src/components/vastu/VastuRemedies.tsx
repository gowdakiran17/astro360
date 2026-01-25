import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Shield, Clock, DollarSign, Zap } from 'lucide-react';
import api from '../../services/api';

interface VastuRemediesProps {
    analysis?: any;
}

const VastuRemedies: React.FC<VastuRemediesProps> = ({ analysis }) => {
    const [defectType, setDefectType] = useState('Toilet');
    const [zone, setZone] = useState('NE');
    const [manualRemedyData, setManualRemedyData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchRemedies = async () => {
        setLoading(true);
        try {
            const response = await api.post('/vastu/remedies', {
                defect_type: defectType,
                zone: zone
            });
            setManualRemedyData(response.data);
        } catch (error) {
            console.error("Failed to fetch remedies", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render a single advanced remedy card
    const RemedyCard = ({ remedy }: { remedy: any }) => (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    remedy.priority === 'High' || remedy.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {remedy.priority} Priority
                </span>
                <span className="text-xs text-slate-400">{remedy.type}</span>
            </div>
            
            <h5 className="font-bold text-slate-800 mb-1">{remedy.title}</h5>
            <p className="text-sm text-slate-600 mb-3">{remedy.description}</p>
            
            <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex flex-col gap-1">
                    <span className="text-slate-400 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cost</span>
                    <span className="font-medium text-slate-700">{remedy.cost}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
                    <span className="font-medium text-slate-700">{remedy.time_to_effect}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-slate-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Risk</span>
                    <span className="font-medium text-slate-700">{remedy.risk}</span>
                </div>
            </div>

            {(remedy.astro_reason || remedy.vastu_reason) && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                    {remedy.astro_reason && <p><strong className="text-indigo-600">Astro:</strong> {remedy.astro_reason}</p>}
                    {remedy.vastu_reason && <p><strong className="text-emerald-600">Vastu:</strong> {remedy.vastu_reason}</p>}
                </div>
            )}
        </div>
    );

    // Extract defects from analysis if available
    const activeDefects = analysis?.zone_details?.filter((z: any) => z.status === 'Defect' && z.remedies && z.remedies.length > 0) || [];

    return (
        <div className="space-y-8">
            {/* 1. Personalized Remedies from Analysis */}
            {analysis && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Your Personalized Remedial Plan
                    </h3>
                    
                    {activeDefects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {activeDefects.map((defect: any, idx: number) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{defect.type} in {defect.direction}</h4>
                                            <p className="text-xs text-rose-600 font-medium">{defect.reason}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {defect.remedies.map((rem: any, rIdx: number) => (
                                            <RemedyCard key={rIdx} remedy={rem} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <h4 className="font-bold text-emerald-900">No Major Defects Found</h4>
                            <p className="text-emerald-700 text-sm">Your space is energetically balanced based on the current floor plan.</p>
                        </div>
                    )}
                </div>
            )}

            {/* 2. Manual Remedy Lookup Tool */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400" />
                    Manual Remedy Lookup
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Issue/Placement</label>
                        <select 
                            value={defectType}
                            onChange={(e) => setDefectType(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                        >
                            <option value="Toilet">Toilet</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Entrance">Main Entrance</option>
                            <option value="Bedroom">Master Bedroom</option>
                            <option value="Water Tank">Water Tank</option>
                            <option value="Cut">Cut / Missing Corner</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Direction/Zone</label>
                        <select 
                            value={zone}
                            onChange={(e) => setZone(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                        >
                            <option value="NE">North-East (Ishanya)</option>
                            <option value="E">East (Purva)</option>
                            <option value="SE">South-East (Agneya)</option>
                            <option value="S">South (Dakshin)</option>
                            <option value="SW">South-West (Nairutya)</option>
                            <option value="W">West (Paschim)</option>
                            <option value="NW">North-West (Vayavya)</option>
                            <option value="N">North (Uttar)</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={fetchRemedies}
                    disabled={loading}
                    className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition-colors mb-6 font-medium"
                >
                    {loading ? "Searching..." : "Search Remedies"}
                </button>

                {manualRemedyData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Advanced Remedies Display */}
                        {manualRemedyData.advanced_remedies && manualRemedyData.advanced_remedies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {manualRemedyData.advanced_remedies.map((rem: any, idx: number) => (
                                    <RemedyCard key={idx} remedy={rem} />
                                ))}
                            </div>
                        ) : (
                            // Fallback to simple list if no advanced data
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-4">
                                <h4 className="font-bold text-orange-900 flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Correction for {manualRemedyData.defect}
                                </h4>
                                <ul className="space-y-2 mt-3">
                                    {manualRemedyData.simple_remedies?.map((r: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                                            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
                                            <span>{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-500 uppercase">Suggested Mantra</span>
                                <p className="font-serif text-lg text-indigo-800 mt-1 italic">"{manualRemedyData.mantra}"</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-500 uppercase">Recommended Yantra</span>
                                <p className="font-medium text-slate-800 mt-1">{manualRemedyData.yantra}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VastuRemedies;
