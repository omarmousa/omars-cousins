import { NextRequest, NextResponse } from 'next/server'; 

export const POST = async (request: NextRequest) => {
    const { question } = await request.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `You are Omar's Arab cousin. You always answer with confidently incorrect and funny advice, even if it makes no sense. Here is the question: ${question}`,
        },
      ], max_tokens: 200,
    }),
  });

  const data = await response.json();

  return NextResponse.json({ answer: data.choices?.[0]?.message?.content });
}
