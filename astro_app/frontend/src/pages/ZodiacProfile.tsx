import MainLayout from '../components/layout/MainLayout';
import { 
  Star, Moon, Flame, Heart, Zap, Sparkles
} from 'lucide-react';

const ZodiacProfile = () => {
  // Mock data for Aries
  const zodiacData = {
    sign: "Aries",
    dates: "March 21 - April 19",
    element: "Fire",
    ruler: "Mars",
    quality: "Cardinal",
    symbol: "The Ram",
    traits: ["Courageous", "Determined", "Confident", "Enthusiastic", "Optimistic"],
    description: "Aries is the first sign of the zodiac, and that's pretty much how those born under this sign see themselves: first. Aries are the leaders of the pack, first in line to get things going. Whether or not everything gets done is another question altogether, for an Aries prefers to initiate rather than to complete.",
    compatibility: [
      { sign: "Leo", score: 95 },
      { sign: "Sagittarius", score: 90 },
      { sign: "Gemini", score: 85 },
      { sign: "Libra", score: 80 }
    ]
  };

  return (
    <MainLayout title="Zodiac Profile" breadcrumbs={['Home', 'Zodiac', zodiacData.sign]}>
      <div className="w-full space-y-8 pb-20 px-6">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
          
          <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Zodiac Profile
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                {zodiacData.sign}
              </h1>
              <p className="text-xl text-indigo-100 font-medium max-w-lg">
                {zodiacData.dates}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">{zodiacData.element}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Ruler: {zodiacData.ruler}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium">{zodiacData.quality}</span>
                </div>
              </div>
            </div>
            
            {/* Abstract Symbol Representation */}
            <div className="w-64 h-64 md:w-80 md:h-80 relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-rose-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute inset-4 bg-slate-900 rounded-full border-2 border-white/10 flex items-center justify-center">
                 <span className="text-9xl font-display font-bold text-white/10 select-none">♈︎</span>
              </div>
              <div className="absolute inset-0 border border-white/10 rounded-full animate-spin-slow" style={{ animationDuration: '30s' }}>
                <div className="absolute top-0 left-1/2 -ml-1 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card-base p-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">About {zodiacData.sign}</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                {zodiacData.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Strengths
                  </h3>
                  <p className="text-sm text-indigo-800">Courageous, determined, confident, enthusiastic, optimistic, honest, passionate</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
                    <AlertIcon /> Weaknesses
                  </h3>
                  <p className="text-sm text-rose-800">Impatient, moody, short-tempered, impulsive, aggressive</p>
                </div>
              </div>
            </div>

            <div className="card-base p-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Traits & Characteristics</h2>
              <div className="flex flex-wrap gap-3">
                {zodiacData.traits.map((trait, idx) => (
                  <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-medium text-sm border border-slate-200">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="card-base p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Compatibility
              </h3>
              <div className="space-y-4">
                {zodiacData.compatibility.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {item.sign.substring(0, 2)}
                      </div>
                      <span className="font-medium text-slate-700">{item.sign}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                View Full Compatibility
              </button>
            </div>

            <div className="card-base p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg">Daily Horoscope</h3>
                  <p className="text-indigo-200 text-sm">Today's forecast for {zodiacData.sign}</p>
                </div>
                <Star className="w-6 h-6 text-amber-400 fill-current" />
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                Your energy is high today, making it a perfect time to tackle difficult tasks. Don't let minor setbacks discourage you.
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold transition-colors">
                Read More
              </button>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

export default ZodiacProfile;
