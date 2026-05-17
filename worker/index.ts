type AssetFetcher = {
  fetch(request: Request): Promise<Response>;
};

type Env = {
  ASSETS: AssetFetcher;
  LLM_API_KEY?: string;
  LLM_FALLBACK_API_KEY?: string;
  LLM_MODEL?: string;
};

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/llm') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: jsonHeaders });
      }
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
      }
      return handleLlm(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleLlm(request: Request, env: Env) {
  const startedAt = Date.now();

  try {
    const body = await request.json() as {
      prompt?: string;
      systemMessages?: string[];
      responseType?: 'draft' | 'questions' | 'sentiment';
    };

    if (!body.prompt || typeof body.prompt !== 'string') {
      return json({ ok: false, error: 'PROMPT_REQUIRED' }, 400);
    }

    const apiKeys = [env.LLM_API_KEY, env.LLM_FALLBACK_API_KEY].filter((key): key is string => Boolean(key));
    if (!apiKeys.length) {
      return json({ ok: false, error: 'LLM_API_KEY_REQUIRED' }, 500);
    }

    const model = env.LLM_MODEL || 'gemini-2.5-flash';
    const systemMessages = Array.isArray(body.systemMessages) ? body.systemMessages : [];
    const result = await callGeminiWithFallback({
      apiKeys,
      model,
      prompt: body.prompt,
      systemMessages,
      responseType: body.responseType,
    });

    return json({
      ok: true,
      data: result.data,
      provider: 'gemini',
      model,
      keyIndex: result.keyIndex,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    return json({
      ok: false,
      error: error instanceof Error ? error.message : 'LLM_REQUEST_FAILED',
      elapsedMs: Date.now() - startedAt,
    }, 502);
  }
}

async function callGeminiWithFallback({
  apiKeys,
  model,
  prompt,
  systemMessages,
  responseType,
}: {
  apiKeys: string[];
  model: string;
  prompt: string;
  systemMessages: string[];
  responseType?: 'draft' | 'questions' | 'sentiment';
}) {
  let lastError: Error | null = null;

  for (let index = 0; index < apiKeys.length; index += 1) {
    try {
      const data = await callGemini({ apiKey: apiKeys[index], model, prompt, systemMessages, responseType });
      return { data, keyIndex: index + 1 };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('LLM_REQUEST_FAILED');
      if (!isQuotaOrRateLimitError(lastError)) throw lastError;
    }
  }

  throw lastError || new Error('LLM_REQUEST_FAILED');
}

async function callGemini({
  apiKey,
  model,
  prompt,
  systemMessages,
  responseType,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  systemMessages: string[];
  responseType?: 'draft' | 'questions' | 'sentiment';
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
        responseSchema: responseSchemaFor(responseType),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`GEMINI_${response.status}${errorText ? `_${errorText.slice(0, 180)}` : ''}`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  return parseJsonText(text, responseType);
}

function parseJsonText(text: string, responseType?: 'draft' | 'questions' | 'sentiment') {
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const escaped = escapeRawNewlinesInsideStrings(cleaned);
    try {
      return JSON.parse(escaped);
    } catch {
      // Continue with type-specific recovery below.
    }

    const recovered = recoverTypedResponse(cleaned, responseType);
    if (recovered) return recovered;

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // Fall through to a compact operational error.
      }
    }
    throw new Error(`LLM_JSON_PARSE_${error instanceof Error ? error.message : 'INVALID_JSON'}`);
  }
}

function escapeRawNewlinesInsideStrings(text: string) {
  let output = '';
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      output += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      output += char;
      continue;
    }

    if (inString && char === '\n') {
      output += '\\n';
      continue;
    }

    if (inString && char === '\r') {
      continue;
    }

    output += char;
  }

  return output;
}

function recoverTypedResponse(text: string, responseType?: 'draft' | 'questions' | 'sentiment') {
  if (responseType === 'draft') {
    const draft = extractStringField(text, 'draft') || text;
    return {
      intent: extractStringField(text, 'intent') || '상담 안내',
      draft: stripJsonNoise(draft),
      canSendImmediately: false,
      notice: extractStringField(text, 'notice') || 'AI 응답 형식 일부가 보정되었습니다. 문구 확인 후 사용하세요.',
      nextActions: extractStringArrayField(text, 'nextActions').slice(0, 2),
      appliedManuals: extractStringArrayField(text, 'appliedManuals'),
      tonePolicy: extractStringField(text, 'tonePolicy') || '상담 보조',
    };
  }

  if (responseType === 'questions') {
    const questions = extractStringArrayField(text, 'questions');
    if (questions.length) return { questions: questions.slice(0, 4) };
  }

  return null;
}

function extractStringField(text: string, field: string) {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)(?:"\\s*,\\s*"\\w+"|"}\\s*$|"$)`));
  return match?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
}

function extractStringArrayField(text: string, field: string) {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g)).map((item) => item[1].trim()).filter(Boolean);
}

function stripJsonNoise(text: string) {
  return text
    .replace(/^\{?\s*"draft"\s*:\s*"?/, '')
    .replace(/",?\s*"(canSendImmediately|notice|nextActions|appliedManuals|tonePolicy)"[\s\S]*$/m, '')
    .trim();
}

function responseSchemaFor(responseType?: 'draft' | 'questions' | 'sentiment') {
  if (responseType === 'questions') {
    return {
      type: 'OBJECT',
      properties: {
        questions: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
      required: ['questions'],
    };
  }

  if (responseType === 'sentiment') {
    return {
      type: 'OBJECT',
      properties: {
        score: { type: 'NUMBER' },
        cooperation: { type: 'NUMBER' },
        stability: { type: 'NUMBER' },
        keywords: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        summary: { type: 'STRING' },
        strategy: { type: 'STRING' },
      },
      required: ['score', 'cooperation', 'stability', 'keywords', 'summary', 'strategy'],
    };
  }

  return {
    type: 'OBJECT',
    properties: {
      intent: { type: 'STRING' },
      draft: { type: 'STRING' },
      canSendImmediately: { type: 'BOOLEAN' },
      notice: { type: 'STRING' },
      nextActions: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      appliedManuals: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      tonePolicy: { type: 'STRING' },
    },
    required: ['intent', 'draft', 'canSendImmediately', 'notice', 'nextActions', 'appliedManuals', 'tonePolicy'],
  };
}

function isQuotaOrRateLimitError(error: Error) {
  return error.message.includes('GEMINI_429');
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}
