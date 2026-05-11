/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  MapPin, 
  Stethoscope, 
  CreditCard, 
  Activity, 
  Clock, 
  Menu, 
  X,
  Plus
} from 'lucide-react';
import { HospitalAgentService, ChatMessage } from './services/geminiService';
import { hospitalDepartments } from './data/hospitalData';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await HospitalAgentService.processMessage(text, messages);
      const assistantMsg: ChatMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，系统暂时无法回复。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: '我要挂号', icon: Clock, query: '我想挂号，怎么办理？' },
    { label: '在哪里缴费', icon: CreditCard, query: '缴费处怎么走？' },
    { label: '验血在哪里', icon: Activity, query: '验血处在哪里？' },
    { label: '感冒看哪个科', icon: Stethoscope, query: '我感冒发烧了，应该看哪个科室？' },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg border border-[#E5E7EB]"
          >
            <Menu size={20} />
          </button>
        )}
      </AnimatePresence>

      {/* Sidebar - Hospital Info */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 768 ? '100%' : '320px') : '0px',
          x: isSidebarOpen ? 0 : -320
        }}
        className={`bg-white border-r border-[#E5E7EB] flex-shrink-0 flex flex-col z-40 fixed md:relative h-full`}
      >
        <div className="p-6 flex justify-between items-center border-bottom border-[#F3F4F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E0F2F1] rounded-xl flex items-center justify-center text-[#00695C]">
              <Plus size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight uppercase tracking-tight">医路通</h1>
              <p className="text-[10px] text-[#6B7280] font-mono uppercase tracking-widest">Medical Guide AI</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
          <section>
            <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4 block">常用科室</label>
            <div className="space-y-2">
              {hospitalDepartments.map(dept => (
                <div key={dept.id} className="p-3 bg-[#F9FAFB] rounded-lg border border-transparent hover:border-[#E5E7EB] transition-all cursor-default">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{dept.name}</span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">{dept.floor}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{dept.building}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4 block">院内公告</label>
            <div className="p-4 bg-[#FFF9C4] rounded-lg border border-[#FBC02D] text-xs text-[#5D4037] leading-relaxed">
              即日起，自助挂号机服务时间延长至 20:00，请各位患者知悉。
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-[#F3F4F6]">
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <MapPin size={14} />
            <span className="text-[10px] font-medium uppercase tracking-wider">中心医院 · 智慧大厅</span>
          </div>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[#F8F9FA]">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-8 justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-sm font-medium">AI 导诊服务在线</span>
          </div>
          <div className="text-xs text-[#6B7280]">
            {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </header>

        {/* Message Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex items-center justify-center text-[#10B981]">
                <Bot size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">您好，我是您的导诊助手</h2>
                <p className="text-sm text-[#6B7280] mt-2">您可以询问症状导诊、位置导航或医疗百科知识。</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.query)}
                    className="p-4 bg-white border border-[#E5E7EB] rounded-xl text-left hover:border-[#10B981] hover:bg-[#F0FDF4] transition-all group"
                  >
                    <action.icon size={18} className="text-[#6B7280] group-hover:text-[#10B981] mb-2" />
                    <div className="text-xs font-semibold">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E5E7EB] text-[#10B981]'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-[#1A1A1A] text-white border-transparent' 
                      : 'bg-white text-[#1A1A1A] border-[#E5E7EB]'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex gap-4">
                        <button className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-widest hover:text-[#1A1A1A]">有用</button>
                        <button className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-widest hover:text-[#1A1A1A]">不准确</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#10B981] flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-8 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="请输入您的问题，例如：'感冒了看哪个科？' 或 '挂号处在哪里？'"
              className="w-full bg-white border border-[#E5E7EB] rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent shadow-sm transition-all text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#1A1A1A] text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-medium">
              本助手仅供辅助导诊，不构成医疗建议
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
