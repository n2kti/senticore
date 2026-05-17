import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, Line, Area } from 'recharts';
import { PaymentHistory, OverdueStep, Customer, ContactHistory } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { TrendingUp, AlertCircle, ChevronRight, X, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BehaviorAnalysisProps {
  history: PaymentHistory[];
  overdueStep: OverdueStep;
  customer: Customer;
  contactHistory: ContactHistory[];
}

export default function BehaviorAnalysis({ history, overdueStep, customer, contactHistory }: BehaviorAnalysisProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState<'3M' | '6M' | '12M'>('12M');

  const filteredHistory = [...history].reverse().slice(
    period === '3M' ? -3 : period === '6M' ? -6 : 0
  );

  const stats = {
    normal: history.filter(h => h.status === 'normal').length,
    overdue: history.filter(h => h.status === 'overdue').length,
    unpaid: history.filter(h => h.status === 'unpaid').length,
    consistency: Math.round((history.filter(h => h.status === 'normal').length / history.length) * 100)
  };

  const hasUnpaid = stats.unpaid > 0 || customer.overdueDays > 0;
  const unpaidBalance = Math.max(0, customer.loanAmount - customer.paidAmount);
  const estimatedInterest = Math.round(unpaidBalance * 0.15 * (customer.overdueDays / 365));
  const totalClaim = unpaidBalance + estimatedInterest;
  const behaviorProfile = customer.overdueDays >= 90
    ? '장기 미납 반복'
    : customer.overdueDays >= 30
    ? '부분 연체 관찰'
    : '정상 납부 유지';
  const consistencyLabel = stats.consistency >= 80 ? '양호' : stats.consistency >= 50 ? '관찰' : '위험';

  return (
    <>
      <div className="glass-panel p-4 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-slate-800">행동 분석</h3>
          </div>
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {(['3M', '6M', '12M'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded-md transition-all",
                  period === p ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
          <div className="min-h-0 px-1 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  interval={period === '12M' ? 1 : 0}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as PaymentHistory;
                      return (
                        <div className="bg-white p-2 border border-slate-200 shadow-lg rounded-lg text-[10px]">
                          <p className="font-bold text-slate-700 mb-1">{data.month}</p>
                          <div className="space-y-1">
                            <p className={cn(
                              "font-bold",
                              data.status === 'normal' ? "text-emerald-600" : "text-red-600"
                            )}>
                              {formatCurrency(data.amount)}
                            </p>
                            <p className="text-slate-400">연체: {data.delayDays}일</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  fill="#0e8fe9" 
                  stroke="none" 
                  fillOpacity={0.1} 
                />
                <Bar dataKey="amount" radius={[2, 2, 0, 0]} barSize={period === '12M' ? 12 : 24}>
                  {filteredHistory.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.status === 'normal' ? '#0e8fe9' : entry.status === 'overdue' ? '#ef4444' : '#94a3b8'} 
                    />
                  ))}
                </Bar>
                <Line 
                  type="monotone" 
                  dataKey="delayDays" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={{ r: 2, fill: '#f59e0b' }}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 min-h-0">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-hidden">
              <p className="text-xs text-slate-400 font-black uppercase">납부 패턴</p>
              <p className="mt-1 text-sm font-black text-slate-900 truncate">{behaviorProfile}</p>
              <div className="mt-2 flex items-center gap-2 overflow-hidden">
                {[
                  { label: '정상', value: stats.normal, tone: 'bg-emerald-500' },
                  { label: '연체', value: stats.overdue, tone: 'bg-orange-500' },
                  { label: '미납', value: stats.unpaid, tone: 'bg-red-500' },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1 text-xs font-black text-slate-600 whitespace-nowrap">
                    <span className={cn('w-2 h-2 rounded-full', item.tone)} />
                    {item.label} {item.value}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-black uppercase">납부 일관성</p>
                <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
                  {consistencyLabel}
                </span>
              </div>
              <div className="mt-1.5 flex items-end gap-2">
                <p className={cn(
                  "text-2xl font-black leading-none",
                  stats.consistency >= 80 ? "text-emerald-600" : stats.consistency >= 50 ? "text-orange-600" : "text-red-600"
                )}>
                  {stats.consistency}%
                </p>
                <p className="pb-0.5 text-[11px] font-bold text-slate-500 whitespace-nowrap">12개월</p>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white border border-slate-100 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    stats.consistency >= 80 ? 'bg-emerald-500' : stats.consistency >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  )}
                  style={{ width: `${stats.consistency}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-3 w-full h-9 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black rounded-xl flex items-center justify-center gap-1 transition-all border border-slate-200 whitespace-nowrap shadow-sm shrink-0"
        >
          행동 분석 상세보기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
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
                  <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">행동 분석 상세보기</h2>
                    <p className="text-xs text-slate-500 font-bold">{customer.name} 고객님 (D+{customer.overdueDays})</p>
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
                  hasUnpaid ? "bg-red-50 border-red-100 text-red-800" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                )}>
                  {hasUnpaid ? <AlertCircle className="w-6 h-6 text-red-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  <div>
                    <p className="text-base font-black">
                      {hasUnpaid ? "미납 및 연체 주의보 발령" : "정상 납부 및 양호한 결제 패턴"}
                    </p>
                    <p className="text-sm opacity-80 font-medium leading-relaxed">
                      {hasUnpaid 
                        ? `현재 ${stats.unpaid}건의 미납 내역과 D+${customer.overdueDays}일의 연체가 확인됩니다. 즉각적인 회수 조치가 권장됩니다.` 
                        : "최근 12개월간 일관된 납부 패턴을 유지하고 있으며, 현재 연체 내역이 없습니다."}
                    </p>
                  </div>
                </div>

                {/* 2. Metric Strip */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: '정상 납부 횟수', value: `${stats.normal}회`, color: 'text-emerald-600' },
                    { label: '연체 횟수', value: `${stats.overdue}회`, color: 'text-orange-600' },
                    { label: '미납 횟수', value: `${stats.unpaid}회`, color: 'text-red-600' },
                    { label: '납부 일관성', value: `${stats.consistency}%`, color: 'text-brand-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{stat.label}</p>
                      <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* 3. Monthly Payment Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-brand-500 rounded-full" />
                    월별 납부 내역
                  </h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {['납부월', '상태', '납부액', '약정액', '지연일'].map(h => (
                            <th key={h} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {history.map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{h.month}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "text-[11px] px-2.5 py-1 rounded-full font-bold",
                                h.status === 'normal' ? "bg-emerald-50 text-emerald-600" :
                                h.status === 'overdue' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                              )}>
                                {h.status === 'normal' ? '정상' : h.status === 'overdue' ? '연체' : '미납'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(h.amount)}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">{formatCurrency(1200000)}</td>
                            <td className="px-6 py-4 text-sm font-bold text-orange-600">{h.delayDays}일</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Debt Balance Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-brand-500 rounded-full" />
                    채권 잔액 현황
                  </h3>
                  <div className="grid grid-cols-5 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    {[
                      { label: '원금', value: formatCurrency(customer.loanAmount) },
                      { label: '누적 납부', value: formatCurrency(customer.paidAmount) },
                      { label: '미납 잔액', value: formatCurrency(unpaidBalance), highlight: 'text-red-600' },
                      { label: '연체이자 추정', value: formatCurrency(estimatedInterest), highlight: 'text-orange-600' },
                      { label: '총청구 예상액', value: formatCurrency(totalClaim), highlight: 'text-brand-600' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-5 text-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{item.label}</p>
                        <p className={cn("text-base font-black", item.highlight || "text-slate-900")}>{item.value}</p>
                      </div>
                    ))}
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
