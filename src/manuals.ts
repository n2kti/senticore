import { AppliedCounselingGuidance, ContactHistory, CounselingManual, Customer, PaymentHistory, TonePolicy } from './types';

export const DEFAULT_MANUALS: CounselingManual[] = [
  {
    id: 'early-delinquency',
    title: '초기 연체 안내',
    category: 'stage',
    summary: 'D+30 이내 고객에게 납부 일정 확인과 자발적 상환 계획 수립을 안내합니다.',
    content: '고객의 현재 상황을 먼저 확인하고, 납부 가능일과 가능 금액을 구체적으로 묻는다. 확정적 감면이나 유예 약속은 하지 않고 담당자 확인 후 안내한다.',
    source: '내부 상담 기준 / 개인채무자보호법 취지 참고',
    keywords: ['초기', '연체', '납부일', '일정', '안내'],
    enabled: true,
  },
  {
    id: 'mid-delinquency',
    title: '중기 연체 상담',
    category: 'stage',
    summary: 'D+30~90 고객에게 분할납부 가능성과 내용증명 전 고지를 정중하게 안내합니다.',
    content: '상환 의지가 확인되면 분할납부 협의를 우선 검토한다. 법적 절차 가능성은 사실 중심으로 설명하되, 압박성 표현이나 단정적 표현은 피한다.',
    source: '금융위원회 개인채무자보호법 안내 참고',
    keywords: ['중기', '내용증명', '분할', '협의', '경고'],
    enabled: true,
  },
  {
    id: 'loss-of-benefit',
    title: '장기 연체/기한이익상실 유의',
    category: 'stage',
    summary: 'D+90 이상 고객에게 기한이익상실과 법적 절차 가능성을 절차 중심으로 설명합니다.',
    content: '기한이익상실, 법적 조치, 추심 착수 가능성은 회사 절차와 담당자 확인이 필요한 사안으로 안내한다. 즉시 조치 확정, 위협, 불이익 과장은 금지한다.',
    source: '개인채무자보호법 및 추심착수 예고통지 기준 참고',
    keywords: ['기한이익', '상실', '법적', '조치', '장기'],
    enabled: true,
  },
  {
    id: 'debt-adjustment',
    title: '채무조정 요청 안내',
    category: 'debt-adjustment',
    summary: '채무조정, 상환유예, 신용회복위원회 상담 문의 시 안내할 기준입니다.',
    content: '고객이 상환 곤란을 호소하면 채무조정 요청 가능성과 신용회복위원회 상담 가능성을 안내한다. 승인 가능 여부는 심사 후 결정된다고 설명한다.',
    source: '신용회복위원회 채무조정 안내 / 개인채무자보호법 참고',
    keywords: ['채무조정', '신용회복', '유예', '워크아웃', '상환곤란'],
    enabled: true,
  },
  {
    id: 'payment-negotiation',
    title: '감면/분할납부 문의 응대',
    category: 'payment',
    summary: '감면, 분할납부, 일부 납부 요청을 받을 때 조건부 검토 톤을 유지합니다.',
    content: '감면이나 분할납부는 고객의 상환 가능 금액, 납부 예정일, 내부 승인 기준을 확인한 뒤 검토한다. 즉시 승인처럼 들리는 표현은 사용하지 않는다.',
    source: '내부 채무조정 상담 기준',
    keywords: ['감면', '할인', '분할', '일부', '납부'],
    enabled: true,
  },
  {
    id: 'legal-anxiety',
    title: '법적조치 불안 고객 응대',
    category: 'emotion',
    summary: '법적조치에 불안을 보이는 고객에게 절차와 선택지를 차분하게 설명합니다.',
    content: '고객 불안을 인정하고 현재 단계, 확인 가능한 선택지, 다음 연락 일정을 짧게 정리한다. 공포감을 키우는 표현은 피하고 상담원 확인 항목을 분리한다.',
    source: '민원 예방 상담 기준',
    keywords: ['불안', '압류', '소송', '법원', '무섭'],
    enabled: true,
  },
  {
    id: 'high-emotion',
    title: '고감정/민원 위험 고객 응대',
    category: 'emotion',
    summary: '부정 감정이 높거나 민원 위험이 있는 상담에서 공감과 기록 중심으로 응대합니다.',
    content: '반박보다 경청을 우선하고, 고객 표현을 요약해 확인한다. 책임 단정, 비난, 감정적 표현을 피하고 모든 약속은 확인 후 안내로 제한한다.',
    source: '금융소비자 보호 상담 원칙 참고',
    keywords: ['화남', '민원', '거부', '불만', '항의'],
    enabled: true,
  },
  {
    id: 'collection-compliance',
    title: '추심 준법 체크리스트',
    category: 'compliance',
    summary: '추심 연락 시 과도한 연락, 단정적 법적 표현, 개인정보 노출을 제한합니다.',
    content: '소속과 연락 목적을 명확히 밝히고, 개인정보는 직접 노출하지 않는다. 과도한 연락, 제3자 고지, 위협적 표현, 확정되지 않은 법적 조치 고지는 금지한다.',
    source: '개인채무자보호법 / 금융위원회 추심 제한 안내 참고',
    keywords: ['추심', '준법', '개인정보', '연락', '고지'],
    enabled: true,
  },
];

