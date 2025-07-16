'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'system', content: "Ask Omar&apos;s cousins anything." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const response = await fetch('/api/omars-cousins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input }),
    });
    const data = await response.json();
    setMessages([...updatedMessages, { role: 'assistant', content: data.answer }]);
    setLoading(false);
  }

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <div className="flex-grow overflow-y-auto p-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 p-3 rounded-lg max-w-xl ${
              msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-white'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="p-3">Omar&apos;s cousins are thinking...</div>}
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
