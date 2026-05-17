import React, { useState } from 'react';
import BehaviorAnalysis from './components/BehaviorAnalysis';
import SentimentAnalysis from './components/SentimentAnalysis';
import ActionPlanPanel from './components/ActionPlan';
import AICounseling from './components/AICounseling';
import HistoryTimeline from './components/HistoryTimeline';
import AdminPanel from './components/AdminPanel';
import WorkQueueSummary from './components/WorkQueueSummary';
import { MOCK_CUSTOMERS, MOCK_PAYMENT_HISTORY, MOCK_PAYMENT_HISTORY_BY_CUSTOMER, MOCK_CONTACT_HISTORY_BY_CUSTOMER, ACTION_PLANS } from './constants';
import { buildGuidance, DEFAULT_MANUALS, DEFAULT_TONE_POLICIES } from './manuals';
import { buildCustomerWorkSummary } from './operations';
import { cn, formatCurrency } from './lib/utils';
import { Customer } from './types';
import { GripVertical } from 'lucide-react';

export default function App() {
  const [selectedId, setSelectedId] = useState(MOCK_CUSTOMERS[0].id);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [manuals, setManuals] = useState(DEFAULT_MANUALS);
  const [tonePolicies, setTonePolicies] = useState(DEFAULT_TONE_POLICIES);
  const customer = MOCK_CUSTOMERS.find(c => c.id === selectedId) || MOCK_CUSTOMERS[0];
  const contactHistory = MOCK_CONTACT_HISTORY_BY_CUSTOMER[customer.id] || [];
  const paymentHistory = MOCK_PAYMENT_HISTORY_BY_CUSTOMER[customer.id] || MOCK_PAYMENT_HISTORY;
  const dashboardGuidance = buildGuidance(manuals, tonePolicies, customer, paymentHistory, contactHistory);
  const workSummary = buildCustomerWorkSummary(customer, paymentHistory, contactHistory, dashboardGuidance);
  const unpaidAmount = Math.max(customer.loanAmount - customer.paidAmount, 0);
  
  const currentIndex = MOCK_CUSTOMERS.findIndex(c => c.id === selectedId);

  const resetAdminDefaults = () => {
    setManuals(DEFAULT_MANUALS.map((manual) => ({ ...manual })));
    setTonePolicies(DEFAULT_TONE_POLICIES.map((policy) => ({ ...policy })));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-[420px] bg-white flex flex-col h-full shrink-0 border-r border-slate-200">
        <HistoryTimeline
          history={contactHistory}
          customer={customer}
          isNotificationOpen={isNotificationOpen}
          onToggleNotification={() => setIsNotificationOpen((open) => !open)}
          onOpenAdmin={() => {
            setIsNotificationOpen(false);
            setIsAdminOpen(true);
          }}
        />
      </aside>

      <main className={cn(
        "flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-in-out",
        isScriptExpanded
          ? "w-0 basis-0 grow-0 opacity-0 border-r-0"
          : "flex-1 opacity-100 border-r border-slate-200"
      )}>
        <header className="h-[58px] border-b border-slate-200 bg-white px-4 shrink-0 flex items-center">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-[106px] rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm flex items-center overflow-hidden shrink-0">
              <button
                onClick={() => {
                  if (currentIndex > 0) setSelectedId(MOCK_CUSTOMERS[currentIndex - 1].id);
                }}
                disabled={currentIndex === 0}
                className="h-full w-8 text-lg font-black hover:bg-slate-50 disabled:opacity-30"
                title="이전 고객"
              >
                ‹
              </button>
              <span className="flex-1 text-center text-sm font-black leading-none tabular-nums whitespace-nowrap border-x border-slate-100">
                {currentIndex + 1} / {MOCK_CUSTOMERS.length}
              </span>
              <button
                onClick={() => {
                  if (currentIndex < MOCK_CUSTOMERS.length - 1) setSelectedId(MOCK_CUSTOMERS[currentIndex + 1].id);
                }}
                disabled={currentIndex === MOCK_CUSTOMERS.length - 1}
                className="h-full w-8 text-lg font-black hover:bg-slate-50 disabled:opacity-30"
                title="다음 고객"
              >
                ›
              </button>
            </div>

            <label className="min-w-[240px] max-w-[360px] flex-1">
              <span className="sr-only">고객 선택</span>
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-black text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                title="고객 전환"
              >
                {MOCK_CUSTOMERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}({compactBirthDate(item.birthDate)}) / {accountNumberFor(item.id)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <div className={cn(
                "h-9 w-[76px] rounded-xl border px-2 shadow-sm shrink-0 flex items-center justify-center",
                customer.gender === '남'
                  ? 'border-blue-100 bg-blue-50 text-blue-700'
                  : 'border-rose-100 bg-rose-50 text-rose-700'
              )}>
                <span className="text-sm font-black leading-none tabular-nums whitespace-nowrap">
                  {ageFromBirthDate(customer.birthDate)}세({customer.gender})
                </span>
              </div>
              {[
                { text: accountStatusLabel(customer), tone: accountStatusTone(customer), width: 'w-[70px]' },
                { text: `미납 ${formatCompactWon(unpaidAmount)}`, tone: 'text-red-700', width: 'w-[100px]' },
                { text: `현재 D+${customer.overdueDays}`, tone: 'text-red-700', width: 'w-[82px]' },
                { text: `최장 D+${customer.maxOverdueDays}`, tone: 'text-orange-700', width: 'w-[82px]' },
                { text: `누적 ${customer.totalOverdueDays}일`, tone: 'text-slate-900', width: 'w-[82px]' },
                { text: `연 ${customer.interestRate.toFixed(1)}%`, tone: 'text-slate-900', width: 'w-[72px]' },
              ].map((item) => (
                <div key={item.text} className={cn("h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 shadow-sm shrink-0 flex items-center justify-center", item.width)}>
                  <span className={cn("text-xs font-black leading-none tabular-nums whitespace-nowrap", item.tone)}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4">
          <div className="max-w-[1200px] mx-auto h-full flex flex-col gap-4 min-h-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
              <ActionPlanPanel plans={ACTION_PLANS} currentStep={customer.step} customer={customer} contactHistory={contactHistory} />
              <div className="min-w-0 flex flex-col">
                <BehaviorAnalysis 
                  history={paymentHistory} 
                  overdueStep={customer.step} 
                  customer={customer}
                  contactHistory={contactHistory}
                />
              </div>
              <div className="min-w-0 flex flex-col">
                <SentimentAnalysis 
                  history={contactHistory} 
                  customer={customer}
                  guidance={dashboardGuidance}
                />
              </div>
            </div>
            <WorkQueueSummary summary={workSummary} />
          </div>
        </div>
      </main>

      <PanelDivider
        label={isScriptExpanded ? '펼치기' : '접기'}
        onClick={() => setIsScriptExpanded((expanded) => !expanded)}
      />

      <aside className={cn(
        "bg-white flex flex-col h-full shrink-0 transition-all duration-500 ease-in-out",
        isScriptExpanded ? "flex-1 min-w-0" : "w-[420px]"
      )}>
        <AICounseling
          customer={customer}
          manuals={manuals}
          tonePolicies={tonePolicies}
          paymentHistory={paymentHistory}
          contactHistory={contactHistory}
          behaviorLabel={workSummary.behaviorDecision}
          responseLabel={workSummary.sentimentDecision}
        />
      </aside>

      {isAdminOpen && (
        <AdminPanel
          manuals={manuals}
          tonePolicies={tonePolicies}
          onManualChange={setManuals}
          onTonePolicyChange={setTonePolicies}
          onReset={resetAdminDefaults}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}

function PanelDivider({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="relative z-30 w-4 shrink-0 border-x border-slate-200 bg-slate-100/80">
      <button
        type="button"
        onClick={onClick}
        className="absolute left-1/2 top-[74px] flex h-[88px] w-7 -translate-x-1/2 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-brand-200 hover:text-brand-700"
        title={label}
      >
        <GripVertical className="h-4 w-4 shrink-0" />
        <span className="text-[10px] font-black leading-none" style={{ writingMode: 'vertical-rl' }}>{label}</span>
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

function accountNumberFor(customerId: string) {
  return `1002-832-${12000 + Number(customerId)}`;
}

function compactBirthDate(birthDate: string) {
  return birthDate.replace(/-/g, '').slice(2);
}

function ageFromBirthDate(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasBirthdayPassed) age -= 1;
  return age;
}

function formatCompactWon(value: number) {
  if (value >= 10000) return `${Math.round(value / 10000).toLocaleString('ko-KR')}만`;
  return formatCurrency(value);
}

function accountStatusLabel(customer: Customer) {
  if (customer.soundnessClass === '추정손실' || customer.recoveryGrade === 'E') return '상각';
  if (customer.overdueDays > 0) return '연체';
  return '정상';
}

function accountStatusTone(customer: Customer) {
  const label = accountStatusLabel(customer);
  if (label === '상각') return 'text-slate-700';
  if (label === '연체') return 'text-red-700';
  return 'text-emerald-700';
}