export const DEFAULT_TONE_POLICIES: TonePolicy[] = [
  {
    id: 'calm-compliance',
    title: '차분한 준법 안내',
    trigger: '기본 상담, 감성 점수 40~70, 중위험 이하',
    tone: '정중하고 간결하게 안내하며, 가능한 선택지를 먼저 제시합니다.',
    guardrail: '확정 승인, 법적조치 단정, 개인정보 직접 언급을 피합니다.',
    enabled: true,
  },
  {
    id: 'empathy-first',
    title: '공감 우선 완충 톤',
    trigger: '감성 점수 40 미만 또는 민원/불안 키워드 감지',
    tone: '고객의 어려움을 먼저 인정하고 짧은 문장으로 다음 확인 절차를 안내합니다.',
    guardrail: '압박성 표현, 책임 추궁, 감정적 반박을 금지합니다.',
    enabled: true,
  },
  {
    id: 'firm-procedure',
    title: '절차 중심 단호 톤',
    trigger: 'D+90 이상, 위험 등급, 반복 미납',
    tone: '감정 표현은 줄이고 현재 단계와 필요한 조치를 절차 중심으로 안내합니다.',
    guardrail: '위협처럼 들리는 표현은 피하고, 담당자 확인 필요 문구를 유지합니다.',
    enabled: true,
  },
  {
    id: 'relationship-care',
    title: '관계 유지 톤',
    trigger: '정상 납부 또는 감성 점수 75 이상',
    tone: '감사와 신뢰를 표현하고 향후 납부 일정 확인을 부드럽게 안내합니다.',
    guardrail: '불필요한 독촉 표현과 법적 절차 언급을 피합니다.',
    enabled: true,
  },
];

export function averageSentiment(history: ContactHistory[]): number {
  if (!history.length) return 50;
  return Math.round(history.reduce((sum, item) => sum + item.sentimentScore, 0) / history.length);
}

export function customerSentimentScore(customer: Customer, history: ContactHistory[]): number {
  if (customer.name === '박재원') return 18;
  if (customer.name === '최미래') return 92;
  return averageSentiment(history);
}

export function behaviorRisk(customer: Customer, paymentHistory: PaymentHistory[]): AppliedCounselingGuidance['behaviorRisk'] {
  const unpaidCount = paymentHistory.filter((item) => item.status === 'unpaid').length;
  if (customer.overdueDays >= 90 || customer.riskLevel === 'danger' || unpaidCount >= 2) return 'high';
  if (customer.overdueDays >= 30 || customer.riskLevel === 'warning' || unpaidCount === 1) return 'medium';
  return 'low';
}

