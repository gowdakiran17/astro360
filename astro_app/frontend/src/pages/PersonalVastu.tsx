import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProfileSelector from '../components/layout/ProfileSelector';
import { useChartSettings } from '../context/ChartContext';
import { vastuService } from '../services/vastu';
import { 
  Compass, Wallet, CheckCircle2,
  User, AlertTriangle, Gift, Gem, Palette,
  Table, Home, Star, CircleDot
} from 'lucide-react';

interface VastuReport {
  meta: {
    ascendant: string;
    ascendant_lord: string;
    moon_sign: string;
    moon_nakshatra: string;
  };
  vastu_compass: {
    sitting: { direction: string; lord: string; desc: string };
    money: { direction: string; lord: string; sign: string; sign_direction: string; desc: string };
    wish_fulfillment: { direction: string; lord: string; sign: string; sign_direction: string; desc: string };
    abundance: { direction: string; lord: string; desc: string };
    lakshmi_yantra: { direction: string; lord: string; desc: string };
    sleeping: { direction: string; desc: string };
  };
  remedies: {
    gemstones: Array<{ planet: string; stone: string; type: string }>;
    rudraksha: { recommendation: string; lord: string; sign: string };
    favorable_color: string;
    donations: Array<{ planet: string; item: string }>;
  };
  chart_data: {
    planets: Array<{
      name: string;
      sign: string;
      nakshatra: string;
      degree: number;
      house: number;
      is_retro: boolean;
    }>;
    houses: Array<{ house: number; sign: string; lord: string }>;
  };
}

