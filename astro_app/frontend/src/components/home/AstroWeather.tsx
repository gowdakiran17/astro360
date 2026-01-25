import React from 'react';
import { Cloud, ArrowRight } from 'lucide-react';

interface AstroWeatherProps {
  weather: string[];
}

const AstroWeather: React.FC<AstroWeatherProps> = ({ weather }) => {
  return (
    <div className="bg-slate-900 rounded-3xl p-6 shadow-sm h-full text-white relative overflow-hidden flex flex-col justify-between">
       {/* Decorative Background */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full filter blur-3xl -mr-10 -mt-10"></div>

      <div className="relative z-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-300" />
            Astro Weather
        </h2>
        
        <ul className="space-y-3 mb-4">
            {weather.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-indigo-100 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                    {item}
                </li>
            ))}
        </ul>

        <button className="text-xs font-medium text-indigo-300 flex items-center gap-1 hover:text-white transition-colors">
            View technical details <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AstroWeather;
