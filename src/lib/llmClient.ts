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
    throw new Error(toUserFacingLlmError(error));
  }

  return {
    data: payload.data as T,
    provider: payload.provider,
    model: payload.model,
    elapsedMs: payload.elapsedMs ?? Math.round(performance.now() - startedAt),
  };
}

function toUserFacingLlmError(error: string) {
  if (error.includes('GEMINI_429')) {
    return 'AI 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나 예비 API 키로 교체해야 합니다.';
  }
  if (error.includes('LLM_API_KEY_REQUIRED')) {
    return 'AI API 키가 설정되지 않았습니다. Cloudflare 환경변수 LLM_API_KEY를 확인해야 합니다.';
  }
  if (error.includes('GEMINI_400')) {
    return 'AI 요청 형식에 문제가 있습니다. 입력 내용 또는 모델 설정을 확인해야 합니다.';
  }
  if (error.includes('GEMINI_401') || error.includes('GEMINI_403')) {
    return 'AI API 키 권한 또는 결제 설정을 확인해야 합니다.';
  }
  if (error.includes('GEMINI_5')) {
    return 'AI 제공자 서버가 일시적으로 불안정합니다. 잠시 후 다시 시도하세요.';
  }
  return `AI 호출에 실패했습니다. Cloudflare Worker 로그를 확인해야 합니다. (${compactError(error)})`;
}

function compactError(error: string) {
  return error.replace(/\s+/g, ' ').slice(0, 160);
}