const PersonalVastu = () => {
  const { currentProfile } = useChartSettings();
  const [report, setReport] = useState<VastuReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('chart');

  useEffect(() => {
    if (currentProfile?.raw) {
      fetchReport();
    }
  }, [currentProfile]);

  const fetchReport = async () => {
    if (!currentProfile?.raw) return;
    
    setLoading(true);
    setError('');
    
    try {
        let timezone = currentProfile.raw.timezone || currentProfile.raw.timezone_str || "+00:00";
        if (!timezone.startsWith('+') && !timezone.startsWith('-')) {
             timezone = '+' + timezone;
        }

        const birthDetails = {
            date: currentProfile.raw.date || currentProfile.raw.date_str,
            time: currentProfile.raw.time || currentProfile.raw.time_str,
            timezone: timezone,
            latitude: parseFloat(currentProfile.raw.latitude),
            longitude: parseFloat(currentProfile.raw.longitude),
            name: currentProfile.name
        };

        const data = await vastuService.getPersonalProfile(birthDetails);
        setReport(data);
    } catch (err: any) {
        console.error("Vastu Error:", err);
        setError("Failed to generate report. Please check birth details.");
    } finally {
        setLoading(false);
    }
  };

  const menuItems = [
    { id: 'chart', label: 'Birth Chart', icon: CircleDot, category: 'Chart' },
    { id: 'planet_rashi', label: 'Planet in Rashi', icon: Table, category: 'Tables' },
    { id: 'planet_house', label: 'Planet in Various House', icon: Home, category: 'Tables' },
    { id: 'money', label: 'Money', icon: Wallet, category: 'Vastu' },
    { id: 'wish', label: 'Wish Fulfillment', icon: Star, category: 'Vastu' },
    { id: 'abundance', label: 'Abundance Point', icon: CheckCircle2, category: 'Vastu' },
    { id: 'lakshmi', label: 'Lakshmi Yantra', icon: Gift, category: 'Vastu' },
    { id: 'seating', label: 'Seating Direction', icon: Compass, category: 'Vastu' },
    { id: 'gemstone', label: 'Gemstone', icon: Gem, category: 'Remedies' },
    { id: 'rudraksha', label: 'Rudraksha', icon: CircleDot, category: 'Remedies' },
    { id: 'color', label: 'Favorable Colour', icon: Palette, category: 'Remedies' },
    { id: 'donation', label: 'Essential Donation', icon: Gift, category: 'Remedies' },
  ];

  const renderContent = () => {
    if (!report) return null;

    switch (activeSection) {
      case 'chart':
        return <AstroVastuWheel chartData={report.chart_data} />;
      case 'planet_rashi':
        return <DataTable title="Planets in Rashi" data={report.chart_data.planets} columns={['name', 'sign', 'nakshatra', 'degree', 'is_retro']} />;
      case 'planet_house':
        return <DataTable title="Planets in Houses" data={report.chart_data.planets} columns={['name', 'house', 'sign', 'degree']} />;
      case 'money':
        return <MoneyCard data={report.vastu_compass.money} />;
      case 'wish':
        return <WishCard data={report.vastu_compass.wish_fulfillment} />;
      case 'abundance':
        return <AbundanceCard data={report.vastu_compass.abundance} />;
      case 'lakshmi':
        return <VastuCard title="Lakshmi Yantra" data={report.vastu_compass.lakshmi_yantra} icon={Gift} color="text-pink-600" bg="bg-pink-50" />;
      case 'seating':
        return <VastuCard title="Seating Direction" data={report.vastu_compass.sitting} icon={Compass} color="text-blue-600" bg="bg-blue-50" />;
      case 'gemstone':
        return <RemedyList title="Gemstones" items={report.remedies.gemstones} type="gemstone" />;
      case 'rudraksha':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CircleDot className="w-5 h-5 text-orange-600" />
              Rudraksha Recommendation
            </h3>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <p className="text-lg font-semibold text-orange-800">{report.remedies.rudraksha.recommendation}</p>
              <p className="text-sm text-orange-600 mt-1">
                Based on your Moon Sign: <strong>{report.remedies.rudraksha.sign}</strong> (Lord: {report.remedies.rudraksha.lord})
              </p>
            </div>
          </div>
        );
      case 'color':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Favorable Color
            </h3>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full border-4 border-slate-100 shadow-inner"
                style={{ backgroundColor: report.remedies.favorable_color.toLowerCase().split('/')[0] }}
              ></div>
              <div>
                <p className="text-xl font-bold text-slate-800">{report.remedies.favorable_color}</p>
                <p className="text-sm text-slate-500">Wear this color for luck and positivity.</p>
              </div>
            </div>
          </div>
        );
      case 'donation':
        return <RemedyList title="Essential Donations" items={report.remedies.donations} type="donation" />;
      default:
        return <AstroVastuWheel chartData={report.chart_data} />;
    }
  };

  if (!currentProfile) {
    return (
      <MainLayout title="Personal Vastu">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
          <User className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Select a Profile</h2>
          <p className="text-slate-500 max-w-md">Please select a profile to generate report.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Personal Vastu">
      <div className="max-w-7xl mx-auto pb-12">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Compass className="w-8 h-8 text-indigo-600" />
              Personal Vastu Compass
            </h1>
            <p className="text-slate-500 mt-1">Holistic Astro-Vastu Analysis for {currentProfile.name}</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-500 hidden md:block">Viewing for:</span>
             <ProfileSelector />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl m-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" /> {error}
          </div>
        ) : report ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-fit">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Menu</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {['Chart', 'Vastu', 'Remedies', 'Tables'].map(cat => (
                   <div key={cat}>
                     <div className="px-4 py-2 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">{cat}</div>
                     {menuItems.filter(i => i.category === cat).map(item => (
                       <button
                         key={item.id}
                         onClick={() => setActiveSection(item.id)}
                         className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                           activeSection === item.id 
                             ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600' 
                             : 'text-slate-600 hover:bg-slate-50'
                         }`}
                       >
                         <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                         {item.label}
                       </button>
                     ))}
                   </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-[500px]">
              {renderContent()}
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

// --- Sub Components ---

const AstroVastuWheel = ({ chartData }: { chartData: any }) => {
  // Simple Visualization of Wheel
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
       <h3 className="text-lg font-bold text-slate-800 mb-6">Astro-Vastu Wheel</h3>
       <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
         {/* Simple SVG Placeholder for Complex Wheel */}
         <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Outer Circle */}
            <circle cx="50" cy="50" r="48" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
            
            {/* 12 House Lines */}
            {[...Array(12)].map((_, i) => (
                <line 
                  key={i} 
                  x1="50" y1="50" 
                  x2={50 + 48 * Math.cos((i * 30 - 90) * Math.PI / 180)} 
                  y2={50 + 48 * Math.sin((i * 30 - 90) * Math.PI / 180)} 
                  stroke="#cbd5e1" 
                  strokeWidth="0.5" 
                />
            ))}
            
            {/* Planets */}
            {chartData.planets.map((planet: any, i: number) => {
               // Calculate angle based on House (Approximate)
               // House 1 is at top (Ascendant). 
               // This is North Indian or South Indian? 
               // Let's do a simple House 1 = Top (90 deg) visual
               const angle = (planet.house - 1) * 30 + 15 - 90; // Center of house
               const rad = angle * Math.PI / 180;
               // Distribute planets in same house by radius or slight angle offset?
               // Simplified: random radius offset
               const r = 35 - (i % 3) * 8; 
               const x = 50 + r * Math.cos(rad);
               const y = 50 + r * Math.sin(rad);
               
               return (
                 <g key={planet.name}>
                    <circle cx={x} cy={y} r="3" fill={getPlanetColor(planet.name)} />
                    <text x={x} y={y + 5} fontSize="3" textAnchor="middle" fill="#1e293b" fontWeight="bold">
                      {planet.name.substring(0, 2)}
                    </text>
                 </g>
               );
            })}
         </svg>
       </div>
       <div className="mt-6 text-sm text-slate-500 text-center max-w-lg">
         * This is a simplified visual representation. House 1 is at the top. Planets are placed in their respective houses.
       </div>
    </div>
  );
};

const getPlanetColor = (name: string) => {
    const colors: any = { Sun: '#ea580c', Moon: '#94a3b8', Mars: '#dc2626', Mercury: '#16a34a', Jupiter: '#ca8a04', Venus: '#db2777', Saturn: '#2563eb', Rahu: '#475569', Ketu: '#475569' };
    return colors[name] || '#64748b';
};

const DataTable = ({ title, data, columns }: { title: string, data: any[], columns: string[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
            {columns.map(c => <th key={c} className="px-6 py-3 capitalize">{c.replace('_', ' ')}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {columns.map(c => (
                <td key={c} className="px-6 py-3 text-slate-700">
                  {typeof row[c] === 'boolean' ? (row[c] ? 'Yes' : 'No') : row[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const VastuCard = ({ title, data, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
    <div className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center mb-6`}>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
    <div className="text-4xl font-black text-slate-900 mb-4">{data.direction}</div>
    <p className="text-slate-500 max-w-md mb-6">{data.desc}</p>
    <div className="px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
      Ruled by {data.lord}
    </div>
  </div>
);

const MoneyCard = ({ data }: { data: any }) => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <Wallet className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Money & Wealth</h3>
      
      <div className="bg-slate-50 p-4 rounded-xl text-slate-600 mb-6 text-sm leading-relaxed max-w-2xl">
        {data.desc}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex flex-col items-center">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">Rashi Direction</span>
          <span className="text-3xl font-black text-emerald-900 mb-1">{data.sign_direction}</span>
          <span className="text-xs text-emerald-500 font-medium">({data.sign} Rashi)</span>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex flex-col items-center">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">Lord Direction</span>
          <span className="text-3xl font-black text-emerald-900 mb-1">{data.direction}</span>
          <span className="text-xs text-emerald-500 font-medium">({data.lord})</span>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
         <span>Balance these directions to improve cash flow.</span>
      </div>
    </div>
  );

  const WishCard = ({ data }: { data: any }) => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6">
        <Star className="w-8 h-8 text-amber-600" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Wish Fulfillment</h3>
      
      <div className="bg-slate-50 p-4 rounded-xl text-slate-600 mb-6 text-sm leading-relaxed max-w-2xl">
        {data.desc}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl flex flex-col items-center">
          <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">Rashi Direction</span>
          <span className="text-3xl font-black text-amber-900 mb-1">{data.sign_direction}</span>
          <span className="text-xs text-amber-500 font-medium">({data.sign} Rashi)</span>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl flex flex-col items-center">
          <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">Lord Direction</span>
          <span className="text-3xl font-black text-amber-900 mb-1">{data.direction}</span>
          <span className="text-xs text-amber-500 font-medium">({data.lord})</span>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
         <CheckCircle2 className="w-4 h-4 text-amber-500" />
         <span>Balance these directions to fulfill your desires.</span>
      </div>
    </div>
  );

