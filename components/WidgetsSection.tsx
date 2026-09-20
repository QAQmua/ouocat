import React, { useState } from 'react';

export type WidgetType = 'calendar' | 'weather' | 'stock' | 'photo';
export type WidgetStyle = 'standard' | 'minimal' | 'glass';

export interface WidgetItemConfig {
  id: string;
  type: WidgetType;
  style?: WidgetStyle;
  photoUrl?: string;
}

interface WidgetsSectionProps {
  isDarkMode: boolean;
  widgets: WidgetItemConfig[];
  isEditing: boolean;
  onRemoveWidget: (id: string) => void;
  onCycleWidgetStyle: (id: string) => void;
  onAddWidget: (type: WidgetType) => void;
  onStartDragWidget?: (index: number, e: React.MouseEvent | React.TouchEvent) => void;
  draggingWidgetIndex?: number | null;
  targetHoverWidgetIndex?: number | null;
}

export const WidgetsSection: React.FC<WidgetsSectionProps> = ({
  isDarkMode,
  widgets,
  isEditing,
  onRemoveWidget,
  onCycleWidgetStyle,
  onAddWidget,
  onStartDragWidget,
  draggingWidgetIndex = null,
  targetHoverWidgetIndex = null,
}) => {
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // Weather state
  const [weatherCityIndex, setWeatherCityIndex] = useState(0);
  const weatherCities = [
    { city: '北京', temp: '22°', weather: '晴', range: '最高 26° 最低 15°', icon: '☀️' },
    { city: '上海', temp: '25°', weather: '多云', range: '最高 27° 最低 20°', icon: '⛅' },
    { city: '深圳', temp: '28°', weather: '阵雨', range: '最高 31° 最低 24°', icon: '🌦️' },
  ];
  const currentWeather = weatherCities[weatherCityIndex];

  // Calendar state
  const today = new Date();
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const monthStr = `${today.getMonth() + 1}月`;
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Stock state
  const [stockIndex, setStockIndex] = useState(0);
  const stockList = [
    { symbol: 'AAPL', name: '苹果公司', price: '228.23', change: '+1.45%', positive: true, sparkline: [224, 225, 226, 225.5, 227, 228.23] },
    { symbol: 'NVDA', name: '英伟达', price: '128.40', change: '+3.12%', positive: true, sparkline: [122, 124, 125, 127, 126.5, 128.4] },
    { symbol: 'BABA', name: '阿里巴巴', price: '88.15', change: '-0.62%', positive: false, sparkline: [89.2, 88.9, 88.5, 88.3, 88.0, 88.15] },
    { symbol: 'TSLA', name: '特斯拉', price: '243.90', change: '+2.18%', positive: true, sparkline: [238, 239, 241, 240, 242.5, 243.9] },
  ];
  const currentStock = stockList[stockIndex];

  const renderWidget = (item: WidgetItemConfig) => {
    const style = item.style || 'standard';

    switch (item.type) {
      case 'calendar': {
        const displayDate = new Date();
        displayDate.setDate(today.getDate() + selectedDayOffset);
        const dayNum = displayDate.getDate();
        const weekday = dayNames[displayDate.getDay()];

        let cardBgClass = isDarkMode
          ? 'bg-neutral-900/80 border border-white/10 text-white'
          : 'bg-white/80 border border-white/60 text-neutral-900';

        if (style === 'minimal') {
          cardBgClass = isDarkMode
            ? 'bg-black/90 border border-rose-500/30 text-white'
            : 'bg-rose-50/90 border border-rose-200 text-neutral-900';
        } else if (style === 'glass') {
          cardBgClass = 'bg-white/20 dark:bg-white/10 border border-white/30 text-white backdrop-blur-2xl';
        }

        return (
          <div
            id={`widget-calendar-${item.id}`}
            onClick={() => {
              if (!isEditing) {
                setSelectedDayOffset((prev) => (prev + 1) % 5);
              }
            }}
            className={`w-full aspect-square rounded-[22px] p-3 flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl ${
              !isEditing ? 'cursor-pointer active:scale-95' : ''
            } ${cardBgClass}`}
            title="点击切换查看日程"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                  {weekday}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 font-medium">
                  {monthStr}
                </span>
              </div>
              <div className="text-3xl font-light tracking-tight mt-0.5">
                {dayNum}
              </div>
            </div>

            <div className={`p-2 rounded-xl text-[11px] leading-tight ${
              isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/5'
            }`}>
              <div className="flex items-center justify-between text-[10px] text-rose-500 font-medium mb-0.5">
                <span>{selectedDayOffset === 0 ? '今天' : `+${selectedDayOffset}天`} 14:00</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              </div>
              <div className="font-medium truncate">
                {selectedDayOffset === 0 ? '方案评审会' : selectedDayOffset === 1 ? '团队周例会' : '专注模式'}
              </div>
            </div>
          </div>
        );
      }

      case 'weather': {
        let cardBgClass = 'bg-gradient-to-br from-sky-400 to-blue-600 text-white';
        if (style === 'minimal') {
          cardBgClass = isDarkMode
            ? 'bg-neutral-900 border border-sky-400/40 text-white'
            : 'bg-sky-50 border border-sky-200 text-neutral-900';
        } else if (style === 'glass') {
          cardBgClass = 'bg-sky-500/30 border border-white/30 text-white backdrop-blur-2xl';
        }

        return (
          <div
            id={`widget-weather-${item.id}`}
            onClick={() => {
              if (!isEditing) {
                setWeatherCityIndex((prev) => (prev + 1) % weatherCities.length);
              }
            }}
            className={`w-full aspect-square rounded-[22px] p-3 flex flex-col justify-between transition-all duration-300 ${
              !isEditing ? 'cursor-pointer active:scale-95' : ''
            } ${cardBgClass}`}
            title="点击切换城市"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide flex items-center gap-1">
                  <span>{currentWeather.city}</span>
                  <span className="text-[9px] opacity-75">▼</span>
                </span>
                <span className="text-xl">{currentWeather.icon}</span>
              </div>
              <div className="text-3xl font-light tracking-tight mt-0.5">
                {currentWeather.temp}
              </div>
            </div>

            <div className="text-[11px] leading-snug">
              <div className="font-semibold">{currentWeather.weather}</div>
              <div className="text-[10px] opacity-80">{currentWeather.range}</div>
            </div>
          </div>
        );
      }

      case 'stock': {
        const pts = currentStock.sparkline;
        const minVal = Math.min(...pts);
        const maxVal = Math.max(...pts);
        const range = maxVal - minVal || 1;
        const svgPoints = pts
          .map((v, i) => {
            const x = (i / (pts.length - 1)) * 100;
            const y = 35 - ((v - minVal) / range) * 30;
            return `${x},${y}`;
          })
          .join(' ');

        let cardBgClass = isDarkMode
          ? 'bg-neutral-900/80 border border-white/10 text-white'
          : 'bg-white/80 border border-white/60 text-neutral-900';

        if (style === 'minimal') {
          cardBgClass = isDarkMode
            ? 'bg-black border border-emerald-500/30 text-white'
            : 'bg-emerald-50 border border-emerald-200 text-neutral-900';
        } else if (style === 'glass') {
          cardBgClass = 'bg-white/20 dark:bg-white/10 border border-white/30 text-white backdrop-blur-2xl';
        }

        return (
          <div
            key={item.id}
            id={`widget-stock-${item.id}`}
            onClick={() => {
              if (!isEditing) {
                setStockIndex((prev) => (prev + 1) % stockList.length);
              }
            }}
            className={`w-full aspect-square rounded-[22px] p-3 flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl ${
              !isEditing ? 'cursor-pointer active:scale-95' : ''
            } ${cardBgClass}`}
            title="点击切换股票"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-tight">
                  {currentStock.symbol}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    currentStock.positive
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-rose-500/15 text-rose-500'
                  }`}
                >
                  {currentStock.change}
                </span>
              </div>
              <div className="text-[10px] opacity-60 truncate">
                {currentStock.name}
              </div>
              <div className="text-xl font-medium tracking-tight mt-1">
                ${currentStock.price}
              </div>
            </div>

            <div className="w-full h-8 flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={currentStock.positive ? '#10b981' : '#f43f5e'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={svgPoints}
                />
              </svg>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="w-full mb-3 select-none">
      {/* 顶部指示条 */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-white/80">
            小组件
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white/90">
            {widgets.length}
          </span>
        </div>
        {isEditing && (
          <button
            onClick={() => setShowAddDrawer(!showAddDrawer)}
            className="text-[11px] font-medium text-white px-2 py-0.5 rounded-full bg-blue-500/80 hover:bg-blue-500 transition-all flex items-center space-x-1 cursor-pointer"
          >
            <span>+ 添加小组件</span>
          </button>
        )}
      </div>

      {/* 小组件网格：自动让位平滑动画 */}
      <div className="grid grid-cols-2 gap-3.5">
        {widgets.map((item, index) => {
          const isDragging = draggingWidgetIndex === index;
          const isTarget = targetHoverWidgetIndex === index && !isDragging;

          return (
            <div
              key={item.id}
              data-zone="widget"
              data-slot-index={index}
              className={`relative group select-none transition-all duration-300 transform ${
                isEditing && !isDragging ? (index % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : ''
              } ${isDragging ? 'opacity-20 scale-95' : ''} ${
                isTarget ? 'scale-105 ring-2 ring-blue-400/80 rounded-[24px]' : ''
              }`}
              onMouseDown={(e) => {
                if (isEditing && onStartDragWidget) {
                  onStartDragWidget(index, e);
                }
              }}
              onTouchStart={(e) => {
                if (isEditing && onStartDragWidget) {
                  onStartDragWidget(index, e);
                }
              }}
            >
              <div className={isEditing ? 'cursor-grab active:cursor-grabbing' : ''}>
                {renderWidget(item)}
              </div>

              {/* 编辑模式下的控制按钮层 */}
              {isEditing && !isDragging && (
                <>
                  {/* 1. 删除组件 (左上角) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveWidget(item.id);
                    }}
                    className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 active:scale-95 transition-transform z-20 cursor-pointer"
                    title="删除小组件"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                    </svg>
                  </button>

                  {/* 2. 切换样式按钮 (右上角) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCycleWidgetStyle(item.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 px-1.5 h-6 rounded-full bg-neutral-800/90 text-white text-[10px] flex items-center justify-center shadow-lg border border-white/20 hover:scale-105 active:scale-95 transition-transform z-20 cursor-pointer space-x-0.5"
                    title="切换小组件样式 (经典 / 极简 / 毛玻璃)"
                  >
                    <span>🎨</span>
                    <span className="scale-90 font-medium">样式</span>
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 编辑模式下的添加小组件抽屉 */}
      {isEditing && showAddDrawer && (
        <div className="mt-3 p-3 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/15 animate-fadeIn">
          <div className="text-[11px] font-medium text-white/70 mb-2 flex items-center justify-between">
            <span>选择要添加到主页面的小组件</span>
            <button
              onClick={() => setShowAddDrawer(false)}
              className="text-white/60 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['calendar', 'weather', 'stock'] as WidgetType[]).map((type) => {
              const labelMap: Record<WidgetType, { name: string; icon: string }> = {
                calendar: { name: '日历', icon: '📅' },
                weather: { name: '天气', icon: '🌤️' },
                stock: { name: '股市行情', icon: '📈' },
              };
              const item = labelMap[type];

              return (
                <button
                  key={type}
                  onClick={() => {
                    onAddWidget(type);
                    setShowAddDrawer(false);
                  }}
                  className="p-2 rounded-xl flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer active:scale-95"
                >
                  <span className="text-lg mb-0.5">{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.name}</span>
                  <span className="text-[9px] mt-1 px-1.5 py-0.2 rounded-full bg-blue-500 text-white">
                    + 放置
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetsSection;
