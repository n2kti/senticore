import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AppliedCounselingGuidance, ContactHistory, Customer } from '../types';
import { cn } from '../lib/utils';
import { Heart, MessageSquare, ChevronRight, X, Info, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SentimentAnalysisProps {
  history: ContactHistory[];
  customer: Customer;
  guidance: AppliedCounselingGuidance;
}

export default function SentimentAnalysis({ history, customer, guidance }: SentimentAnalysisProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScoringOpen, setIsScoringOpen] = useState(false);

  const avgScore = Math.round(
    history.reduce((acc, curr) => acc + curr.sentimentScore, 0) / (history.length || 1)
  );

  const getSentimentInfo = (score: number) => {
    if (score >= 61) return { label: '협조적', color: 'text-emerald-500', fill: '#10b981', border: 'border-emerald-100' };
    if (score >= 31) return { label: '중립', color: 'text-amber-500', fill: '#f59e0b', border: 'border-amber-100' };
    return { label: '부정적', color: 'text-red-500', fill: '#ef4444', border: 'border-red-100' };
  };

  const info = getSentimentInfo(avgScore);
  const chartData = [{ value: avgScore }, { value: 100 - avgScore }];
  const latestQuote = history[0]?.content.substring(0, 40) + '...';

  // Specific scenario data
  const isParkJaeWon = customer.name === '박재원';
  const isChoiMiRae = customer.name === '최미래';

  const sentimentMetrics = [
    { label: 'Sentiment Score', value: avgScore, status: info.label },
    { label: '협조적 태도', value: isChoiMiRae ? 95 : isParkJaeWon ? 15 : 65, status: isChoiMiRae ? '매우 높음' : isParkJaeWon ? '매우 낮음' : '보통' },
    { label: '감정 안정도', value: isChoiMiRae ? 90 : isParkJaeWon ? 20 : 40, status: isChoiMiRae ? '안정' : isParkJaeWon ? '불안정' : '보통' },
    { label: '분할납부 수용 가능성', value: isChoiMiRae ? 85 : isParkJaeWon ? 10 : 75, status: isChoiMiRae ? '높음' : isParkJaeWon ? '매우 낮음' : '보통' },
    { label: '법적조치 전환 위험', value: isChoiMiRae ? 5 : isParkJaeWon ? 95 : 35, status: isChoiMiRae ? '매우 낮음' : isParkJaeWon ? '매우 높음' : '보통' },
  ];

  const keywordFrequency = isChoiMiRae 
    ? [
        { keyword: '감사합니다', count: 5, sentiment: 'positive' },
        { keyword: '납부 예정', count: 4, sentiment: 'positive' },
        { keyword: '친절한 안내', count: 3, sentiment: 'positive' },
      ]
    : isParkJaeWon
    ? [
        { keyword: '불가능', count: 8, sentiment: 'negative' },
        { keyword: '연락 거부', count: 6, sentiment: 'negative' },
        { keyword: '법대로 해라', count: 4, sentiment: 'negative' },
      ]
    : [
        { keyword: '경제적 어려움', count: 4, sentiment: 'negative' },
        { keyword: '납부 의지', count: 3, sentiment: 'positive' },
        { keyword: '불안정', count: 2, sentiment: 'neutral' },
      ];
  const sentimentProfileTitle = isParkJaeWon ? '민원 위험형' : isChoiMiRae ? '협조 유지형' : '상환협의 가능형';
  const sentimentProfileDescription = isParkJaeWon
    ? '상담 거부와 불만 반복. 법적 절차 언급에 민감, 압박성 표현 시 민원 위험 높음.'
    : isChoiMiRae
    ? '응답 빠름, 협조적. 감사 표현과 간단한 일정 확인에 긍정 반응.'
    : '경제적 어려움 반복 설명, 상환 의지 유지. 구체적인 일정 제시 필요.';
  const evidenceItems = isParkJaeWon
    ? ['연락 거부 표현 반복', '법적 절차 문의와 불만 동시 발생', '최근 통화에서 상담 종료']
    : isChoiMiRae
    ? ['감사 표현 확인', '납부 증빙 회신', '다음 납부일 확인 답변']
    : ['경제적 어려움 호소', '일부 납부 가능성 언급', '일정 확약은 아직 없음'];

  return (
    <>
      <div className="glass-panel p-4 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            감성 분석
          </h3>
          <button
            type="button"
            onClick={() => setIsScoringOpen(true)}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            title="감성 점수 채점 기준"
          >
            채점 기준
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
          <div className="min-h-0 flex gap-4 items-center overflow-hidden">
            <div className="w-24 h-24 flex items-center justify-center relative shrink-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <span className={cn("text-2xl font-black", info.color)}>{avgScore}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">추정 {info.label}</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={35}
                    outerRadius={45}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={info.fill} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-3">
              {sentimentMetrics.slice(1, 4).map((metric, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>{metric.label}</span>
                    <span className={sentimentTextClass(metric.value)}>{metric.value}%</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-1000",
                        sentimentBgClass(metric.value)
                      )}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-hidden">
            <p className="text-xs text-slate-400 font-black uppercase">요약</p>
            <p className="mt-1 text-base font-black text-slate-900">{sentimentProfileTitle}</p>
            <p className="mt-1 text-sm text-slate-600 font-bold leading-snug line-clamp-2">{sentimentProfileDescription}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-3 w-full h-9 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black rounded-xl flex items-center justify-center gap-1 transition-all border border-slate-200 whitespace-nowrap shadow-sm shrink-0"
        >
          감성 분석 상세보기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isScoringOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900">감성 점수 채점 기준</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">상담 가능성과 응대 톤을 정하기 위한 내부 기준입니다.</p>
                </div>
                <button
                  onClick={() => setIsScoringOpen(false)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                {[
                  { range: '0-30', label: '부정적', tone: 'text-red-600', detail: '상담 거부, 강한 불만, 민원 위험. 공감 우선, 압박 금지.' },
                  { range: '31-60', label: '관찰', tone: 'text-amber-600', detail: '불안정하거나 확약 부족. 짧고 중립적으로 납부 가능일과 금액 확인.' },
                  { range: '61-80', label: '협조적', tone: 'text-emerald-600', detail: '상환 협의 가능. 분할납부, 납부일 협의 중심으로 안내.' },
                  { range: '81-100', label: '매우 협조적', tone: 'text-brand-600', detail: '감사 표현, 빠른 회신, 정상 납부. 관계 유지와 리마인드 중심.' },
                ].map((item) => (
                  <div key={item.range} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <span className={cn('w-20 shrink-0 rounded-lg bg-slate-50 px-2 py-1 text-center text-sm font-black tabular-nums whitespace-nowrap', item.tone)}>{item.range}</span>
                      <p className="text-sm font-black text-slate-900">{item.label}</p>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">{item.detail}</p>
                  </div>
                ))}
                <p className="rounded-xl bg-slate-50 p-4 text-xs font-bold leading-relaxed text-slate-500">
                  점수는 고객의 단순 기분이 아니라 납부 의사, 일정/금액 구체성, 회신 여부, 연락 거부, 민원 위험을 함께 본 상담 가능성 지표입니다.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">감성 분석 상세보기</h2>
                    <p className="text-sm text-slate-500 font-bold">{customer.name} 고객님 (D+{customer.overdueDays})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                {/* 1. Banner */}
                <div className={cn(
                  "p-5 rounded-2xl border flex items-center gap-4",
                  avgScore < 40 ? "bg-red-50 border-red-100 text-red-800" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                )}>
                  {avgScore < 40 ? <AlertCircle className="w-6 h-6 text-red-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  <div>
                    <p className="text-base font-black">
                      {isParkJaeWon ? "법적조치 전환 위험: 높음" : isChoiMiRae ? "협조적 상태: 매우 양호" : avgScore < 40 ? "비협조적 태도 및 감정 불안정 감지" : "협조적 태도 유지 중"}
                    </p>
                    <p className="text-base opacity-80 font-medium leading-relaxed">
                      {isParkJaeWon ? "상담 거부 및 비협조적 태도가 반복되고 있습니다. 법적 절차 이행 검토가 시급합니다." : isChoiMiRae ? "고객님께서 매우 긍정적이고 협조적인 태도를 보이고 있습니다." : "최근 상담 이력을 기반으로 분석된 감성 지표입니다."}
                    </p>
                  </div>
                </div>

                {/* 3. History Sentiment Data */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-red-500 rounded-full" />
                    상담 이력별 감성 데이터
                  </h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full table-fixed text-left border-collapse">
                      <colgroup>
                        <col className="w-28" />
                        <col className="w-20" />
                        <col className="w-16" />
                        <col />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">날짜</th>
                          <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">채널</th>
                          <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">점수</th>
                          <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">키워드 및 내용</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {history.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">{formatHistoryDate(item.date)}</td>
                            <td className="px-5 py-4">
                              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase">{item.type}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn(
                                "text-sm font-black",
                                sentimentTextClass(item.sentimentScore)
                              )}>
                                {item.sentimentScore}
                              </span>
                            </td>
                            <td className="px-5 py-4 min-w-0">
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {['경제적 어려움', '납부 의지'].map((kw, idx) => (
                                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">#{kw}</span>
                                ))}
                              </div>
                              <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-normal break-keep">{item.content}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 4. Keyword Frequency Table */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <div className="w-1.5 h-5 bg-red-500 rounded-full" />
                      감성 키워드 빈도
                    </h3>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase">키워드</th>
                            <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase text-center">빈도</th>
                            <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase text-center">분류</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {keywordFrequency.map((kw, i) => (
                            <tr key={i}>
                              <td className="px-4 py-3 text-sm font-bold text-slate-700">{kw.keyword}</td>
                              <td className="px-4 py-3 text-sm font-black text-slate-900 text-center">{kw.count}회</td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "text-[11px] px-2.5 py-1 rounded-full font-bold",
                                  kw.sentiment === 'positive' ? "bg-emerald-50 text-emerald-600" :
                                  kw.sentiment === 'negative' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
                                )}>
                                  {kw.sentiment === 'positive' ? '긍정' : kw.sentiment === 'negative' ? '부정' : '중립'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. AI Strategy Recommendation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <div className="w-1.5 h-5 bg-red-500 rounded-full" />
                      AI 상담 전략 권고
                    </h3>
                    <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100 h-[calc(100%-44px)] flex flex-col justify-center">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <Info className="w-6 h-6 text-brand-500" />
                        </div>
                        <div>
                          <p className="text-base text-brand-900 font-black mb-1.5">
                            {isParkJaeWon ? "법적 절차 이행 및 강경 대응" : isChoiMiRae ? "관계 유지 및 우량 고객 관리" : "중립적/협조적 접근 권장"}
                          </p>
                          <p className="text-brand-800/80 text-base leading-relaxed font-medium">
                            {isParkJaeWon 
                              ? "고객의 상담 거부 의사가 완강하므로 추가적인 유선 독촉보다는 기한의 이익 상실 통보 및 법적 조치 착수를 권고합니다." 
                              : isChoiMiRae 
                              ? "매우 협조적인 고객이므로 정중한 감사 인사와 함께 향후 발생할 수 있는 혜택 등을 안내하여 우량 고객으로 유지하십시오." 
                              : "고객의 경제적 어려움에 공감하되, 구체적인 상환 일정을 확약받는 전략이 필요합니다. 분할납부 옵션을 적극 활용하십시오."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function sentimentTextClass(score: number) {
  if (score >= 61) return 'text-emerald-600';
  if (score >= 31) return 'text-amber-600';
  return 'text-red-600';
}

function sentimentBgClass(score: number) {
  if (score >= 61) return 'bg-emerald-500';
  if (score >= 31) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatHistoryDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(date))
    .replace(/\.\s*/g, '.')
    .replace(/\.$/, '');
}
