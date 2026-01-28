import React, { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import AIChatArea, { Message } from '../components/ai/AIChatArea';
import AIChatSidebar, { ChatSession } from '../components/ai/AIChatSidebar';
import ChatHeader from '../components/ai/ChatHeader';
import { useChartSettings } from '../context/ChartContext';
import { astrologyService } from '../services/astrology';
import api from '../services/api';
import { Sparkles } from 'lucide-react';

type ChatMode = 'natal' | 'synastry' | 'transit' | 'composite';

const AIChatPage: React.FC = () => {
  const { currentProfile, availableProfiles } = useChartSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('natal');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chartData, setChartData] = useState<any | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const primaryDetails = useMemo(() => {
    if (!currentProfile) return null;
    return {
      date: currentProfile.date,
      time: currentProfile.time,
      timezone: currentProfile.timezone,
      latitude: currentProfile.latitude,
      longitude: currentProfile.longitude,
    };
  }, [currentProfile]);

  const secondaryDetails = useMemo(() => {
    const other = availableProfiles?.find((p: any) => {
      const name = p.first_name ? `${p.first_name} ${p.last_name}` : p.name || 'My Chart';
      return name !== currentProfile?.name;
    }) || availableProfiles?.[0];
    if (!other) return null;
    return {
      date: other.date_str || other.date,
      time: other.time_str || other.time,
      timezone: other.timezone_str || other.timezone,
      latitude: other.latitude,
      longitude: other.longitude,
    };
  }, [availableProfiles, currentProfile]);

  useEffect(() => {
    if (!currentProfile) return;
    const loadChart = async () => {
      try {
        const data = await astrologyService.getBirthChart({
          date: currentProfile.date,
          time: currentProfile.time,
          timezone: currentProfile.timezone,
          latitude: currentProfile.latitude,
          longitude: currentProfile.longitude,
        });
        setChartData(data);
      } catch {
        setChartData(null);
      }
    };
    loadChart();
  }, [currentProfile]);

  useEffect(() => {
    if (sessions.length === 0) {
      const id = Date.now().toString();
      const initial: ChatSession = {
        id,
        title: 'New Conversation',
        date: new Date(),
        preview: '',
      };
      setSessions([initial]);
      setCurrentSessionId(id);
    }
  }, [sessions.length]);

  const appendUserMessage = (text: string) => {
    const msg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
  };

  const appendAssistantMessage = (text: string) => {
    const msg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
  };

  const onSend = async (message: string) => {
    if (!message.trim() || !currentProfile) return;
    appendUserMessage(message);
    setIsLoading(true);
    try {
      let payload: any = {};
      if (mode === 'natal') {
        payload = {
          context: 'natal_chat',
          data: { birth_details: primaryDetails },
          query: message,
        };
      } else if (mode === 'transit') {
        payload = {
          context: 'transit_chat',
          data: { birth_details: primaryDetails },
          query: message,
        };
      } else if (mode === 'synastry') {
        if (!secondaryDetails) {
          payload = {
            context: 'synastry_chat',
            data: { boy: primaryDetails, girl: primaryDetails },
            query: message,
          };
        } else {
          payload = {
            context: 'synastry_chat',
            data: { boy: primaryDetails, girl: secondaryDetails },
            query: message,
          };
        }
      } else {
        if (!secondaryDetails) {
          payload = {
            context: 'composite_chat',
            data: { boy: primaryDetails, girl: primaryDetails },
            query: message,
          };
        } else {
          payload = {
            context: 'composite_chat',
            data: { boy: primaryDetails, girl: secondaryDetails },
            query: message,
          };
        }
      }
      const res = await api.post('/ai/generate', payload);
      const insight = res.data?.insight || 'No insight available';
      appendAssistantMessage(insight);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, preview: insight.slice(0, 80), date: new Date() }
            : s
        )
      );
    } catch {
      appendAssistantMessage('I am unable to connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onShowChart = () => {
    appendAssistantMessage('[SHOW_CHART] Here is your chart view.');
  };

  const onShowTechnical = () => {
    onSend('Show technical details of positions and aspects.');
  };

  const onGenerateReport = () => {
    onSend('Generate a detailed report tailored to my chart.');
  };

  const onNewChat = () => {
    const id = Date.now().toString();
    const s: ChatSession = { id, title: 'New Conversation', date: new Date(), preview: '' };
    setSessions((prev) => [s, ...prev]);
    setCurrentSessionId(id);
    setMessages([]);
  };

  const onSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setMessages([]);
  };

  const onDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      const next = sessions.find((s) => s.id !== id)?.id || null;
      setCurrentSessionId(next);
      setMessages([]);
    }
  };

  return (
    <MainLayout title="AI Chat" breadcrumbs={['Dashboard', 'AI Chat']} showHeader={false} disableContentPadding={true} theme="cosmic">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[calc(100vh-64px)] md:h-[calc(100vh-0px)]">
        <div className="md:col-span-3 lg:col-span-3 xl:col-span-2 border-r border-white/10">
          <AIChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={onSelectSession}
            onNewChat={onNewChat}
            onDeleteSession={onDeleteSession}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
        <div className="md:col-span-9 lg:col-span-9 xl:col-span-10 flex flex-col h-full">
          <div className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <ChatHeader profileName={currentProfile?.name} />
              <div className="hidden md:flex items-center gap-2 px-6">
                <button
                  onClick={() => setMode('natal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'natal' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300 border border-white/10'}`}
                >
                  Natal
                </button>
                <button
                  onClick={() => setMode('synastry')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'synastry' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300 border border-white/10'}`}
                >
                  Synastry
                </button>
                <button
                  onClick={() => setMode('transit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'transit' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300 border border-white/10'}`}
                >
                  Transit
                </button>
                <button
                  onClick={() => setMode('composite')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'composite' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300 border border-white/10'}`}
                >
                  Composite
                </button>
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-3 text-white"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
          <AIChatArea
            messages={messages}
            isLoading={isLoading}
            onSend={onSend}
            onShowChart={onShowChart}
            onShowTechnical={onShowTechnical}
            onGenerateReport={onGenerateReport}
            containerRef={messagesContainerRef}
            chartData={chartData}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default AIChatPage;
