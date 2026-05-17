export type LlmClientResult<T = unknown> = {
  data: T;
  provider?: string;
  model?: string;
  elapsedMs?: number;
};

export async function requestLlmJson<T = unknown>(
  prompt: string,
  systemMessages: string[]
): Promise<LlmClientResult<T>> {
  const startedAt = performance.now();
  const response = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemMessages }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const error = payload?.error || 'LLM_REQUEST_FAILED';
    throw new Error(error);
  }

  return {
    data: payload.data as T,
    provider: payload.provider,
    model: payload.model,
    elapsedMs: payload.elapsedMs ?? Math.round(performance.now() - startedAt),
  };
}
