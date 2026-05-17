import { AppliedCounselingGuidance, ContactChannel } from "../types";
import { requestLlmJson } from "../lib/llmClient";

type LlmGeneration = {
  provider?: string;
  elapsedMs?: number;
  model?: string;
};

export async function classifyIntentAndDraft(
  customerName: string,
  overdueDays: number,
  query: string,
  channel: ContactChannel,
  guidance?: AppliedCounselingGuidance,
  strategy?: {
    behaviorLabel: string;
    responseLabel: string;
  }
) {
  const guidancePrompt = guidance ? `
    적용 내부 매뉴얼:
    ${guidance.manuals.map((manual) => `- ${manual.title}: ${manual.summary} / ${manual.content}`).join('\n')}

    행동/감성 기반 응대 톤:
    - 정책명: ${guidance.tonePolicy.title}
    - 행동 근거: ${guidance.behaviorToneCue}
    - 감성 근거: ${guidance.sentimentToneCue}
    - 감성 점수: ${guidance.sentimentScore}
    - 행동 위험도: ${guidance.behaviorRisk}
    - 응대 톤: ${guidance.tonePolicy.tone}
    - 금지/주의: ${guidance.tonePolicy.guardrail}
    - 화면 행동 전략: ${strategy?.behaviorLabel || '미지정'}
    - 화면 응대 전략: ${strategy?.responseLabel || '미지정'}
  ` : '';

  const prompt = `
    당신은 저축은행 채권관리 부서의 전문 상담 보조 AI입니다.
    고객명: ${customerName}
    연체일수: ${overdueDays}일
    문의내용: ${query}
    희망채널: ${channel}
    ${guidancePrompt}

    다음 규칙을 엄격히 준수하여 상담원이 고객에게 안내할 수 있는 멘트 초안을 작성하세요:
    1. 고객에게 직접 안내하는 자연스러운 상담 멘트로 쓰세요.
    2. 확정적 답변 금지. 단, "담당자 확인", "담당 부서 확인", "연결해 드리겠습니다"처럼 다른 사람에게 넘기는 표현으로 회피하지 마세요.
    3. 고객을 압박하거나 겁주는 표현은 금지합니다.
    4. 계좌번호, 주민번호 등 개인식별정보 직접 언급 금지
    5. 화면 행동 전략과 화면 응대 전략을 우선 적용하되 라벨명은 노출하지 마세요.
    6. 연체 단계에 맞는 안내 방향 적용 (초기: 납부일 확정, 중기: 분할/조정 협의, 후기: 고지 이력/법적 절차 확인)
    7. draft에는 내부 상담 기준, 응대 전략명, 톤 정책명, 매뉴얼명, 점수, 위험도 라벨을 절대 쓰지 마세요.
    8. draft는 고객에게 바로 말할 수 있는 3~5문장으로 작성하세요.
    9. draft는 두 문단으로 나누세요. 첫 문단은 현재 상태 안내, 두 번째 문단은 고객이 해야 할 다음 행동입니다.
    10. 마지막 문장은 고객에게 필요한 다음 행동을 구체적으로 안내하세요.
    11. 상담원이 최종 응대자입니다. 상담원이 직접 확인하고 정리해 주는 말투로 작성하세요.

    출력 형식(JSON):
    {
      "intent": "의도 분류 (예: 납부 문의, 기한상실 문의 등)",
      "draft": "고객 안내 멘트 초안",
      "canSendImmediately": boolean,
      "notice": "상담원 주의사항",
      "nextActions": ["액션1", "액션2"],
      "appliedManuals": ["매뉴얼명1", "매뉴얼명2"],
      "tonePolicy": "적용 톤 정책명"
    }
  `;

  try {
    const generated = await requestLlmJson<any>(prompt, [
      "JSON만 출력하세요.",
      "draft는 상담원이 바로 읽을 수 있게 4문장 이내, 두 문단으로 작성하세요.",
      "첫 문단은 현재 상태 안내, 두 번째 문단은 고객이 해야 할 다음 행동입니다.",
      "화면 행동 전략과 화면 응대 전략을 우선 반영하세요.",
      "법적 조치, 감면, 승인 여부는 확정하지 말고 현재 확인 가능한 범위와 필요한 다음 행동만 안내하세요.",
    ], 'draft');
    return withDraftDefaults(generated.data, guidance, strategy, {
      provider: generated.provider,
      elapsedMs: generated.elapsedMs,
      model: generated.model,
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

function sanitizeCustomerDraft(draft: string) {
  return stripDraftJsonNoise(String(draft || ""))
    .replace(/\n?\s*상담\s?기준\s*:\s*.*$/gim, "")
    .replace(/\n?\s*응대\s?전략\s*:\s*.*$/gim, "")
    .replace(/\n?\s*행동\s?전략\s*:\s*.*$/gim, "")
    .replace(/\n?\s*톤\s?정책\s*:\s*.*$/gim, "")
    .replace(/\n?\s*적용\s?근거\s*:\s*.*$/gim, "")
    .replace(/담당자(?:에게)?\s*연결해\s*드리겠습니다\.?/g, "")
    .replace(/담당자\s*확인\s*후/g, "확인 후")
    .replace(/담당\s*부서\s*확인\s*후/g, "확인 후")
    .replace(/담당자가\s*/g, "")
    .replace(/담당자에게\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripDraftJsonNoise(draft: string) {
  const parsed = parseEmbeddedDraft(draft);
  if (parsed) return parsed;

  return draft
    .replace(/^\s*\{?\s*"intent"\s*:\s*"[^"]*",?\s*/i, "")
    .replace(/^\s*"draft"\s*:\s*"?/i, "")
    .replace(/",?\s*"(canSendImmediately|notice|nextActions|appliedManuals|tonePolicy)"[\s\S]*$/i, "")
    .replace(/^\s*\{/, "")
    .replace(/\}\s*$/, "")
    .trim();
}

function parseEmbeddedDraft(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed?.draft === 'string' ? parsed.draft : null;
  } catch {
    const match = trimmed.match(/"draft"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"(canSendImmediately|notice|nextActions|appliedManuals|tonePolicy)"|"\s*\})/);
    return match?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n').trim() || null;
  }
}

function withDraftDefaults(
  data: any,
  guidance?: AppliedCounselingGuidance,
  strategy?: {
    behaviorLabel: string;
    responseLabel: string;
  },
  generation?: LlmGeneration
) {
  return {
    intent: data.intent || "전략 기반 상담안내",
    draft: sanitizeCustomerDraft(data.draft || ""),
    canSendImmediately: Boolean(data.canSendImmediately),
    notice: data.notice || "확정 표현 없이 현재 확인 가능한 범위와 다음 행동 중심으로 응대하세요.",
    nextActions: Array.isArray(data.nextActions)
      ? data.nextActions.slice(0, 2)
      : [strategy?.behaviorLabel || "상담 결과 기록"],
    appliedManuals: Array.isArray(data.appliedManuals)
      ? data.appliedManuals
      : guidance?.manuals.map((manual) => manual.title) || [],
    tonePolicy: data.tonePolicy || strategy?.responseLabel || guidance?.tonePolicy.title,
    provider: generation?.provider,
    elapsedMs: generation?.elapsedMs ?? 0,
    model: generation?.model,
  };
}

export async function analyzeSentiment(content: string) {
  const prompt = `
    다음 상담 메모를 분석하여 고객의 감성 상태와 협조 가능성을 수치화하세요.
    상담내용: ${content}

    출력 형식(JSON):
    {
      "score": 0-100 (감성 점수),
      "cooperation": 0-100 (협조적 태도),
      "stability": 0-100 (감정 안정도),
      "keywords": ["키워드1", "키워드2"],
      "summary": "감성 요약 문장",
      "strategy": "상담 전략 권고"
    }
  `;

  try {
    const generated = await requestLlmJson(prompt, [
      "JSON만 출력하세요.",
      "상담 메모의 감성 상태를 수치화하세요.",
      "출력 키는 score, cooperation, stability, keywords, summary, strategy만 사용하세요.",
    ], 'sentiment');
    return generated.data;
  } catch (error) {
    console.error("Sentiment Analysis Error:", error);
    return null;
  }
}

export async function generateSuggestedQuestions(
  customerName: string,
  overdueDays: number,
  loanAmount: number,
  riskLevel: string
): Promise<string[]> {
  const prompt = `
    당신은 저축은행 채권관리 부서의 전문 상담 보조 AI입니다.
    현재 상담원이 응대할 고객의 정보는 다음과 같습니다:
    고객명: ${customerName}
    연체일수: ${overdueDays}일
    대출원금: ${loanAmount}원
    위험등급: ${riskLevel}

    이 고객의 연체 상태와 위험 등급을 분석하여, 상담원이 이 고객에게 가장 먼저 확인하거나 물어볼 만한 '예상 질문(빠른 입력 칩)' 4가지를 추천해주세요.
    질문은 상담원 시점이 아니라, 시스템이 상담원을 보조하기 위해 띄워주는 메뉴명(또는 단답형 지시어) 형태여야 합니다. (예: "법적 조치 예고 통보", "상환 기한 연장 안내", "최근 지연 사유 확인")
    최대 20자를 넘지 않도록 간결하게 작성하세요.

    출력 형식(JSON):
    {
      "questions": ["질문1", "질문2", "질문3", "질문4"]
    }
  `;

  try {
    const generated = await requestLlmJson<any>(prompt, [
      "JSON만 출력하세요.",
      "상담원이 누를 예상 질문 버튼 4개만 생성하세요.",
      "고객에게 보낼 멘트가 아니라 상담원이 선택할 짧은 질문/업무 메뉴명입니다.",
      "출력 키는 questions만 사용하세요.",
    ], 'questions');
    const questions = generated?.data?.questions;
    if (Array.isArray(questions)) return questions.slice(0, 4);
  } catch (error) {
    console.error("Generate Suggested Questions Error:", error);
  }

  // Fallback based on simple logic if API fails.
  if (overdueDays > 60) return ["법적 조치 예고", "기한상실 안내", "최후 변제 촉구", "자진 상환 혜택"];
  if (overdueDays > 0) return ["내용증명 고지", "상환 기한 연장", "분할 납부 협의", "지연 사유 확인"];
  return ["정상 납부 감사", "다음 납부일 안내", "추가 한도 상담", "금리 인하 문의"];
}
