import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, RefreshCw, CheckCircle2, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { classifyIntentAndDraft, generateSuggestedQuestions } from '../services/geminiService';
import { ContactChannel, ContactHistory, CounselingManual, Customer, PaymentHistory, TonePolicy } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { buildGuidance } from '../manuals';
import { DEMO_INPUT_PROMPTS_BY_CUSTOMER, SUGGESTED_QUESTIONS_BY_CUSTOMER } from '../constants';

interface AICounselingProps {
  customer: Customer;
  manuals: CounselingManual[];
  tonePolicies: TonePolicy[];
  paymentHistory: PaymentHistory[];
  contactHistory: ContactHistory[];
  behaviorLabel: string;
  responseLabel: string;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  isTyping?: boolean;
  startedAt?: number;
};

export default function AICounseling({
  customer,
  manuals,
  tonePolicies,
  paymentHistory,
  contactHistory,
  behaviorLabel,
  responseLabel,
}: AICounselingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const channel: ContactChannel = 'call';
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith('senticore.aiDraft.')) {
        window.sessionStorage.removeItem(key);
      }
    }
  }, []);

  useEffect(() => {
    refreshSuggestedQuestions();
    setInput(DEMO_INPUT_PROMPTS_BY_CUSTOMER[customer.id] || '');
    setMessages([]);
  }, [customer.id, customer.overdueDays, customer.name, customer.loanAmount, customer.riskLevel]);

  async function refreshSuggestedQuestions() {
    setLoadingQuestions(true);
    try {
      const questions = await generateSuggestedQuestions(customer.name, customer.overdueDays, customer.loanAmount, customer.riskLevel);
      setSuggestedQuestions(questions.length ? questions : SUGGESTED_QUESTIONS_BY_CUSTOMER[customer.id] || defaultSuggestedQuestions(customer));
    } catch (error) {
      setSuggestedQuestions(SUGGESTED_QUESTIONS_BY_CUSTOMER[customer.id] || defaultSuggestedQuestions(customer));
    } finally {
      setLoadingQuestions(false);
    }
  }

  const resetConversation = () => {
    setInput(DEMO_INPUT_PROMPTS_BY_CUSTOMER[customer.id] || '');
    setMessages([]);
  };

  const handleSubmit = async (text: string, options?: { resetThread?: boolean }) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(options?.resetThread ? [userMessage] : prev => [...prev, userMessage]);
    setInput('');

    setLoading(true);

    const typingMessage: Message = { id: 'typing', role: 'assistant', content: '', isTyping: true, startedAt: Date.now() };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const guidance = buildGuidance(manuals, tonePolicies, customer, paymentHistory, contactHistory, text);
      const data = await classifyIntentAndDraft(customer.name, customer.overdueDays, text, channel, guidance, {
        behaviorLabel,
        responseLabel,
      });
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
        data: data
      }]);
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      const message = error instanceof Error ? error.message : 'LLM_REQUEST_FAILED';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `AI 호출에 실패했습니다.\n\n${message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDraft = async (messageId: string, draft: string) => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopiedDraftId(messageId);
      window.setTimeout(() => setCopiedDraftId((current) => (current === messageId ? null : current)), 1600);
    } catch (error) {
      setCopiedDraftId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-20">
      {/* Header */}
      <div className="h-[58px] flex items-center justify-between gap-3 px-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-100">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">AI스크립트</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <span className="rounded-md bg-brand-50 border border-brand-100 px-1.5 py-0.5 text-[10px] font-black text-brand-700 whitespace-nowrap">
            {behaviorLabel}
          </span>
          <span className="max-w-[130px] rounded-md bg-red-50 border border-red-100 px-1.5 py-0.5 text-[10px] font-black text-red-700 whitespace-nowrap truncate">
            {responseLabel}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-slate-50/30">
        <div className="sticky top-0 z-10 -mx-1 h-[88px] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="text-[11px] font-black text-slate-600 tracking-wide truncate">예상 질문</span>
              {loadingQuestions && <RefreshCw className="w-3 h-3 text-slate-400 animate-spin ml-1 shrink-0" />}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={refreshSuggestedQuestions}
                disabled={loadingQuestions}
                className="h-6 px-2 rounded-md border border-slate-200 bg-white text-[10px] font-black text-slate-500 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50"
                title="예상 질문 새로고침"
              >
                새로고침
              </button>
              <button
                onClick={resetConversation}
                className="h-6 px-2 rounded-md border border-slate-200 bg-white text-[10px] font-black text-slate-500 hover:text-slate-800"
                title="대화 초기화"
              >
                초기화
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(q, { resetThread: true })}
                disabled={loadingQuestions || loading}
                className="h-8 px-2 bg-slate-50 border border-brand-100/60 rounded-md text-[11px] font-bold text-slate-700 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all text-center leading-tight line-clamp-2 disabled:opacity-50"
                title={q}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className="w-full"
            >
              <div className="flex gap-3">
                <div className="shrink-0 pt-0.5">
                  {msg.role === 'user' ? (
                    <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-brand-600" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                {msg.isTyping ? (
                  <ScriptGenerationLoader startedAt={msg.startedAt} />
                ) : (
                  <>
                    {msg.content && (
                      msg.role === 'user' ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="mb-1.5 text-[11px] font-black text-slate-500">상담원 입력</div>
                          <div className="whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-slate-800">{msg.content}</div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <div className="mb-1.5 text-[11px] font-black text-brand-700">AI 답변</div>
                          <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800">
                            {msg.content}
                          </div>
                        </div>
                      )
                    )}

                    {msg.data && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="w-full flex flex-col gap-2"
                      >
                        <div className="rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-sm">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[11px] font-black text-brand-700">AI 답변</span>
                              <span className="min-w-0 truncate rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-800">
                                {msg.data.intent}
                              </span>
                              {msg.data.provider && msg.data.provider !== "fallback" && (
                                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black tabular-nums text-slate-600">
                                  {formatProvider(msg.data.provider, msg.data.model)} · {formatElapsed(msg.data.elapsedMs)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleCopyDraft(msg.id, msg.data.draft)}
                              className="shrink-0 rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-400 hover:text-brand-600"
                              title="초안 복사"
                            >
                              {copiedDraftId === msg.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <DraftTypewriter text={formatScriptParagraphs(compactScript(msg.data.draft))} onProgress={scrollToBottom} />
                        </div>

                      </motion.div>
                    )}
                  </>
                )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="relative flex items-end gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="고객 질문 또는 상담 내용을 입력하세요."
            className="flex-1 max-h-56 min-h-[96px] bg-transparent text-[13px] px-2 py-2 focus:outline-none resize-y scrollbar-hide font-medium leading-relaxed"
            rows={4}
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={loading || !input.trim()}
            className="w-11 h-11 shrink-0 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[9px] font-bold text-slate-400">AI-generated content may be inaccurate.</span>
        </div>
      </div>
    </div>
  );
}

function HighlightedDraft({ text, compact = false }: { text: string; compact?: boolean }) {
  const pattern = /(법적\s?조치|기한이익상실|기한상실|확인\s?후\s?안내|문자|DM|전화|이메일|분할납부|부분납부|새출발기금|채무조정|압박|민원|납부일|가능\s?금액|내부\s?검토|확정)/g;
  const keywordPattern = new RegExp(pattern.source);
  const parts = text.split(pattern).filter(Boolean);

  return (
    <div className={cn(
      "whitespace-pre-wrap text-slate-900 font-medium leading-relaxed",
      compact ? "min-h-[82px] pr-2 text-[15px]" : "text-[16px]"
    )}>
      {parts.map((part, index) => {
        if (!keywordPattern.test(part)) return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
        return (
          <mark key={`${part}-${index}`} className="rounded bg-brand-50 px-1 py-0.5 font-semibold text-brand-800">
            {part}
          </mark>
        );
      })}
    </div>
  );
}

function DraftTypewriter({ text, onProgress }: { text: string; onProgress?: () => void }) {
  const [visibleText, setVisibleText] = useState('');
  const [done, setDone] = useState(false);
  const reservedHeight = Math.min(220, Math.max(96, Math.ceil(text.length / 42) * 25 + 10));

  useEffect(() => {
    setVisibleText('');
    setDone(false);
    let index = 0;
    const step = Math.max(1, Math.ceil(text.length / 90));

    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setVisibleText(text.slice(0, index));
      onProgress?.();

      if (index >= text.length) {
        window.clearInterval(timer);
        setDone(true);
      }
    }, 34);

    return () => window.clearInterval(timer);
  }, [text, onProgress]);

  return (
    <div className="relative" style={{ minHeight: reservedHeight }}>
      <HighlightedDraft text={visibleText} compact />
      {!done && (
        <span className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-full bg-brand-500 align-middle" />
      )}
    </div>
  );
}

function ScriptGenerationLoader({ startedAt }: { startedAt?: number }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const started = startedAt || Date.now();
    const updateElapsed = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 500);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return (
    <div className="w-[320px] max-w-full overflow-hidden rounded-2xl rounded-tl-sm border border-brand-100 bg-white shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-7 h-7 shrink-0 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 leading-tight">AI 호출 중</p>
              <p className="text-[10px] font-bold text-slate-500 leading-tight">전략과 준법 문구를 반영하는 중</p>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-black tabular-nums text-slate-500">
            {elapsedSeconds}s
          </span>
        </div>

        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-brand-400 via-brand-600 to-red-500"
            animate={{ x: ['-120%', '320%'] }}
            transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {['전략 반영', '준법 점검', '초안 정리'].map((label, index) => (
            <div key={label} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-brand-500"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.2 }}
              />
              <span className="min-w-0 truncate text-[10px] font-black text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function compactScript(draft: string) {
  return draft
    .replace(/\(상세 내용은 전화 요망\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatScriptParagraphs(draft: string) {
  const cleaned = compactScript(draft);
  if (cleaned.includes('\n\n')) return cleaned;

  const sentences = cleaned
    .split(/(?<=[.!?。]|[다요죠니다세요습니다]\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length < 3) return cleaned;
  const splitIndex = Math.ceil(sentences.length / 2);
  return `${sentences.slice(0, splitIndex).join(' ')}\n\n${sentences.slice(splitIndex).join(' ')}`;
}

function formatProvider(provider?: string, model?: string) {
  if (provider === 'ollama') return model ? `Ollama ${model}` : 'Ollama';
  if (provider === 'gemini' || provider === 'google') return model ? `Gemini ${model}` : 'Gemini';
  return 'Fallback';
}

function formatElapsed(elapsedMs?: number) {
  if (!elapsedMs) return '즉시';
  if (elapsedMs < 1000) return `${elapsedMs}ms`;
  return `${(elapsedMs / 1000).toFixed(1)}s`;
}

function defaultSuggestedQuestions(customer: Customer) {
  if (customer.step >= 5) return ['기한상실 안내', '법적 절차 확인', '문자 고지 문안', '승인 기준 확인'];
  if (customer.step >= 4) return ['채무조정 진행 확인', '서면 안내 문안', '다음 조치 일정', '민원 표현 완충'];
  if (customer.step >= 3) return ['분할 납부 협의', '납부 예정일 확인', '내용증명 전 안내', '상환 계획서 요청'];
  if (customer.step >= 2) return ['지연 사유 확인', '급여일 후 납부 약속', '계좌 변경 확인', '부분 납부 가능액'];
  return ['다음 납부일 안내', '자동이체 확인', '감사 문자 작성', '계좌 안내'];
}
