export type OverdueStep = 1 | 2 | 3 | 4 | 5;
export type LoanProduct = '햇살론' | '차량담보대출' | '신용대출' | '사잇돌';
export type RecoveryGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export type SoundnessClass = '정상' | '요주의' | '고정' | '회수의문' | '추정손실';
export type CustomerTrait =
  | '개인회생'
  | '신용회복'
  | '파산'
  | '새출발기금'
  | '경매'
  | '민사집행'
  | '채권보전'
  | '집행권원'
  | '형사고소'
  | '민원 위험'
  | '상환의지 있음'
  | '정상 납부';
export type ContactChannel = 'sms' | 'call' | 'dm' | 'email';

export interface Customer {
  id: string;
  name: string;
  gender: '남' | '여';
  birthDate: string;
  phone: string;
  product: LoanProduct;
  recoveryGrade: RecoveryGrade;
  soundnessClass: SoundnessClass;
  traits: CustomerTrait[];
  blockedChannels: ContactChannel[];
  preferredChannels: ContactChannel[];
  interestRate: number;
  loanAmount: number;
  paidAmount: number;
  overdueDays: number;
  maxOverdueDays: number;
  totalOverdueDays: number;
  accelerationDate?: string;
  nextActionDate?: string;
  finalPaymentDate?: string;
  dueDateDay: number;
  contractDate: string;
  riskLevel: 'none' | 'observe' | 'caution' | 'warning' | 'severe' | 'danger';
  step: OverdueStep;
}

export interface PaymentHistory {
  month: string;
  amount: number;
  status: 'normal' | 'overdue' | 'unpaid';
  delayDays: number;
}

export interface ContactHistory {
  id: string;
  date: string;
  type: ContactChannel | 'visit';
  content: string;
  sentimentScore: number;
  author: string;
}

export interface ActionPlan {
  step: OverdueStep;
  title: string;
  period: string;
  action: string;
  status: 'completed' | 'in-progress' | 'pending' | 'warning' | 'danger';
}

export interface CounselingManual {
  id: string;
  title: string;
  category: 'stage' | 'debt-adjustment' | 'compliance' | 'emotion' | 'payment';
  summary: string;
  content: string;
  source: string;
  keywords: string[];
  enabled: boolean;
}

export interface TonePolicy {
  id: string;
  title: string;
  trigger: string;
  tone: string;
  guardrail: string;
  enabled: boolean;
}

export interface AppliedCounselingGuidance {
  manuals: CounselingManual[];
  tonePolicy: TonePolicy;
  behaviorToneCue: string;
  sentimentToneCue: string;
  sentimentScore: number;
  behaviorRisk: 'low' | 'medium' | 'high';
}
