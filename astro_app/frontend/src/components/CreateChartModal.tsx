import { useState } from 'react';
import { X, User, Save, Search } from 'lucide-react';
import CitySearch from './CitySearch';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface CreateChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChartCreated?: () => void; // Callback to refresh list
}

const CreateChartModal = ({ isOpen, onClose, onChartCreated }: CreateChartModalProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: 'Kiran',
    lastName: 'Kumar',
    chartFor: 'Myself',
    month: 'April',
    day: '17',
    year: '1990',
    hour: '5',
    minute: '6',
    amPm: 'AM',
    gender: 'Male',
    location: {
      name: 'Malur, Karnataka 563130, India',
      latitude: 13.0037,
      longitude: 77.9383,
      timezone: '+05:30'
    }
  });

  if (!isOpen) return null;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  interface LocationSelection {
    name?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }

  const handleLocationSelect = (loc: LocationSelection) => {
    setFormData(prev => ({
      ...prev,
      location: {
        name: loc.name || 'Selected Location',
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone
      }
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      // 1. Format Date
      const index = months.indexOf(formData.month);
      const monthIndex = index === -1 ? 1 : index + 1; // Fallback to 1 (Jan) if likely error
      const formattedDate = `${String(formData.day).padStart(2, '0')}/${String(monthIndex).padStart(2, '0')}/${formData.year}`;

      // 2. Format Time (12h -> 24h)
      let hour = parseInt(formData.hour);
      if (formData.amPm === 'PM' && hour !== 12) hour += 12;
      if (formData.amPm === 'AM' && hour === 12) hour = 0;
      const formattedTime = `${String(hour).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')}`;

      // 3. Prepare Payload for Backend
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        relation: formData.chartFor,
        date_str: formattedDate,
        time_str: formattedTime,
        timezone_str: formData.location.timezone,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        location_name: formData.location.name
      };

      // 4. Save to Backend
      const response = await api.post('/charts/', payload);

      // 5. Navigate or Refresh
      const homePayload = {
        ...payload,
        id: response.data.id,
        date: payload.date_str,
        time: payload.time_str,
        timezone: payload.timezone_str,
        locationName: payload.location_name
      };

      if (onChartCreated) {
        onChartCreated();
      }

      onClose();
      navigate('/home', { state: { chartData: homePayload } });

    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to create chart.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Create Your First Chart</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-slate-500 text-sm -mt-2">Enter birth details to generate your personalized chart</p>
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Section: Birth Information */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex items-center mb-4 text-slate-700 font-medium">
              <User className="w-4 h-4 mr-2" />
              Birth Information
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">This chart is for *</label>
              <select
                value={formData.chartFor}
                onChange={e => setFormData({ ...formData, chartFor: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                <option>Myself</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Spouse</option>
                <option>Child</option>
              </select>
            </div>
          </div>

          {/* Section: Birth Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Birth Date *</label>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <span className="text-xs text-slate-400 mb-1 block">Month</span>
                <select
                  value={formData.month}
                  onChange={e => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  {months.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <span className="text-xs text-slate-400 mb-1 block">Day</span>
                <input
                  type="number"
                  value={formData.day}
                  onChange={e => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div className="col-span-3">
                <span className="text-xs text-slate-400 mb-1 block">Year</span>
                <input
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Birth Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Birth Time *</label>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <span className="text-xs text-slate-400 mb-1 block">Hour</span>
                <input
                  type="number"
                  value={formData.hour}
                  onChange={e => setFormData({ ...formData, hour: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div className="col-span-4">
                <span className="text-xs text-slate-400 mb-1 block">Minutes</span>
                <input
                  type="number"
                  value={formData.minute}
                  onChange={e => setFormData({ ...formData, minute: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div className="col-span-4">
                <span className="text-xs text-slate-400 mb-1 block">AM/PM</span>
                <select
                  value={formData.amPm}
                  onChange={e => setFormData({ ...formData, amPm: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Birth Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Birth Location *</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <CitySearch onSelect={handleLocationSelect} label="" />
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center mt-1 h-[38px]">
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
            {formData.location.latitude !== 0 && (
              <div className="mt-2 flex items-center text-xs text-red-400">
                <span className="mr-1">📍</span>
                {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}
              </div>
            )}
          </div>

          {/* Section: Gender */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">Gender (optional)</label>
              <span className="text-xs text-slate-400 flex items-center">
                <span className="mr-1">?</span> Why do we ask?
              </span>
            </div>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 font-medium text-sm hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-indigo-500/20 flex items-center"
          >
            {loading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Create Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChartModal;
