'use client';
import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const response = await fetch('/api/omars-cousins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    setAnswer(data.answer);
    setLoading(false);
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ask Omar's Arab Cousins</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
      {answer && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </main>
  );
}
