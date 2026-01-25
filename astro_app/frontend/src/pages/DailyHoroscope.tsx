import MainLayout from '../components/layout/MainLayout';
import DashboardHeader from '../components/layout/DashboardHeader';
import { 
  Calendar, 
  Briefcase, Heart, Activity, Share2
} from 'lucide-react';

const DailyHoroscope = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <MainLayout title="Daily Horoscope" breadcrumbs={['Home', 'Horoscope', 'Today']} showHeader={false} disableContentPadding={true}>
      <DashboardHeader activeTab="horoscope" />
      <div className="w-full space-y-8 pb-20 mt-10 px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Daily Horoscope</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <select className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Aries</option>
              <option>Taurus</option>
              <option>Gemini</option>
              <option>Cancer</option>
              <option>Leo</option>
              <option>Virgo</option>
              <option>Libra</option>
              <option>Scorpio</option>
              <option>Sagittarius</option>
              <option>Capricorn</option>
              <option>Aquarius</option>
              <option>Pisces</option>
            </select>
          </div>
        </div>

        {/* Main Forecast Card */}
        <div className="card-base p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-display font-bold shadow-inner">
                ♈︎
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-display font-bold mb-2">Aries</h2>
                <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl">
                  Today brings a surge of creative energy. Your ruling planet Mars is aligned with Venus, suggesting harmonious interactions and successful creative endeavors.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <div className="flex items-center justify-between text-sm font-medium bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <span>Mood</span>
                  <span className="text-amber-300">Energetic</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <span>Lucky No</span>
                  <span className="text-emerald-300">7</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <span>Color</span>
                  <span className="text-rose-300">Red</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-rose-500 font-bold uppercase tracking-wider text-xs">
                <Heart className="w-4 h-4" /> Love & Relationships
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                Romance takes center stage. If you're single, a chance encounter could spark something interesting. Couples will find deep connection in shared activities.
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[85%] rounded-full"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-wider text-xs">
                <Briefcase className="w-4 h-4" /> Career & Money
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                Financial opportunities are likely to surface. Trust your instincts when it comes to investments. A colleague might offer valuable advice.
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%] rounded-full"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-500 font-bold uppercase tracking-wider text-xs">
                <Activity className="w-4 h-4" /> Health & Wellness
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                High energy levels might make you restless. Channel this into physical exercise. Meditation in the evening will help you ground yourself.
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[60%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly & Monthly Tabs (Visual Only) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button className="px-6 py-2 rounded-lg bg-white text-slate-900 font-bold shadow-sm text-sm">Today</button>
          <button className="px-6 py-2 rounded-lg text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Tomorrow</button>
          <button className="px-6 py-2 rounded-lg text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Weekly</button>
          <button className="px-6 py-2 rounded-lg text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Monthly</button>
        </div>

        {/* Planetary Transits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-base p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">☀️</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Sun</div>
              <div className="text-sm font-bold text-slate-900">In Pisces</div>
            </div>
          </div>
          <div className="card-base p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">🌙</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Moon</div>
              <div className="text-sm font-bold text-slate-900">In Taurus</div>
            </div>
          </div>
          <div className="card-base p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">☿️</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Mercury</div>
              <div className="text-sm font-bold text-slate-900">In Aries</div>
            </div>
          </div>
          <div className="card-base p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">♀️</div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Venus</div>
              <div className="text-sm font-bold text-slate-900">In Pisces</div>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default DailyHoroscope;
