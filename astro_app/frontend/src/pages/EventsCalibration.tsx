import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Zap, Plus, X, Calendar, Trash2 } from 'lucide-react';

interface LifeEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    description?: string;
    createdAt: string;
}

const EventsCalibration = () => {
    // const navigate = useNavigate(); // Keep for future use if needed
    const [events, setEvents] = useState<LifeEvent[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: ''
    });

    // Load events on mount
    useEffect(() => {
        const savedEvents = localStorage.getItem('calibration_events');
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        } else {
            // Add some dummy data if empty for demo ? No, clean state is better.
            // Or maybe the sample ones from screenshot? 
            // Let's start clean.
        }
    }, []);

    // Save events when changed
    useEffect(() => {
        localStorage.setItem('calibration_events', JSON.stringify(events));
    }, [events]);

    const handleSave = () => {
        if (!formData.title || !formData.date) return;

        const newEvent: LifeEvent = {
            id: Date.now().toString(),
            title: formData.title,
            date: formData.date,
            description: formData.description,
            createdAt: new Date().toISOString()
        };

        setEvents([newEvent, ...events]);
        setFormData({ title: '', date: '', description: '' });
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const getMonthsAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);

        if (years > 0) return `${years} years ago`;
        const months = Math.floor(diffDays / 30);
        if (months > 0) return `${months} months ago`;
        return `${diffDays} days ago`;
    };

    return (
        <MainLayout title="Events Calibration" breadcrumbs={['Tools', 'Calibration', 'Events Calibration']}>
            <div className="max-w-4xl space-y-6">

                {/* Header Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Zap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Events Calibration</h1>
                        <span className="bg-white text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
                            Life Events Analysis
                        </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed max-w-3xl text-lg">
                        Any astrologer would need to have basic information about your life events, to make good predictions.
                        Add significant life events with their dates to help calibrate your birth chart for more accurate predictions.
                        These events help correlate astrological transits with real-life occurrences, improving prediction accuracy.
                    </p>
                </div>

                {/* Events Grid */}
                {events.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map(event => (
                            <div key={event.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start">
                                    <div className="flex space-x-4">
                                        {/* Date Box */}
                                        <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[70px]">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase">
                                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </div>
                                            <div className="text-2xl font-bold text-slate-800 leading-none my-1">
                                                {new Date(event.date).getDate()}
                                            </div>
                                            <div className="text-[10px] font-medium text-slate-500">
                                                {new Date(event.date).getFullYear()}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
                                            <p className="text-slate-500 text-sm mt-1">{getMonthsAgo(event.date)}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Event Form */}
                {showForm ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-700">Add New Life Event</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Event Description</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Started new job, Got married, Moved to new city"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Event Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm pr-10"
                                    />
                                    <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <button
                                onClick={handleSave}
                                disabled={!formData.title || !formData.date}
                                className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Save Event
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full md:w-auto flex items-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-medium py-3 px-6 rounded-xl transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Life Event #{events.length + 1}
                    </button>
                )}

            </div>
        </MainLayout>
    );
};

export default EventsCalibration;
