import React from 'react';
import { WidgetItemConfig } from './WidgetsSection';
import { PhotoWidget } from './PhotoWidget';

interface WidgetDisplayProps {
  item: WidgetItemConfig;
  isDarkMode: boolean;
  isEditing?: boolean;
  onUpdatePhoto?: (newUrl: string) => void;
}

export const WidgetDisplay: React.FC<WidgetDisplayProps> = ({
  item,
  isDarkMode,
  isEditing = false,
  onUpdatePhoto,
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = React.useState(0);
  const [weatherCityIndex, setWeatherCityIndex] = React.useState(0);
  const [stockIndex, setStockIndex] = React.useState(0);

  const style = item.style || 'standard';

  switch (item.type) {
    case 'calendar': {
      const today = new Date();
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const monthStr = `${today.getMonth() + 1}月`;
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
          className={`w-full h-full rounded-[24px] p-3 flex flex-col justify-between backdrop-blur-2xl select-none overflow-hidden ${
            !isEditing ? 'cursor-pointer active:scale-95 transition-transform' : ''
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

          <div
            className={`p-2 rounded-xl text-[11px] leading-tight ${
              isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/5'
            }`}
          >
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
      const weatherCities = [
        { city: '北京', temp: '22°', weather: '晴', range: '最高 26° 最低 15°', icon: '☀️' },
        { city: '上海', temp: '25°', weather: '多云', range: '最高 27° 最低 20°', icon: '⛅' },
        { city: '深圳', temp: '28°', weather: '阵雨', range: '最高 31° 最低 24°', icon: '🌦️' },
      ];
      const currentWeather = weatherCities[weatherCityIndex];

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
          className={`w-full h-full rounded-[24px] p-3 flex flex-col justify-between select-none overflow-hidden ${
            !isEditing ? 'cursor-pointer active:scale-95 transition-transform' : ''
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
      const stockList = [
        { symbol: 'AAPL', name: '苹果公司', price: '228.23', change: '+1.45%', positive: true, sparkline: [224, 225, 226, 225.5, 227, 228.23] },
        { symbol: 'NVDA', name: '英伟达', price: '128.40', change: '+3.12%', positive: true, sparkline: [122, 124, 125, 127, 126.5, 128.4] },
        { symbol: 'BABA', name: '阿里巴巴', price: '88.15', change: '-0.62%', positive: false, sparkline: [89.2, 88.9, 88.5, 88.3, 88.0, 88.15] },
        { symbol: 'TSLA', name: '特斯拉', price: '243.90', change: '+2.18%', positive: true, sparkline: [238, 239, 241, 240, 242.5, 243.9] },
      ];
      const currentStock = stockList[stockIndex];

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
          id={`widget-stock-${item.id}`}
          onClick={() => {
            if (!isEditing) {
              setStockIndex((prev) => (prev + 1) % stockList.length);
            }
          }}
          className={`w-full h-full rounded-[24px] p-3 flex flex-col justify-between backdrop-blur-2xl select-none overflow-hidden ${
            !isEditing ? 'cursor-pointer active:scale-95 transition-transform' : ''
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

    case 'photo': {
      return (
        <PhotoWidget
          id={`widget-photo-${item.id}`}
          isDarkMode={isDarkMode}
          isEditing={isEditing}
          currentPhotoUrl={item.photoUrl}
          onPhotoChange={onUpdatePhoto}
        />
      );
    }

    default:
      return null;
  }
};

export default WidgetDisplay;

