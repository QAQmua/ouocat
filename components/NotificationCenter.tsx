
import React, { useState } from 'react';

interface Notification {
  id: number;
  app: string;
  title: string;
  content: string;
  time: string;
}

const initialNotifications: Notification[] = [
  { id: 1, app: 'QQ AI', title: '新的灵感', content: '我刚才想到了一个更有趣的笑话，要听听吗？ ^_^', time: '现在' },
  { id: 2, app: '系统', title: '神经网络更新', content: 'iOS 26 核心组件已优化，响应速度提升 15%。', time: '10分钟前' }
];

interface NotificationCenterProps {
  progress: number; // 0 to 1
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ progress, isOpen, onClose, isDarkMode, onToggleDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showSettings, setShowSettings] = useState(false);
  const [appPreferences, setAppPreferences] = useState<Record<string, boolean>>({
    'QQ AI': true,
    '系统': true
  });

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('zh-CN', options);
  };

  const translateY = (progress - 1) * 100;

  const handleClearAll = () => {
    setNotifications([]);
    setShowSettings(false);
  };

  const toggleAppPreference = (app: string) => {
    setAppPreferences(prev => ({ ...prev, [app]: !prev[app] }));
  };

  const filteredNotifications = notifications.filter(n => appPreferences[n.app]);

  return (
    <div 
      className="absolute inset-0 z-[100] pointer-events-none transition-transform duration-300 ease-out"
      style={{ 
        transform: `translateY(${translateY}%)`,
        opacity: progress > 0 ? 1 : 0
      }}
    >
      <div className={`w-full h-full ${isDarkMode ? 'bg-black/60' : 'bg-white/40'} backdrop-blur-3xl pointer-events-auto flex flex-col items-center pt-16 px-6 transition-colors duration-500`}>
        
        {/* Top Actions */}
        <div className="absolute top-14 left-0 right-0 px-8 flex justify-between items-center z-10">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-colors active:scale-90 ${
              isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${
                isDarkMode ? 'text-white/60' : 'text-black/60'
              } ${showSettings ? 'rotate-180' : 'rotate-0'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Settings Overlay */}
        {showSettings && (
          <div className={`absolute top-28 left-6 right-6 z-20 ${isDarkMode ? 'bg-[#1a1a1a]/90 text-white' : 'bg-white/80 text-black'} backdrop-blur-2xl border ${isDarkMode ? 'border-white/5' : 'border-black/5'} rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">设置</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-xs font-bold opacity-40 uppercase tracking-widest px-2 py-1"
              >
                完成
              </button>
            </div>
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>深色模式</span>
                <button 
                  onClick={onToggleDarkMode}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-blue-500' : 'bg-black/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {Object.keys(appPreferences).map(app => (
                <div key={app} className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{app} 通知</span>
                  <button 
                    onClick={() => toggleAppPreference(app)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${appPreferences[app] ? (isDarkMode ? 'bg-blue-500' : 'bg-black') : 'bg-black/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appPreferences[app] ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
              <div className="pt-4 border-t border-black/5">
                <button 
                  onClick={handleClearAll}
                  className="w-full py-3 bg-black/5 rounded-2xl text-sm font-bold text-red-500 hover:bg-black/10 transition-colors"
                >
                  清除所有通知
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clock Section */}
        <div className={`text-center mb-10 transition-all duration-500 ${showSettings ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`} style={{ transform: `scale(${0.8 + progress * 0.2})` }}>
          <div className={`text-[72px] font-bold tracking-tighter leading-none transition-colors duration-500 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className={`text-lg font-medium mt-2 transition-colors duration-500 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Notifications List */}
        <div className={`w-full space-y-3 overflow-y-auto max-h-[400px] scrollbar-hide transition-all duration-500 ${showSettings ? 'opacity-20 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`backdrop-blur-md border rounded-[2rem] p-4 shadow-sm active:scale-95 transition-all duration-300 ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white/60 border-white/20'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 ${notif.app === 'QQ AI' ? 'bg-blue-500' : (isDarkMode ? 'bg-white/40' : 'bg-black/40')} rounded-sm`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{notif.app}</span>
                  </div>
                  <span className={`text-[10px] ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{notif.time}</span>
                </div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white/90' : 'text-black/80'}`}>{notif.title}</h4>
                <p className={`text-sm leading-snug mt-0.5 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{notif.content}</p>
              </div>
            ))
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 transition-opacity ${isDarkMode ? 'opacity-10' : 'opacity-20'}`}>
              <div className={`text-sm font-medium tracking-widest uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>没有新通知</div>
            </div>
          )}
        </div>

        {/* Bottom Handle */}
        <div 
          className="absolute bottom-4 left-0 right-0 flex justify-center cursor-pointer p-4"
          onClick={onClose}
        >
          <div className={`w-12 h-1.5 ${isDarkMode ? 'bg-white/20' : 'bg-black/10'} rounded-full transition-colors duration-500`}></div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