const AbundanceCard = ({ data }: { data: any }) => {
    // Helper to get rotation for direction
    const getRotation = (dir: string) => {
      // 16 Zone Mapping
      const map: Record<string, number> = {
        "North": 270, 
        "North-North-East": 292.5,
        "North-East": 315, 
        "East-North-East": 337.5,
        "East": 0, 
        "East-South-East": 22.5,
        "South-East": 45,
        "South-South-East": 67.5,
        "South": 90, 
        "South-South-West": 112.5,
        "South-West": 135, 
        "West-South-West": 157.5,
        "West": 180, 
        "West-North-West": 202.5,
        "North-West": 225, 
        "North-North-West": 247.5,
        "Center": 0
      };
      return map[dir] ?? 270;
    };

    const rotation = getRotation(data.direction);
    
    // Abbreviate label for display
    const getLabel = (dir: string) => {
        const words = dir.split('-');
        if (words.length === 1) return words[0].substring(0, 1); // N, E, S, W
        return words.map(w => w[0]).join(''); // NNE, SE, etc.
    };

    return (
      <div className="bg-white p-0 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#FFD700] p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Your Abundance Point</h3>
          <div className="bg-white/20 p-2 rounded-full">
            <Gift className="w-6 h-6 text-slate-900" />
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col items-center">
          {/* Compass Visualization */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* Background Circle */}
              <circle cx="50" cy="50" r="48" fill="white" stroke="#e2e8f0" strokeWidth="1" />
              
              {/* Ticks */}
              {[...Array(72)].map((_, i) => (
                <line 
                  key={i} 
                  x1="50" y1="50" 
                  x2={50 + 48 * Math.cos(i * 5 * Math.PI / 180)} 
                  y2={50 + 48 * Math.sin(i * 5 * Math.PI / 180)} 
                  stroke={i % 9 === 0 ? "#94a3b8" : "#e2e8f0"} 
                  strokeWidth={i % 9 === 0 ? "1" : "0.5"} 
                  strokeDasharray="4 96" // Only draw the tip? No, simplified:
                  transform="rotate(0 50 50)" // Reset
                />
              ))}

              {/* Highlight Sector */}
              <path 
                d={`M 50 50 L ${50 + 48 * Math.cos((rotation - 22.5) * Math.PI / 180)} ${50 + 48 * Math.sin((rotation - 22.5) * Math.PI / 180)} A 48 48 0 0 1 ${50 + 48 * Math.cos((rotation + 22.5) * Math.PI / 180)} ${50 + 48 * Math.sin((rotation + 22.5) * Math.PI / 180)} Z`}
                fill="#3b82f6" // Blue highlight like image
                opacity="0.8"
              />
              
              {/* Label in Sector */}
              <text 
                x={50 + 35 * Math.cos(rotation * Math.PI / 180)} 
                y={50 + 35 * Math.sin(rotation * Math.PI / 180)} 
                fontSize="4" 
                fontWeight="bold" 
                fill="white" 
                textAnchor="middle" 
                alignmentBaseline="middle"
              >
                {getLabel(data.direction)}
              </text>

              {/* Center Point */}
              <circle cx="50" cy="50" r="2" fill="#334155" />
            </svg>
            
            {/* Lamp Icon Overlay (Simulated) */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ 
                transform: `translate(-50%, -50%) translate(${35 * Math.cos(rotation * Math.PI / 180)}px, ${35 * Math.sin(rotation * Math.PI / 180)}px)` 
              }}
            >
               {/* Using Gift as Lamp placeholder or Sparkles */}
               <div className="bg-yellow-400 rounded-full p-1 shadow-lg border border-white">
                 <Gift className="w-4 h-4 text-white" />
               </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-slate-700 text-sm leading-relaxed max-w-2xl whitespace-pre-line text-justify">
            {data.desc}
          </div>
        </div>
      </div>
    );
  };

  const RemedyList = ({ title, items, type }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="divide-y divide-slate-100">
      {items.map((item: any, i: number) => (
        <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50">
          <div className="mt-1">
            {type === 'gemstone' ? <Gem className="w-5 h-5 text-indigo-500" /> : <Gift className="w-5 h-5 text-emerald-500" />}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">{item.planet}</h4>
            <p className="text-slate-600">
                {type === 'gemstone' ? `${item.stone} (${item.type})` : item.item}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PersonalVastu;
