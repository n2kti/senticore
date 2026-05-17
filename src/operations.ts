import { ActionPlan, AppliedCounselingGuidance, ContactHistory, Customer, PaymentHistory } from './types';

export type WorkPriorityLevel = 'critical' | 'attention' | 'routine';

export interface CustomerWorkSummary {
  customerId: string;
  priorityLevel: WorkPriorityLevel;
  priorityLabel: string;
  priorityTone: string;
  productFinding: string;
  productDecision: string;
  accountActions: string[];
  behaviorFinding: string;
  behaviorDecision: string;
  sentimentFinding: string;
  sentimentDecision: string;
  toneFinding: string;
  toneDecision: string;
  toneTitle: string;
  toneInstruction: string;
  toneGuardrail: string;
  aiStrategy: string;
  reasons: string[];
  nextActionTitle: string;
  nextActionDetail: string;
  recommendedChannel: string;
  contactCadence: string;
  complianceWarnings: string[];
  personalMemo: string;
}

export interface ActionChecklistItem {
  id: string;
  label: string;
  detail: string;
  required: boolean;
}

export function buildCustomerWorkSummary(
  customer: Customer,
  paymentHistory: PaymentHistory[],
  contactHistory: ContactHistory[],
  guidance: AppliedCounselingGuidance
): CustomerWorkSummary {
  const unpaidCount = customer.overdueDays > 0
    ? paymentHistory.filter((item) => item.status === 'unpaid').length
    : 0;
  const latestContact = contactHistory[0];
  const latestContactLabel = latestContact
    ? `최근 ${channelLabel(latestContact.type)} 이력: ${new Date(latestContact.date).toLocaleDateString('ko-KR')}`
    : '최근 접촉 이력 없음';

  const isCritical = customer.overdueDays >= 90 || customer.riskLevel === 'danger' || guidance.sentimentScore < 25;
  const needsAttention = customer.overdueDays >= 30 || guidance.sentimentScore < 61 || unpaidCount > 0;
  const priorityLevel: WorkPriorityLevel = isCritical ? 'critical' : needsAttention ? 'attention' : 'routine';
  const productFinding = [
    `회수 ${customer.recoveryGrade}`,
    customer.soundnessClass,
    customer.product,
    traitGroupLabel(customer.traits),
  ].filter(Boolean).join(' · ');
  const productDecision = accountStrategyLabel(customer);
  const accountActions = accountActionLabels(customer.traits, priorityLevel);
  const normalCount = customer.overdueDays > 0 ? paymentHistory.filter((item) => item.status === 'normal').length : paymentHistory.length;
  const consistency = Math.round((normalCount / paymentHistory.length) * 100);
  const behaviorFinding = `D+${customer.overdueDays} · 미납 ${unpaidCount} · 일관성 ${consistency}%`;
  const sentimentFinding = `감성 ${guidance.sentimentScore} · ${guidance.sentimentScore < 40 ? '거부 높음' : guidance.sentimentScore < 61 ? '관찰' : '협조'}`;

  const personalMemo = customerMemo(customer);
  const summaryByPriority: Record<WorkPriorityLevel, Omit<CustomerWorkSummary, 'customerId' | 'reasons' | 'complianceWarnings'>> = {
    critical: {
      priorityLevel,
      priorityLabel: '오늘 최우선',
      priorityTone: '절차 확인',
      productFinding,
      productDecision,
      accountActions,
      behaviorFinding,
      behaviorDecision: '고지 이력 확인',
      sentimentFinding,
      sentimentDecision: '절차중심 · 압박금지',
      toneFinding: '절차 중심 · 단호하게',
      toneDecision: '압박/확정 금지',
      toneTitle: guidance.tonePolicy.title,
      toneInstruction: guidance.tonePolicy.tone,
      toneGuardrail: guidance.tonePolicy.guardrail,
      aiStrategy: '상담 거부가 강하면 반복 독촉보다 법적 절차 검토와 담당자 확인을 우선합니다.',
      nextActionTitle: '법적 절차 전 최종 확인',
      nextActionDetail: '기한이익상실, 법적조치, 추심 착수 가능 여부를 담당자 승인 기준으로 재확인합니다.',
      recommendedChannel: '관리자 검토 후 연락',
      contactCadence: '반복 연락 전 고지 이력 확인',
      personalMemo,
    },
    attention: {
      priorityLevel,
      priorityLabel: '상담 필요',
      priorityTone: '상환 일정 확인',
      productFinding,
      productDecision,
      accountActions,
      behaviorFinding,
      behaviorDecision: '납부일 확약',
      sentimentFinding,
      sentimentDecision: guidance.sentimentScore < 40
        ? '공감우선 · 확답보류'
        : '중립 · 금액확인',
      toneFinding: guidance.sentimentScore < 40 ? '공감 먼저 · 짧게' : '중립 · 구체적으로',
      toneDecision: '확답 보류',
      toneTitle: guidance.tonePolicy.title,
      toneInstruction: guidance.tonePolicy.tone,
      toneGuardrail: guidance.tonePolicy.guardrail,
      aiStrategy: '납부 가능 금액과 일정을 구체화하고, 승인 여부는 내부 검토로 남깁니다.',
      nextActionTitle: '분할납부/납부일 협의',
      nextActionDetail: '상환 가능 금액, 납부 예정일, 지연 사유를 확인하고 확정 답변은 보류합니다.',
      recommendedChannel: guidance.sentimentScore < 40 ? '문자 후 유선 확인' : '유선 상담',
      contactCadence: '당일 1회 상담 · 다음 접촉 예약',
      personalMemo,
    },
    routine: {
      priorityLevel,
      priorityLabel: '관계 유지',
      priorityTone: '감사 안내',
      productFinding,
      productDecision,
      accountActions,
      behaviorFinding,
      behaviorDecision: '리마인드 유지',
      sentimentFinding,
      sentimentDecision: '감사 · 짧게',
      toneFinding: '감사 · 신뢰 유지',
      toneDecision: '짧은 안내',
      toneTitle: guidance.tonePolicy.title,
      toneInstruction: guidance.tonePolicy.tone,
      toneGuardrail: guidance.tonePolicy.guardrail,
      aiStrategy: '감사 안내와 다음 납부일 리마인드 중심으로 관계를 유지합니다.',
      nextActionTitle: '정상 납부 고객 케어',
      nextActionDetail: '관계 유지 목적의 감사 안내와 다음 납부일 리마인드를 짧게 전달합니다.',
      recommendedChannel: '감사 문자',
      contactCadence: '약정일 전 리마인드',
      personalMemo,
    },
  };

  const reasons = [
    `연체 D+${customer.overdueDays}`,
    `감성 ${guidance.sentimentScore}점`,
    `미납 ${unpaidCount}건`,
    latestContactLabel,
  ];

  const complianceWarnings = [
    '확정 승인, 감면 확약, 법적조치 단정 표현 금지',
    '계좌번호·주민번호 등 개인식별정보 직접 노출 금지',
  ];

  if (priorityLevel === 'critical' || guidance.sentimentScore < 40) {
    complianceWarnings.push('압박성 표현보다 절차와 선택지를 짧게 분리해 안내');
  }

  return {
    ...summaryByPriority[priorityLevel],
    customerId: customer.id,
    reasons,
    complianceWarnings,
  };
}

