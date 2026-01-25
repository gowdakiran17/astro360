import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Sun, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ZodiacCalibration = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(1.71);

    // Initial dummy data for equalizer bars (0-100)
    // 1: Aries (Fire), 2: Taurus (Earth), 3: Gemini (Air), 4: Cancer (Water)...
    const [levels, setLevels] = useState([
        85, // Aries
        20, // Taurus
        25, // Gemini
        90, // Cancer
        30, // Leo
        25, // Virgo
        95, // Libra
        25, // Scorpio
        30, // Sagittarius
        30, // Capricorn
        35, // Aquarius
        30  // Pisces
    ]);

    const zodiacs = [
        { id: 1, sign: '♈', name: 'Aries', element: 'Fire' },
        { id: 2, sign: '♉', name: 'Taurus', element: 'Earth' },
        { id: 3, sign: '♊', name: 'Gemini', element: 'Air' },
        { id: 4, sign: '♋', name: 'Cancer', element: 'Water' },
        { id: 5, sign: '♌', name: 'Leo', element: 'Fire' },
        { id: 6, sign: '♍', name: 'Virgo', element: 'Earth' },
        { id: 7, sign: '♎', name: 'Libra', element: 'Air' },
        { id: 8, sign: '♏', name: 'Scorpio', element: 'Water' },
        { id: 9, sign: '♐', name: 'Sagittarius', element: 'Fire' },
        { id: 10, sign: '♑', name: 'Capricorn', element: 'Earth' },
        { id: 11, sign: '♒', name: 'Aquarius', element: 'Air' },
        { id: 12, sign: '♓', name: 'Pisces', element: 'Water' }
    ];

    const getElementColor = (element: string) => {
        switch (element) {
            case 'Fire': return 'from-red-400 to-red-500';
            case 'Earth': return 'from-purple-400 to-purple-500'; // Screenshot has purples for earth/generic? 
            // Screenshot: Fire=Red, Earth=Purple, Air=Blue/Indigo, Water=Cyan/LightBlue
            case 'Air': return 'from-indigo-400 to-indigo-500';
            case 'Water': return 'from-cyan-400 to-cyan-500';
            default: return 'from-slate-400 to-slate-500';
        }
    };

    const getElementBg = (element: string) => {
        switch (element) {
            case 'Fire': return 'bg-red-50 text-red-600';
            case 'Earth': return 'bg-purple-50 text-purple-600';
            case 'Air': return 'bg-indigo-50 text-indigo-600';
            case 'Water': return 'bg-cyan-50 text-cyan-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const handleAnswer = () => {
        // Mock logic: Randomly adjust levels slightly to simulate calibration
        const newLevels = levels.map(l => {
            const change = Math.floor(Math.random() * 20) - 10;
            return Math.min(100, Math.max(10, l + change));
        });
        setLevels(newLevels);
        setProgress(prev => Math.min(100, prev + 5.5));
    };

    return (
        <MainLayout title="Zodiac Calibration" breadcrumbs={['Tools', 'Calibration', 'Zodiac Calibration']}>
            <div className="max-w-4xl space-y-8">

                {/* Header Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <Sun className="w-5 h-5 text-slate-600" /> {/* Use Sun as generic Zodiac icon */}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Zodiac Calibration</h1>
                        <span className="bg-white text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
                            Interactive Chart Analysis
                        </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed max-w-3xl text-lg">
                        This interactive calibration helps fine-tune your astrological interpretations based on your personal experiences and traits.
                    </p>
                </div>

                {/* Equalizer Visualization */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-slate-700">Zodiac Calibration Equalizer</h2>
                        <p className="text-slate-400 text-sm">Interactive visualization showing your astrological calibration levels</p>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center space-x-6 mb-10 overflow-x-auto py-2">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-red-50 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span>Fire (3) ♈ ♌ ♐</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-purple-50 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span>Earth (3) ♉ ♍ ♑</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-indigo-50 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span>Air (3) ♊ ♎ ♒</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-cyan-50 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                            <span>Water (3) ♋ ♏ ♓</span>
                        </div>
                    </div>

                    {/* Bars Grid */}
                    <div className="grid grid-cols-12 gap-2 md:gap-4 h-64 items-end mb-4 px-2 md:px-8">
                        {zodiacs.map((z, i) => (
                            <div key={z.id} className="flex flex-col items-center group h-full justify-end relative">
                                {/* Top Icon */}
                                <div className={`mb-3 w-8 h-8 flex items-center justify-center rounded-lg text-lg ${getElementBg(z.element)} font-bold shadow-sm z-10`}>
                                    {z.sign}
                                </div>

                                {/* Bar Container */}
                                <div className="w-full h-full bg-slate-50 rounded-t-xl relative overflow-hidden flex flex-col justify-end border-x border-t border-slate-100 group-hover:bg-slate-100 transition-colors">
                                    {/* Dotted indicators (decorative using SVG or dots) */}
                                    <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-20">
                                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                    </div>

                                    {/* Fill Bar */}
                                    <div
                                        className={`w-full bg-gradient-to-t ${getElementColor(z.element)} transition-all duration-700 ease-out`}
                                        style={{ height: `${levels[i]}%`, opacity: 0.8 }}
                                    ></div>
                                </div>

                                {/* Bottom Number */}
                                <div className={`mt-3 text-xs font-bold ${levels[i] > 50 ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {z.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interaction Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center relative overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">I rely on seeing signs to make my decisions.</h3>

                    <div className="flex justify-center space-x-4 mb-8">
                        <button
                            onClick={handleAnswer}
                            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Agree
                        </button>
                        <button
                            onClick={handleAnswer}
                            className="bg-white text-slate-500 px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                        >
                            Don't Know
                        </button>
                        <button
                            onClick={handleAnswer}
                            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Disagree
                        </button>
                    </div>

                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                            <span>Progress</span>
                            <span>{progress.toFixed(2)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-slate-900 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="w-3 h-3 bg-slate-900 rounded-full border-2 border-white shadow-sm mt-[-5px] transition-all duration-500" style={{ marginLeft: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/tools/rectification')}
                        className="flex items-center space-x-2 text-slate-500 font-bold hover:text-red-500 transition-colors px-6 py-3 bg-white border border-slate-200 rounded-xl hover:border-red-200 hover:shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Discard</span>
                    </button>
                </div>

            </div>
        </MainLayout>
    );
};

export default ZodiacCalibration;
