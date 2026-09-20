import React, { useState } from 'react';

interface AlipayScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
}

const AlipayScreen: React.FC<AlipayScreenProps> = ({ onBack, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'wealth' | 'message' | 'mine'>('home');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrType, setQrType] = useState<'pay' | 'receive'>('pay');
  const [showScanModal, setShowScanModal] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [energyCollected, setEnergyCollected] = useState(false);
  const [energyAmount, setEnergyAmount] = useState(158);

  const primaryBlue = '#1677FF';

  const quickServices = [
    { name: '扫一扫', icon: 'scan', action: () => setShowScanModal(true) },
    { name: '收付款', icon: 'qr', action: () => { setQrType('pay'); setShowQrModal(true); } },
    { name: '出行', icon: 'bus', action: () => { setQrType('pay'); setShowQrModal(true); } },
    { name: '卡包', icon: 'wallet', action: () => {} },
  ];

  const gridServices = [
    { name: '转账', icon: '💸', color: 'bg-blue-50 text-blue-600' },
    { name: '信用卡还款', icon: '💳', color: 'bg-orange-50 text-orange-500' },
    { name: '余额宝', icon: '📈', color: 'bg-red-50 text-red-500' },
    { name: '手机充值', icon: '📱', color: 'bg-indigo-50 text-indigo-500' },
    { name: '生活缴费', icon: '💡', color: 'bg-yellow-50 text-yellow-600' },
    { name: '医疗健康', icon: '🩺', color: 'bg-emerald-50 text-emerald-500' },
    { name: '市民中心', icon: '🏛️', color: 'bg-sky-50 text-sky-500' },
    { name: '更多', icon: '⋯', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className={`w-full h-full ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F6F8] text-[#333333]'} flex flex-col relative select-none overflow-hidden transition-colors duration-300`}>
      {/* 沉浸式顶部区域 (支付宝经典深蓝底色) */}
      <div className="bg-[#1677FF] text-white pt-11 pb-3 px-4 shadow-md transition-all">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between mb-3">
          <button 
            id="alipay-back-button"
            onClick={onBack}
            className="flex items-center text-white/90 hover:text-white active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs ml-0.5 font-medium opacity-90">返回</span>
          </button>

          <div className="flex items-center space-x-1 font-medium text-sm">
            <span>杭州</span>
            <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setHideAmount(!hideAmount)} className="text-white/90 hover:text-white">
              {hideAmount ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              支
            </div>
          </div>
        </div>

        {/* 顶部搜索条 */}
        <div className="bg-white/95 rounded-full px-3 py-1.5 flex items-center shadow-inner text-gray-500 mb-3">
          <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs text-gray-400 flex-1 truncate">搜索服务、商家、转账或乘车</span>
          <div className="bg-[#1677FF] text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium active:scale-95 transition-transform cursor-pointer">
            搜索
          </div>
        </div>

        {/* 金刚区 4 大快捷入口 */}
        <div className="grid grid-cols-4 gap-2 pt-1 pb-1">
          {quickServices.map((item, idx) => (
            <button
              key={idx}
              id={`alipay-quick-${item.name}`}
              onClick={item.action}
              className="flex flex-col items-center justify-center text-white active:scale-90 transition-transform py-1"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1">
                {item.icon === 'scan' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                )}
                {item.icon === 'qr' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
                    <path strokeWidth="2" d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h3v3h-3zM19 19h2v2h-2z" />
                  </svg>
                )}
                {item.icon === 'bus' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="3" width="16" height="16" rx="3" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M4 11h16M7 15h.01M17 15h.01M6 19l-2 2M18 19l2 2" />
                  </svg>
                )}
                {item.icon === 'wallet' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                )}
              </div>
              <span className="text-[11px] font-medium tracking-tight">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-16 space-y-3">
        {/* 服务功能九宫格 */}
        <div className={`${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} rounded-2xl p-3 shadow-sm`}>
          <div className="grid grid-cols-4 gap-y-3.5 text-center">
            {gridServices.map((s, idx) => (
              <button
                key={idx}
                className="flex flex-col items-center justify-center active:scale-90 transition-transform"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg mb-1 shadow-sm ${isDarkMode ? 'bg-white/10' : s.color}`}>
                  {s.icon}
                </div>
                <span className={`text-[11px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 资产与收益卡片 */}
        <div className={`${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} rounded-2xl p-3.5 shadow-sm`}>
          <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-gray-500">我的资产</span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium dark:bg-blue-900/30 dark:text-blue-300">安全守护中</span>
            </div>
            <span className="text-[11px] text-gray-400">总资产明细 &gt;</span>
          </div>
          
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">总金额 (元)</div>
              <div className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {hideAmount ? '****' : '¥ 88,620.50'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 mb-0.5">昨日收益</div>
              <div className="text-sm font-semibold text-red-500">
                {hideAmount ? '****' : '+¥ 28.32'}
              </div>
            </div>
          </div>
        </div>

        {/* 蚂蚁森林互动小卡片 */}
        <div className={`rounded-2xl p-3.5 shadow-sm relative overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shadow-md">
                🌲
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">蚂蚁森林</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">已有 5 颗真树在荒漠种下</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!energyCollected) {
                  setEnergyCollected(true);
                  setEnergyAmount(prev => prev + 52);
                }
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                energyCollected 
                  ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-default' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95 animate-bounce'
              }`}
            >
              {energyCollected ? `已收取 (${energyAmount}g)` : `收取 52g 能量`}
            </button>
          </div>
        </div>

        {/* 常用服务动态 */}
        <div className={`${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} rounded-2xl p-3.5 shadow-sm space-y-2.5`}>
          <div className="text-xs font-bold text-gray-700 dark:text-gray-200">生活助手</div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-gray-50 dark:border-white/5">
            <span className="text-gray-500">余额宝收益到账</span>
            <span className="text-gray-800 dark:text-gray-300 font-medium">今天 06:00 +28.32</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-gray-500">本月花呗应还款</span>
            <span className="text-blue-600 font-medium">已自动还清</span>
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <div className={`absolute bottom-0 left-0 right-0 h-14 ${isDarkMode ? 'bg-[#1c1c1e] border-white/10' : 'bg-white border-black/5'} border-t flex items-center justify-around z-30 px-2`}>
        {[
          { id: 'home', label: '首页', icon: '🏠' },
          { id: 'wealth', label: '理财', icon: '📊' },
          { id: 'message', label: '消息', icon: '💬' },
          { id: 'mine', label: '我的', icon: '👤' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === tab.id ? 'text-[#1677FF] font-semibold scale-105' : 'text-gray-400'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 收付款模态弹窗 */}
      {showQrModal && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 animate-ios-fade">
          <div className={`${isDarkMode ? 'bg-[#222]' : 'bg-white'} rounded-3xl w-full max-w-[310px] p-5 shadow-2xl relative text-center`}>
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500"
            >
              ✕
            </button>

            <div className="flex items-center justify-center space-x-3 mb-4 border-b pb-3 border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setQrType('pay')}
                className={`text-xs font-bold px-3 py-1 rounded-full ${qrType === 'pay' ? 'bg-[#1677FF] text-white' : 'text-gray-400'}`}
              >
                向商家付钱
              </button>
              <button 
                onClick={() => setQrType('receive')}
                className={`text-xs font-bold px-3 py-1 rounded-full ${qrType === 'receive' ? 'bg-[#1677FF] text-white' : 'text-gray-400'}`}
              >
                个人收钱码
              </button>
            </div>

            {/* 条形码与二维码模拟 */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center">
              {/* 模拟条形码 */}
              <div className="w-full h-11 flex justify-between items-center mb-3 px-1 overflow-hidden">
                {[4, 2, 6, 1, 3, 5, 2, 4, 1, 3, 6, 2, 4, 1, 5, 3, 2, 6, 3, 1, 4, 2, 5, 3, 2].map((w, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${w}px` }}></div>
                ))}
              </div>
              <div className="text-[10px] text-gray-400 mb-3 tracking-widest">6214 **** **** 8820</div>

              {/* 模拟二维码 */}
              <div className="w-36 h-36 border-2 border-black p-2 flex flex-col justify-between relative bg-white">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                  <div className="w-8 h-8 border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                </div>
                <div className="flex justify-center items-center">
                  <div className="w-6 h-6 rounded bg-[#1677FF] flex items-center justify-center text-white text-[10px] font-bold">
                    支
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="w-8 h-8 border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-gray-400">
              每分钟自动刷新 · 付款保护中
            </div>
          </div>
        </div>
      )}

      {/* 扫一扫模拟取景框 */}
      {showScanModal && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col animate-ios-fade text-white">
          <div className="pt-12 px-4 flex justify-between items-center">
            <button 
              onClick={() => setShowScanModal(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              ✕
            </button>
            <span className="text-sm font-semibold">扫一扫</span>
            <div className="w-8"></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6">
            {/* 扫描框 */}
            <div className="w-56 h-56 border-2 border-[#1677FF] rounded-2xl relative flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(22,119,255,0.4)]">
              {/* 扫描激光线 */}
              <div className="absolute left-0 right-0 h-0.5 bg-[#1677FF] shadow-[0_0_8px_#1677FF] animate-pulse"></div>
              {/* 四个角装饰 */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white"></div>
            </div>
            <p className="text-xs text-white/70 mt-6">对准二维码/条形码到框内即可扫描</p>
          </div>

          <div className="pb-12 flex justify-around px-12">
            <button className="flex flex-col items-center text-xs opacity-80 hover:opacity-100">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">🖼️</div>
              相册
            </button>
            <button className="flex flex-col items-center text-xs opacity-80 hover:opacity-100">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">🔦</div>
              手电筒
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlipayScreen;
