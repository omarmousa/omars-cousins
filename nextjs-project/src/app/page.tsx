'use client';
import { useState, useEffect } from 'react';

// Types for session and message
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

const SYSTEM_MESSAGE: Message = { role: 'system', content: "Ask Omar’s cousins anything." };
const SESSIONS_KEY = 'omars-cousins-sessions';

function generateSessionName() {
  const now = new Date();
  return `Chat ${now.toLocaleString()}`;
}

function loadSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // Ensure all messages have correct role types
    return parsed.map((session: any) => ({
      ...session,
      messages: session.messages.map((msg: any) => ({
        ...msg,
        role: msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'system',
      })),
    }));
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loaded = loadSessions();
    if (loaded.length === 0) {
      // Create a new session if none exist
      const newSession: Session = {
        id: crypto.randomUUID(),
        name: generateSessionName(),
        messages: [SYSTEM_MESSAGE],
        createdAt: Date.now(),
      };
      setSessions([newSession]);
      setSelectedSessionId(newSession.id);
      saveSessions([newSession]);
    } else {
      setSessions(loaded);
      setSelectedSessionId(loaded[0].id);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  const currentSession = sessions.find((s) => s.id === selectedSessionId);

  function handleNewSession() {
    const newSession: Session = {
      id: crypto.randomUUID(),
      name: generateSessionName(),
      messages: [SYSTEM_MESSAGE],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setSelectedSessionId(newSession.id);
    setInput('');
    setError('');
    setShowSuccess(false);
  }

  function handleSelectSession(id: string) {
    setSelectedSessionId(id);
    setInput('');
    setError('');
    setShowSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;
    const newMessage: Message = { role: 'user', content: input };
    const updatedMessages: Message[] = [...currentSession.messages, newMessage];
    setInput('');
    setLoading(true);
    setError('');
    setShowSuccess(false);

    // Optimistically update UI
    updateSessionMessages(currentSession.id, updatedMessages);

    try {
      const response = await fetch('/api/omars-cousins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      updateSessionMessages(currentSession.id, [
        ...updatedMessages,
        { role: 'assistant', content: data.answer },
      ]);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      updateSessionMessages(currentSession.id, [
        ...updatedMessages,
        { role: 'assistant', content: "Omar’s Cousins are having some issues right now" },
      ]);
      setError("Omar’s Cousins are having some issues right now");
    } finally {
      setLoading(false);
    }
  }

  function updateSessionMessages(sessionId: string, messages: Message[]) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, messages } : s
      )
    );
  }

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-row flex-grow">
        {/* Sidebar navigation */}
        <aside className="w-64 bg-white border-r flex flex-col p-4">
          <button
            type="button"
            onClick={handleNewSession}
            className="mb-4 p-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + New Chat
          </button>
          <div className="flex-1 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`cursor-pointer p-2 rounded-lg mb-2 truncate transition border border-transparent ${
                  session.id === selectedSessionId
                    ? 'bg-blue-100 border-blue-400 font-bold text-blue-900'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
                title={session.name}
              >
                {session.name}
              </div>
            ))}
          </div>
        </aside>
        {/* Main chat area */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col">
          {currentSession?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 p-3 rounded-lg max-w-xl ${
                msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-white'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && <div className="p-3 italic text-gray-500">Omar’s cousins are thinking...</div>}
          {!loading && showSuccess && !error && (
            <div className="p-3 text-green-600 font-semibold">Powered by Omar’s Cousins</div>
          )}
          {!loading && error && (
            <div className="p-3 text-red-600 font-semibold">{error}</div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex p-4 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-grow p-3 border rounded-lg mr-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-3 bg-blue-600 text-white rounded-lg"
        >
          Send
        </button>
      </form>
    </main>
  );
}
