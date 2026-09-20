import React, { useState } from 'react';
import { AppInfo } from '../types';
import { QQIcon, SettingsAppIcon, AlipayAppIcon, MessagesAppIcon, PhoneAppIcon } from './icons';

interface AppLibraryScreenProps {
  onAppOpen: (appName: string) => void;
  isDarkMode: boolean;
  onBackToHome?: () => void;
}

interface AppCategory {
  id: string;
  name: string;
  apps: AppInfo[];
}

export const allAppsList: AppInfo[] = [
  { name: '电话', icon: PhoneAppIcon, color: 'bg-green-500' },
  { name: '信息', icon: MessagesAppIcon, color: 'bg-green-500' },
  { name: 'QQ', icon: QQIcon, color: 'bg-blue-500' },
  { name: '支付宝', icon: AlipayAppIcon, color: 'bg-[#1677FF]' },
  { name: '设置', icon: SettingsAppIcon, color: 'bg-[#636366]' },
];

const categories: AppCategory[] = [
  {
    id: 'suggestions',
    name: '建议',
    apps: [
      { name: 'QQ', icon: QQIcon, color: 'bg-blue-500' },
      { name: '支付宝', icon: AlipayAppIcon, color: 'bg-[#1677FF]' },
      { name: '信息', icon: MessagesAppIcon, color: 'bg-green-500' },
      { name: '电话', icon: PhoneAppIcon, color: 'bg-green-500' },
    ],
  },
  {
    id: 'social',
    name: '社交与通讯',
    apps: [
      { name: '信息', icon: MessagesAppIcon, color: 'bg-green-500' },
      { name: 'QQ', icon: QQIcon, color: 'bg-blue-500' },
      { name: '电话', icon: PhoneAppIcon, color: 'bg-green-500' },
    ],
  },
  {
    id: 'finance',
    name: '财务与生活',
    apps: [
      { name: '支付宝', icon: AlipayAppIcon, color: 'bg-[#1677FF]' },
    ],
  },
  {
    id: 'utilities',
    name: '实用工具',
    apps: [
      { name: '设置', icon: SettingsAppIcon, color: 'bg-[#636366]' },
      { name: '电话', icon: PhoneAppIcon, color: 'bg-green-500' },
    ],
  },
];

const AppLibraryScreen: React.FC<AppLibraryScreenProps> = ({ onAppOpen, isDarkMode, onBackToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = allAppsList.filter(app =>
    app.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col pt-[68px] px-5 select-none overflow-hidden">
      {/* 顶部 iOS 资源库搜索栏 */}
      <div className="mb-4 flex items-center gap-2">
        {onBackToHome && (
          <button
            id="app-library-back-btn"
            onClick={onBackToHome}
            className={`h-9 px-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isDarkMode ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-white/60 hover:bg-white/80 text-black'
            } backdrop-blur-xl border border-white/20 dark:border-white/10`}
            title="返回主屏幕"
          >
            <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-medium">主屏幕</span>
          </button>
        )}
        <div
          className={`flex-1 h-9 px-3 rounded-xl flex items-center transition-colors ${
            isDarkMode ? 'bg-white/15 text-white' : 'bg-white/65 text-black'
          } backdrop-blur-xl border border-white/20 dark:border-white/10`}
        >
          <svg
            className={`w-4 h-4 mr-2.5 shrink-0 ${isDarkMode ? 'text-white/60' : 'text-black/50'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="app-library-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="App 资源库"
            className={`bg-transparent text-sm w-full outline-none ${
              isDarkMode ? 'placeholder:text-white/50 text-white' : 'placeholder:text-neutral-500 text-black'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] text-white shrink-0 ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果视图 (有输入时以字母列表呈现) */}
      {searchQuery.trim() ? (
        <div className="flex-1 overflow-y-auto space-y-2 pb-24">
          <div className="text-xs text-white/70 font-medium px-1 mb-2">匹配结果 ({filteredApps.length})</div>
          {filteredApps.length === 0 ? (
            <div className="text-center py-12 text-white/50 text-sm">未找到相关 App</div>
          ) : (
            <div className={`rounded-2xl divide-y ${isDarkMode ? 'bg-white/10 divide-white/10' : 'bg-white/50 divide-black/5'} backdrop-blur-xl overflow-hidden`}>
              {filteredApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <div
                    key={app.name}
                    id={`app-library-result-${app.name}`}
                    onClick={() => onAppOpen(app.name)}
                    className="p-3 flex items-center space-x-3 active:bg-white/20 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      <div className="transform scale-90">
                        {IconComponent ? (
                          <IconComponent darkMode={isDarkMode} tintColor={isDarkMode ? '#ffffff' : '#000000'} />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {app.name ? app.name.slice(0, 1) : '?'}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-white flex-1">{app.name}</span>
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 分类文件夹 2x2 网格视图 (Categorized Folders) */
        <div className="flex-1 overflow-y-auto pb-24 pr-0.5">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center">
                {/* 文件夹圆角毛玻璃卡片 */}
                <div
                  id={`app-folder-${cat.id}`}
                  className={`w-full aspect-square rounded-[26px] p-2.5 flex flex-col justify-between transition-all ${
                    isDarkMode
                      ? 'bg-white/10 border border-white/10'
                      : 'bg-white/40 border border-white/30'
                  } backdrop-blur-2xl`}
                >
                  <div className="grid grid-cols-2 gap-2 w-full h-full">
                    {cat.apps.slice(0, 4).map((app) => {
                      const IconComponent = app.icon;
                      return (
                        <button
                          key={app.name}
                          id={`app-folder-item-${cat.id}-${app.name}`}
                          onClick={() => onAppOpen(app.name)}
                          className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/15 active:scale-90 transition-transform cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                            <div className="transform scale-90">
                              {IconComponent ? (
                                <IconComponent darkMode={isDarkMode} tintColor={isDarkMode ? '#ffffff' : '#000000'} />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                  {app.name ? app.name.slice(0, 1) : '?'}
                                </div>
                              )}
                            </div>
                          </div>
                          <span
                            className="text-[10px] text-white mt-1 font-medium tracking-tight truncate max-w-[54px] text-center"
                          >
                            {app.name}
                          </span>
                        </button>
                      );
                    })}

                    {/* 如果少于 4 个，补齐半透明占位微网格，符合 iOS 原生空位视觉 */}
                    {Array.from({ length: Math.max(0, 4 - cat.apps.length) }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-center p-1">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 文件夹分类标题 */}
                <span
                  className="text-[11px] font-semibold text-white mt-1.5 tracking-wide text-center"
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { AppLibraryScreen };
export default AppLibraryScreen;
