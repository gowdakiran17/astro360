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
}

interface PlanetaryTableProps {
    planets: PlanetData[];
    ascendant: {
        zodiac_sign: string;
        longitude: number;
        nakshatra: string;
    };
}

const PlanetaryTable = ({ planets, ascendant }: PlanetaryTableProps) => {
    const [isOpen, setIsOpen] = useState(true);

    // Helper to format degrees (e.g. 152.5 -> 2° 30' of Virgo)
    const formatLocation = (lon: number, sign: string) => {
        const degInSign = lon % 30;
        const d = Math.floor(degInSign);
        const m = Math.floor((degInSign - d) * 60);
        return `${d}° ${m}' ${sign}`;
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
            type: 'Reference'
        },
        ...planets.map(p => ({ ...p, type: 'Planet' }))
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div
                className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-bold text-slate-800">Planetary Details</h3>
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
                                <th className="px-6 py-3 font-medium">House</th>
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
                                    <td className="px-6 py-3 text-slate-600 font-bold">
                                        {body.house}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PlanetaryTable;
