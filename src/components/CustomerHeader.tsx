import React from 'react';
import { Customer } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Shield, AlertTriangle, TrendingDown, Calendar } from 'lucide-react';

interface CustomerHeaderProps {
  customer: Customer;
}

export default function CustomerHeader({ customer }: CustomerHeaderProps) {
  const riskColor = {
    none: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    observe: 'text-blue-500 bg-blue-50 border-blue-100',
    caution: 'text-yellow-500 bg-yellow-50 border-yellow-100',
    warning: 'text-orange-500 bg-orange-50 border-orange-100',
    severe: 'text-red-500 bg-red-50 border-red-100',
    danger: 'text-red-700 bg-red-100 border-red-200',
  }[customer.riskLevel];

  const riskLabel = {
    none: '위험 없음',
    observe: '관찰',
    caution: '주의',
    warning: '경고',
    severe: '심각',
    danger: '위험',
  }[customer.riskLevel];

  return (
    <div className="glass-panel p-4 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-[330px]">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2", riskColor)}>
            <Shield className="w-7 h-7" />
          </div>
          <div className="min-w-[250px]">
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-2xl font-black text-slate-950">{customer.name}</h1>
              <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-black border whitespace-nowrap", riskColor)}>
                {riskLabel}
              </span>
            </div>
            <div className="mt-1 space-y-0.5 text-slate-600 text-sm font-medium">
              <p className="flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-4 h-4 shrink-0" />
                계약일 {customer.contractDate}
              </p>
              <p className="pl-[22px] whitespace-nowrap">약정일 매월 {customer.dueDateDay}일</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-[540px]">
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">대출 원금</p>
            <p className="text-lg font-black text-slate-950 tabular-nums whitespace-nowrap">{formatCurrency(customer.loanAmount)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">연체 일수</p>
            <p className="text-lg font-black text-red-600 flex items-center gap-1 tabular-nums whitespace-nowrap">
              <AlertTriangle className="w-5 h-5" />
              D+{customer.overdueDays}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">납부 누계</p>
            <p className="text-lg font-black text-brand-600 tabular-nums whitespace-nowrap">{formatCurrency(customer.paidAmount)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">연체 단계</p>
            <p className="text-lg font-black text-slate-950 tabular-nums whitespace-nowrap">Step {customer.step}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