export function selectTonePolicy(
  policies: TonePolicy[],
  customer: Customer,
  sentimentScore: number,
  risk: AppliedCounselingGuidance['behaviorRisk']
): TonePolicy {
  const enabled = policies.filter((policy) => policy.enabled);
  const fallback = enabled[0] || DEFAULT_TONE_POLICIES[0];

  if ((customer.overdueDays >= 90 || risk === 'high') && enabled.find((policy) => policy.id === 'firm-procedure')) {
    return enabled.find((policy) => policy.id === 'firm-procedure')!;
  }
  if (sentimentScore < 40 && enabled.find((policy) => policy.id === 'empathy-first')) {
    return enabled.find((policy) => policy.id === 'empathy-first')!;
  }
  if ((customer.overdueDays === 0 || sentimentScore >= 75) && enabled.find((policy) => policy.id === 'relationship-care')) {
    return enabled.find((policy) => policy.id === 'relationship-care')!;
  }
  return fallback;
}

export function behaviorToneCue(customer: Customer, risk: AppliedCounselingGuidance['behaviorRisk']): string {
  if (risk === 'high') return `행동 분석: D+${customer.overdueDays} 및 고위험 계좌라 절차 중심의 단호한 톤이 필요합니다.`;
  if (risk === 'medium') return `행동 분석: 연체/미납 흐름이 있어 상환 일정 확인 톤이 필요합니다.`;
  return '행동 분석: 납부 흐름이 안정적이므로 관계 유지 톤을 유지할 수 있습니다.';
}

export function sentimentToneCue(score: number): string {
  if (score < 40) return `감성 분석: 감성 점수 ${score}점으로 불만/거부감이 높아 공감 완충 표현이 필요합니다.`;
  if (score < 61) return `감성 분석: 감성 점수 ${score}점으로 관찰 구간이라 중립적이고 짧은 안내가 필요합니다.`;
  return `감성 분석: 감성 점수 ${score}점으로 협조적이어서 정중하고 부드러운 표현이 적합합니다.`;
}

export function selectManuals(manuals: CounselingManual[], customer: Customer, query: string, sentimentScore: number): CounselingManual[] {
  const enabled = manuals.filter((manual) => manual.enabled);
  const compactQuery = query.replace(/\s/g, '').toLowerCase();
  const scored = enabled.map((manual) => {
    let score = 0;
    if (manual.category === 'compliance') score += 4;
    if (customer.overdueDays < 30 && manual.id === 'early-delinquency') score += 5;
    if (customer.overdueDays >= 30 && customer.overdueDays < 90 && manual.id === 'mid-delinquency') score += 5;
    if (customer.overdueDays >= 90 && manual.id === 'loss-of-benefit') score += 6;
    if (sentimentScore < 40 && manual.id === 'high-emotion') score += 5;
    if (customer.riskLevel === 'danger' && manual.id === 'legal-anxiety') score += 2;
    for (const keyword of manual.keywords) {
      if (compactQuery.includes(keyword.replace(/\s/g, '').toLowerCase())) score += 4;
    }
    return { manual, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, 3)
    .map((item) => item.manual);
}

export function buildGuidance(
  manuals: CounselingManual[],
  policies: TonePolicy[],
  customer: Customer,
  paymentHistory: PaymentHistory[],
  contactHistory: ContactHistory[],
  query = ''
): AppliedCounselingGuidance {
  const sentimentScore = customerSentimentScore(customer, contactHistory);
  const risk = behaviorRisk(customer, paymentHistory);
  return {
    manuals: selectManuals(manuals, customer, query, sentimentScore),
    tonePolicy: selectTonePolicy(policies, customer, sentimentScore, risk),
    behaviorToneCue: behaviorToneCue(customer, risk),
    sentimentToneCue: sentimentToneCue(sentimentScore),
    sentimentScore,
    behaviorRisk: risk,
  };
}
