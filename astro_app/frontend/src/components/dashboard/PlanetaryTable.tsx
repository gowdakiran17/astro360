import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlanetData {
    name: string;
    zodiac_sign: string;
    longitude: number;     // Total longitude (0-360)
    nakshatra: string;
    house: number;
    is_retrograde: boolean;
    pada?: number;         // Optional if not computed yet
    avasthas?: any[];      // Added for Phase 1
}

interface PlanetaryTableProps {
    planets: PlanetData[];
    ascendant: {
        zodiac_sign: string;
        longitude: number;
        nakshatra: string;
    };
    specialPoints?: Record<string, any>; // Bhrigu Bindu, Yogi, etc.
}

const PlanetaryTable = ({ planets, ascendant, specialPoints }: PlanetaryTableProps) => {
    const [isOpen, setIsOpen] = useState(true);

    // Helper to format degrees (e.g. 152.5 -> 2° 30' of Virgo)
    const formatLocation = (lon: number, sign: string) => {
        const degInSign = lon % 30;
        const d = Math.floor(degInSign);
        const m = Math.floor((degInSign - d) * 60);
        return `${d}° ${m}' ${sign}`;
    };

    // Helper for Avasthas
    const formatAvasthas = (avasthas?: any[]) => {
        if (!avasthas || avasthas.length === 0) return "-";
        const baladi = avasthas.find(a => a.name === "Baladi")?.state.split(" ")[0];
        const jagradadi = avasthas.find(a => a.name === "Jagradadi")?.state.split(" ")[0];
        return (
            <div className="flex flex-col text-xs leading-tight text-slate-500">
                <span title="Baladi (Age)">{baladi}</span>
                <span title="Jagradadi (Alertness)" className="text-slate-400">{jagradadi}</span>
            </div>
        );
    };

    // Combine Ascendant and Planets for the list
    const allBodies = [
        {
            name: 'Ascendant',
            zodiac_sign: ascendant.zodiac_sign,
            longitude: ascendant.longitude,
            nakshatra: ascendant.nakshatra,
            house: 1,
            is_retrograde: false,
            type: 'Reference',
            avasthas: []
        },
        ...planets.map(p => ({ ...p, type: 'Planet' }))
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div
                className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <h3 className="font-bold text-slate-800">Planetary Details</h3>
                    <p className="text-xs text-slate-500">Positions, Nakshatras & Avasthas</p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>

            {isOpen && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Planet</th>
                                <th className="px-6 py-3 font-medium">Sign / Degree</th>
                                <th className="px-6 py-3 font-medium">Nakshatra</th>
                                <th className="px-6 py-3 font-medium text-center">House</th>
                                <th className="px-6 py-3 font-medium">Avasthas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allBodies.map((body, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-900 flex items-center">
                                        {body.name}
                                        {body.is_retrograde && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">R</span>}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {formatLocation(body.longitude, body.zodiac_sign)}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {body.nakshatra}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 font-bold text-center">
                                        {body.house}
                                    </td>
                                    <td className="px-6 py-3">
                                        {formatAvasthas(body.avasthas)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Special Points Section */}
                    {specialPoints && Object.keys(specialPoints).length > 0 && (
                        <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Special Points</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(specialPoints).map(([name, point]: [string, any]) => (
                                    <div key={name} className="bg-white border border-slate-200 rounded p-3 text-xs shadow-sm">
                                        <div className="font-bold text-slate-700">{name}</div>
                                        <div className="text-slate-500 mt-1">{point.sign} ({Math.floor(point.longitude % 30)}°)</div>
                                        <div className="text-slate-400 text-[10px]">{point.nakshatra}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlanetaryTable;
