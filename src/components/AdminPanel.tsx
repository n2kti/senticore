import React, { useState } from 'react';
import { BookOpen, CheckCircle2, RotateCcw, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { CounselingManual, TonePolicy } from '../types';
import { cn } from '../lib/utils';

interface AdminPanelProps {
  manuals: CounselingManual[];
  tonePolicies: TonePolicy[];
  onClose: () => void;
  onManualChange: (manuals: CounselingManual[]) => void;
  onTonePolicyChange: (policies: TonePolicy[]) => void;
  onReset: () => void;
}

export default function AdminPanel({
  manuals,
  tonePolicies,
  onClose,
  onManualChange,
  onTonePolicyChange,
  onReset,
}: AdminPanelProps) {
  const [manualQuery, setManualQuery] = useState('');
  const [toneQuery, setToneQuery] = useState('');
  const [onlyEnabled, setOnlyEnabled] = useState(false);

  const updateManual = (id: string, patch: Partial<CounselingManual>) => {
    onManualChange(manuals.map((manual) => (manual.id === id ? { ...manual, ...patch } : manual)));
  };

  const updateTonePolicy = (id: string, patch: Partial<TonePolicy>) => {
    onTonePolicyChange(tonePolicies.map((policy) => (policy.id === id ? { ...policy, ...patch } : policy)));
  };

  const filteredManuals = manuals.filter((manual) => {
    const query = manualQuery.trim().toLowerCase();
    const matchesQuery = !query || [manual.title, manual.summary, manual.content, manual.source, ...manual.keywords].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (!onlyEnabled || manual.enabled);
  });

  const filteredTonePolicies = tonePolicies.filter((policy) => {
    const query = toneQuery.trim().toLowerCase();
    const matchesQuery = !query || [policy.title, policy.trigger, policy.tone, policy.guardrail].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (!onlyEnabled || policy.enabled);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">관리자 설정</h2>
              <p className="text-[11px] font-bold text-slate-500">상담 매뉴얼 탑재 및 최종 응대 톤 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              기본값 복원
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 scrollbar-hide">
          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.9fr] gap-6">
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-600" />
                    <h3 className="text-sm font-black text-slate-900">기본 탑재 상담 매뉴얼</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    표시 {filteredManuals.length} · 활성 {manuals.filter((manual) => manual.enabled).length}/{manuals.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex-1 min-w-0 h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      value={manualQuery}
                      onChange={(event) => setManualQuery(event.target.value)}
                      placeholder="매뉴얼 검색"
                      className="min-w-0 flex-1 bg-transparent text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </label>
                  <button
                    onClick={() => setOnlyEnabled((value) => !value)}
                    className={cn(
                      'h-9 px-3 rounded-lg border text-[11px] font-black whitespace-nowrap',
                      onlyEnabled ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-white text-slate-500 border-slate-200'
                    )}
                  >
                    활성만
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredManuals.map((manual) => (
                  <div key={manual.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            value={manual.title}
                            onChange={(event) => updateManual(manual.id, { title: event.target.value })}
                            className="text-sm font-black text-slate-900 bg-transparent border-b border-transparent focus:border-brand-300 focus:outline-none"
                          />
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">
                            {manual.category}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 mt-1">{manual.source}</p>
                      </div>
                      <button
                        onClick={() => updateManual(manual.id, { enabled: !manual.enabled })}
                        className={cn(
                          'h-7 px-2.5 rounded-lg text-[11px] font-black border flex items-center gap-1.5 shrink-0',
                          manual.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {manual.enabled ? '활성' : '비활성'}
                      </button>
                    </div>

                    <textarea
                      value={manual.summary}
                      onChange={(event) => updateManual(manual.id, { summary: event.target.value })}
                      className="w-full min-h-[42px] resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                    />
                    <textarea
                      value={manual.content}
                      onChange={(event) => updateManual(manual.id, { content: event.target.value })}
                      className="w-full min-h-[74px] resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs leading-relaxed text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-brand-600" />
                    <h3 className="text-sm font-black text-slate-900">최종 응대 톤 정책</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    표시 {filteredTonePolicies.length} · 활성 {tonePolicies.filter((policy) => policy.enabled).length}/{tonePolicies.length}
                  </span>
                </div>
                <label className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    value={toneQuery}
                    onChange={(event) => setToneQuery(event.target.value)}
                    placeholder="톤 정책 검색"
                    className="min-w-0 flex-1 bg-transparent text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </label>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTonePolicies.map((policy) => (
                  <div key={policy.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <input
                          value={policy.title}
                          onChange={(event) => updateTonePolicy(policy.id, { title: event.target.value })}
                          className="text-sm font-black text-slate-900 bg-transparent border-b border-transparent focus:border-brand-300 focus:outline-none"
                        />
                        <p className="text-[11px] font-bold text-slate-500 mt-1">{policy.trigger}</p>
                      </div>
                      <button
                        onClick={() => updateTonePolicy(policy.id, { enabled: !policy.enabled })}
                        className={cn(
                          'h-7 px-2.5 rounded-lg text-[11px] font-black border shrink-0',
                          policy.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        )}
                      >
                        {policy.enabled ? '활성' : '비활성'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="block">
                        <span className="text-[10px] font-black text-slate-400 uppercase">응대 톤</span>
                        <textarea
                          value={policy.tone}
                          onChange={(event) => updateTonePolicy(policy.id, { tone: event.target.value })}
                          className="mt-1 w-full min-h-[64px] resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-black text-slate-400 uppercase">금지/주의</span>
                        <textarea
                          value={policy.guardrail}
                          onChange={(event) => updateTonePolicy(policy.id, { guardrail: event.target.value })}
                          className="mt-1 w-full min-h-[56px] resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs leading-relaxed text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
