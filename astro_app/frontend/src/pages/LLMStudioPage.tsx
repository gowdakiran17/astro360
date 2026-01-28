import React, { useState, useEffect } from 'react';
import { 
    Cpu, Save, Play, RefreshCw, 
    Settings, MessageSquare, Database, 
    Trash2
} from 'lucide-react';
import { useChart } from '../context/ChartContext';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';

// Types
interface SavedPrompt {
    id: string;
    name: string;
    prompt: string;
    model: string;
    provider: string;
}

const MODELS = [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'gemini' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' }
];

const LLMStudioPage = () => {
    const { currentProfile } = useChart();
    
    // State
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showContext, setShowContext] = useState(false);
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load saved prompts from local storage
    useEffect(() => {
        const saved = localStorage.getItem('astro360_llm_prompts');
        if (saved) {
            setSavedPrompts(JSON.parse(saved));
        }
    }, []);

    // Save prompt handler
    const handleSavePrompt = () => {
        if (!prompt.trim()) return;
        const name = prompt.split('\n')[0].substring(0, 30) + '...';
        const newPrompt: SavedPrompt = {
            id: Date.now().toString(),
            name,
            prompt,
            model: selectedModel.id,
            provider: selectedModel.provider
        };
        const updated = [newPrompt, ...savedPrompts];
        setSavedPrompts(updated);
        localStorage.setItem('astro360_llm_prompts', JSON.stringify(updated));
    };

    // Load prompt handler
    const handleLoadPrompt = (p: SavedPrompt) => {
        setPrompt(p.prompt);
        const model = MODELS.find(m => m.id === p.model) || MODELS[0];
        setSelectedModel(model);
    };

    // Delete prompt handler
    const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedPrompts.filter(p => p.id !== id);
        setSavedPrompts(updated);
        localStorage.setItem('astro360_llm_prompts', JSON.stringify(updated));
    };

    // Generate handler
    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            // Prepare the payload
            // We use 'normal_user_chat' context but override the prompt via query
            // In a real "LLMCoder" style, we might want a 'raw_completion' endpoint, 
            // but reusing the existing endpoint with a special context or query is safer.
            
            // Actually, let's use the 'query' field as the main instruction
            // and the 'context' as 'llm_studio' if we want special handling later.
            // For now, 'normal_user_chat' is fine as it wraps the query.
            
            const payload = {
                context: 'normal_user_chat',
      data: {
        chart: currentProfile?.raw || {},
        user_name: currentProfile?.name || 'User'
      },
      query: prompt,
      llm_config: {
        provider: selectedModel.provider,
        model_name: selectedModel.id
      }
    };

            const res = await api.post('/ai/generate', payload);
            setResponse(res.data.insight);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || "Generation failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            {/* Sidebar - Saved Prompts */}
            <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-bold text-slate-700 dark:text-slate-200">Prompt Library</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {savedPrompts.length === 0 && (
                        <div className="text-center p-4 text-slate-400 text-sm">
                            No saved prompts yet. Write one and click Save!
                        </div>
                    )}
                    {savedPrompts.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => handleLoadPrompt(p)}
                            className="group relative w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                        >
                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-6">
                                {p.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide
                                    ${p.provider === 'openai' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {p.model}
                                </span>
                            </div>
                            
                            <button 
                                onClick={(e) => handleDeletePrompt(p.id, e)}
                                className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0B0F19]">
                {/* Top Toolbar */}
                <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                            <Cpu className="w-5 h-5" />
                            <span>LLM Studio</span>
                        </div>
                        
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                        
                        <select 
                            value={selectedModel.id}
                            onChange={(e) => setSelectedModel(MODELS.find(m => m.id === e.target.value) || MODELS[0])}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                        >
                            {MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowContext(!showContext)}
                            className={`p-2 rounded-lg transition-colors ${showContext ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Toggle Context Data"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleSavePrompt}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Save Prompt"
                        >
                            <Save className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
                        >
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Run
                        </button>
                    </div>
                </div>

                {/* Split View Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Input */}
                    <div className={`flex flex-col transition-all duration-300 ${showContext ? 'w-1/2' : 'w-1/2'} border-r border-slate-200 dark:border-slate-800`}>
                        <div className="flex-1 flex flex-col p-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                                <span>Prompt / Query</span>
                                <span className="text-slate-400 font-normal normal-case">Supports Markdown</span>
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter your prompt here... e.g., 'Analyze the effect of Jupiter transit on the 10th house'"
                                className="flex-1 w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                            />
                        </div>
                        
                        {showContext && (
                            <div className="h-1/3 border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 overflow-auto">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Context Data (JSON)
                                </label>
                                <pre className="text-[10px] text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap">
                                    {JSON.stringify({
                                        chart: currentProfile?.raw || {},
                                        user: currentProfile?.name
                                    }, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Right: Output */}
                    <div className="flex-1 bg-white dark:bg-slate-900 p-6 overflow-y-auto">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">
                            Output
                        </label>
                        
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {!response && !isLoading && !error && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                <p>Run a prompt to see results here</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                            </div>
                        )}

                        {response && (
                            <div className="prose prose-indigo dark:prose-invert max-w-none">
                                <ReactMarkdown>{response}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LLMStudioPage;
