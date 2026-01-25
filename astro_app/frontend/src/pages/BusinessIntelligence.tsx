import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { 
  TrendingUp, Bitcoin, Activity, Zap, Brain, Building2, Users,
  ArrowRight, Info, CheckCircle, Crosshair
} from 'lucide-react';

const IntelligenceCard = ({ title, purpose, uses, outputs, icon: Icon, color, isSubscription = false, route, onNavigate }: any) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
    <div className={`p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between ${color.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/90 dark:bg-slate-900/50 shadow-sm ${color.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
      </div>
      {isSubscription && (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full border border-amber-200">
          Premium
        </span>
      )}
    </div>

    <div className="p-5 flex-1 flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Info className="w-3 h-3" /> Purpose
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {purpose}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Uses</h4>
          <ul className="space-y-1.5">
            {uses.map((use: string, i: number) => (
              <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                {use}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Output</h4>
          <ul className="space-y-1.5">
            {outputs.map((output: string, i: number) => (
              <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                {output}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 mt-auto">
      <button 
        onClick={() => onNavigate && route ? onNavigate(route) : null}
        className="w-full py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 group/btn"
      >
        Access Intelligence
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover/btn:text-indigo-500 transition-colors" />
      </button>
    </div>
  </div>
);

const BusinessIntelligence = () => {
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    if (route) {
      navigate(route);
    }
  };

  const cards = [
    {
      title: "Market Timing Intelligence",
      purpose: "Tell users when to buy, sell, launch, apply, negotiate.",
      uses: ["Transits", "Dasha", "Moon", "Nakshatra", "Numerology"],
      outputs: ["Best dates", "Risk windows", "Opportunity windows"],
      icon: TrendingUp,
      color: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600" },
      route: "/cosmic/business/market-timing"
    },
    {
      title: "Gann Trading Intelligence",
      purpose: "Advanced Time-Price analysis for serious traders using Gann's planetary laws.",
      uses: ["Square of 9", "Planetary Harmonics", "Retrogrades", "Cycle Analysis"],
      outputs: ["Price Targets", "Reversal Dates", "Cycle Warnings"],
      icon: Crosshair,
      color: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600" },
      route: "/cosmic/business/gann",
      isSubscription: true
    },
    {
      title: "Crypto vs Stock Dashboard",
      purpose: "Personalized financial decision engine based on your wealth DNA.",
      uses: ["Wealth DNA", "Asset Suitability", "Risk vs Stability", "Personal Trends"],
      outputs: ["Best Asset Today", "Crypto Score", "Stock Score", "Wealth Persona"],
      icon: Bitcoin,
      color: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600" },
      route: "/cosmic/business/crypto-stocks"
    },
    {
      title: "Gann Trading Intelligence",
      purpose: "For serious traders using planetary degrees and cycles.",
      uses: ["Planetary degrees", "Retrogrades", "Mars–Saturn cycles", "Sun ingress"],
      outputs: ["Support & resistance time zones", "Breakout days", "Reversal windows"],
      icon: Activity,
      color: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600" }
    },
    {
      title: "Real-time Trading Intelligence",
      purpose: "Live actionable trading signals and volatility warnings.",
      uses: ["Today is a buy zone", "Avoid new trades till Friday", "High volatility window"],
      outputs: ["Buy zones", "No-trade windows", "Volatility alerts"],
      icon: Zap,
      color: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600" },
      isSubscription: true,
      route: "/cosmic/business/real-time"
    },
    {
      title: "Market Psychology Intelligence",
      purpose: "Analyze market sentiment using lunar and planetary influences.",
      uses: ["Moon", "Rahu", "Mercury"],
      outputs: ["Market fear", "Market greed", "Crowd behavior"],
      icon: Brain,
      color: { bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-600" }
    },
    {
      title: "Corporate Planning Intelligence",
      purpose: "Strategic timing for founders, managers, and HR.",
      uses: ["Organizational charts", "Planetary periods", "Transits"],
      outputs: ["When to hire", "When to fire", "When to expand", "When to restructure"],
      icon: Building2,
      color: { bg: "bg-slate-50 dark:bg-slate-800", text: "text-slate-600" }
    },
    {
      title: "Team Dynamics Intelligence",
      purpose: "Optimize team composition and conflict resolution.",
      uses: ["Birth charts", "Nakshatra", "Moon sign"],
      outputs: ["Team compatibility", "Leadership alignment", "Conflict zones"],
      icon: Users,
      color: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600" }
    }
  ];

  return (
    <MainLayout title="Business Intelligence" breadcrumbs={['Cosmic Hub', 'Business']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Business & Financial Intelligence</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
            Leverage planetary cycles and astrological data for strategic financial decisions, market timing, and organizational growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <IntelligenceCard key={index} {...card} onNavigate={handleNavigate} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default BusinessIntelligence;
