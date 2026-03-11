import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Brain, Archive, CheckCircle2, 
  Briefcase, PenTool, Code, BookOpen, Sparkles, CornerDownLeft, 
  Calendar, Clock, Tag, Loader2, Volume2, Plus, Search, Settings, Trash2, XCircle, ArrowRight, PlayCircle, Check, X, Github, Camera, FileText, Music, Clapperboard, Paperclip, Bookmark, Youtube, Lightbulb, Pin, PinOff, CheckSquare, Copy, Globe, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processDropText, ProcessedDrop } from './services/ai';
import { SettingsModal } from './components/SettingsModal';
import { ProcessingModal } from './components/ProcessingModal';
import { ArticleCard } from './components/ArticleCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Types ---
interface DropItem extends ProcessedDrop {
  id: string;
  rawText: string;
  createdAt: number;
  status?: 'pending' | 'completed';
  isPinned?: boolean;
}

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dropmind_theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [language, setLanguage] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem('dropmind_language');
    return (saved as 'zh' | 'en') || 'zh';
  });
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>(() => {
    return (localStorage.getItem('dropmind_fontFamily') as 'sans' | 'serif' | 'mono') || 'sans';
  });
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>(() => {
    return (localStorage.getItem('dropmind_fontSize') as 'sm' | 'base' | 'lg') || 'base';
  });

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dropmind_theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('dropmind_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dropmind_fontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('dropmind_fontSize', fontSize);
  }, [fontSize]);
  
  return view === 'landing' ? (
    <LandingPage onEnter={() => setView('app')} theme={theme} />
  ) : (
    <AppInterface 
      onBack={() => setView('landing')} 
      theme={theme} 
      setTheme={setTheme}
      language={language}
      setLanguage={setLanguage}
      fontFamily={fontFamily}
      setFontFamily={setFontFamily}
      fontSize={fontSize}
      setFontSize={setFontSize}
    />
  );
}