export function buildActionChecklist(
  customer: Customer,
  plans: ActionPlan[],
  guidance: AppliedCounselingGuidance
): ActionChecklistItem[] {
  const currentPlan = plans.find((plan) => plan.step === customer.step);
  const baseItems: ActionChecklistItem[] = [
    {
      id: 'confirm-profile',
      label: '고객/계약 정보 재확인',
      detail: '상담 전 고객, 약정일, 현재 단계가 같은 건인지 확인합니다.',
      required: true,
    },
    {
      id: 'save-note',
      label: '상담 기록 저장',
      detail: '고객 반응, 납부 가능일, 다음 연락 일정을 이력에 남깁니다.',
      required: true,
    },
  ];

  if (customer.overdueDays >= 90 || customer.riskLevel === 'danger') {
    return [
      {
        id: 'last-notice',
        label: '기한이익상실 고지 이력 확인',
        detail: '최종 고지일, 발송 채널, 회신 여부를 확인한 뒤 후속 절차를 판단합니다.',
        required: true,
      },
      {
        id: 'manager-approval',
        label: '법적 절차 담당자 승인',
        detail: '즉시 조치처럼 말하지 않고 담당자 확인 후 안내 문구를 유지합니다.',
        required: true,
      },
      ...baseItems,
    ];
  }

  if (guidance.behaviorRisk === 'medium') {
    return [
      {
        id: 'payment-date',
        label: '납부 가능일 확인',
        detail: '가능 일자와 가능 금액을 구체적으로 받고 확정 여부는 내부 검토로 남깁니다.',
        required: true,
      },
      {
        id: 'installment-option',
        label: '분할납부 선택지 안내',
        detail: currentPlan?.action || '현재 단계에 맞는 상환 협의안을 안내합니다.',
        required: false,
      },
      ...baseItems,
    ];
  }

  return [
    {
      id: 'thank-you',
      label: '감사 및 다음 납부일 안내',
      detail: '정상 납부 흐름을 유지하도록 다음 약정일과 자동이체 상태를 확인합니다.',
      required: false,
    },
    ...baseItems,
  ];
}

