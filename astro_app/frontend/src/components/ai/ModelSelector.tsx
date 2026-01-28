import React from 'react';
import { Bot, Sparkles, Cpu } from 'lucide-react';

export type AIModel = 'gemini-flash-latest' | 'gemini-2.5-pro' | 'gpt-4o' | 'gpt-3.5-turbo' | 'llama3' | 'mistral' | 'phi3' | 'mistral-nemo' | 'llama3.1-405b' | 'command-r-plus';

interface ModelSelectorProps {
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
    disabled?: boolean;
}

export const AVAILABLE_MODELS: { id: AIModel; name: string; provider: 'Google' | 'OpenAI' | 'Ollama'; group: 'Cloud' | 'Local'; icon: any; description: string }[] = [
    // Cloud Models
    {
        id: 'gemini-flash-latest',
        name: 'Gemini Flash (Latest)',
        provider: 'Google',
        group: 'Cloud',
        icon: Sparkles,
        description: 'Fastest cloud model (Default)'
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        group: 'Cloud',
        icon: Bot,
        description: 'Best reasoning capability'
    },

    // Local Models (VedaAI Collection)
    {
        id: 'llama3',
        name: 'Llama 3 (8B)',
        provider: 'Ollama',
        group: 'Local',
        icon: Cpu,
        description: 'Standard fast local model'
    },
    {
        id: 'phi3',
        name: 'Phi-3 Medium (128k)',
        provider: 'Ollama',
        group: 'Local',
        icon: Cpu,
        description: 'High context Microsoft model'
    },
    {
        id: 'mistral-nemo',
        name: 'Mistral Nemo (128k)',
        provider: 'Ollama',
        group: 'Local',
        icon: Cpu,
        description: 'New standard for small models'
    },
    {
        id: 'llama3.1-405b',
        name: 'Llama 3.1 (405B)',
        provider: 'Ollama',
        group: 'Local',
        icon: Cpu,
        description: 'Frontier class (Requires massive VRAM)'
    },
    {
        id: 'command-r-plus',
        name: 'Command R+ (100B)',
        provider: 'Ollama',
        group: 'Local',
        icon: Cpu,
        description: 'Optimized for RAG & Tool use'
    },
    {
        id: 'mistral',
        name: 'Mistral (Standard)',
        provider: 'Ollama',
        group: 'Local',
        icon: Cpu,
        description: 'Legacy robust local model'
    }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange, disabled }) => {
    return (
        <div className="relative group min-w-[200px]">
            <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value as AIModel)}
                disabled={disabled}
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
                <optgroup label="Cloud Models (Best Quality)">
                    {AVAILABLE_MODELS.filter(m => m.group === 'Cloud').map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name}
                        </option>
                    ))}
                </optgroup>
                <optgroup label="Local Models (Private & Free)">
                    {AVAILABLE_MODELS.filter(m => m.group === 'Local').map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name}
                        </option>
                    ))}
                </optgroup>
            </select>

            {/* Custom Arrow Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Tooltip on hover showing description */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-semibold mb-1 text-blue-300">
                    {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                </div>
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.description}
            </div>
        </div>
    );
};

export default ModelSelector;
