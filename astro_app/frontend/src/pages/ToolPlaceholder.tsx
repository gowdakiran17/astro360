import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ToolPlaceholderProps {
    title: string;
    description?: string;
}

const ToolPlaceholder: React.FC<ToolPlaceholderProps> = ({ title, description }) => {
    const navigate = useNavigate();

    return (
        <MainLayout title={title} breadcrumbs={['Tools', title]}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Construction className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    {description || "This powerful astrological tool is currently being built by our expert team. Check back soon for updates!"}
                </p>

                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </button>

                    <button
                        disabled
                        className="px-6 py-2.5 bg-indigo-100 text-indigo-400 font-medium rounded-lg cursor-not-allowed"
                    >
                        Coming Soon
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};

export default ToolPlaceholder;
