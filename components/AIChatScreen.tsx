
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, AiConfig } from '../types';

interface AIChatScreenProps {
  setIsAiThinking: (thinking: boolean) => void;
  onBack: () => void;
  isDarkMode?: boolean;
  config: AiConfig;
  onUpdateConfig?: (newConfig: AiConfig) => void;
}

const TypingIndicator: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => (
  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className={`${isDarkMode ? 'bg-white/[0.05] border-white/5' : 'bg-black/[0.03] border-black/5'} border px-5 py-3 rounded-[1.8rem] rounded-bl-none flex items-center space-x-1.5`}>
      <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-white/20' : 'bg-black/20'} rounded-full animate-bounce [animation-duration:0.8s]`}></div>
      <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-white/30' : 'bg-black/30'} rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.15s]`}></div>
      <div className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-white/40' : 'bg-black/40'} rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.3s]`}></div>
    </div>
  </div>
);

const AIChatScreen: React.FC<AIChatScreenProps> = ({ setIsAiThinking, onBack, isDarkMode, config, onUpdateConfig }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Fixed: changed timestamp from new Date() to new Date().toISOString() to match ChatMessage interface
    { role: 'model', content: "嘿！我是 QQ AI。神经网络已按照最新的 API 配置完成同步。今天想聊点什么好玩的？^_^", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Fixed: changed timestamp from new Date() to new Date().toISOString()
    const userMessage: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsAiThinking(true);
    setIsTyping(true);

    try {
      const apiKey = config.apiKey.trim() || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const history = messages.slice(1).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: config.modelName,
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config: {
            systemInstruction: config.systemInstruction,
            temperature: config.temperature,
        }
      });

      const aiText = response.text || "哎呀，量子纠缠出了一点小偏差，请稍后再试。";
      // Fixed: changed timestamp from new Date() to new Date().toISOString()
      setMessages(prev => [...prev, { role: 'model', content: aiText, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error("AI Error:", error);
      // Fixed: changed timestamp from new Date() to new Date().toISOString()
      setMessages(prev => [...prev, { role: 'model', content: "信号有点皮，连接 API 时被防火墙弹回了，请检查设置。 ^_^", timestamp: new Date().toISOString() }]);
    } finally {
      setIsAiThinking(false);
      setIsTyping(false);
    }
  };

  const handleSwitchModel = (modelName: string) => {
    if (onUpdateConfig) {
      onUpdateConfig({
        ...config,
        modelName
      });
    }
    setShowModelSelector(false);
  };

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#fcfcfc]'} flex flex-col pt-14 transition-colors duration-500 relative`}>
      {/* High-End Glass Header */}
      <div className={`px-4 py-4 flex items-center border-b ${isDarkMode ? 'border-white/5 bg-black/70' : 'border-black/5 bg-white/70'} backdrop-blur-3xl sticky top-0 z-20 transition-colors duration-500`}>
        <button 
          onClick={onBack}
          className={`mr-3 p-2 rounded-full ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors active:scale-90`}
          aria-label="返回"
        >
          <svg className={`w-6 h-6 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center space-x-1.5 cursor-pointer active:opacity-60 transition-opacity" onClick={() => setShowModelSelector(true)}>
             <h1 className={`text-lg font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>{config.modelName}</h1>
             <svg className={`w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
             </svg>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isTyping ? (isDarkMode ? 'bg-blue-500 animate-pulse' : 'bg-blue-500 animate-pulse') : (isDarkMode ? 'bg-white/20' : 'bg-black/20')}`}></span>
            <p className={`${isDarkMode ? 'text-white/40' : 'text-black/40'} text-[9px] uppercase tracking-[0.15em] font-bold truncate`}>
              {isTyping ? 'Thinking & Vibing...' : `Ready @ Temp ${config.temperature.toFixed(1)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both`}>
            <div 
              className={`max-w-[85%] px-5 py-3.5 rounded-[1.8rem] text-[15px] leading-relaxed transition-all duration-300 shadow-sm ${
                msg.role === 'user' 
                ? (isDarkMode ? 'bg-white text-black rounded-br-none' : 'bg-black text-white rounded-br-none') 
                : (isDarkMode ? 'bg-[#1a1a1a] text-white/90 border border-white/5 rounded-bl-none' : 'bg-white text-black/85 border border-black/5 rounded-bl-none')
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator isDarkMode={isDarkMode} />}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Minimalist Input Area */}
      <div className={`p-4 pb-10 ${isDarkMode ? 'bg-black/80 border-white/5' : 'bg-white/80 border-black/5'} backdrop-blur-xl border-t transition-colors duration-500`}>
        <div className={`relative flex items-center ${isDarkMode ? 'bg-white/5 focus-within:bg-white/[0.08]' : 'bg-black/5 focus-within:bg-black/[0.07]'} rounded-[2.5rem] p-1.5 transition-all`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="来点有趣的话题..."
            disabled={isTyping}
            className={`flex-1 bg-transparent text-[15px] px-5 py-2.5 focus:outline-none disabled:opacity-50 ${isDarkMode ? 'text-white placeholder:text-white/20' : 'text-black placeholder:text-black/25'}`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
              !input.trim() || isTyping 
              ? (isDarkMode ? 'bg-white/5 text-white/10 shadow-none' : 'bg-black/5 text-black/10 shadow-none') 
              : (isDarkMode ? 'bg-white text-black' : 'bg-black text-white shadow-black/20')
            }`}
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
             </svg>
          </button>
        </div>
        <p className={`text-[10px] text-center mt-3 font-medium tracking-wide ${isDarkMode ? 'text-white/10' : 'text-black/10'}`}>iOS 26 NEURAL INTERFACE @ {config.modelName}</p>
      </div>

      {/* Model Selector Overlay */}
      {showModelSelector && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-ios-fade" onClick={() => setShowModelSelector(false)}></div>
           <div className={`relative w-full max-h-[70%] flex flex-col ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'border-white/10' : 'border-black/5'} animate-ios-pop`}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'} flex justify-between items-center bg-inherit sticky top-0 z-10`}>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>切换模型</h3>
                  <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>已拉取的可用引擎列表</p>
                </div>
                <button onClick={() => setShowModelSelector(false)} className="p-2 rounded-full active:bg-gray-500/10">
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
                {config.availableModels && config.availableModels.length > 0 ? (
                  config.availableModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => handleSwitchModel(model)}
                      className={`w-full px-6 py-5 text-left transition-all active:bg-blue-500/10 border-b last:border-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'} flex items-center justify-between ${config.modelName === model ? 'bg-blue-500/5' : ''}`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-base font-bold truncate ${config.modelName === model ? 'text-blue-500' : (isDarkMode ? 'text-white/90' : 'text-black/80')}`}>
                          {model}
                        </span>
                        {config.modelName === model && <span className="text-[9px] text-blue-500/60 font-bold uppercase tracking-wider mt-0.5">当前正在使用</span>}
                      </div>
                      {config.modelName === model && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4 px-10 text-center">
                    <div className={`p-5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <svg className={`w-10 h-10 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                      未发现备选模型。请前往主屏幕的<br/><strong className="text-blue-500">API 设置</strong>中点击“拉取模型”并保存设置。
                    </p>
                  </div>
                )}
              </div>
              <div className={`p-6 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'} bg-inherit`}>
                 <p className={`text-[9px] text-center font-bold tracking-[0.2em] ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>iOS 26 NEURAL SELECTOR</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AIChatScreen;
