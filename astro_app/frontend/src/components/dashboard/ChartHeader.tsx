import { Sparkles, Edit2, MapPin, Calendar, Clock, ChevronDown } from 'lucide-react';

interface ChartHeaderProps {
  name: string;
  date: string;
  time: string;
  location: string;
  onEdit: () => void;
}

const ChartHeader = ({ name, date, time, location, onEdit }: ChartHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Top Row: Name & Actions */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Chart</div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
            <button className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center hover:bg-slate-800 transition-colors">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Get a Reading
            </button>
          </div>
        </div>
        <button className="text-slate-500 hover:text-slate-900 text-sm font-medium flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          Switch
          <ChevronDown className="w-4 h-4 ml-1.5" />
        </button>
      </div>

      {/* Details Bar */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between text-sm shadow-sm">
        <div className="flex items-center space-x-6 text-slate-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            {time}
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            {date}
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
            {location}
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChartHeader;
