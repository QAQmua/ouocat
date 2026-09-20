import React, { useState } from 'react';

interface MessagesScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
}

interface MessageItem {
  id: string;
  sender: string;
  role: 'user' | 'sender';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatarText: string;
  avatarBg: string;
  isImessage: boolean;
  unread: boolean;
  lastMessage: string;
  lastTime: string;
  phoneOrEmail: string;
  messages: MessageItem[];
}

const initialConversations: Conversation[] = [
  {
    id: 'conv-linxiao',
    name: '林晓',
    avatarText: '晓',
    avatarBg: 'bg-gradient-to-tr from-blue-400 to-indigo-500',
    isImessage: true,
    unread: false,
    lastMessage: '周五晚上有空聚餐吗？我找了一家超赞的日料店🍣',
    lastTime: '21:05',
    phoneOrEmail: 'linxiao@icloud.com',
    messages: [
      { id: 'm1', sender: '林晓', role: 'sender', text: '嗨！这周工作辛苦啦～', time: '20:45' },
      { id: 'm2', sender: 'me', role: 'user', text: '哈哈确实，终于熬到周五了！', time: '20:50' },
      { id: 'm3', sender: '林晓', role: 'sender', text: '周五晚上有空聚餐吗？我找了一家超赞的日料店🍣', time: '21:05' },
    ]
  },
  {
    id: 'conv-10086',
    name: '10086',
    avatarText: '移',
    avatarBg: 'bg-blue-600',
    isImessage: false,
    unread: true,
    lastMessage: '【中国移动】尊敬的客户，您当前话费余额为 78.50 元，本月国内通用流量已使用 8.42GB，剩余 21.58GB。',
    lastTime: '10:24',
    phoneOrEmail: '10086',
    messages: [
      { id: 'm10', sender: '10086', role: 'sender', text: '【中国移动】尊敬的客户，您当前话费余额为 78.50 元，本月国内通用流量已使用 8.42GB，剩余 21.58GB。回复 101 可查询详细账单。', time: '10:24' }
    ]
  },
  {
    id: 'conv-apple',
    name: 'Apple',
    avatarText: '',
    avatarBg: 'bg-black text-white',
    isImessage: true,
    unread: false,
    lastMessage: '您的 Apple ID 安全验证码是：830219。有效时间为 10 分钟。',
    lastTime: '昨天',
    phoneOrEmail: 'verify@apple.com',
    messages: [
      { id: 'ma1', sender: 'Apple', role: 'sender', text: '您的 Apple ID 安全验证码是：830219。有效时间为 10 分钟，请勿将验证码泄露给他人。如非本人操作请尽快修改密码。', time: '昨天 15:32' }
    ]
  },
  {
    id: 'conv-sf',
    name: '顺丰速运',
    avatarText: 'SF',
    avatarBg: 'bg-gray-800 text-white',
    isImessage: false,
    unread: false,
    lastMessage: '【顺丰速运】您的快件已送达【天府三街自提柜】，凭提货码 8492 取件。',
    lastTime: '周四',
    phoneOrEmail: '95338',
    messages: [
      { id: 'msf1', sender: '顺丰速运', role: 'sender', text: '【顺丰速运】您的快件已送达【天府三街自提柜】，凭提货码 8492 取件。如有疑问请联系派件员 13800000000。', time: '周四 14:18' }
    ]
  }
];

