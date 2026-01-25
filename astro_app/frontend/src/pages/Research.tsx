import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';
import { Upload, Search, FileText, BookOpen, Loader2, AlertCircle, CheckCircle, GitBranch, RefreshCw, Sparkles, X } from 'lucide-react';

interface GraphNode {
    id: string;
    label: string;
    type: 'document' | 'concept';
}

interface GraphLink {
    source: string;
    target: string;
}

const Research = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'graph'>('search');

    // Ingest State
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Search State
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    // Graph State
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
    const [loadingGraph, setLoadingGraph] = useState(false);

    // AI Ask State
    const [askingAI, setAskingAI] = useState(false);
    const [aiAnswer, setAiAnswer] = useState<{ answer: string, sources: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/research/ingest', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadStatus({ type: 'success', message: `Ingested ${response.data.filename} (${response.data.chunks_added} chunks)` });
            setFile(null);
        } catch (err: any) {
            setUploadStatus({ type: 'error', message: 'Failed to upload document.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        setAiAnswer(null); // Clear previous AI answer
        try {
            const response = await api.post('/research/search', { query, k: 5 });
            setResults(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const handleAskAI = async () => {
        if (!query.trim()) return;
        setAskingAI(true);
        try {
            const response = await api.post('/research/ask', { question: query, k: 5 });
            setAiAnswer(response.data);
        } catch (err) {
            console.error(err);
            setAiAnswer({ answer: 'Failed to get AI response. Please try again.', sources: [] });
        } finally {
            setAskingAI(false);
        }
    };

    const fetchGraph = async () => {
        setLoadingGraph(true);
        try {
            const response = await api.get('/research/graph');
            setGraphData(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingGraph(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'graph' && graphData.nodes.length === 0) {
            fetchGraph();
        }
    }, [activeTab]);

    // Simple Graph Visualization using SVG
    const renderGraph = () => {
        if (graphData.nodes.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <GitBranch className="w-16 h-16 mb-4 opacity-30" />
                    <p>No knowledge graph data. Upload documents first.</p>
                </div>
            );
        }

        const width = 800;
        const height = 500;
        const centerX = width / 2;
        const centerY = height / 2;

        // Separate nodes by type
        const docNodes = graphData.nodes.filter(n => n.type === 'document');
        const conceptNodes = graphData.nodes.filter(n => n.type === 'concept');

        // Position nodes in concentric circles
        const nodePositions: Record<string, { x: number, y: number }> = {};

        // Documents in inner circle
        docNodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / Math.max(docNodes.length, 1);
            const radius = 100;
            nodePositions[node.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        // Concepts in outer circle
        conceptNodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / Math.max(conceptNodes.length, 1);
            const radius = 200;
            nodePositions[node.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        return (
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                {/* Links */}
                {graphData.links.map((link, idx) => {
                    const source = nodePositions[link.source];
                    const target = nodePositions[link.target];
                    if (!source || !target) return null;
                    return (
                        <line
                            key={idx}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke="#cbd5e1"
                            strokeOpacity="0.4"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Nodes */}
                {graphData.nodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;
                    const isDoc = node.type === 'document';
                    return (
                        <g key={node.id}>
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={isDoc ? 18 : 10}
                                fill={isDoc ? '#6366f1' : '#f59e0b'}
                                className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
                            />
                            <text
                                x={pos.x}
                                y={pos.y + (isDoc ? 32 : 24)}
                                textAnchor="middle"
                                className="text-[10px] fill-slate-600 dark:fill-slate-400 font-medium"
                            >
                                {node.label.length > 12 ? node.label.slice(0, 12) + '...' : node.label}
                            </text>
                        </g>
                    );
                })}

                {/* Legend */}
                <g transform="translate(20, 20)">
                    <circle cx={8} cy={8} r={8} fill="#6366f1" />
                    <text x={22} y={12} className="text-[10px] fill-slate-500 dark:fill-slate-400">Documents</text>
                    <circle cx={8} cy={28} r={6} fill="#f59e0b" />
                    <text x={22} y={32} className="text-[10px] fill-slate-500 dark:fill-slate-400">Concepts</text>
                </g>
            </svg>
        );
    };

    return (
        <MainLayout title="Research Intelligence" breadcrumbs={['Tools', 'Research']}>
            <div className="w-full space-y-6 px-6">
                {/* Tab Navigation */}
                <div className="flex items-center space-x-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'search' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <Search className="w-4 h-4" /> Search
                    </button>
                    <button
                        onClick={() => setActiveTab('graph')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'graph' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <GitBranch className="w-4 h-4" /> Knowledge Graph
                    </button>
                </div>

                {activeTab === 'search' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Ingest */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    Ingest Knowledge
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Upload PDF documents to add to the knowledge base.
                                </p>

                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
                                    <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <FileText className="w-8 h-8 text-slate-300 dark:text-slate-500 mb-2" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{file ? file.name : "Click to Upload PDF"}</span>
                                    </div>
                                </div>

                                {file && (
                                    <button onClick={handleUpload} disabled={uploading} className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center">
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        {uploading ? 'Ingesting...' : 'Start Ingestion'}
                                    </button>
                                )}

                                {uploadStatus && (
                                    <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${uploadStatus.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                        {uploadStatus.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                                        {uploadStatus.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Search */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[500px] flex flex-col transition-colors duration-300">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    Semantic Search
                                </h2>
                                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., 'What are the rules for marriage timing in KP?'" className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-colors" />
                                    <button type="submit" disabled={searching} className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors disabled:opacity-50">{searching ? '...' : 'Search'}</button>
                                    <button type="button" onClick={handleAskAI} disabled={askingAI || !query.trim()} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                                        {askingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        Ask AI
                                    </button>
                                </form>

                                {/* AI Answer Panel */}
                                {aiAnswer && (
                                    <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-5 border border-indigo-100 dark:border-slate-600 relative">
                                        <button onClick={() => setAiAnswer(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <h3 className="font-bold text-indigo-800 dark:text-indigo-200">AI Answer</h3>
                                        </div>
                                        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {aiAnswer.answer}
                                        </div>
                                        {aiAnswer.sources.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-slate-600">
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Sources:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {aiAnswer.sources.map((src, i) => (
                                                        <span key={i} className="text-xs bg-white dark:bg-slate-600 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{src}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {results.length > 0 ? results.map((res, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1"><BookOpen className="w-3 h-3" />{res.metadata.source || "Unknown Source"}</div>
                                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">{Math.round(res.score * 100) / 100} sim</span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">"...{res.content}..."</p>
                                        </div>
                                    )) : !searching && !aiAnswer && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-50">
                                            <BookOpen className="w-16 h-16 mb-4" />
                                            <p>No results found. Try searching for a specific topic.</p>
                                        </div>
                                    )}
                                    {searching && <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" /></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'graph' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Knowledge Graph
                            </h2>
                            <button onClick={fetchGraph} disabled={loadingGraph} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-colors">
                                <RefreshCw className={`w-5 h-5 ${loadingGraph ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Visual map of connections between uploaded documents and astrological concepts.</p>
                        {loadingGraph ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" /></div>
                        ) : renderGraph()}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Research;
