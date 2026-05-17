import React from 'react';
import { ContactHistory, Customer } from '../types';
import { cn } from '../lib/utils';
import { Bell, Check, Headset, Mail, MessageSquare, Phone, Settings, X, User, FileText, Sparkles } from 'lucide-react';

interface HistoryTimelineProps {
  history: ContactHistory[];
  customer: Customer;
  isNotificationOpen: boolean;
  onToggleNotification: () => void;
  onOpenAdmin: () => void;
}

export default function HistoryTimeline({
  history,
  customer,
  isNotificationOpen,
  onToggleNotification,
  onOpenAdmin,
}: HistoryTimelineProps) {
  const contactCounts = history.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-3.5 h-3.5" />;
      case 'sms': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'dm': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'email': return <Mail className="w-3.5 h-3.5" />;
      case 'visit': return <User className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-[58px] px-4 border-b border-slate-100 bg-slate-50/30 flex items-center">
        <div className="flex items-center justify-between gap-3 relative w-full">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5 min-w-0">
            <span className="relative w-8 h-8 rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-100 flex items-center justify-center shrink-0">
              <Headset className="w-5 h-5" />
              <Sparkles className="absolute -right-1 -top-1 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </span>
            <span className="truncate">AI 상담보조</span>
            <span className="text-[11px] font-black text-brand-600 uppercase tracking-widest whitespace-nowrap">SentiCore Assist</span>
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleNotification}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all relative"
              title="운영 알림"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button
              onClick={onOpenAdmin}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
              title="관리자 설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          {isNotificationOpen && (
            <div className="absolute right-0 top-9 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <p className="text-sm font-black text-slate-900">운영 알림</p>
                <p className="text-[11px] font-bold text-slate-500">관리팀 검토가 필요한 데모 알림입니다.</p>
              </div>
              <button
                onClick={onOpenAdmin}
                className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
              >
                <p className="text-xs font-black text-slate-900">매뉴얼/응대 톤 정책</p>
                <p className="mt-1 text-[11px] font-bold text-slate-500">관리자 설정에서 수정 가능</p>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
      <div className="h-full overflow-y-auto p-5 pr-3 space-y-5 scrollbar-thin">
        <div className="h-[88px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm overflow-hidden">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-black text-slate-600">최근 접촉 {history.length}건</p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {(['call', 'sms', 'dm', 'email', 'visit'] as const).map((channel) => {
              const canConfigureChannel = channel !== 'visit';
              const isBlocked = canConfigureChannel && customer.blockedChannels.includes(channel);
              const isPreferred = canConfigureChannel && customer.preferredChannels.includes(channel);
              const count = contactCounts[channel] || 0;
              return (
                <div
                  key={channel}
                  className={cn(
                    'h-10 rounded-lg border px-1.5 py-1.5 text-center overflow-hidden',
                    isBlocked
                      ? 'bg-slate-50 text-slate-400 border-slate-200'
                      : isPreferred
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-white text-slate-400 border-slate-200'
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className={cn(
                    'w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0',
                    isBlocked
                      ? 'bg-white border-slate-300 text-slate-300'
                      : isPreferred
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-300 text-slate-300'
                  )}>
                    {isBlocked ? <X className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                  </span>
                    <span className="text-[10px] font-black truncate">{contactChannelLabel(channel)}</span>
                  </div>
                  <p className="mt-1 text-sm font-black tabular-nums leading-none">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
        {history.map((item, i) => (
          <div key={item.id} className="relative flex gap-4 group">
            {i !== history.length - 1 && (
              <div className="absolute left-[15.5px] top-8 bottom-[-32px] w-0.5 bg-slate-100 group-hover:bg-brand-100 transition-colors" />
            )}
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all duration-300 shadow-sm border border-white",
              item.type === 'call' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
              item.type === 'sms' || item.type === 'dm' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
              item.type === 'visit' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" :
              "bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white"
            )}>
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">{item.author}</span>
                  <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
                    {contactChannelLabel(item.type)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:border-brand-100 group-hover:bg-brand-50/30 transition-all">
                <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors font-medium">
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-2 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <button className="w-full py-3 bg-white border border-slate-200 text-[11px] text-slate-600 font-black uppercase tracking-widest hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 rounded-xl transition-all shadow-sm">
          전체 히스토리 조회
        </button>
      </div>
    </div>
  );
}

function contactChannelLabel(channel: string) {
  if (channel === 'call') return '전화';
  if (channel === 'sms') return '문자';
  if (channel === 'dm') return 'DM';
  if (channel === 'visit') return '방문';
  return '이메일';
}
