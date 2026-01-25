import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Heart, HelpCircle, Save } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

const BiodataCalibration = () => {
    // const navigate = useNavigate();

    const [formData, setFormData] = useState({
        profession: '',
        education: '',
        maritalStatus: '',
        children: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    // Load saved data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('biodata_calibration');
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('biodata_calibration', JSON.stringify(formData));
            setIsSaving(false);
            setLastSaved(new Date().toLocaleTimeString());
        }, 800);
    };

    const InputField = ({ label, name, placeholder, value, onChange }: any) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">{label}</label>
                <HelpCircle className="w-4 h-4 text-slate-300 cursor-help hover:text-slate-400 transition-colors" />
            </div>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm placeholder:text-slate-300"
            />
        </div>
    );

    return (
        <MainLayout title="Biodata Calibration" breadcrumbs={['Tools', 'Calibration', 'Biodata Calibration']}>
            <div className="max-w-4xl space-y-8">

                {/* Header Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Heart className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Biodata Calibration</h1>
                        <span className="bg-white text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
                            Life Context Information
                        </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed max-w-3xl text-lg">
                        Any astrologer would need basic information about your life background to make good predictions.
                        This information is optional, but predictions are better if you provide this.
                    </p>
                </div>

                {/* Life Context Form */}
                <div className="bg-white border border-slate-200 rounded-xl px-8 py-6 shadow-sm">
                    <div className="bg-slate-50 -mx-8 -mt-6 px-8 py-4 border-b border-slate-100 mb-6">
                        <h2 className="font-bold text-slate-700">Life Context Form</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InputField
                            label="Profession"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            placeholder="e.g., Software Engineer, Teacher, Stay-at-home parent, Retired"
                        />
                        <InputField
                            label="Education"
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            placeholder="e.g., Masters in CS, High school diploma, Self-taught programmer"
                        />
                        <InputField
                            label="Marital Status"
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleChange}
                            placeholder="e.g., Married, Single, Divorced, In a relationship, Widowed"
                        />
                        <InputField
                            label="Children"
                            name="children"
                            value={formData.children}
                            onChange={handleChange}
                            placeholder="e.g., Two (ages 5 and 8), None, One adult son, Expecting first"
                        />
                    </div>

                    <div className="mt-8 flex items-center justify-start space-x-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-8 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSaving ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save</span>
                                </>
                            )}
                        </button>

                        {lastSaved && (
                            <span className="text-xs text-green-600 font-medium animate-fadeIn">
                                Saved at {lastSaved}
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default BiodataCalibration;
