import React, { useState } from 'react';
import { ActionPlan, ContactHistory, Customer } from '../types';
import { cn } from '../lib/utils';
import { CheckCircle2, Clock, FileText, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActionPlanPanelProps {
  plans: ActionPlan[];
  currentStep: number;
  customer: Customer;
  contactHistory: ContactHistory[];
}

export default function ActionPlanPanel({ plans, currentStep, customer, contactHistory }: ActionPlanPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentPlan = plans.find(p => p.step === currentStep);
  const actionChecks = buildActionChecks(customer);
  const stageDetails = buildStageDetails(plans, currentStep, customer, contactHistory);

  return (
    <>
    <div className="glass-panel p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-500" />
          타임 라인
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wider">
            {currentStep}단계
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
        <div className="relative min-h-0 flex items-center justify-between px-2 overflow-hidden">
          {/* Background Line */}
          <div className="absolute left-6 right-6 h-0.5 bg-slate-100 top-1/2 -translate-y-1/2" />
          
          {/* Progress Line */}
          <div 
            className="absolute left-6 h-0.5 bg-brand-500 top-1/2 -translate-y-1/2 transition-all duration-1000" 
            style={{ width: `calc(${(currentStep - 1) / (plans.length - 1) * 100}% - 12px)` }}
          />

          {plans.map((plan) => {
            const isCurrent = plan.step === currentStep;
            const isPast = plan.step < currentStep;
            
            return (
              <div key={plan.step} className="relative flex flex-col items-center group">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 z-10 border-4 border-white",
                  isPast ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100" :
                  isCurrent ? "bg-brand-600 text-white shadow-lg shadow-brand-200 scale-125" :
                  "bg-slate-100 text-slate-400"
                )}>
                  {isPast ? <CheckCircle2 className="w-5 h-5" /> : plan.step}
                </div>
                
                <div className={cn(
                  "absolute -bottom-9 w-20 text-center transition-all duration-300",
                  isCurrent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                )}>
                  <p className={cn(
                    "text-[10px] font-black leading-tight",
                    isCurrent ? "text-brand-700" : "text-slate-500"
                  )}>
                    {plan.title}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold">{plan.period}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="min-h-0 flex flex-col gap-2">
          <div className="flex-1 min-h-0 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative overflow-hidden group hover:border-brand-200 transition-all">
            <div className="relative z-10">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                <p className="text-[11px] font-bold text-slate-500 uppercase">현재 단계 액션</p>
              </div>
              <p className="mt-2 text-sm text-slate-900 font-black leading-snug line-clamp-2">{currentPlan?.action}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 shrink-0">
            {actionDates(customer).map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-lg border px-2 py-1.5",
                  item.danger ? "border-red-100 bg-red-50" : "border-slate-200 bg-white"
                )}
              >
                <p className={cn("text-[10px] font-black leading-none", item.danger ? "text-red-500" : "text-slate-400")}>{item.label}</p>
                <p className={cn("mt-0.5 text-[11px] font-black tabular-nums", item.danger ? "text-red-700" : "text-slate-900")}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-3 w-full h-9 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black rounded-xl flex items-center justify-center gap-1 transition-all border border-slate-200 whitespace-nowrap shadow-sm shrink-0"
      >
        타임 라인 상세보기 <ChevronRight className="w-4 h-4" />
      </button>
    </div>

    <AnimatePresence>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(event) => event.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-3xl h-[620px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">타임 라인 상세보기</h2>
                <p className="text-sm font-bold text-slate-500">현재 Step {currentStep} · {currentPlan?.title}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 flex-1 overflow-hidden">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: '회수등급', value: customer.recoveryGrade, tone: customer.recoveryGrade >= 'D' ? 'text-red-600' : 'text-brand-600' },
                  { label: '건전성', value: customer.soundnessClass, tone: 'text-slate-900' },
                  { label: '상품', value: customer.product, tone: 'text-slate-900' },
                  { label: '현재 단계', value: `Step ${currentStep}`, tone: 'text-brand-600' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className={cn("mt-1 text-base font-black truncate", item.tone)}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <p className="text-xs font-black text-brand-700 uppercase tracking-widest">현재 실행 라인</p>
                <p className="mt-1 text-lg font-black text-slate-900">{currentPlan?.action}</p>
                <p className="mt-1 text-sm font-bold text-slate-600">{currentPlan?.title} · {currentPlan?.period}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {actionDates(customer).map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        item.danger ? "border-red-100 bg-red-50" : "border-brand-100 bg-white"
                      )}
                    >
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", item.danger ? "text-red-500" : "text-slate-400")}>{item.label}</p>
                      <p className={cn("mt-0.5 text-sm font-black tabular-nums", item.danger ? "text-red-700" : "text-slate-900")}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <details className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-black text-slate-900">단계별 처리 이력 펼쳐보기</summary>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {stageDetails.map((stage) => (
                    <div key={stage.step} className={cn(
                      "rounded-lg border px-3 py-2",
                      stage.isCurrent ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-slate-50"
                    )}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0',
                          stage.isCurrent ? 'bg-brand-600 text-white' : stage.isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                        )}>
                          {stage.isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stage.step}
                        </span>
                        <p className="text-sm font-black text-slate-900 truncate">{stage.title}</p>
                        <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">{stage.period}</span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-slate-600 line-clamp-1">{stage.action}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500 line-clamp-1">이력: {stage.history}</p>
                    </div>
                  ))}
                </div>
              </details>

              <div className="grid grid-cols-2 gap-3">
                {actionChecks.slice(0, 2).map((check, index) => (
                  <div key={check.title} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0',
                      index === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                    )}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900">{check.title}</p>
                      <p className="mt-1 text-xs font-bold leading-relaxed text-slate-600">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {['개인채무자보호법', '자산건전성 기준', '내부 회수정책'].map((basis) => (
                  <span key={basis} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600">
                    {basis}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

function buildActionChecks(customer: Customer) {
  if (customer.step >= 5) {
    return [
      { title: '기한이익상실 고지 이력 확인', detail: '예고 발송일, 수신 여부, 회신 기한 경과 여부 확인' },
      { title: '법적 절차 담당자 승인', detail: `${customer.recoveryGrade}등급 · ${customer.soundnessClass} 분류 기준으로 승인 라인 확인` },
      { title: '접촉 제한 반영', detail: `접촉금지 ${customer.blockedChannels.length ? customer.blockedChannels.map(contactChannelLabel).join('·') : '없음'} / 가능 ${customer.preferredChannels.map(contactChannelLabel).join('·')}` },
      { title: '처리 결과 기록', detail: '고지 이력, 고객 반응, 다음 조치 예정일을 상담 이력에 저장' },
    ];
  }

  if (customer.step >= 3) {
    return [
      { title: '내용증명/도달 확인', detail: '발송 채널과 수신 확인 여부 점검' },
      { title: '상환 가능일 재확인', detail: '부분 납부 가능액과 확약 일자 확인' },
      { title: '접촉 채널 선택', detail: `우선 채널 ${customer.preferredChannels.map(contactChannelLabel).join('·')}` },
      { title: '다음 단계 조건 기록', detail: '미응답 또는 확약 불이행 시 예고 단계 전환' },
    ];
  }

  return [
    { title: '납부 안내', detail: '약정일과 미납 금액 안내' },
    { title: '자동 알림 발송', detail: `가능 채널 ${customer.preferredChannels.map(contactChannelLabel).join('·')}` },
    { title: '응답 여부 확인', detail: '회신, 통화 연결, 납부 증빙 여부 확인' },
    { title: '상담 이력 저장', detail: '고객 반응과 다음 안내 일자 기록' },
  ];
}

function buildStageDetails(plans: ActionPlan[], currentStep: number, customer: Customer, contactHistory: ContactHistory[]) {
  const calls = contactHistory.filter((item) => item.type === 'call').length;
  const sms = contactHistory.filter((item) => item.type === 'sms').length;
  const emails = contactHistory.filter((item) => item.type === 'email').length;
  const latest = contactHistory[0];

  return plans.map((plan) => {
    const isDone = plan.step < currentStep;
    const isCurrent = plan.step === currentStep;
    const base = {
      step: plan.step,
      title: plan.title,
      period: plan.period,
      action: plan.action,
      isDone,
      isCurrent,
    };

    if (plan.step === 1) {
      return {
        ...base,
        history: sms > 0 ? `문자 안내 ${sms}건 발송` : '자동 안내 이력 없음',
        check: customer.preferredChannels.includes('sms') ? '문자 수신 가능' : '대체 채널 확인',
      };
    }

    if (plan.step === 2) {
      return {
        ...base,
        history: calls > 0 ? `전화 접촉 ${calls}건 기록` : '전화 접촉 이력 없음',
        check: customer.blockedChannels.includes('call') ? '전화 접촉금지 반영' : '통화 가능 시간 확인',
      };
    }

    if (plan.step === 3) {
      return {
        ...base,
        history: sms + emails > 0 ? `문자/이메일 ${sms + emails}건 도달 확인 대상` : '도달 확인 이력 없음',
        check: '내용증명 또는 도달 채널 확인',
      };
    }

    if (plan.step === 4) {
      return {
        ...base,
        history: emails > 0 ? `예고 안내문 이메일 ${emails}건` : '기한상실 예고 이력 확인 필요',
        check: '예고 발송일과 회신 기한 확인',
      };
    }

    return {
      ...base,
      history: latest ? `최근 ${contactChannelLabel(latest.type)}: ${latest.content}` : '최근 접촉 이력 없음',
      check: `${customer.recoveryGrade}등급 · ${customer.soundnessClass} 기준 승인 라인 확인`,
    };
  });
}

function contactChannelLabel(channel: string) {
  if (channel === 'call') return '전화';
  if (channel === 'sms') return '문자';
  if (channel === 'dm') return 'DM';
  return '이메일';
}

function actionDates(customer: Customer) {
  return [
    { label: '차기이수일', value: customer.nextActionDate ? compactDate(customer.nextActionDate) : '-', danger: false },
    { label: '최종상환일', value: customer.finalPaymentDate ? compactDate(customer.finalPaymentDate) : '-', danger: false },
    { label: '기한상실일', value: customer.accelerationDate ? compactDate(customer.accelerationDate) : '-', danger: Boolean(customer.accelerationDate) },
  ];
}

function compactDate(date: string) {
  return date.replaceAll('-', '.');
}
