import React, { useState } from 'react';
import { X, User, ChevronRight, Sun, Moon, Settings, Globe, Brain, Cloud, Keyboard, Database, LogOut, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Section = 'general' | 'ai' | 'sync' | 'data';

export function SettingsModal({ 
  isOpen, 
  onClose,
  theme,
  setTheme,
  language,
  setLanguage,
  aiModel,
  setAiModel,
  dropsCount,
  todosCount,
  onExportData,
  onImportData,
  onClearData
}: { 
  isOpen: boolean, 
  onClose: () => void,
  theme: 'light' | 'dark',
  setTheme: (theme: 'light' | 'dark') => void,
  language: 'zh' | 'en',
  setLanguage: (lang: 'zh' | 'en') => void,
  aiModel: 'gemini-3.1' | 'kimi',
  setAiModel: (model: 'gemini-3.1' | 'kimi') => void,
  dropsCount: number,
  todosCount: number,
  onExportData: () => void,
  onImportData: () => void,
  onClearData: () => void
}) {
  const [activeTab, setActiveTab] = useState<Section>('general');

  const tabs = [
    { id: 'general', label: '常规', icon: Settings },
    { id: 'ai', label: 'AI 配置', icon: Brain },
    { id: 'sync', label: '同步', icon: Cloud },
    { id: 'data', label: '数据', icon: Database },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex h-[600px]"
          >
            {/* Sidebar */}
            <div className="w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 p-6 flex flex-col">
              <div className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-8 px-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                设置
              </div>

              <nav className="flex-1 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Section)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Pro 会员</span>
                  </div>
                  <p className="text-xs opacity-90 mb-3 leading-relaxed">解锁无限 AI 额度与多端同步</p>
                  <button className="w-full bg-white text-indigo-600 py-2 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-colors">
                    立即续费
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'general' && (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <User className="w-4 h-4" />
                        个人账户
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                              J
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                jackie
                                <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-black">Pro</span>
                              </div>
                              <div className="text-sm text-zinc-500 dark:text-zinc-400">jackie@example.com</div>
                            </div>
                          </div>
                          <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">编辑资料</button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500 dark:text-zinc-400">账号安全</span>
                            <button className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-medium">
                              修改密码 <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <Sun className="w-4 h-4" />
                        偏好设置
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">深色模式</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">根据喜好切换视觉风格</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                              <Globe className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">语言设置</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">选择界面显示语言</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                            className="bg-white dark:bg-zinc-800 px-4 py-1.5 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 shadow-sm"
                          >
                            {language === 'zh' ? '简体中文' : 'English'}
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <Brain className="w-4 h-4" />
                        模型配置
                      </div>
                      <div className="space-y-4">
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">默认 AI 模型</label>
                          <div className="grid grid-cols-2 gap-3">
                            {['gemini-3.1', 'kimi'].map((model) => (
                              <button
                                key={model}
                                onClick={() => setAiModel(model as any)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                  aiModel === model 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                    : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700'
                                }`}
                              >
                                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                                  {model === 'gemini-3.1' ? 'Gemini 3.1 Pro' : 'Kimi (Moonshot)'}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {model === 'gemini-3.1' ? '最强多模态理解能力' : '中文语境极致优化'}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">自定义 API Key</label>
                            <span className="text-[10px] font-black text-zinc-400 uppercase">可选</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="password" 
                              placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-900 dark:text-zinc-100"
                            />
                            <button className="absolute right-3 top-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">保存</button>
                          </div>
                          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            配置自己的 API Key 后，将不再消耗 DropMind 的公共额度。
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'sync' && (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <Cloud className="w-4 h-4" />
                        云端同步
                      </div>
                      <div className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-center">
                        <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl mx-auto flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
                          <Cloud className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">连接坚果云</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs mx-auto">
                          将你的笔记自动同步到坚果云，实现多端数据一致与永久备份。
                        </p>
                        
                        <div className="space-y-4 text-left max-w-sm mx-auto">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">坚果云账号</label>
                            <input type="text" placeholder="your@email.com" className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1">应用密码</label>
                            <input type="password" placeholder="••••••••••••" className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100" />
                          </div>
                          <button className="w-full bg-indigo-500 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4">
                            验证并开启同步
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <Database className="w-4 h-4" />
                        数据统计
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">知识库条目</div>
                          <div className="text-3xl font-light text-zinc-900 dark:text-zinc-100 tracking-tighter">{dropsCount}</div>
                        </div>
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">待办事项</div>
                          <div className="text-3xl font-light text-zinc-900 dark:text-zinc-100 tracking-tighter">{todosCount}</div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" />
                        隐私与安全
                      </div>
                      <div className="space-y-3">
                        <button 
                          onClick={onExportData}
                          className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                              <Database className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">导出备份</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">下载所有数据的 JSON 文件</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-400" />
                        </button>

                        <button 
                          onClick={onImportData}
                          className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                              <Cloud className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">导入数据</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">从 JSON 文件恢复数据</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-400" />
                        </button>

                        <button 
                          onClick={onClearData}
                          className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg">
                              <LogOut className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-bold text-red-600">清空数据</div>
                              <div className="text-xs text-red-400">永久删除所有本地笔记与设置</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                  DropMind v2.4.0 • Build 20240328
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
