
import React from 'react';

type IconProps = { 
    className?: string;
    darkMode?: boolean;
    tintColor?: string;
    color?: string;
};

export const QQIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
    <div className={`${className} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-blue-500 rounded-2xl shadow-inner"></div>
        <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 relative z-10 p-1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" opacity=".2"/>
        </svg>
    </div>
);

export const SettingsAppIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
    <div className={`${className} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#8E8E93] via-[#636366] to-[#48484A] rounded-2xl shadow-inner"></div>
        {/* iOS Settings Gear Icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative z-10">
            <circle cx="12" cy="12" r="3.2" strokeWidth="2" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    </div>
);

export const ApiAppIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
    <div className={`${className} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative z-10">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    </div>
);

export const QQSearchIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export const QQPlusIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export const QQMessageNavIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive ? '#3b82f6' : 'none'} stroke={isActive ? '#3b82f6' : '#6b7280'} strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
);

export const QQContactsNavIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive ? '#3b82f6' : 'none'} stroke={isActive ? '#3b82f6' : '#6b7280'} strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

export const QQKandianNavIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive ? '#3b82f6' : 'none'} stroke={isActive ? '#3b82f6' : '#6b7280'} strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

export const QQDongtaiNavIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive ? '#3b82f6' : 'none'} stroke={isActive ? '#3b82f6' : '#6b7280'} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

export const TencentDocsIcon: React.FC = () => (
    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    </div>
);

export const QQPayIcon: React.FC = () => (
    <div className="w-full h-full rounded-full bg-orange-400 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <path d="M16 14a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    </div>
);

export const GroupChatIcon: React.FC = () => (
    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    </div>
);

export const UserAvatarIcon1: React.FC = () => (
    <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
        Z
    </div>
);

export const UserAvatarIcon2: React.FC = () => (
    <div className="w-full h-full rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">
        L
    </div>
);

// 支付宝 App 图标 (Alipay)
export const AlipayAppIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
    <div className={`${className} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-[#1677FF] rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
            {/* 柔和高光 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20"></div>
        </div>
        {/* 支付宝精细矢量“支”字 */}
        <svg viewBox="0 0 1024 1024" fill="white" className="w-8 h-8 relative z-10">
            <path d="M796.8 624.4c-68.8-30.8-154-71.8-232-108.4 46-65.6 84.8-145.4 112.4-232.8H800V224H544V128h-96v96H192v59.2h384c-22.8 65.6-54.8 126.8-93.2 178-62.8-54-124-118.8-174.4-189.6l-78.4 44.8C265.6 394 336 467.6 409.6 529.2 307.2 590.8 192 638 80 668.8l38.4 83.2c131.2-38 259.2-96.4 369.6-170.8 72 34 148 70.4 212 98.8-92 85.6-218 136-360 136-41.2 0-80.8-4.4-118.4-12.8v87.2c38.8 6 78.4 9.6 118.4 9.6 178 0 336-66.4 451.2-176.4l78.4 44.8 44.8-78-117.6-66z"/>
        </svg>
    </div>
);

// iOS 风格信息 App 图标 (Messages)
export const MessagesAppIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
    <div className={`${className} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#34C759] via-[#30D158] to-[#24B24B] rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/20 pointer-events-none"></div>
        </div>
        {/* iOS 经典消息气泡 */}
        <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 relative z-10">
            <path d="M12 3C6.477 3 2 6.94 2 11.8c0 2.76 1.44 5.22 3.71 6.84-.2 1.42-.81 3.1-2.2 4.16 2.45.1 4.54-.74 5.92-1.68.82.23 1.68.36 2.57.36 5.523 0 10-3.94 10-8.8S17.523 3 12 3z" />
        </svg>
    </div>
);

// iOS 风格电话 App 图标 (Phone)
export const PhoneAppIcon: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
    <div className={`${className} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#34C759] via-[#30D158] to-[#24B24B] rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/20 pointer-events-none"></div>
        </div>
        {/* iOS 经典电话听筒 */}
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 relative z-10">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.49l1.97-1.57c.29-.24.38-.63.26-.99A11.36 11.36 0 0 1 8.94 4c0-.55-.45-1-1-1H4.41c-.55 0-1 .45-1 1C3.41 13.06 10.94 20.59 20.01 20.59c.55 0 1-.45 1-1v-3.21c0-.55-.45-1-1-1z" />
        </svg>
    </div>
);

// iOS 26 信号图标：完全还原图片中的 4 柱圆角设计，最后一格为灰色
export const SignalIcon: React.FC<{ color?: string }> = ({ color = 'black' }) => (
    <div className="flex items-end space-x-[1.5px] h-[12px] mb-[0.5px]">
        <div className={`w-[3px] h-[35%] ${color === 'black' ? 'bg-black' : 'bg-white'} rounded-full`}></div>
        <div className={`w-[3px] h-[55%] ${color === 'black' ? 'bg-black' : 'bg-white'} rounded-full`}></div>
        <div className={`w-[3px] h-[75%] ${color === 'black' ? 'bg-black' : 'bg-white'} rounded-full`}></div>
        <div className={`w-[3px] h-[100%] ${color === 'black' ? 'bg-black/20' : 'bg-white/20'} rounded-full`}></div>
    </div>
);

// iOS 26 Wi-Fi 图标：三层弧形，最上层为灰色
export const WifiIcon: React.FC<{ color?: string }> = ({ color = 'black' }) => (
    <svg width="18" height="14" viewBox="0 0 20 16" fill="none" className="mb-[0.5px]">
        {/* 最底层点 */}
        <circle cx="10" cy="13.5" r="1.5" fill={color} />
        {/* 中间弧层 */}
        <path d="M6 10C7.2 8.8 8.6 8.2 10 8.2C11.4 8.2 12.8 8.8 14 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* 最顶层弧 (灰色) */}
        <path d="M3 7C5 5 7.5 4 10 4C12.5 4 15 5 17 7" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.2" />
    </svg>
);

// iOS 电池图标：灰色外框 + 单色填充（无闪电图标）
export const BatteryIcon: React.FC<{ color?: string }> = ({ color = 'black' }) => {
    const borderColor = color === 'black' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';

    return (
        <div className="flex items-center ml-1">
            <div 
                className="relative w-[25px] h-[12px] border-[1.2px] rounded-[4px] p-[1.5px] flex items-center justify-start overflow-hidden"
                style={{ borderColor }}
            >
                <div 
                    className="w-full h-full rounded-[2px] transition-colors duration-500"
                    style={{ backgroundColor: color }}
                />
            </div>
            <div 
                className="w-[1.2px] h-[4px] rounded-r-full ml-[1px] transition-colors duration-500" 
                style={{ backgroundColor: borderColor }}
            ></div>
        </div>
    );
};
