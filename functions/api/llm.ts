type Env = {
  LLM_API_KEY?: string;
  LLM_MODEL?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
};

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: jsonHeaders,
  });

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const startedAt = Date.now();

  try {
    const body = await request.json() as {
      prompt?: string;
      systemMessages?: string[];
    };

    if (!body.prompt || typeof body.prompt !== 'string') {
      return json({ ok: false, error: 'PROMPT_REQUIRED' }, 400);
    }

    const apiKey = env.LLM_API_KEY;
    if (!apiKey) {
      return json({ ok: false, error: 'LLM_API_KEY_REQUIRED' }, 500);
    }

    const systemMessages = Array.isArray(body.systemMessages) ? body.systemMessages : [];
    const model = env.LLM_MODEL || 'gemini-2.5-flash';
    const data = await callGemini({ apiKey, model, prompt: body.prompt, systemMessages });

    return json({
      ok: true,
      data,
      provider: 'gemini',
      model,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    return json({
      ok: false,
      error: error instanceof Error ? error.message : 'LLM_REQUEST_FAILED',
      elapsedMs: Date.now() - startedAt,
    }, 502);
  }
};

export const onRequestGet = async () =>
  json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);

async function callGemini({
  apiKey,
  model,
  prompt,
  systemMessages,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  systemMessages: string[];
}) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: [systemMessages.join('\n'), prompt].filter(Boolean).join('\n\n') }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GEMINI_${response.status}`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  return parseJsonText(text);
}

function parseJsonText(text: string) {
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}
