import React, { useEffect, useState } from 'react';
import { Check, ClipboardList, Pencil, StickyNote } from 'lucide-react';
import { CustomerWorkSummary as CustomerWorkSummaryType } from '../operations';
import { cn } from '../lib/utils';

interface WorkQueueSummaryProps {
  summary: CustomerWorkSummaryType;
}

export default function WorkQueueSummary({ summary }: WorkQueueSummaryProps) {
  const storageKey = `senticore.customerMemo.${summary.customerId}`;
  const [memo, setMemo] = useState(summary.personalMemo);
  const [draftMemo, setDraftMemo] = useState(summary.personalMemo);
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  useEffect(() => {
    const savedMemo = window.localStorage.getItem(storageKey) || summary.personalMemo;
    setMemo(savedMemo);
    setDraftMemo(savedMemo);
    setIsEditingMemo(false);
  }, [storageKey, summary.personalMemo]);

  const saveMemo = () => {
    const nextMemo = draftMemo.trim() || summary.personalMemo;
    setMemo(nextMemo);
    setDraftMemo(nextMemo);
    window.localStorage.setItem(storageKey, nextMemo);
    setIsEditingMemo(false);
  };

  const rows = [
    {
      label: '회수전략',
      result: summary.productDecision,
      hint: '타임라인 기반',
      color: 'bg-slate-900 text-white',
      details: summary.accountActions,
    },
    {
      label: '행동전략',
      result: summary.behaviorDecision,
      hint: '행동 분석 기반',
      color: 'bg-brand-600 text-white',
      details: [summary.nextActionTitle, summary.contactCadence],
    },
    {
      label: '응대전략',
      result: summary.sentimentDecision,
      hint: '감성 분석 기반',
      color: 'bg-red-600 text-white',
      details: [summary.toneTitle, summary.toneInstruction, summary.toneGuardrail],
      basis: ['개인채무자보호법', '채권추심 준법', '내부 회수정책'],
    },
  ];

  return (
    <section className="glass-panel p-3 flex-1 min-h-0 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <ClipboardList className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-black text-slate-900">상담전략 요약</h3>
        </div>
        <div className="min-w-0 flex-1">
          {isEditingMemo ? (
            <div className="h-8 rounded-lg border border-amber-200 bg-amber-50 px-2 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <input
                value={draftMemo}
                onChange={(event) => setDraftMemo(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveMemo();
                  if (event.key === 'Escape') {
                    setDraftMemo(memo);
                    setIsEditingMemo(false);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-xs font-black text-amber-950 outline-none"
                autoFocus
              />
              <button
                onClick={saveMemo}
                className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600"
                title="메모 저장"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingMemo(true)}
              className="h-8 w-full rounded-lg border border-amber-100 bg-amber-50 px-2.5 flex items-center gap-1.5 overflow-hidden text-left hover:border-amber-200"
              title="메모 편집"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="min-w-0 flex-1 text-xs font-black text-amber-950 truncate">{memo}</span>
              <Pencil className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-black text-slate-900">{row.label}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.hint}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'min-w-0 max-w-full rounded-lg px-3 py-1.5 text-sm font-black',
                row.label === '응대전략' ? 'leading-snug line-clamp-2' : 'truncate',
                row.color
              )}>
                {row.result}
              </span>
            </div>
            <div className="mt-2 space-y-1 min-h-0 overflow-hidden">
              {row.details.slice(0, 3).map((detail) => (
                <p
                  key={detail}
                  className={cn(
                    "rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 leading-snug",
                    row.label === '응대전략' ? 'line-clamp-2' : 'line-clamp-1'
                  )}
                >
                  {compactDashboardText(detail)}
                </p>
              ))}
            </div>
            {'basis' in row && (
              <div className="mt-auto pt-2 shrink-0">
                <div className="flex flex-wrap gap-1.5 max-h-[28px] overflow-hidden">
                  {row.basis.map((basis) => (
                    <span key={basis} className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-black text-red-700">
                      {basis}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 max-h-7 overflow-hidden shrink-0">
        {summary.complianceWarnings.slice(0, 3).map((warning) => (
          <span key={warning} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {compactWarning(warning)}
          </span>
        ))}
      </div>
    </section>
  );
}

function compactDashboardText(text: string) {
  return text
    .replaceAll('합니다.', '')
    .replaceAll('합니다', '')
    .replaceAll('합니다.', '')
    .replaceAll('입니다.', '')
    .replaceAll('입니다', '')
    .replaceAll('합니다', '')
    .trim();
}

function compactWarning(warning: string) {
  if (warning.includes('확정')) return '확정금지';
  if (warning.includes('개인식별정보')) return '개인정보 금지';
  if (warning.includes('압박')) return '압박금지';
  return warning;
}
