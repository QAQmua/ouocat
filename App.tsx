
import React, { useState, useRef, useEffect } from 'react';
import IphoneFrame from './components/IphoneFrame';
import HomeScreen from './components/HomeScreen';
import QQScreen from './components/QQScreen';
import ApiSettingsScreen from './components/ApiSettingsScreen';
import SettingsScreen from './components/SettingsScreen';
import AlipayScreen from './components/AlipayScreen';
import MessagesScreen from './components/MessagesScreen';
import PhoneScreen from './components/PhoneScreen';
import NotificationCenter from './components/NotificationCenter';
import DynamicIsland from './components/DynamicIsland';
import { SignalIcon, WifiIcon, BatteryIcon } from './components/icons';
import { AiConfig, Contact } from './types';

const StatusBar: React.FC<{ textColor?: string; isEditing?: boolean }> = ({ textColor = 'black', isEditing = false }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });

  return (
    <div className={`absolute top-[14px] left-0 right-0 h-[40px] px-6 flex justify-between items-center ${textColor === 'black' ? 'text-black' : 'text-white'} z-[70] pointer-events-none transition-all duration-300`}>
      <div className={`w-[30%] text-[15px] font-bold tracking-tight pl-2 transition-opacity duration-300 ${isEditing ? 'opacity-0' : 'opacity-100'}`}>{formatTime(time)}</div>
      <div className={`flex items-center justify-end space-x-2 w-[30%] pr-2 transition-opacity duration-300 ${isEditing ? 'opacity-0' : 'opacity-100'}`}>
        <SignalIcon color={textColor} />
        <WifiIcon color={textColor} />
        <BatteryIcon color={textColor} />
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState('homescreen');
  const [previousApp, setPreviousApp] = useState('homescreen');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHomeEditing, setIsHomeEditing] = useState(false);
  const [ncProgress, setNcProgress] = useState(0); 
  const [isNcOpen, setIsNcOpen] = useState(false);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  // Global AI Config
  const [aiConfig, setAiConfig] = useState<AiConfig>(() => {
    const saved = localStorage.getItem('aiConfig');
    return saved ? JSON.parse(saved) : {
      baseUrl: 'https://generativelanguage.googleapis.com',
      apiKey: '',
      modelName: 'gemini-3-flash-preview',
      temperature: 1.0,
      systemInstruction: "你现在是 QQ AI。请用幽默、亲和的对话风格交流，多使用字符表情如 ^_^。",
      availableModels: []
    };
  });

  // Persistent Personas
  const [personas, setPersonas] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('personas');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'default-ai', 
        name: 'QQ AI', 
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=QQAI', 
        initial: 'Q', 
        note: '官方智能助手', 
        systemInstruction: "你现在是 QQ AI。请用幽默、亲和的对话风格交流。",
        history: [{ role: 'model', content: '你好！我是你的 QQ 助手。^_^', timestamp: new Date().toISOString() }]
      }
    ];
  });

  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    return localStorage.getItem('activePersonaId') || 'default-ai';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('personas', JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    localStorage.setItem('activePersonaId', activePersonaId);
  }, [activePersonaId]);

  const handleAppOpen = (appName: string) => {
    setIsHomeEditing(false);
    setPreviousApp(activeApp);
    if (appName === 'QQ') setActiveApp('qq');
    else if (appName === '设置' || appName === 'Settings') setActiveApp('settings');
    else if (appName === '支付宝' || appName === 'Alipay') setActiveApp('alipay');
    else if (appName === '信息' || appName === 'Messages') setActiveApp('messages');
    else if (appName === '电话' || appName === 'Phone') setActiveApp('phone');
  };

  const handleAddPersona = (p: Contact) => {
    setPersonas(prev => [...prev, p]);
    setActivePersonaId(p.id);
  };

  const handleUpdateHistory = (personaId: string, message: any) => {
    setPersonas(prev => prev.map(p => 
      p.id === personaId ? { ...p, history: [...p.history, message] } : p
    ));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans selection:bg-blue-500/30 transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f0f2f5]'}`}>
      <IphoneFrame onGoHome={() => setActiveApp('homescreen')} isDarkMode={isDarkMode}>
        <div 
          className="relative w-full h-full overflow-hidden select-none"
          style={{ overscrollBehavior: 'none', touchAction: 'pan-x' }}
          onTouchStart={(e) => {
            const y = e.touches[0].clientY;
            if (!isNcOpen && y < 100) { touchStartY.current = y; isDragging.current = true; }
          }}
          onTouchMove={(e) => {
            if (!isDragging.current) return;
            const y = e.touches[0].clientY;
            const delta = y - touchStartY.current;
            setNcProgress(Math.min(Math.max(delta / 400, 0), 1));
          }}
          onTouchEnd={() => {
            if (!isDragging.current) return;
            isDragging.current = false;
            if (ncProgress > 0.3) { setNcProgress(1); setIsNcOpen(true); } else { setNcProgress(0); setIsNcOpen(false); }
          }}
        >
          <StatusBar 
            textColor={isDarkMode || activeApp === 'homescreen' || activeApp === 'alipay' ? 'white' : 'black'} 
            isEditing={activeApp === 'homescreen' && isHomeEditing}
          />
          
          <DynamicIsland 
            activeApp={activeApp}
            isDarkMode={isDarkMode}
            onOpenApp={(appName) => handleAppOpen(appName)}
          />

          <NotificationCenter 
            progress={ncProgress} 
            isOpen={isNcOpen} 
            onClose={() => { setNcProgress(0); setIsNcOpen(false); }} 
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />

          <div className={activeApp === 'homescreen' ? 'w-full h-full' : 'hidden'}>
            <HomeScreen 
              onAppOpen={handleAppOpen} 
              isDarkMode={isDarkMode} 
              onToggleDarkMode={() => {}} 
              onEditingChange={setIsHomeEditing}
            />
          </div>
          {activeApp === 'qq' && (
            <QQScreen 
              isDarkMode={isDarkMode} 
              onBackToHome={() => setActiveApp('homescreen')} 
              config={aiConfig} 
              personas={personas}
              activePersonaId={activePersonaId}
              onSelectPersona={setActivePersonaId}
              onAddPersona={handleAddPersona}
              onUpdateHistory={handleUpdateHistory}
            />
          )}
          {activeApp === 'alipay' && (
            <AlipayScreen 
              onBack={() => setActiveApp('homescreen')}
              isDarkMode={isDarkMode}
            />
          )}
          {activeApp === 'messages' && (
            <MessagesScreen 
              onBack={() => setActiveApp('homescreen')}
              isDarkMode={isDarkMode}
            />
          )}
          {activeApp === 'phone' && (
            <PhoneScreen 
              onBack={() => setActiveApp('homescreen')}
              isDarkMode={isDarkMode}
            />
          )}
          {activeApp === 'settings' && (
            <SettingsScreen 
              onBack={() => setActiveApp('homescreen')}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              config={aiConfig}
              onOpenApiSettings={() => {
                setPreviousApp('settings');
                setActiveApp('api-settings');
              }}
              personasCount={personas.length}
            />
          )}
          {activeApp === 'api-settings' && (
            <ApiSettingsScreen 
              onBack={() => setActiveApp('settings')} 
              isDarkMode={isDarkMode}
              config={aiConfig}
              onSave={setAiConfig}
            />
          )}
        </div>
      </IphoneFrame>
    </div>
  );
};

export default App;
