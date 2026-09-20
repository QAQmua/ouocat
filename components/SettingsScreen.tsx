import React, { useState } from 'react';
import { AiConfig } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  config: AiConfig;
  onOpenApiSettings: () => void;
  personasCount: number;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  isDarkMode,
  onToggleDarkMode,
  config,
  onOpenApiSettings,
  personasCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const bgColor = isDarkMode ? 'bg-black' : 'bg-[#F2F2F7]';
  const groupBg = isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const subTextColor = isDarkMode ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
  const dividerColor = isDarkMode ? 'border-[#38383A]' : 'border-[#E5E5EA]';

  return (
    <div id="settings-screen" className={`w-full h-full ${bgColor} flex flex-col transition-colors duration-300 relative select-none`}>
      {/* iOS Header */}
      <div className={`pt-12 pb-2 px-4 flex items-center justify-between sticky top-0 z-20 ${isDarkMode ? 'bg-black/80' : 'bg-[#F2F2F7]/80'} backdrop-blur-xl border-b ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
        <button 
          id="settings-back-button"
          onClick={onBack} 
          className="flex items-center space-x-1 text-[#007AFF] active:opacity-50 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[15px] font-medium">主屏幕</span>
        </button>
        <h1 className={`text-[17px] font-semibold ${textColor}`}>设置</h1>
        <div className="w-12" /> {/* Spacer for symmetry */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 pb-20">
        {/* Search Bar */}
        <div className={`flex items-center px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-[#E3E3E8]'} text-sm`}>
          <svg className="w-4 h-4 text-[#8E8E93] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`bg-transparent outline-none w-full ${textColor} placeholder-[#8E8E93] text-sm`}
          />
        </div>

        {/* Profile / Apple ID Banner */}
        <div className={`${groupBg} rounded-2xl p-3.5 flex items-center space-x-3.5 shadow-sm`}>
          <div className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            iOS
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[16px] font-medium ${textColor} truncate`}>Phone User</div>
            <div className={`text-[12px] ${subTextColor} truncate`}>Apple ID、iCloud+ 与媒体</div>
          </div>
          <svg className="w-4 h-4 text-[#C7C7CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Appearance Group (Dark Mode) */}
        <div className={`${groupBg} rounded-2xl overflow-hidden shadow-sm`}>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </div>
              <div>
                <div className={`text-[15px] font-normal ${textColor}`}>深色模式</div>
                <div className={`text-[11px] ${subTextColor}`}>{isDarkMode ? '深色外观已开启' : '浅色外观'}</div>
              </div>
            </div>
            
            {/* iOS Switch */}
            <button
              id="dark-mode-toggle-switch"
              onClick={onToggleDarkMode}
              className={`w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-300 flex items-center ${
                isDarkMode ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
              }`}
            >
              <div
                className={`w-[27px] h-[27px] rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-[20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* AI & Services Group */}
        <div className={`${groupBg} rounded-2xl overflow-hidden shadow-sm`}>
          {/* AI Settings entry */}
          <button
            id="settings-api-link"
            onClick={onOpenApiSettings}
            className={`w-full px-4 py-3 flex items-center justify-between border-b ${dividerColor} active:opacity-60 transition-opacity text-left`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className={`text-[15px] font-normal ${textColor}`}>AI 与模型管理</div>
                <div className={`text-[11px] ${subTextColor}`}>配置 API Key、端点与默认模型</div>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[13px] ${subTextColor} max-w-[90px] truncate`}>
                {config.modelName.replace('gemini-', '')}
              </span>
              <svg className="w-4 h-4 text-[#C7C7CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* QQ AI Personas Info */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className={`text-[15px] font-normal ${textColor}`}>QQ AI 对话角色</span>
            </div>
            <span className={`text-[13px] ${subTextColor}`}>{personasCount} 个角色</span>
          </div>
        </div>

        {/* Sounds & System Toggles Group */}
        <div className={`${groupBg} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-4 py-3 flex items-center justify-between border-b ${dividerColor}`}>
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 6v12l-4-4H4V10h4l4-4z" />
                </svg>
              </div>
              <span className={`text-[15px] font-normal ${textColor}`}>声音与按键提示</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-300 flex items-center ${
                soundEnabled ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
              }`}
            >
              <div
                className={`w-[27px] h-[27px] rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  soundEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`text-[15px] font-normal ${textColor}`}>触感反馈</span>
            </div>
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={`w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-300 flex items-center ${
                hapticsEnabled ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
              }`}
            >
              <div
                className={`w-[27px] h-[27px] rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  hapticsEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* General / About Device Group */}
        <div className={`${groupBg} rounded-2xl overflow-hidden shadow-sm`}>
          <button
            id="settings-about-button"
            onClick={() => setShowAboutModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between active:opacity-60 transition-opacity text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-gray-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-[15px] font-normal ${textColor}`}>关于本机</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[13px] ${subTextColor}`}>iPhone 16 Pro</span>
              <svg className="w-4 h-4 text-[#C7C7CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* About Device Modal */}
      {showAboutModal && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className={`w-full rounded-2xl ${groupBg} p-5 space-y-4 shadow-2xl animate-ios-pop border ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${textColor}`}>关于本机</h2>
              <button
                onClick={() => setShowAboutModal(false)}
                className="text-[#007AFF] text-sm font-medium"
              >
                完成
              </button>
            </div>
            
            <div className={`space-y-2.5 text-sm ${subTextColor}`}>
              <div className="flex justify-between py-1 border-b border-gray-200/20">
                <span>设备名称</span>
                <span className={textColor}>iPhone 16 Pro</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/20">
                <span>系统版本</span>
                <span className={textColor}>iOS 18.5 (Build 26A)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/20">
                <span>核心处理器</span>
                <span className={textColor}>Apple A18 Pro</span>
              </div>
              <div className="flex justify-between py-1">
                <span>当前模型</span>
                <span className={textColor}>{config.modelName}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
