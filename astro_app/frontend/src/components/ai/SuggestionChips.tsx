import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestionChipsProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSelect }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(suggestion)}
                    className="
                        group relative px-4 py-2 rounded-xl text-sm font-medium
                        bg-white dark:bg-slate-800 
                        border border-slate-200 dark:border-slate-700
                        hover:border-emerald-400 dark:hover:border-emerald-500
                        text-slate-700 dark:text-slate-300
                        hover:text-emerald-700 dark:hover:text-emerald-300
                        hover:shadow-lg hover:shadow-emerald-500/10
                        transition-all duration-300 ease-out
                        hover:-translate-y-0.5
                    "
                    style={{ animationDelay: `${index * 150}ms` }}
                >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                        {suggestion}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default SuggestionChips;
