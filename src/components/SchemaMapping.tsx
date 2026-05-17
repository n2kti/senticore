import React, { useState } from 'react';
import { Database, Upload, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function SchemaMapping() {
  const [isOpen, setIsOpen] = useState(false);
  const [ddl, setDdl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [mappings, setMappings] = useState<any[] | null>(null);

  const handleAnalyze = () => {
    if (!ddl.trim()) return;
    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setMappings([
        { original: 'cust_no', internal: 'customer_id', confidence: 'high' },
        { original: 'cust_nm', internal: 'customer_name', confidence: 'high' },
        { original: 'ovd_day', internal: 'overdue_days', confidence: 'high' },
        { original: 'loan_bal', internal: 'loan_amount', confidence: 'medium' },
        { original: 'repay_amt', internal: 'paid_amount', confidence: 'medium' },
        { original: 'FIELD_001', internal: 'unknown', confidence: 'low' },
      ]);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-all shadow-sm"
      >
        <Database className="w-4 h-4" />
        DB 스키마 매핑
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Database className="w-6 h-6 text-brand-500" />
                  기존 시스템 DB 스키마 자동 매핑
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {!mappings ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700">DDL 또는 스키마 정보 입력</label>
                      <span className="text-[10px] text-slate-400 font-medium">Phase 1: DDL 붙여넣기 지원</span>
                    </div>
                    <textarea
                      value={ddl}
                      onChange={(e) => setDdl(e.target.value)}
                      placeholder="CREATE TABLE TB_CUST_MAST (..."
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                    />
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing || !ddl.trim()}
                      className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {analyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      AI 스키마 분석 및 자동 매핑 시작
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm text-emerald-800 font-medium">AI 분석이 완료되었습니다. 매핑 결과를 확인해 주세요.</span>
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="px-4 py-3">기존 컬럼명</th>
                            <th className="px-4 py-3">내부 표준 필드</th>
                            <th className="px-4 py-3">신뢰도</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mappings.map((m, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs text-slate-700">{m.original}</td>
                              <td className="px-4 py-3">
                                <select 
                                  defaultValue={m.internal}
                                  className="bg-transparent border-none text-xs font-medium text-brand-600 focus:ring-0 cursor-pointer"
                                >
                                  <option value="customer_id">customer_id</option>
                                  <option value="customer_name">customer_name</option>
                                  <option value="overdue_days">overdue_days</option>
                                  <option value="loan_amount">loan_amount</option>
                                  <option value="paid_amount">paid_amount</option>
                                  <option value="unknown">수동 선택</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                  m.confidence === 'high' ? "bg-emerald-100 text-emerald-700" :
                                  m.confidence === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                )}>
                                  {m.confidence === 'high' ? '높음' : m.confidence === 'medium' ? '중간' : '낮음'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setMappings(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                      >
                        다시 분석
                      </button>
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all"
                      >
                        매핑 저장 및 적용
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