function channelLabel(type: ContactHistory['type']) {
  if (type === 'call') return '전화';
  if (type === 'sms') return '문자';
  if (type === 'dm') return 'DM';
  if (type === 'email') return '이메일';
  return '방문';
}

function accountStrategyLabel(customer: Customer) {
  if (customer.product === '차량담보대출' && hasLegalTrait(customer.traits)) return '담보·송무 병행';
  if (customer.soundnessClass === '회수의문' || customer.soundnessClass === '추정손실') return '조정 가능성 검토';
  if (customer.recoveryGrade >= 'D') return '고지·승인선 확인';
  if (customer.product === '햇살론') return '보증기관 기준 확인';
  if (customer.product === '사잇돌') return '보증·분할 협의';
  if (customer.traits.includes('상환의지 있음')) return '상환계획 확보';
  return '상환능력 확인';
}

function accountActionLabels(traits: Customer['traits'], priorityLevel: WorkPriorityLevel) {
  const actions: string[] = [];
  if (traits.some((trait) => ['개인회생', '신용회복', '파산', '새출발기금'].includes(trait))) {
    actions.push('채무조정 접수 상태 확인');
  }
  if (hasLegalTrait(traits)) {
    actions.push('송무/집행 절차 확인');
  }
  if (priorityLevel === 'critical') {
    actions.push('기한이익상실 고지 이력 확인', '법적 절차 담당자 승인');
  } else if (priorityLevel === 'attention') {
    actions.push('분할납부 가능성 확인', '납부 예정일 확보');
  } else {
    actions.push('다음 납부일 안내', '관계 유지');
  }
  return actions.slice(0, 4);
}

function hasLegalTrait(traits: Customer['traits']) {
  return traits.some((trait) => ['경매', '민사집행', '채권보전', '집행권원', '형사고소'].includes(trait));
}

function customerMemo(customer: Customer) {
  if (customer.id === '1') return '전화 거부 이력 강함. 문자로 고지 후 담당자 확인 문구 유지.';
  if (customer.id === '2') return '자동이체 유지 고객. 감사 안내와 다음 약정일 리마인드만 짧게.';
  if (customer.id === '3') return '상환 의지는 있으나 일정이 흔들림. 가능 금액보다 납부일 확약 우선.';
  if (customer.id === '4') return '급여일 이후 일부 납부 가능. 계좌 변경 이슈를 먼저 확인.';
  if (customer.id === '5') return '유선 부담 표현. 새출발기금 진행 여부를 서면 기준으로 확인.';
  return '최근 접촉 반응을 먼저 확인하고 다음 액션을 짧게 정리.';
}

function traitGroupLabel(traits: Customer['traits']) {
  const groups: string[] = [];
  if (traits.some((trait) => ['개인회생', '신용회복', '파산', '새출발기금'].includes(trait))) groups.push('사고');
  if (traits.some((trait) => ['경매', '민사집행', '채권보전', '집행권원', '형사고소'].includes(trait))) groups.push('송무');
  if (traits.includes('민원 위험')) groups.push('민원');
  if (traits.includes('상환의지 있음')) groups.push('상환의지');
  return groups.join('/');
}
