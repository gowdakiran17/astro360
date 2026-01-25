import React, { useState } from 'react';
import { 
  Activity, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Heart, Briefcase, 
  DollarSign, Zap, Brain, MessageCircle, Loader2
} from 'lucide-react';
import { interpretDasha, LifePhaseData } from '../../utils/periodInterpreter';
import api from '../../services/api';

interface NormalUserViewProps {
  currentMahadasha: string;
  currentAntardasha: string;
  startDate: string;
  endDate: string;
  nextDashaName?: string;
  contextData?: any; // Extra data for AI
}

const NormalUserView: React.FC<NormalUserViewProps> = ({
  currentMahadasha,
  currentAntardasha,
  startDate,
  endDate,
  nextDashaName,
  contextData
}) => {
  const data: LifePhaseData = interpretDasha(
    currentMahadasha, 
    currentAntardasha, 
    startDate, 
    endDate,
    nextDashaName
  );

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAI(true);
    setAiResponse(null);
    try {
        const payload = {
            context: "normal_user_chat",
            data: {
                question: aiQuery,
                current_phase: {
                    mahadasha: currentMahadasha,
                    antardasha: currentAntardasha,
                    meaning: data.oneLineMeaning,
                    status: data.status
                },
                ...contextData
            }
        };
        const res = await api.post('/ai/generate', payload);
        setAiResponse(res.data.insight);
    } catch (err) {
        console.error("AI Error:", err);
        setAiResponse("I'm having trouble connecting to the cosmic insights right now. Please try again later.");
    } finally {
        setLoadingAI(false);
    }
  };

  const statusColors = {
    'Smooth': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Mixed': 'bg-amber-100 text-amber-800 border-amber-200',
    'Demanding': 'bg-rose-100 text-rose-800 border-rose-200'
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* 1. Life Phase Overview */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ${statusColors[data.status]}`}>
              {data.status} Phase
            </span>
            <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" /> Ends {data.endDate}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            {data.phaseName}
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed">
            {data.oneLineMeaning}
          </p>
        </div>
      </div>

      {/* 2. Life Phase Timeline */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="text-slate-400 font-medium text-center md:text-left">
            <div className="text-xs uppercase tracking-wider mb-1">Past</div>
            {data.timeline.past}
          </div>
          
          <div className="flex-1 w-full flex items-center gap-4">
            <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                style={{ width: `${data.timeline.progress}%` }}
              ></div>
            </div>
            <div className="text-indigo-600 font-bold whitespace-nowrap">
              You are here ({data.timeline.progress}%)
            </div>
          </div>

          <div className="text-slate-900 font-bold text-center md:text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-normal mb-1">Next</div>
            {data.timeline.next}
            <div className="text-xs text-emerald-600 font-medium mt-1">
              Improvement by {data.timeline.nextImprovement}
            </div>
          </div>
        </div>
      </div>

      {/* 3. What This Phase Means for You (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'career', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { key: 'money', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { key: 'relationships', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
          { key: 'health', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((item: any) => {
          const area = data.areas[item.key as keyof typeof data.areas];
          return (
            <div key={item.key} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{area.title}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Happening Now</div>
                  <p className="text-slate-700 text-sm">{area.what}</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Expect</div>
                  <p className="text-slate-700 text-sm">{area.expect}</p>
                </div>
                <div className="pt-2 border-t border-slate-50">
                   <div className="text-xs font-bold text-indigo-600 uppercase mb-1">How to Handle</div>
                   <p className="text-indigo-900 text-sm font-medium bg-indigo-50 p-2 rounded-lg">{area.handle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 4. Phase Stability Meter */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> Phase Stability
           </h3>
           <div className="flex flex-col items-center justify-center py-4">
              <div className="flex gap-1 mb-3">
                  {[1, 2, 3].map(i => (
                      <div key={i} className={`w-12 h-3 rounded-full transition-colors ${
                          (data.stability.level === 'Stable' && i <= 3) ||
                          (data.stability.level === 'Moderate' && i <= 2) ||
                          (data.stability.level === 'Temporary Unstable' && i <= 1)
                          ? 'bg-indigo-500' : 'bg-slate-200'
                      }`}></div>
                  ))}
              </div>
              <div className="font-bold text-lg text-slate-800">{data.stability.level}</div>
              <p className="text-center text-sm text-slate-500 mt-2 leading-snug">
                  {data.stability.explanation}
              </p>
           </div>
        </div>

        {/* 5. Phase Scorecard (Visual Only) */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Phase Scorecard
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Career', score: data.scores.career },
                { label: 'Money', score: data.scores.money },
                { label: 'Relationships', score: data.scores.relationships },
                { label: 'Health', score: data.scores.health },
                { label: 'Mental Clarity', score: data.scores.mental }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                   <span className="w-24 text-sm font-medium text-slate-600">{item.label}</span>
                   <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                            item.score > 75 ? 'bg-emerald-500' : 
                            item.score > 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} 
                        style={{ width: `${item.score}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* 6 & 7. Opportunities & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Opportunities */}
         <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Top Opportunities
            </h3>
            <div className="space-y-4">
                {data.opportunities.map((op, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {i+1}
                        </div>
                        <div>
                            <div className="font-bold text-emerald-900 text-sm">{op.title}</div>
                            <div className="text-emerald-700 text-xs mt-0.5">{op.why}</div>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         {/* Challenges */}
         <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Challenges to Manage
            </h3>
            <div className="space-y-4">
                {data.challenges.map((ch, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                            !
                        </div>
                        <div>
                            <div className="font-bold text-amber-900 text-sm">{ch.title}</div>
                            <div className="text-amber-800 text-xs mt-0.5">{ch.description}</div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* 8. What to Do & Avoid (Most Important) */}
      <div className="bg-white rounded-3xl border-2 border-indigo-100 p-8 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
         <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Action Plan for This Phase</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x divide-slate-100">
            <div>
                <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold uppercase tracking-wider text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Do This
                </div>
                <ul className="space-y-3">
                    {data.dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                            <span className="font-medium">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:pl-8">
                <div className="flex items-center gap-2 mb-4 text-rose-700 font-bold uppercase tracking-wider text-sm">
                    <XCircle className="w-5 h-5" /> Avoid This
                </div>
                <ul className="space-y-3">
                    {data.avoids.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                            <span className="font-medium">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
         </div>
      </div>

      {/* 9 & 10. Timing & Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Timing */}
         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Timing & Changes</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Pressure Reduces</span>
                    <span className="font-bold text-indigo-600">{data.timing.pressureReduces}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Improvement Begins</span>
                    <span className="font-bold text-emerald-600">{data.timing.improvementBegins}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-sm">Month to be Careful</span>
                    <span className="font-bold text-rose-600">{data.timing.cautionMonth}</span>
                </div>
            </div>
         </div>

         {/* Balance Tips */}
         <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-700 rounded-full -mr-10 -mt-10 opacity-50"></div>
            <h3 className="font-bold mb-4 relative z-10">Balance & Alignment</h3>
            <div className="space-y-4 relative z-10">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-xs text-indigo-200 uppercase mb-1">Daily Habit</div>
                    <div className="font-medium">{data.balance.habit}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-xs text-indigo-200 uppercase mb-1">Mindset</div>
                    <div className="font-medium">{data.balance.mindset}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-xs text-indigo-200 uppercase mb-1">Spiritual Tip</div>
                    <div className="font-medium">{data.balance.spiritual}</div>
                </div>
            </div>
         </div>
      </div>

      {/* 11. Personal Message */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">
              💌
          </div>
          <p className="text-lg text-slate-700 italic font-medium max-w-2xl mx-auto leading-relaxed">
              "{data.personalMessage}"
          </p>
      </div>

      {/* 12. Ask AI */}
      <div className="bg-white rounded-3xl border border-slate-200 p-1 shadow-sm">
          <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" /> Ask AI Consultant
              </h3>
              <p className="text-slate-500 text-sm mb-4">Ask any question about your current phase. I'll answer as your personal guide.</p>
              
              <div className="flex flex-col md:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g., Is this a good time to change jobs?"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    disabled={loadingAI}
                  />
                  <button 
                    onClick={handleAskAI}
                    disabled={loadingAI}
                    className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                      {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                      {loadingAI ? 'Thinking...' : 'Ask'}
                  </button>
              </div>

              {/* AI Response Area */}
              {aiResponse && (
                  <div className="mt-6 bg-indigo-50 rounded-xl p-6 border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                              <Brain className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                              <div className="text-sm font-bold text-indigo-900 mb-1">AI Consultant</div>
                              <div className="text-slate-700 text-sm leading-relaxed prose prose-indigo max-w-none">
                                  {aiResponse.split('\n').map((line, i) => (
                                      <p key={i} className="mb-2 last:mb-0">{line}</p>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                  {["Why am I feeling restless?", "What should I avoid now?", "Is my career stable?"].map((q, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setAiQuery(q); }}
                        className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        {q}
                      </button>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};

export default NormalUserView;
