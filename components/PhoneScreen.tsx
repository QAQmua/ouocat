import React, { useState, useEffect, useRef } from 'react';

interface PhoneScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
}

interface CallRecord {
  id: string;
  name: string;
  number: string;
  type: 'incoming' | 'outgoing' | 'missed';
  location: string;
  time: string;
}

const initialRecents: CallRecord[] = [
  { id: '1', name: '妈妈', number: '138 0013 8000', type: 'incoming', location: '杭州', time: '18:32' },
  { id: '2', name: '顺丰速运', number: '95338', type: 'missed', location: '全国热线', time: '14:15' },
  { id: '3', name: '10086', number: '10086', type: 'outgoing', location: '中国移动', time: '昨天' },
  { id: '4', name: '林晓', number: '139 8888 6666', type: 'incoming', location: '北京', time: '周三' },
  { id: '5', name: '外卖骑手', number: '177 1234 5678', type: 'incoming', location: '本地通话', time: '周一' },
];

const contactsList = [
  { letter: 'B', contacts: [{ name: '爸爸', number: '139 0000 1111', role: '家人' }] },
  { letter: 'L', contacts: [{ name: '林晓', number: '139 8888 6666', role: '朋友' }, { name: '李工程师', number: '158 2222 3333', role: '同事' }] },
  { letter: 'M', contacts: [{ name: '妈妈', number: '138 0013 8000', role: '家人' }] },
  { letter: 'S', contacts: [{ name: '顺丰速运', number: '95338', role: '服务热线' }] },
  { letter: 'W', contacts: [{ name: '王主管', number: '136 6666 8888', role: '公司' }] },
  { letter: 'Z', contacts: [{ name: '张经理', number: '188 9999 0000', role: '客户' }] },
];

const dtmfFrequencies: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

