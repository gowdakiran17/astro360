import { Sunrise, Sunset, Calendar } from 'lucide-react';

interface PanchangData {
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
    vara: string;
}

interface PanchangCardProps {
    panchang: PanchangData | null;
}

const PanchangCard = ({ panchang }: PanchangCardProps) => {
    if (!panchang) {
        return (
            <div className="bg-white rounded-xl p-6 flex items-center justify-center min-h-[280px]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full mb-3"></div>
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                </div>
            </div>
        );
    }

    const DetailRow = ({ label, value }: { label: string, value: string }) => (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-slate-800">{value}</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Daily Panchang</h3>
                        <p className="text-xs text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-1 mb-6">
                <DetailRow label="Tithi" value={panchang.tithi} />
                <DetailRow label="Nakshatra" value={panchang.nakshatra} />
                <DetailRow label="Yoga" value={panchang.yoga} />
                <DetailRow label="Karana" value={panchang.karana} />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center mt-auto">
                <div className="text-center">
                    <div className="flex justify-center mb-1 text-amber-500"><Sunrise className="w-4 h-4" /></div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Sunrise</div>
                    <div className="text-xs font-bold text-slate-700">{panchang.sunrise}</div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                    <div className="flex justify-center mb-1 text-indigo-400"><Sunset className="w-4 h-4" /></div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Sunset</div>
                    <div className="text-xs font-bold text-slate-700">{panchang.sunset}</div>
                </div>
            </div>
        </div>
    );
};

export default PanchangCard;
