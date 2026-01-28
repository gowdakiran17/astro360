import { useState, useEffect } from 'react';
import { Message } from '../components/ai/AIChatArea';

// Types
export interface ChatSession {
    id: string;
    title: string;
    date: Date;
    preview: string;
    messages: Message[];
}

const STORAGE_KEY = 'vedic_ai_chat_history_v1';

export const useChatHistory = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Hydrate dates
                const hydratedSessions = parsed.map((s: any) => ({
                    ...s,
                    date: new Date(s.date),
                    messages: s.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }))
                }));
                setSessions(hydratedSessions);
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    }, []);

    // Save to LocalStorage whenever sessions change
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        }
    }, [sessions]);

    const createSession = (firstMessage: string, msgObj: Message) => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : ''),
            date: new Date(),
            preview: firstMessage,
            messages: [msgObj]
        };
        setSessions(prev => [newSession, ...prev]);
        return newSession.id;
    };

    const addMessageToSession = (sessionId: string, message: Message) => {
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                return {
                    ...s,
                    messages: [...s.messages, message],
                    preview: message.content.slice(0, 50) + '...'
                };
            }
            return s;
        }));
    };

    const deleteSession = (sessionId: string) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        // Update local storage immediately for deletion
        const current = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    };

    return {
        sessions,
        createSession,
        addMessageToSession,
        deleteSession
    };
};
