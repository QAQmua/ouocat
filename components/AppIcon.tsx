import React from 'react';
import { AppInfo } from '../types';

interface AppIconProps {
  app: AppInfo;
  darkMode: boolean;
  tintColor: string;
  showLabels: boolean;
  onClick?: () => void;
  isEditing?: boolean;
  index?: number;
  total?: number;
  onRemove?: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  onStartDragApp?: (e: React.MouseEvent | React.TouchEvent) => void;
  isDraggingThis?: boolean;
  isDragTargetThis?: boolean;
  labelClassName?: string;
}

const AppIcon: React.FC<AppIconProps> = ({
  app,
  darkMode,
  tintColor,
  showLabels,
  onClick,
  isEditing = false,
  index = 0,
  onRemove,
  onLongPressStart,
  onLongPressEnd,
  onStartDragApp,
  isDraggingThis = false,
  isDragTargetThis = false,
  labelClassName,
}) => {
  const IconComponent = app.icon;
  const backgroundStyle = darkMode ? 'bg-gray-800/70' : app.color;

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${
        showLabels ? 'w-full h-full overflow-visible py-0.5' : 'w-14 h-14'
      } ${
        isEditing && !isDraggingThis
          ? index % 2 === 0
            ? 'animate-jiggle'
            : 'animate-jiggle-alt'
          : ''
      } ${isDraggingThis ? 'opacity-20 scale-95 transition-opacity' : 'transition-transform active:scale-95'} ${
        isDragTargetThis ? 'scale-110 ring-2 ring-blue-400/80 rounded-2xl bg-white/10' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (!isEditing && onClick) {
          onClick();
        }
      }}
      onMouseDown={(e) => {
        if (isEditing) {
          e.stopPropagation();
          if (onStartDragApp) {
            e.preventDefault();
            onStartDragApp(e);
          }
        } else if (onLongPressStart) {
          onLongPressStart();
        }
      }}
      onMouseUp={() => {
        if (onLongPressEnd) onLongPressEnd();
      }}
      onTouchStart={(e) => {
        if (isEditing) {
          e.stopPropagation();
          if (onStartDragApp) {
            onStartDragApp(e);
          }
        } else if (onLongPressStart) {
          onLongPressStart();
        }
      }}
      onTouchEnd={() => {
        if (onLongPressEnd) onLongPressEnd();
      }}
    >
      {/* 软件图标 */}
      <div
        className={`w-[50px] h-[50px] ${backgroundStyle} rounded-2xl flex items-center justify-center transition-all duration-300 overflow-visible relative shrink-0 ${
          isEditing ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div className="transform scale-75 pointer-events-none">
          {IconComponent ? (
            <IconComponent darkMode={darkMode} tintColor={tintColor} />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {app?.name ? app.name.slice(0, 1) : '?'}
            </div>
          )}
        </div>

        {/* 编辑模式下的移除角标 (位于图标左上角，阻止拖拽冒泡，确保点击必删) */}
        {isEditing && !isDraggingThis && onRemove && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-neutral-800/95 text-white flex items-center justify-center border border-white/30 hover:scale-110 active:scale-90 z-30 cursor-pointer"
            title="移除或移出应用"
          >
            <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
            </svg>
          </button>
        )}
      </div>

      {/* 软件名称标签 (无额外阴影，全居中对齐) */}
      {showLabels && (
        <div className="w-full max-w-[68px] flex items-center justify-center mt-0.5 pointer-events-none overflow-visible text-center">
          <span
            className={`${
              labelClassName || 'text-white'
            } text-[11px] font-medium text-center leading-tight px-0.5 max-w-full truncate block`}
          >
            {app.name}
          </span>
        </div>
      )}
    </div>
  );
};

export { AppIcon };
export default AppIcon;
