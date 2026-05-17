import React from 'react';
import { ArrowRight, BrainCircuit, MessageSquareText, ShieldCheck } from 'lucide-react';
import { AppliedCounselingGuidance } from '../types';
import { cn } from '../lib/utils';

interface ToneGuidancePanelProps {
  guidance: AppliedCounselingGuidance;
}

export default function ToneGuidancePanel({ guidance }: ToneGuidancePanelProps) {
  const riskLabel = guidance.behaviorRisk === 'high' ? '고위험' : guidance.behaviorRisk === 'medium' ? '중위험' : '저위험';
  const riskClass = guidance.behaviorRisk === 'high'
    ? 'bg-red-50 text-red-700 border-red-100'
    : guidance.behaviorRisk === 'medium'
    ? 'bg-orange-50 text-orange-700 border-orange-100'
    : 'bg-emerald-50 text-emerald-700 border-emerald-100';

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-brand-600" />
          <h3 className="font-black text-slate-900">상담 톤 판단</h3>
        </div>
        <span className={cn('text-[10px] font-black px-2 py-0.5 rounded border whitespace-nowrap', riskClass)}>
          행동 {riskLabel} · 감성 {guidance.sentimentScore}점
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">원인</p>
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 leading-relaxed">{guidance.behaviorToneCue}</p>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">{guidance.sentimentToneCue}</p>
          </div>
        </div>

        <div className="flex items-center justify-center text-slate-300">
          <ArrowRight className="w-5 h-5" />
        </div>

        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-[10px] font-black text-brand-700 uppercase tracking-widest mb-2">결과</p>
          <p className="text-base font-black text-slate-900">{guidance.tonePolicy.title}</p>
          <p className="mt-2 text-xs font-semibold text-slate-700 leading-relaxed">{guidance.tonePolicy.tone}</p>
        </div>

        <div className="flex items-center justify-center text-slate-300">
          <ArrowRight className="w-5 h-5" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareText className="w-4 h-4 text-brand-300" />
            <p className="text-[10px] font-black text-brand-300 uppercase tracking-widest">상담보조 반영</p>
          </div>
          <p className="text-xs font-semibold leading-relaxed text-slate-100">
            답변 초안은 이 톤으로 작성되고, 상담원 주의사항에는 금지/주의 문구가 함께 반영됩니다.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <ShieldCheck className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">적용 매뉴얼</p>
          <div className="flex flex-wrap gap-1.5">
            {guidance.manuals.map((manual) => (
              <span key={manual.id} className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">
                {manual.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
