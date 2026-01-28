import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Server, Save } from 'lucide-react';

interface LLMConfig {
    geminiKey: string;
    openaiKey: string;
    ollamaUrl: string;
}

interface LLMSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: LLMConfig) => void;
    initialConfig: LLMConfig;
}

export const LLMSettings: React.FC<LLMSettingsProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
    const [config, setConfig] = useState<LLMConfig>(initialConfig);

    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">LLM Configuration</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Ollama Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                            <Server className="w-4 h-4 text-emerald-500" />
                            Local LLM (Ollama)
                        </h4>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">Ollama Base URL</label>
                            <input
                                type="text"
                                value={config.ollamaUrl}
                                onChange={(e) => setConfig({ ...config, ollamaUrl: e.target.value })}
                                placeholder="http://localhost:11434"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                            />
                            <p className="text-[10px] text-slate-400 pl-1">
                                Requires Ollama running locally. (Run `ollama serve`)
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Cloud Keys Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                            <Key className="w-4 h-4 text-amber-500" />
                            Cloud API Keys (Optional)
                        </h4>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">OpenAI API Key</label>
                            <input
                                type="password"
                                value={config.openaiKey}
                                onChange={(e) => setConfig({ ...config, openaiKey: e.target.value })}
                                placeholder="sk-..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 ml-1">Gemini API Key</label>
                            <input
                                type="password"
                                value={config.geminiKey}
                                onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
                                placeholder="AIza..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 pl-1 leading-relaxed">
                            ⚠️ Keys are stored locally in your browser. If left empty, the server's default keys will be used.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
                    <button
                        onClick={() => { onSave(config); onClose(); }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};
