import { useNavigate } from 'react-router-dom';
import { Star, Heart, Compass, Gem, MessageSquare } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Full Horoscope', icon: Star, path: '/tools/periods', color: 'bg-indigo-500' },
    { label: 'Match Compatibility', icon: Heart, path: '/global/matching', color: 'bg-rose-500' },
    { label: 'Vastu Check', icon: Compass, path: '/tools/vastu', color: 'bg-orange-500' },
    { label: 'Gemstone Advice', icon: Gem, path: '/tools/gems', color: 'bg-teal-500' },
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {actions.map((action, i) => (
              <button 
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 aspect-square justify-center"
              >
                  <div className={`w-12 h-12 rounded-full ${action.color} text-white flex items-center justify-center shadow-sm`}>
                      <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{action.label}</span>
              </button>
          ))}
        </div>
      </div>

      <button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 font-bold hover:scale-[1.02] transition-transform">
          <MessageSquare className="w-5 h-5" />
          Ask About Today
      </button>
    </div>
  );
};

export default QuickActions;
