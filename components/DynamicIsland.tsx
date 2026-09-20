import React, { useState, useEffect } from 'react';

export interface DynamicIslandProps {
  activeApp: string; // 'homescreen' | 'qq' | 'phone' | 'messages' | 'alipay' | 'settings' | 'api-settings'
  isDarkMode?: boolean;
  onOpenApp?: (appName: string) => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeApp,
  isDarkMode,
  onOpenApp,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [phoneTimer, setPhoneTimer] = useState<number>(0);

  const isHome = activeApp === 'homescreen';

  // 电话软件通话计时
  useEffect(() => {
    let interval: any;
    if (activeApp === 'phone') {
      interval = setInterval(() => {
        setPhoneTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setPhoneTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeApp]);

  // 切换软件或退回主屏时重置展开状态
  useEffect(() => {
    setIsExpanded(false);
  }, [activeApp]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-14 flex justify-center items-start z-[80] pointer-events-none">
      <div
        id="dynamic-island"
        onClick={() => {
          if (!isHome) {
            setIsExpanded(!isExpanded);
          }
        }}
        className={`mt-3.5 bg-black text-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none overflow-hidden ${
          !isHome ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none cursor-default'
        } ${
          isExpanded
            ? 'w-[340px] rounded-[36px] p-4 shadow-2xl border border-white/10'
            : !isHome
            ? 'w-36 h-10 rounded-full px-3.5 flex items-center justify-between shadow-md hover:scale-[1.02] active:scale-95 border border-white/10'
            : 'w-32 h-10 rounded-full flex items-center justify-center'
        }`}
      >
        {/* ================= 1. 主屏幕未打开应用：经典原生标准药丸状态 ================= */}
        {isHome && (
          <div className="w-full h-full flex items-center justify-center">
            {/* 经典原生摄像头传感器 */}
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 ml-16"></div>
          </div>
        )}

        {/* ================= 2. 打开软件但未展开：对应应用的紧凑动态药丸态 ================= */}
        {!isHome && !isExpanded && (
          <div className="w-full h-full flex items-center justify-between text-xs">
            {activeApp === 'phone' && (
              <>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] animate-pulse">
                    📞
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">通话中</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                  {formatSeconds(phoneTimer)}
                </span>
              </>
            )}

            {activeApp === 'messages' && (
              <>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center text-[8px]">
                    💬
                  </div>
                  <span className="text-[10px] text-green-300 font-medium">信息</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                <span className="text-[10px] text-white/60 shrink-0">编辑中</span>
              </>
            )}

            {activeApp === 'qq' && (
              <>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">
                    🐧
                  </div>
                  <span className="text-[10px] text-blue-300 font-medium">QQ AI</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                <div className="flex items-center space-x-0.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                  <span className="text-[9px] text-blue-200 ml-1">在线</span>
                </div>
              </>
            )}

            {activeApp === 'alipay' && (
              <>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1677FF] flex items-center justify-center text-[7px] font-bold">
                    支
                  </div>
                  <span className="text-[10px] text-blue-200 font-medium">支付宝</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                <span className="text-[10px] text-emerald-400 shrink-0">● 安全保护</span>
              </>
            )}

            {(activeApp === 'settings' || activeApp === 'api-settings') && (
              <>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#636366] flex items-center justify-center text-[8px]">
                    ⚙️
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">设置</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                <span className="text-[10px] text-white/60 shrink-0">运行良好</span>
              </>
            )}
          </div>
        )}

        {/* ================= 3. 打开软件且点击药丸：对应应用的展开大卡片态 ================= */}
        {!isHome && isExpanded && (
          <div className="w-full flex flex-col text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 font-medium">
                当前运行软件状态
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-[10px] text-white cursor-pointer"
                title="折叠灵动岛"
              >
                ✕
              </button>
            </div>

            {/* 电话展开 */}
            {activeApp === 'phone' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-xl text-white shadow-lg shadow-emerald-500/30">
                    📞
                  </div>
                  <div>
                    <div className="text-sm font-semibold">正在通话 · 电话</div>
                    <div className="text-xs text-emerald-400 flex items-center space-x-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>通话时长 {formatSeconds(phoneTimer)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] text-white/80">
                  高清通话
                </div>
              </div>
            )}

            {/* 信息展开 */}
            {activeApp === 'messages' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-green-500 flex items-center justify-center text-xl text-white shadow-lg shadow-green-500/30">
                    💬
                  </div>
                  <div>
                    <div className="text-sm font-semibold">信息服务</div>
                    <div className="text-xs text-white/70 mt-0.5">iMessage 端到端加密通话已就绪</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-md bg-green-500/20 text-green-400 font-medium">
                  在线保护
                </span>
              </div>
            )}

            {/* QQ 展开 */}
            {activeApp === 'qq' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500 flex items-center justify-center text-xl text-white shadow-lg shadow-blue-500/30">
                    🐧
                  </div>
                  <div>
                    <div className="text-sm font-semibold">QQ 智能助手</div>
                    <div className="text-xs text-blue-300 mt-0.5">AI 对话引擎待命中，随时响应</div>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
            )}

            {/* 支付宝展开 */}
            {activeApp === 'alipay' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1677FF] flex items-center justify-center text-xl text-white shadow-lg shadow-blue-600/30 font-bold">
                    支
                  </div>
                  <div>
                    <div className="text-sm font-semibold">支付宝金融沙盒</div>
                    <div className="text-xs text-blue-200 mt-0.5">付款码防截屏 · 账户安全险已生效</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-medium">
                  安全加密
                </span>
              </div>
            )}

            {/* 设置展开 */}
            {(activeApp === 'settings' || activeApp === 'api-settings') && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#636366] flex items-center justify-center text-xl text-white shadow-lg shadow-gray-600/30">
                    ⚙️
                  </div>
                  <div>
                    <div className="text-sm font-semibold">系统设置</div>
                    <div className="text-xs text-gray-300 mt-0.5">参数配置实时生效中</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-md bg-white/10 text-white/80">
                  同步中
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicIsland;
