import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useChart } from '../../context/ChartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import KPPlanetTable from '../../components/kp/KPPlanetTable';
import KPHouseTable from '../../components/kp/KPHouseTable';
import KPSignificatorsTable from '../../components/kp/KPSignificatorsTable';
import NorthIndianChart from '../../components/NorthIndianChart';
import SouthIndianChart from '../../components/charts/SouthIndianChart';
import { LayoutGrid, Info, Table as TableIcon, Star } from 'lucide-react';

const KPChart: React.FC = () => {
    const { currentProfile } = useChart();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chartStyle, setChartStyle] = useState<'NORTH_INDIAN' | 'SOUTH_INDIAN'>('NORTH_INDIAN');

    const fetchData = useCallback(async () => {
        if (!currentProfile) return;

        setIsLoading(true);
        setError(null);

        const formatDate = (dateStr: string) => {
            if (dateStr.includes('-')) {
                const [y, m, d] = dateStr.split('-');
                return `${d}/${m}/${y}`;
            }
            return dateStr;
        };

        const payload = {
            date: formatDate(currentProfile.date),
            time: currentProfile.time,
            latitude: currentProfile.latitude,
            longitude: currentProfile.longitude,
            timezone: currentProfile.timezone
        };

        try {
            const response = await api.post('kp/chart', { birth_details: payload });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching KP chart:", err);
            setError("Failed to load KP Chart data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [currentProfile]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-xl border border-red-900/50 m-6">{error}</div>;
    if (!data) return null;

    // Transform data for the charts
    const zodiacOrder = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    const getHouse = (longitude: number, ascLongitude: number) => {
        let house = Math.floor((longitude - ascLongitude + 360) % 360 / 30) + 1;
        return house;
    };

    const rashiChartData = {
        ascendant: {
            zodiac_sign: data.ascendant.sign
        },
        planets: data.planets.map((p: any) => ({
            name: p.planet,
            zodiac_sign: p.sign,
            house: getHouse(p.longitude, data.ascendant.longitude)
        }))
    };

    // For Bhav Chalit, we use the house number directly from our house calculation logic if possible, 
    // but usually KP means the planet is in the house where its longitude falls between cusps.
    const getBhavHouse = (longitude: number, cusps: any[]) => {
        for (let i = 0; i < 11; i++) {
            const start = cusps[i].longitude;
            const end = cusps[i + 1].longitude;
            if (start < end) {
                if (longitude >= start && longitude < end) return i + 1;
            } else {
                // Wraps around 360
                if (longitude >= start || longitude < end) return i + 1;
            }
        }
        return 12;
    };

    const bhavChalitData = {
        ascendant: {
            zodiac_sign: data.ascendant.sign
        },
        planets: data.planets.map((p: any) => ({
            name: p.planet,
            zodiac_sign: p.sign, // Note: In Bhav Chalit, signs might be warped but NorthIndianChart expects zodiac_sign for labeling
            house: getBhavHouse(p.longitude, data.house_cusps)
        }))
    };

    const renderChart = (chartData: any, title: string) => (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-serif text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                {title}
            </h3>
            <div className="aspect-square w-full max-w-[400px] mx-auto">
                {chartStyle === 'NORTH_INDIAN' ? (
                    <NorthIndianChart data={chartData} />
                ) : (
                    <SouthIndianChart data={chartData} />
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">KP Birth Chart</h1>
                    <p className="text-slate-400">Complete analysis of planets and house cusps using the Krishnamurti Padhdhati system.</p>
                </div>
                <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setChartStyle('NORTH_INDIAN')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartStyle === 'NORTH_INDIAN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        North Indian
                    </button>
                    <button
                        onClick={() => setChartStyle('SOUTH_INDIAN')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartStyle === 'SOUTH_INDIAN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        South Indian
                    </button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderChart(rashiChartData, "Rashi Chart (Lagna)")}
                {renderChart(bhavChalitData, "KP Bhav Chalit Chart")}
            </div>

            {/* Data Tables */}
            <div className="space-y-12">
                {/* Planets */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-indigo-400" />
                        Planetary KP Details
                    </h2>
                    <KPPlanetTable planets={data.planets} />
                </section>

                {/* House Cusps */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-emerald-400" />
                        House Cusp Details
                    </h2>
                    <KPHouseTable houses={data.house_cusps} />
                </section>

                {/* Significators */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TableIcon className="w-5 h-5 text-amber-400" />
                        KP Significators
                    </h2>
                    <KPSignificatorsTable significators={data.significators} />
                </section>
            </div>
        </div>
    );
};

export default KPChart;