const PhoneScreen: React.FC<PhoneScreenProps> = ({ onBack, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'recents' | 'contacts' | 'keypad' | 'voicemail'>('keypad');
  const [dialedNumber, setDialedNumber] = useState('');
  const [recents, setRecents] = useState<CallRecord[]>(initialRecents);
  const [recentsFilter, setRecentsFilter] = useState<'all' | 'missed'>('all');
  
  // 通话状态
  const [activeCall, setActiveCall] = useState<{ name: string; number: string } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Web Audio Context for DTMF tones
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = (key: string) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = dtmfFrequencies[key] || [440, 440];
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio autoplay restriction fallback
    }
  };

  const handleKeyPress = (num: string) => {
    playTone(num);
    setDialedNumber(prev => prev + num);
  };

  const handleDelete = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const startCall = (name: string, number: string) => {
    setActiveCall({ name, number });
    setCallDuration(0);
  };

  const endCall = () => {
    if (activeCall) {
      const newRecord: CallRecord = {
        id: `call-${Date.now()}`,
        name: activeCall.name,
        number: activeCall.number,
        type: 'outgoing',
        location: '本地通话',
        time: '刚刚'
      };
      setRecents(prev => [newRecord, ...prev]);
    }
    setActiveCall(null);
    setCallDuration(0);
  };

  // 通话计时
  useEffect(() => {
    let timer: any;
    if (activeCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const keypadButtons = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' },
    { num: '0', sub: '+' },
    { num: '#', sub: '' },
  ];

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-black text-white' : 'bg-[#FFFFFF] text-black'} flex flex-col relative select-none overflow-hidden transition-colors duration-300 font-sans`}>
      {/* 通话中全屏层 */}
      {activeCall && (
        <div className="absolute inset-0 z-50 bg-[#1C1C1E] text-white flex flex-col justify-between pt-16 pb-12 px-8 animate-ios-fade">
          <div className="flex flex-col items-center pt-8">
            <h2 className="text-3xl font-light mb-1.5 tracking-tight">{activeCall.name}</h2>
            <div className="text-sm text-gray-400 font-normal">
              {callDuration === 0 ? '正在呼叫...' : formatDuration(callDuration)}
            </div>
            {activeCall.number !== activeCall.name && (
              <div className="text-xs text-gray-500 mt-1">{activeCall.number}</div>
            )}
          </div>

          {/* 6 个经典通话选项按钮 */}
          <div className="grid grid-cols-3 gap-y-7 gap-x-4 max-w-[280px] mx-auto w-full">
            {[
              { label: '静音', icon: 'mic', active: isMuted, onClick: () => setIsMuted(!isMuted) },
              { label: '拨号键盘', icon: 'keypad', active: false, onClick: () => {} },
              { label: '免提', icon: 'speaker', active: isSpeaker, onClick: () => setIsSpeaker(!isSpeaker) },
              { label: '添加通话', icon: 'plus', active: false, onClick: () => {} },
              { label: 'FaceTime', icon: 'video', active: false, onClick: () => {} },
              { label: '通讯录', icon: 'contacts', active: false, onClick: () => {} },
            ].map((btn, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <button
                  onClick={btn.onClick}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    btn.active ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
                  }`}
                >
                  {btn.icon === 'mic' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                    </svg>
                  )}
                  {btn.icon === 'keypad' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="19" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                      <circle cx="19" cy="19" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                  {btn.icon === 'speaker' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                  {btn.icon === 'plus' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {btn.icon === 'video' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                  {btn.icon === 'contacts' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </button>
                <span className="text-[11px] text-gray-300 mt-1.5">{btn.label}</span>
              </div>
            ))}
          </div>

          {/* 红色大挂断按钮 */}
          <div className="flex justify-center pb-4">
            <button
              id="phone-end-call-button"
              onClick={endCall}
              className="w-18 h-18 w-[70px] h-[70px] rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <svg className="w-8 h-8 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.49l1.97-1.57c.29-.24.38-.63.26-.99A11.36 11.36 0 0 1 8.94 4c0-.55-.45-1-1-1H4.41c-.55 0-1 .45-1 1C3.41 13.06 10.94 20.59 20.01 20.59c.55 0 1-.45 1-1v-3.21c0-.55-.45-1-1-1z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 顶部简易工具条 */}
      <div className="pt-11 px-4 flex items-center justify-between z-20">
        <button 
          id="phone-back-home"
          onClick={onBack}
          className="text-[#007AFF] text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 active:opacity-50"
        >
          返回主屏幕
        </button>
        <span className="text-xs text-gray-400">中国移动 5G</span>
      </div>

      {/* TAB 1: 拨号键盘 (Keypad) */}
      {activeTab === 'keypad' && (
        <div className="flex-1 flex flex-col justify-between pb-16 px-6 pt-1">
          {/* 号码展示区 */}
          <div className="h-16 flex flex-col items-center justify-center relative">
            <span className="text-3xl font-light tracking-wider overflow-hidden max-w-[260px] truncate text-center">
              {dialedNumber}
            </span>
            {dialedNumber && (
              <span className="text-xs text-[#007AFF] font-medium mt-0.5 cursor-pointer">
                添加号码
              </span>
            )}
          </div>

          {/* 3x4 iOS 键盘 */}
          <div className="grid grid-cols-3 gap-y-3.5 gap-x-5 max-w-[270px] mx-auto w-full">
            {keypadButtons.map((btn) => (
              <button
                key={btn.num}
                onClick={() => handleKeyPress(btn.num)}
                className={`w-[66px] h-[66px] rounded-full flex flex-col items-center justify-center mx-auto active:scale-95 transition-all ${
                  isDarkMode 
                    ? 'bg-[#2C2C2E] hover:bg-[#3A3A3C] active:bg-[#48484A]' 
                    : 'bg-[#E5E5EA] hover:bg-[#D1D1D6] active:bg-[#C7C7CC]'
                }`}
              >
                <span className="text-2xl font-light leading-none">{btn.num}</span>
                {btn.sub && (
                  <span className="text-[9px] font-bold text-gray-500 tracking-wider mt-0.5 leading-none">
                    {btn.sub}
                  </span>
                )}
              </button>
            ))}

            {/* 占位空位 */}
            <div className="w-[66px] h-[66px]"></div>

            {/* 绿色大拨号键 */}
            <button
              id="phone-call-button"
              onClick={() => {
                const target = dialedNumber || '10086';
                startCall(target, target);
              }}
              className="w-[66px] h-[66px] rounded-full bg-[#34C759] hover:bg-[#30D158] text-white flex items-center justify-center mx-auto shadow-md active:scale-90 transition-transform"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.49l1.97-1.57c.29-.24.38-.63.26-.99A11.36 11.36 0 0 1 8.94 4c0-.55-.45-1-1-1H4.41c-.55 0-1 .45-1 1C3.41 13.06 10.94 20.59 20.01 20.59c.55 0 1-.45 1-1v-3.21c0-.55-.45-1-1-1z" />
              </svg>
            </button>

            {/* 退格键 */}
            <div className="w-[66px] h-[66px] flex items-center justify-center">
              {dialedNumber && (
                <button
                  id="phone-delete-digit"
                  onClick={handleDelete}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 active:text-black dark:active:text-white"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-9.172a2 2 0 00-1.414.586L3 12z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 最近通话 (Recents) */}
      {activeTab === 'recents' && (
        <div className="flex-1 flex flex-col pt-1 pb-16 px-4 overflow-hidden">
          {/* 顶部 Segmented Control */}
          <div className="flex justify-center mb-3">
            <div className={`p-0.5 rounded-lg flex ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-[#767680]/15'}`}>
              <button
                onClick={() => setRecentsFilter('all')}
                className={`text-xs px-4 py-1 rounded-md font-medium transition-all ${
                  recentsFilter === 'all' 
                    ? isDarkMode ? 'bg-[#636366] text-white shadow' : 'bg-white text-black shadow' 
                    : 'text-gray-400'
                }`}
              >
                所有通话
              </button>
              <button
                onClick={() => setRecentsFilter('missed')}
                className={`text-xs px-4 py-1 rounded-md font-medium transition-all ${
                  recentsFilter === 'missed' 
                    ? isDarkMode ? 'bg-[#636366] text-white shadow' : 'bg-white text-black shadow' 
                    : 'text-gray-400'
                }`}
              >
                未接来电
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">最近通话</h1>

          {/* 列表 */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200/50 dark:divide-white/10">
            {recents
              .filter(r => recentsFilter === 'all' || r.type === 'missed')
              .map((record) => (
                <div 
                  key={record.id}
                  onClick={() => startCall(record.name, record.number)}
                  className="py-2.5 flex items-center justify-between active:bg-gray-100 dark:active:bg-white/5 cursor-pointer -mx-2 px-2 rounded-xl"
                >
                  <div className="flex items-center space-x-2.5">
                    {/* 呼叫类型指示 */}
                    <div className="w-4">
                      {record.type === 'outgoing' && (
                        <svg className="w-3.5 h-3.5 text-gray-400 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className={`text-[15px] font-medium ${record.type === 'missed' ? 'text-[#FF3B30]' : ''}`}>
                        {record.name}
                      </div>
                      <div className="text-xs text-gray-400">{record.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400">{record.time}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`号码详情：${record.number}`);
                      }}
                      className="text-[#007AFF] active:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                        <path strokeLinecap="round" strokeWidth={2} d="M12 8h.01M12 11v5" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: 通讯录 (Contacts) */}
      {activeTab === 'contacts' && (
        <div className="flex-1 flex flex-col pt-1 pb-16 px-4 overflow-hidden">
          <h1 className="text-3xl font-bold tracking-tight mb-2">通讯录</h1>
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* 我的名片 */}
            <div className={`p-3 rounded-2xl flex items-center space-x-3 ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-gray-100'}`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                我
              </div>
              <div>
                <div className="text-sm font-bold">本机机主</div>
                <div className="text-xs text-gray-400">我的名片</div>
              </div>
            </div>

            {contactsList.map(group => (
              <div key={group.letter}>
                <div className="text-xs font-bold text-gray-400 px-1 mb-1">{group.letter}</div>
                <div className="divide-y divide-gray-200/50 dark:divide-white/10">
                  {group.contacts.map(c => (
                    <div 
                      key={c.name}
                      onClick={() => startCall(c.name, c.number)}
                      className="py-2.5 flex items-center justify-between active:bg-gray-100 dark:active:bg-white/5 cursor-pointer px-1 rounded-lg"
                    >
                      <div>
                        <div className="text-[15px] font-medium">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.role} · {c.number}</div>
                      </div>
                      <button className="text-[#34C759]">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.49l1.97-1.57c.29-.24.38-.63.26-.99A11.36 11.36 0 0 1 8.94 4c0-.55-.45-1-1-1H4.41c-.55 0-1 .45-1 1C3.41 13.06 10.94 20.59 20.01 20.59c.55 0 1-.45 1-1v-3.21c0-.55-.45-1-1-1z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 个人收藏 (Favorites) */}
      {activeTab === 'favorites' && (
        <div className="flex-1 flex flex-col pt-1 pb-16 px-4 overflow-hidden">
          <h1 className="text-3xl font-bold tracking-tight mb-4">个人收藏</h1>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: '妈妈', num: '138 0013 8000', icon: '❤️' },
              { name: '林晓', num: '139 8888 6666', icon: '⭐' },
              { name: '爸爸', num: '139 0000 1111', icon: '🏠' },
              { name: '顺丰快递', num: '95338', icon: '📦' },
            ].map(f => (
              <button
                key={f.name}
                onClick={() => startCall(f.name, f.num)}
                className={`p-3.5 rounded-2xl flex flex-col items-start ${
                  isDarkMode ? 'bg-[#1C1C1E]' : 'bg-gray-50 border border-gray-100'
                } active:scale-95 transition-transform`}
              >
                <span className="text-xl mb-1">{f.icon}</span>
                <span className="text-sm font-semibold">{f.name}</span>
                <span className="text-[11px] text-gray-400 mt-0.5">住宅电话</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 语音留言 (Voicemail) */}
      {activeTab === 'voicemail' && (
        <div className="flex-1 flex flex-col items-center justify-center pb-16 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-2xl mb-3">
            ➿
          </div>
          <h3 className="text-base font-semibold mb-1">无语音留言</h3>
          <p className="text-xs text-gray-400">目前没有新的未听取电话语音留言</p>
        </div>
      )}

      {/* iOS 经典 5 个 Tab 栏 */}
      <div className={`absolute bottom-0 left-0 right-0 h-14 ${
        isDarkMode ? 'bg-[#1C1C1E]/90 border-white/10' : 'bg-white/90 border-black/5'
      } border-t backdrop-blur-xl flex items-center justify-around z-30 px-1`}>
        {[
          { id: 'favorites', label: '个人收藏', icon: 'star' },
          { id: 'recents', label: '最近通话', icon: 'clock' },
          { id: 'contacts', label: '通讯录', icon: 'contacts' },
          { id: 'keypad', label: '拨号键盘', icon: 'keypad' },
          { id: 'voicemail', label: '语音留言', icon: 'voicemail' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-[#007AFF] font-medium' : 'text-gray-400'
              }`}
            >
              {tab.icon === 'star' && (
                <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
              {tab.icon === 'clock' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2" />
                </svg>
              )}
              {tab.icon === 'contacts' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              {tab.icon === 'keypad' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="18" r="1.5" fill="currentColor" />
                </svg>
              )}
              {tab.icon === 'voicemail' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="6" cy="12" r="4" strokeWidth={1.8} />
                  <circle cx="18" cy="12" r="4" strokeWidth={1.8} />
                  <path strokeLinecap="round" strokeWidth={1.8} d="M6 16h12" />
                </svg>
              )}
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhoneScreen;
