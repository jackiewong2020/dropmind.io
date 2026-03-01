import React, { useState, useRef } from 'react';
import { Eye, Edit2, FileText, Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Code, Quote, List, ListOrdered, Minus, Type, Download, FileText as FileTextIcon, Heading1, Heading2, Heading3, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ArticleCard({ drop, onSave, onDelete, onCategoryChange }: { drop?: any, onSave?: (content: string) => void, onDelete?: () => void, onCategoryChange?: (category: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(drop?.cleanText || `服装品牌成功案例分析与SOP执行指南 结合Kayla等实际案例，提供详细步骤和实操策略，帮助有志于建立服装品牌的创业者顺利起步并实现成功。 第一步：品牌构思与市场调研

1. 确定品牌愿景与目标 • 实操案例：Kayla的服装品牌起步

Kayla在自己创业初期，立志于打造一个服装品牌，尽管她的起点较低（生活在两室八人家庭、经历过贫穷），但她的愿景很明确：希望通过自己设计的服装，改变生活，拥有更高质量的生活和财务自由。

执行指南：

• 明确你的品牌愿景，如产品所传达的价值、针对的目标消费群体（Kayla的品牌以年轻时尚爱好者为主）。
• 制定品牌目标，例如在一年内完成首个限量款发布，获得5000+名订阅用户。`);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (drop?.cleanText) {
      setContent(drop.cleanText);
    }
  }, [drop?.cleanText]);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave && content !== drop?.cleanText) {
      onSave(content);
    }
  };

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const exportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const html = header + "<div style='font-family: sans-serif;'>" + content.replace(/\n/g, '<br>') + "</div>" + footer;
    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (drop?.title || 'document') + '.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-6"
    >
      <div className="p-8 border-b border-zinc-50 dark:border-zinc-800">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-6">
          {drop?.title || "服装品牌成功案例分析与SOP执行指南 结合Kayla等实际案例..."}
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            <FileText className="w-4 h-4" />
            <span>{content.length} 字</span>
            {drop && onCategoryChange && (
              <select 
                value={drop.category || '阅读'} 
                onChange={(e) => onCategoryChange(e.target.value)}
                className="ml-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium px-2 py-1 rounded-lg border-none outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <option value="阅读">阅读</option>
                <option value="工作">工作</option>
                <option value="灵感">灵感</option>
                <option value="待办">待办</option>
                <option value="书签">书签</option>
              </select>
            )}
          </div>
          <div className="flex items-center gap-3 bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl">
            <button onClick={exportPDF} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" title="导出 PDF">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={exportWord} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" title="导出 Word">
              <FileTextIcon className="w-4 h-4" />
            </button>
            <button onClick={handleCopy} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" title="复制内容">
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            <button 
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${!isEditing ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
            >
              <Eye className="w-4 h-4" /> 预览
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isEditing ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
            >
              <Edit2 className="w-4 h-4" /> 编辑
            </button>
            {onDelete && (
              <button onClick={onDelete} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                删除
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4 p-3 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-t-xl border-b border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 overflow-x-auto">
            <button onClick={() => insertText('# ', '')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="一级标题"><Heading1 className="w-4 h-4" /></button>
            <button onClick={() => insertText('## ', '')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="二级标题"><Heading2 className="w-4 h-4" /></button>
            <button onClick={() => insertText('### ', '')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="三级标题"><Heading3 className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            <button onClick={() => insertText('**', '**')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="加粗"><Bold className="w-4 h-4" /></button>
            <button onClick={() => insertText('*', '*')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="斜体"><Italic className="w-4 h-4" /></button>
            <button onClick={() => insertText('<u>', '</u>')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="下划线"><Underline className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            <button onClick={() => insertText('[', '](url)')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="链接"><LinkIcon className="w-4 h-4" /></button>
            <button onClick={() => insertText('![alt](', 'url)')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="图片"><ImageIcon className="w-4 h-4 text-emerald-500" /></button>
            <button onClick={() => insertText('\n```\n', '\n```\n')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="代码"><Code className="w-4 h-4" /></button>
            <button onClick={() => insertText('> ', '')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="引用"><Quote className="w-4 h-4" /></button>
            <button onClick={() => insertText('- ', '')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="无序列表"><List className="w-4 h-4" /></button>
            <button onClick={() => insertText('1. ', '')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="有序列表"><ListOrdered className="w-4 h-4" /></button>
            <button onClick={() => insertText('\n---\n', '')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-1" title="分割线"><Minus className="w-4 h-4" /></button>
          </div>
          <textarea 
            ref={textareaRef}
            className="w-full h-96 bg-white dark:bg-zinc-800 p-6 rounded-b-xl border-x border-b border-zinc-200/50 dark:border-zinc-700/50 focus:outline-none resize-none text-zinc-800 dark:text-zinc-100 leading-relaxed font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      ) : (
        <div className="p-10 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-r-2xl mb-10">
            <p className="text-zinc-600 dark:text-zinc-400 italic leading-relaxed text-base">
              {content.substring(0, 100)}...
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </motion.div>
  );
}
