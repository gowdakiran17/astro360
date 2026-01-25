import { useState } from 'react';
import { Download, FileText, Table, Calendar } from 'lucide-react';

const ExportControls = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}...`);
    // Mock export functionality
    alert(`Exporting report as ${format}. This feature is being processed.`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
        <div className="flex items-center gap-2">
            {/* Date Range Selector Mock */}
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Calendar className="w-4 h-4" />
                <span>This Month</span>
            </button>

            {/* Export Dropdown */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
                <Download className="w-4 h-4" />
                Export
            </button>
        </div>

        {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700">
                    <FileText className="w-4 h-4 text-red-500" /> PDF Report
                </button>
                <button onClick={() => handleExport('CSV')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700">
                    <Table className="w-4 h-4 text-green-500" /> CSV Data
                </button>
                <button onClick={() => handleExport('Excel')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700">
                    <Table className="w-4 h-4 text-emerald-600" /> Excel Sheet
                </button>
            </div>
        )}
    </div>
  );
};

export default ExportControls;