const MessagesScreen: React.FC<MessagesScreenProps> = ({ onBack, isDarkMode }) => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');

  const currentConv = conversations.find(c => c.id === selectedConvId);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedConvId) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      role: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedConvId) {
        return {
          ...c,
          lastMessage: newMsg.text,
          lastTime: '刚刚',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setInputText('');

    // 如果给好友发送，模拟自动回复一条 iMessage
    if (currentConv?.id === 'conv-linxiao') {
      setTimeout(() => {
        const replyMsg: MessageItem = {
          id: `reply-${Date.now()}`,
          sender: '林晓',
          role: 'sender',
          text: '好耶！那我下班后过去先占位，不见不散～🎉',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations(prev => prev.map(c => {
          if (c.id === 'conv-linxiao') {
            return {
              ...c,
              lastMessage: replyMsg.text,
              lastTime: '刚刚',
              messages: [...c.messages, replyMsg]
            };
          }
          return c;
        }));
      }, 1000);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-black text-white' : 'bg-[#FFFFFF] text-black'} flex flex-col relative select-none overflow-hidden transition-colors duration-300 font-sans`}>
      {/* 视图一：会话列表 (主界面) */}
      {!selectedConvId && (
        <div className="w-full h-full flex flex-col pt-11">
          {/* iOS Messages 顶部导航 */}
          <div className="px-4 pb-1 flex items-center justify-between">
            <button 
              id="messages-back-home"
              onClick={onBack}
              className="text-[#007AFF] text-[15px] font-normal active:opacity-50 transition-opacity"
            >
              编辑
            </button>
            <div className="flex items-center space-x-3">
              <button 
                id="messages-close-to-home"
                onClick={onBack}
                className="text-[#007AFF] text-[13px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30"
              >
                主屏幕
              </button>
              <button className="text-[#007AFF] active:opacity-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 大标题 "信息" */}
          <div className="px-4 pt-1 pb-2">
            <h1 className="text-3xl font-bold tracking-tight">信息</h1>
          </div>

          {/* iOS 原生搜索栏 */}
          <div className="px-4 pb-2">
            <div className={`h-9 rounded-xl px-3 flex items-center ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-[#767680]/15'}`}>
              <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full outline-none placeholder-gray-400"
              />
              <svg className="w-4 h-4 text-gray-400 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
              </svg>
            </div>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200/50 dark:divide-white/10 px-4">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConvId(conv.id);
                  // 标记已读
                  setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: false } : c));
                }}
                className="py-3 flex items-center space-x-3 active:bg-gray-100 dark:active:bg-white/5 cursor-pointer -mx-2 px-2 rounded-xl transition-colors"
              >
                {/* 未读蓝点 */}
                <div className="w-2 flex justify-center">
                  {conv.unread && <div className="w-2 h-2 rounded-full bg-[#007AFF]"></div>}
                </div>

                {/* 头像 */}
                <div className={`w-12 h-12 rounded-full ${conv.avatarBg} flex items-center justify-center font-bold text-base shadow-sm shrink-0`}>
                  {conv.id === 'conv-apple' ? (
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.79-11.97-14.25-6.74-10.12-12-21.43-15.78-33.91-3.77-12.49-5.67-24.31-5.67-35.48 0-14.15 3.6-25.96 10.8-35.42 7.21-9.46 16.32-14.28 27.34-14.46 4.8 0 10.37 1.28 16.71 3.84 6.33 2.56 10.23 3.88 11.7 3.96 1.85-.2 5.86-1.57 12.02-4.11 6.17-2.54 11.51-3.69 16.03-3.46 12.33.62 22.34 5.3 30.04 14.05-10.74 6.51-16.02 15.53-15.83 27.05.21 9.07 3.73 16.66 10.57 22.77 6.84 6.11 15.01 9.53 24.51 10.27-2.18 6.54-4.89 13.04-8.13 19.5zM119.22 31.84c0-7.39 2.65-14.41 7.96-21.06 5.31-6.65 11.85-10.78 19.62-12.38.1 1.25.16 2.29.16 3.13 0 7.39-2.8 14.46-8.41 21.2-5.61 6.74-12.19 10.63-19.74 11.67-.1-1.04-.15-1.9-.15-2.56z" />
                    </svg>
                  ) : (
                    conv.avatarText
                  )}
                </div>

                {/* 会话信息 */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="font-semibold text-[15px] truncate">{conv.name}</span>
                    <span className="text-[12px] text-gray-400 shrink-0 ml-2">{conv.lastTime}</span>
                  </div>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                    {conv.lastMessage}
                  </p>
                </div>

                {/* iOS 箭头 */}
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 视图二：会话详情 (聊天界面) */}
      {selectedConvId && currentConv && (
        <div className="w-full h-full flex flex-col pt-11 bg-[#F2F2F7] dark:bg-black transition-colors">
          {/* iOS 顶部详情栏 */}
          <div className="px-3 pb-2 pt-1 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-20">
            <button 
              id="messages-back-to-list"
              onClick={() => setSelectedConvId(null)}
              className="flex items-center text-[#007AFF] text-[15px] active:opacity-50 -ml-1 py-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-normal">信息</span>
            </button>

            {/* 中间联系人信息 */}
            <div className="flex flex-col items-center cursor-pointer">
              <div className={`w-8 h-8 rounded-full ${currentConv.avatarBg} flex items-center justify-center font-bold text-xs shadow-sm mb-0.5`}>
                {currentConv.avatarText || ''}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-semibold">{currentConv.name}</span>
                <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Facetime / 详情按钮 */}
            <button className="text-[#007AFF] active:opacity-50 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* 会话类型标示 (iMessage 或 短信) */}
          <div className="py-2 text-center">
            <span className="text-[10px] text-gray-400 tracking-wider">
              {currentConv.isImessage ? 'iMessage 信息' : '短信 / 彩信'}
            </span>
          </div>

          {/* 消息气泡流 */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {currentConv.messages.map((m) => {
              const isMe = m.role === 'user';
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-[14px] leading-relaxed shadow-sm break-words ${
                      isMe
                        ? currentConv.isImessage
                          ? 'bg-[#007AFF] text-white rounded-br-sm'
                          : 'bg-[#34C759] text-white rounded-br-sm'
                        : isDarkMode
                        ? 'bg-[#262628] text-white rounded-bl-sm'
                        : 'bg-[#E9E9EB] text-black rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{m.time}</span>
                </div>
              );
            })}
          </div>

          {/* iOS 底部输入条 */}
          <div className="p-2 border-t border-black/5 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl flex items-center space-x-2">
            <button className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <div className={`flex-1 rounded-full px-3 py-1.5 flex items-center border ${
              isDarkMode ? 'bg-[#1C1C1E] border-white/10 text-white' : 'bg-white border-gray-300 text-black'
            }`}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={currentConv.isImessage ? 'iMessage 信息' : '短信信息'}
                className="bg-transparent text-sm w-full outline-none placeholder-gray-400"
              />
              
              {/* 发送按钮 (iOS 经典圆形箭头) */}
              <button
                id="messages-send-button"
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-1 transition-all ${
                  inputText.trim() 
                    ? currentConv.isImessage 
                      ? 'bg-[#007AFF] text-white scale-100 shadow-sm' 
                      : 'bg-[#34C759] text-white scale-100 shadow-sm'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 scale-90'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesScreen;
