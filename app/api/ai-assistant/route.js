// Requires ANTHROPIC_API_KEY in .env (get one at https://console.anthropic.com).
// Without it, this route returns a clear error instead of crashing, so the
// rest of the site keeps working even if the key hasn't been set up yet.

const SYSTEM_PROMPT = `You are the "AI Legal Assistant" on LEGAL THREATs BD
, a legal-services
website for Bangladesh. You answer general questions about Bangladeshi law
(criminal, civil, corporate, tax, family, property, etc.) in plain, simple
language a non-lawyer can understand.

Rules:
- Keep answers concise (roughly 120-220 words) unless the question clearly needs more.
- You are NOT a substitute for a licensed lawyer. Never claim certainty about
  how a specific case will turn out.
- When relevant, name the applicable Bangladeshi act or authority (e.g. the
  Penal Code 1860, the Companies Act 1994, the Income Tax Act 2023) but do not
  fabricate section numbers you are not confident about.
- If the question describes a specific, serious, or urgent personal legal
  situation, gently recommend they use the "Find a Lawyer" feature on this
  site to book a consultation with a verified lawyer.
- Always answer in the same language the question was asked in (Bengali or English).
- Do not answer questions unrelated to law/legal topics — politely redirect
  the person back to legal questions if they ask something else.`;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        message:
          'The AI Assistant is not configured yet. Add ANTHROPIC_API_KEY to your .env file to enable it.',
      },
      { status: 503 }
    );
  }

  const { question, history } = await req.json();
  if (!question || !question.trim()) {
    return Response.json({ ok: false, message: 'Please type a question.' }, { status: 400 });
  }

  const messages = [
    ...(Array.isArray(history) ? history.slice(-6) : []),
    { role: 'user', content: question.trim() },
  ];

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { ok: false, message: data?.error?.message || 'The AI Assistant could not answer right now.' },
        { status: 502 }
      );
    }

    const answer = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return Response.json({ ok: true, answer: answer || 'Sorry, I could not generate a response.' });
  } catch (err) {
    return Response.json(
      { ok: false, message: 'The AI Assistant is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