function AppInterface({ onBack, theme, setTheme, language, setLanguage, fontFamily, setFontFamily, fontSize, setFontSize }: { 
  onBack: () => void, 
  theme: 'light' | 'dark', 
  setTheme: (t: 'light' | 'dark') => void,
  language: 'zh' | 'en',
  setLanguage: (l: 'zh' | 'en') => void,
  fontFamily: 'sans' | 'serif' | 'mono',
  setFontFamily: (f: 'sans' | 'serif' | 'mono') => void,
  fontSize: 'sm' | 'base' | 'lg',
  setFontSize: (s: 'sm' | 'base' | 'lg') => void
}) {
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [todoFilter, setTodoFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiModel, setAiModel] = useState<'gemini-3.1' | 'kimi'>('gemini-3.1');

  const [processingCategory, setProcessingCategory] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dropmind_data');
    if (saved) {
      try {
        setDrops(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved drops", e);
      }
    }
  }, []);

  // Save to localStorage when drops change
  useEffect(() => {
    localStorage.setItem('dropmind_data', JSON.stringify(drops));
  }, [drops]);

  const handleNewDrop = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setProcessingStep(1);
    setProcessingCategory('');
    
    // Simulate steps for processing modal
    const stepInterval = setInterval(() => {
      setProcessingStep(prev => prev < 4 ? prev + 1 : prev);
    }, 300);

    try {
      const processed = await processDropText(text, aiModel);
      clearInterval(stepInterval);

      let finalCategory = processed.category;
      if (text.length < 600 && finalCategory !== '待办' && finalCategory !== '工作' && finalCategory !== '书签') {
        finalCategory = '灵感';
      }

      setProcessingCategory(finalCategory);
      setProcessingStep(5);

      const newDrop: DropItem = {
        id: Date.now().toString(),
        rawText: text,
        createdAt: Date.now(),
        ...processed,
        category: finalCategory,
        status: finalCategory === '待办' ? 'pending' : undefined
      };
      
      await new Promise(r => setTimeout(r, 400)); // Show final step for a bit
      
      setDrops(prev => [newDrop, ...prev]);
    } catch (error) {
      clearInterval(stepInterval);
      alert("处理失败，请重试。");
    } finally {
      setIsProcessing(false);
      setProcessingStep(0);
      setProcessingCategory('');
    }
  };

  const handleDelete = (id: string) => {
    setDrops(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleTodo = (id: string) => {
    setDrops(prev => prev.map(d => {
      if (d.id === id && d.category === '待办') {
        return { ...d, status: d.status === 'completed' ? 'pending' : 'completed' };
      }
      return d;
    }));
  };

  const handleTogglePin = (id: string) => {
    setDrops(prev => prev.map(d => d.id === id ? { ...d, isPinned: !d.isPinned } : d));
  };

  const handleUpdateDrop = (id: string, newContent: string) => {
    setDrops(prev => prev.map(d => d.id === id ? { ...d, cleanText: newContent } : d));
  };

  const handleCategoryChange = (id: string, newCategory: string) => {
    setDrops(prev => prev.map(d => d.id === id ? { ...d, category: newCategory } : d));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(drops, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'dropmind_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedData)) {
            setDrops(importedData);
            alert('数据导入成功！');
          } else {
            alert('无效的数据格式。');
          }
        } catch (err) {
          alert('解析文件失败。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      setDrops([]);
      localStorage.removeItem('dropmind_data');
    }
  };

  let filteredDrops = activeCategory === '全部' 
    ? drops 
    : drops.filter(d => d.category === activeCategory);

  if (activeCategory === '待办') {
    if (todoFilter === 'pending') filteredDrops = filteredDrops.filter(d => d.status !== 'completed');
    if (todoFilter === 'completed') filteredDrops = filteredDrops.filter(d => d.status === 'completed');
  }

  filteredDrops.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (sortBy === 'newest') return b.createdAt - a.createdAt;
    return a.createdAt - b.createdAt;
  });

  const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const sizeClass = fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base';

  return (
    <div className={`flex h-screen w-full text-zinc-900 dark:text-zinc-100 ${fontClass} ${sizeClass} overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300`}>
      {!isFullscreen && (
        <Sidebar 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
          onBack={onBack}
          counts={{
            '全部': drops.length,
            '工作': drops.filter(d => d.category === '工作').length,
            '灵感': drops.filter(d => d.category === '灵感').length,
            '待办': drops.filter(d => d.category === '待办').length,
            '阅读': drops.filter(d => d.category === '阅读').length,
            '书签': drops.filter(d => d.category === '书签').length,
          }}
        />
      )}
      
      <div className={`flex-1 flex flex-col relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-3xl shadow-[-10px_0_40px_rgba(0,0,0,0.03)] dark:shadow-[-10px_0_40px_rgba(0,0,0,0.3)] border-l border-white/40 dark:border-zinc-700/40 overflow-hidden transition-all duration-300 ${isFullscreen ? 'rounded-none m-0' : 'rounded-l-[2.5rem] my-2 mr-2'}`}>
        {!isFullscreen && <TopNav onOpenSettings={() => setIsSettingsOpen(true)} />}
        
        <div className={`flex-1 flex flex-col mx-auto w-full overflow-hidden ${isFullscreen ? 'max-w-5xl px-12 pt-12 pb-8' : 'max-w-4xl px-8 pt-8 pb-4'}`}>
          {/* Input Area */}
          {!isFullscreen && <InputArea onDrop={handleNewDrop} isProcessing={isProcessing} />}
          
          {/* List Area */}
          <div className={`flex-1 overflow-y-auto pr-4 pb-20 custom-scrollbar ${isFullscreen ? 'mt-0' : 'mt-8'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{activeCategory}</h2>
                <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">{filteredDrops.length} 条记录</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors bg-zinc-100/80 dark:bg-zinc-800/80 rounded-xl"
                  title={isFullscreen ? "退出专注模式" : "专注模式 (隐藏侧边栏和输入框)"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                {activeCategory === '待办' && (
                  <div className="flex items-center bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl">
                    <button onClick={() => setTodoFilter('all')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${todoFilter === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>全部</button>
                    <button onClick={() => setTodoFilter('pending')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${todoFilter === 'pending' ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>未完成</button>
                    <button onClick={() => setTodoFilter('completed')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${todoFilter === 'completed' ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>已完成</button>
                  </div>
                )}
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-xs font-medium px-3 py-1.5 rounded-xl border-none outline-none cursor-pointer hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition-colors"
                >
                  <option value="newest">最新创建</option>
                  <option value="oldest">最早创建</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Show Article Card Demo in '阅读' category if empty, or just always show it for demo purposes */}
              {activeCategory === '阅读' && filteredDrops.length === 0 && (
                <ArticleCard />
              )}

              <AnimatePresence mode="popLayout">
                {filteredDrops.length === 0 && activeCategory !== '阅读' ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center py-20 text-zinc-400"
                  >
                    <Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>这里空空如也，试着空投一条思绪吧</p>
                  </motion.div>
                ) : (
                  filteredDrops.map(drop => (
                    drop.category === '阅读' ? (
                      <ArticleCard 
                        key={drop.id} 
                        drop={drop} 
                        onSave={(content) => handleUpdateDrop(drop.id, content)} 
                        onDelete={() => handleDelete(drop.id)} 
                        onCategoryChange={(cat) => handleCategoryChange(drop.id, cat)}
                      />
                    ) : (
                      <DropCard 
                        key={drop.id} 
                        drop={drop} 
                        onDelete={() => handleDelete(drop.id)} 
                        onToggleTodo={() => handleToggleTodo(drop.id)} 
                        onTogglePin={() => handleTogglePin(drop.id)}
                        onCategoryChange={(cat) => handleCategoryChange(drop.id, cat)}
                      />
                    )
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        aiModel={aiModel}
        setAiModel={setAiModel}
        dropsCount={drops.length}
        todosCount={drops.filter(d => d.category === '待办').length}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearData={handleClearData}
      />
      <ProcessingModal step={processingStep} category={processingCategory} />
    </div>
  );
}

// --- App Interface Components ---

function Sidebar({ activeCategory, setActiveCategory, counts, onBack }: any) {
  const categories = [
    { name: '全部', icon: <Archive className="w-4 h-4" /> },
    { name: '工作', icon: <Briefcase className="w-4 h-4" /> },
    { name: '灵感', icon: <Brain className="w-4 h-4" /> },
    { name: '待办', icon: <CheckCircle2 className="w-4 h-4" /> },
    { name: '阅读', icon: <BookOpen className="w-4 h-4" /> },
    { name: '书签', icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <div className="w-64 flex flex-col bg-transparent py-6">
      <div 
        onClick={onBack}
        className="px-8 mb-8 flex items-center gap-2.5 font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Sparkles className="w-6 h-6 text-indigo-500" />
        <span>DropMind</span>
      </div>

      <div className="px-4 space-y-1">
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ${
              activeCategory === cat.name 
                ? 'bg-white dark:bg-zinc-800 shadow-sm border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              {cat.icon}
              <span>{cat.name}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.name ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400'}`}>
              {counts[cat.name]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TopNav({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="h-20 flex items-center justify-end px-10 w-full shrink-0">
      <div className="flex items-center gap-2">
        <button className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-full transition-all">
          <Search className="w-5 h-5" />
        </button>
        <button onClick={onOpenSettings} className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-full transition-all">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function InputArea({ onDrop, isProcessing }: { onDrop: (text: string) => void, isProcessing: boolean }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showYoutubeOptions, setShowYoutubeOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  const recognitionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SKILLS = [
    { id: 'translate', icon: Globe, label: '翻译', prompt: '请将以下内容翻译成中文：\n' },
    { id: 'summarize', icon: FileText, label: '总结', prompt: '请总结以下内容的核心要点：\n' },
    { id: 'extract_todo', icon: CheckSquare, label: '提取待办', prompt: '请从以下内容中提取具体的待办事项：\n' },
    { id: 'polish', icon: Sparkles, label: '润色', prompt: '请帮我润色以下文字，使其更加专业流畅：\n' },
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    
    const lastSlashIndex = val.lastIndexOf('/');
    if (lastSlashIndex !== -1 && lastSlashIndex === val.length - 1) {
      setShowSkillMenu(true);
      setSkillFilter('');
    } else if (showSkillMenu && lastSlashIndex !== -1) {
      setSkillFilter(val.substring(lastSlashIndex + 1));
    } else {
      setShowSkillMenu(false);
    }
  };

  const insertSkill = (skillPrompt: string) => {
    const lastSlashIndex = text.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      const newText = text.substring(0, lastSlashIndex) + skillPrompt;
      setText(newText);
    }
    setShowSkillMenu(false);
  };

  const handleSubmit = (mode?: 'link' | 'notes') => {
    if (!text.trim() || isProcessing) return;

    const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(text.trim());
    
    if (isYoutube && !mode) {
      setShowYoutubeOptions(true);
      return;
    }

    let finalSubmitText = text;
    if (mode === 'notes') {
      finalSubmitText = `请帮我把这个视频链接写成详细的学习笔记：\n${text}`;
    } else if (mode === 'link') {
      finalSubmitText = `保存这个链接：\n${text}`;
    }

    onDrop(finalSubmitText);
    setText('');
    setShowYoutubeOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setText(prev => prev + (prev ? '\n' : '') + event.target!.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setText(prev => prev + (prev ? '\n' : '') + event.target!.result);
            }
          };
          reader.readAsText(file);
        }
      }
    }
  };

  const handleTryItOut = (type: string) => {
    if (isTyping) return;
    
    let sampleText = '';
    if (type === 'bookmark') sampleText = 'https://github.com/facebook/react 这个库太棒了，值得学习';
    if (type === 'youtube') sampleText = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ 这首歌太经典了，一定要保存下来';
    if (type === 'inspiration') sampleText = '突然想到一个点子：把所有的笔记都变成卡片，然后用AI自动连线，形成知识图谱。';
    if (type === 'article') sampleText = '这是一篇长文章的开头...\n\n今天我们来讨论一下如何提高工作效率。首先，你需要一个好的工具。其次，你需要专注。最后，你需要休息。';
    if (type === 'todo') sampleText = '明天下午3点召开周会，记得准备好上周的数据报表。';
    
    setText('');
    setIsTyping(true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    let i = 0;
    const typeChar = () => {
      if (i < sampleText.length) {
        setText(sampleText.substring(0, i + 1));
        i++;
        typingTimeoutRef.current = setTimeout(typeChar, 30); // 30ms per character
      } else {
        setIsTyping(false);
      }
    };
    
    typeChar();
  };

  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音识别。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setText(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  return (
    <div className="shrink-0">
      <div className="group relative">
        <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-10 transition duration-500 ${isProcessing ? 'opacity-40 animate-pulse' : 'group-focus-within:opacity-30'}`} />
        <div 
          className="relative bg-white dark:bg-zinc-800 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-700 p-3 transition-all duration-300"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
        {showSkillMenu && (
          <div className="absolute bottom-full left-4 mb-2 w-64 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden z-[100]">
            <div className="p-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-700">
              快速指令
            </div>
            <div className="p-1 max-h-64 overflow-y-auto">
              {SKILLS.filter(s => {
                const filter = skillFilter.trim().toLowerCase();
                return !filter || s.label.toLowerCase().includes(filter) || s.id.toLowerCase().includes(filter);
              }).map(skill => (
                <button
                  key={skill.id}
                  onClick={() => insertSkill(skill.prompt)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors text-left"
                >
                  <skill.icon className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium">{skill.label}</span>
                </button>
              ))}
              {SKILLS.filter(s => {
                const filter = skillFilter.trim().toLowerCase();
                return !filter || s.label.toLowerCase().includes(filter) || s.id.toLowerCase().includes(filter);
              }).length === 0 && (
                <div className="px-3 py-2 text-sm text-zinc-500 text-center">无匹配指令</div>
              )}
            </div>
          </div>
        )}
        <textarea 
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="把语无伦次的想法扔进来，AI 帮你整理... (支持拖拽或粘贴文件)"
          disabled={isProcessing}
          className="w-full h-32 resize-none bg-transparent p-4 text-lg focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 font-medium disabled:opacity-50 text-zinc-800 dark:text-zinc-100"
        />
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
            <button 
              onClick={toggleVoice}
              className={`p-2.5 rounded-xl transition-all duration-200 ${isRecording ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              title="语音输入"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-all duration-200" title="上传图片"><Camera className="w-5 h-5" /></button>
            <button className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-all duration-200" title="添加附件"><Paperclip className="w-5 h-5" /></button>
          </div>
          <button 
            onClick={() => handleSubmit()}
            disabled={!text.trim() || isProcessing}
            className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-2xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-2 font-bold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>处理中...</span>
              </>
            ) : (
              <>
                <span>空投</span>
                <CornerDownLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        
        {showYoutubeOptions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-4 right-0 bg-white dark:bg-zinc-800 shadow-xl border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 flex flex-col gap-2 z-10 w-64"
          >
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" /> 检测到 YouTube 链接
            </div>
            <button onClick={() => handleSubmit('link')} className="text-left px-3 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
              仅保存链接 (书签)
            </button>
            <button onClick={() => handleSubmit('notes')} className="text-left px-3 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
              写成学习笔记 (长文)
            </button>
            <button onClick={() => setShowYoutubeOptions(false)} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
      </div>
      
      {/* Quick Actions Demo */}
      <div className="relative z-10 mt-4 flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap pl-2">试试看：</span>
        <button onClick={() => handleTryItOut('todo')} disabled={isTyping} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm transition-all whitespace-nowrap disabled:opacity-50">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> 待办事项
        </button>
        <button onClick={() => handleTryItOut('bookmark')} disabled={isTyping} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm transition-all whitespace-nowrap disabled:opacity-50">
          <Bookmark className="w-3.5 h-3.5 text-blue-500" /> 收藏书签
        </button>
        <button onClick={() => handleTryItOut('youtube')} disabled={isTyping} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm transition-all whitespace-nowrap disabled:opacity-50">
          <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube 视频
        </button>
        <button onClick={() => handleTryItOut('inspiration')} disabled={isTyping} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm transition-all whitespace-nowrap disabled:opacity-50">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 一段灵感
        </button>
        <button onClick={() => handleTryItOut('article')} disabled={isTyping} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-sm transition-all whitespace-nowrap disabled:opacity-50">
          <FileText className="w-3.5 h-3.5 text-emerald-500" /> 一篇文章
        </button>
      </div>
    </div>
  );
}

function DropCard({ drop, onDelete, onToggleTodo, onTogglePin, onCategoryChange }: { drop: DropItem, onDelete: () => void, onToggleTodo: () => void, onTogglePin: () => void, onCategoryChange?: (category: string) => void }) {
  const categoryColors: Record<string, string> = {
    '工作': 'bg-blue-50 text-blue-600 border-blue-100',
    '灵感': 'bg-purple-50 text-purple-600 border-purple-100',
    '待办': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    '阅读': 'bg-orange-50 text-orange-600 border-orange-100',
    '书签': 'bg-pink-50 text-pink-600 border-pink-100',
  };

  const handlePlayVoice = () => {
    const utterance = new SpeechSynthesisUtterance(drop.cleanText);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(drop.cleanText);
    // Optional: show a toast or feedback
  };

  const isTodoCompleted = drop.category === '待办' && drop.status === 'completed';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`group bg-white dark:bg-zinc-900 border ${drop.isPinned ? 'border-amber-300 dark:border-amber-500/50 shadow-amber-500/10' : 'border-zinc-100 dark:border-zinc-800'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${isTodoCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 flex items-start gap-3">
          {drop.category === '待办' && (
            <button 
              onClick={onToggleTodo}
              className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isTodoCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 text-transparent hover:text-emerald-100'}`}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <div>
            {drop.title && (
              <div className="flex items-center gap-2 mb-3">
                {drop.isPinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />}
                <h3 className={`text-lg font-bold ${isTodoCompleted ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{drop.title}</h3>
              </div>
            )}
            <div className={`text-[15px] text-zinc-800 dark:text-zinc-200 font-medium leading-[1.8] whitespace-pre-wrap ${isTodoCompleted ? 'line-through text-zinc-500' : ''}`}>
              {drop.cleanText}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onTogglePin} className={`p-2 rounded-lg transition-colors ${drop.isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40' : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`} title={drop.isPinned ? "取消置顶" : "置顶"}>
            {drop.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
          <button onClick={handleCopy} className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="复制内容">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handlePlayVoice} className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="朗读">
            <Volume2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="删除">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center flex-wrap gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <select 
          value={drop.category} 
          onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
          className={`px-2.5 py-1 rounded-md text-xs font-bold border outline-none cursor-pointer ${categoryColors[drop.category] || 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}
        >
          <option value="阅读">阅读</option>
          <option value="工作">工作</option>
          <option value="灵感">灵感</option>
          <option value="待办">待办</option>
          <option value="书签">书签</option>
        </select>
        
        {drop.scheduledTime && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-medium border border-emerald-100/50 dark:border-emerald-900/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>{drop.scheduledTime}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {drop.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(drop.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      
      {/* Raw Text Toggle */}
      <details className="mt-3 group/details">
        <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 select-none list-none flex items-center gap-1">
          <span className="group-open/details:hidden">查看原始输入</span>
          <span className="hidden group-open/details:inline">收起原始输入</span>
        </summary>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 italic">
          "{drop.rawText}"
        </p>
      </details>
    </motion.div>
  );
}

// --- Landing Page Components ---

function LandingPage({ onEnter, theme }: { onEnter: () => void, theme: 'light' | 'dark' }) {
  return (
    <div className="min-h-screen w-full text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <LandingTopNav onEnter={onEnter} />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-40">
        <Hero onEnter={onEnter} />
        <PainPoints />
        <Features />
        <UseCases />
        <Pricing onEnter={onEnter} />
      </main>
      <Footer />
    </div>
  );
}

function LandingTopNav({ onEnter }: { onEnter: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-b border-white/40 dark:border-zinc-800/40">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>DropMind念投</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">功能</a>
          <a href="#usecases" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">场景</a>
          <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">定价</a>
          <a href="#" className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Github className="w-4 h-4" /> GitHub
          </a>
          <button onClick={onEnter} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all shadow-md shadow-zinc-900/10 active:scale-95">
            进入工作区
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-16 pt-10">
      <div className="flex-1 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 rounded-full px-4 py-1.5 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">AI 驱动的瞬时笔记工具</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-7xl font-light tracking-tighter leading-[1.1] text-zinc-900 dark:text-zinc-100"
        >
          思维
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pr-2">
            空投舱
          </span>
          <br/>
          <span className="text-4xl md:text-5xl text-zinc-400 dark:text-zinc-500 font-light mt-4 block">你的瞬时灵感降落地</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg font-medium"
        >
          无需整理，自动归类，7天归档。像呼吸一样记录，让 AI 成为你的第二大脑缓存区。支持语音、文字、链接一键空投。
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button onClick={onEnter} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all shadow-xl shadow-zinc-900/10 active:scale-95 flex items-center justify-center gap-2">
            <span>免费空投体验</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 rounded-full font-medium text-lg bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300">
            <PlayCircle className="w-5 h-5" />
            <span>观看演示</span>
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-6 text-sm font-medium text-zinc-400 dark:text-zinc-500"
        >
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> 无需注册</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> 端到端加密</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> 离线可用</div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 w-full max-w-lg mx-auto lg:ml-auto"
      >
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur-xl opacity-20 group-focus-within:opacity-40 transition duration-500" />
          <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 border border-white dark:border-zinc-800 p-4 transition-all duration-300">
            <div className="flex items-center justify-between px-4 pt-2 pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">实时同步中</div>
            </div>
            <textarea 
              placeholder="试试空投一条思绪...例如：突然想到下周会议需要准备AI趋势报告 #工作"
              className="w-full h-40 resize-none bg-transparent p-4 text-lg focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium text-zinc-800 dark:text-zinc-100"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                <button className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-all duration-200"><Mic className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-all duration-200"><Volume2 className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-all duration-200"><Camera className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-all duration-200"><FileText className="w-5 h-5" /></button>
              </div>
              <button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95 font-medium flex items-center gap-2">
                <span>空投</span>
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PainPoints() {
  return (
    <section className="text-center space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">传统笔记工具太<span className="font-serif italic text-red-500 pr-1">重</span>了</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">灵感一闪而过，却被复杂的分类和整理流程扼杀</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        <PainCard 
          icon={<XCircle className="w-6 h-6 text-red-500" />} 
          title="打开即放弃" 
          desc="Notion、Obsidian 太重，新建笔记需要选择文件夹、模板、标签..." 
        />
        <PainCard 
          icon={<Trash2 className="w-6 h-6 text-red-500" />} 
          title="信息黑洞" 
          desc="收藏即冷藏，90%的笔记再也没有被打开过，成为数字囤积垃圾" 
        />
        <PainCard 
          icon={<CheckCircle2 className="w-6 h-6 text-indigo-500" />} 
          title="DropMind 方案" 
          desc="零 friction 输入，AI 自动分类，7天自动归档，只保留真正重要的思绪" 
          highlighted 
        />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4"
      >
        <span className="text-indigo-500 text-sm font-bold tracking-widest uppercase">核心功能</span>
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">扔进去，<span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500 pr-1">搞定了</span></h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">三大核心能力，构建你的瞬时思维缓存系统</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8">
        <FeatureCard 
          icon={<Mic className="w-7 h-7 text-indigo-500" />} 
          title="语音空投" 
          desc="自动剔除冗余废话与自我修正，将语无伦次的口语转化为结构清晰的直出成稿。即使在中英混排或生僻术语场景下，也能精准捕捉核心表达，拒绝过度脑补。" 
          tags={['核心提取', '结构化排版', '中英混排']} 
        />
        <FeatureCard 
          icon={<Brain className="w-7 h-7 text-purple-500" />} 
          title="AI 智能分类" 
          desc="无需手动打标签，AI 自动识别内容并分类到工作、灵感、待办、阅读四个舱室。" 
          tags={['#工作', '#灵感', '#待办']} 
        />
        <FeatureCard 
          icon={<Calendar className="w-7 h-7 text-emerald-500" />} 
          title="语义日程解析" 
          desc="强大的语义识别能力，随口一句“周日下午3点开红人营销会议”，即可自动提取时间与事件，无缝打通并同步至 iOS 日历、Google Calendar 和飞书会议。" 
          tags={['语义识别', '多端同步', '日历打通']} 
        />
        <FeatureCard 
          icon={<Archive className="w-7 h-7 text-pink-500" />} 
          title="瞬态归档" 
          desc="默认7天后自动归档，减少心理负担。重要内容可标记为永久保存或一键导出。" 
          tags={['自动清理', '无负担']} 
        />
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section id="usecases" className="space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">谁在使用 DropMind？</h2>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UseCaseCard icon={<Briefcase/>} title="产品经理" desc="通勤时的需求灵感，会议中的快速待办，用户反馈的即时记录。" color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <UseCaseCard icon={<PenTool/>} title="内容创作者" desc="选题灵感、金句收集、视频脚本碎片，不再丢失任何创意。" color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
        <UseCaseCard icon={<Code/>} title="开发者" desc="代码片段、Bug 记录、技术方案思考，支持 Markdown 和代码高亮。" color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <UseCaseCard icon={<BookOpen/>} title="终身学习者" desc="阅读摘录、课程笔记、随机想法，构建个人知识流的入口。" color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
      </div>
    </section>
  );
}

function Pricing({ onEnter }: { onEnter: () => void }) {
  return (
    <section id="pricing" className="space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4"
      >
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">简单定价</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">免费版足够好用，Pro 版为你加速</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard 
          title="免费版" 
          price="¥0" 
          desc="每月 50 条空投额度" 
          features={['基础 AI 分类', '7天本地存储']} 
          missing={['语音输入', '导出到 Notion/Obsidian', '永久云存储']} 
          onAction={onEnter}
        />
        <PricingCard 
          title="Pro 版" 
          price="¥99" 
          desc="无限空投额度" 
          features={['高级 AI 分类与摘要', '语音输入 & 实时转录', '导出到 Notion/Obsidian', '永久云存储']} 
          highlighted 
          onAction={onEnter}
        />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200/50 dark:border-zinc-800/50 mt-32 py-12 px-6 md:px-12 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-lg">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>DropMind念投</span>
        </div>
        <p>© 2024 DropMind. 保留所有权利。</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">功能特性</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">隐私政策</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">服务条款</a>
        </div>
      </div>
    </footer>
  );
}

function PainCard({ icon, title, desc, highlighted = false }: { icon: React.ReactNode, title: string, desc: string, highlighted?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-8 rounded-[2rem] border ${highlighted ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30 shadow-xl shadow-indigo-500/5' : 'bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border-white dark:border-zinc-700 shadow-xl shadow-zinc-200/50 dark:shadow-black/50'}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${highlighted ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-red-50 dark:bg-red-900/40'}`}>
        {icon}
      </div>
      <h3 className={`text-xl font-bold mb-3 ${highlighted ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-900 dark:text-zinc-100'}`}>{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, tags }: { icon: React.ReactNode, title: string, desc: string, tags: string[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 rounded-[2rem] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border border-white dark:border-zinc-700 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-6">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function UseCaseCard({ icon, title, desc, color, bg }: { icon: React.ReactNode, title: string, desc: string, color: string, bg: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="p-6 rounded-[2rem] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border border-white dark:border-zinc-700 shadow-xl shadow-zinc-200/50 dark:shadow-black/50"
    >
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-5`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
      </div>
      <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function PricingCard({ title, price, desc, features, missing = [], highlighted = false, onAction }: { title: string, price: string, desc: string, features: string[], missing?: string[], highlighted?: boolean, onAction: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative p-10 rounded-[2.5rem] border ${highlighted ? 'bg-zinc-900 border-zinc-800 text-white shadow-2xl shadow-indigo-500/20' : 'bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border-white dark:border-zinc-700 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 text-zinc-900 dark:text-zinc-100'}`}
    >
      {highlighted && (
        <div className="absolute top-0 right-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-b-xl">
          推荐
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-5xl font-light tracking-tighter ${highlighted ? 'text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400' : ''}`}>{price}</span>
        <span className={highlighted ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}>/月</span>
      </div>
      <p className={`text-sm font-medium mb-8 ${highlighted ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>{desc}</p>
      
      <ul className="space-y-4 mb-10">
        {features.map(f => (
          <li key={f} className="flex items-center gap-3 font-medium">
            <Check className={`w-5 h-5 ${highlighted ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <span>{f}</span>
          </li>
        ))}
        {missing.map(m => (
          <li key={m} className={`flex items-center gap-3 font-medium ${highlighted ? 'text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'}`}>
            <X className="w-5 h-5" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={onAction}
        className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 ${highlighted ? 'bg-white text-zinc-900 hover:bg-zinc-100' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-400'}`}
      >
        立即开始
      </button>
    </motion.div>
  );
}



