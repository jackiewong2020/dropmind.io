import React from 'react';
import { Check, Loader2, Search, Edit3, Triangle, Palette, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ProcessingModal({ step, category }: { step: number, category?: string }) {
  if (step === 0) return null;

  const steps = [
    { id: 1, icon: Search, text: "正在分析内容结构..." },
    { id: 2, icon: Edit3, text: "正在提取核心信息..." },
    { id: 3, icon: Triangle, text: "正在智能分类与打标..." },
    { id: 4, icon: Palette, text: "正在格式化输出..." },
    { id: 5, icon: Save, text: category ? `正在保存到${category}...` : "正在保存..." },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border-4 border-zinc-400/20 dark:border-zinc-700/20"
      >
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-10">处理中...</h2>
        <div className="space-y-8">
          {steps.map((s) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            const isPending = step < s.id;

            return (
              <div key={s.id} className={`flex items-center gap-4 transition-opacity duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700" />
                  )}
                </div>
                <div className={`flex items-center gap-2 text-lg font-medium ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  <s.icon className="w-5 h-5" />
                  <span>{s.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
