import React from 'react';
import { FolderData } from '../types';

interface FolderIconProps {
  folder: FolderData;
  darkMode: boolean;
  isEditing?: boolean;
  index?: number;
  onClick?: () => void;
  onRemove?: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  onStartDrag?: (e: React.MouseEvent | React.TouchEvent) => void;
  isDraggingThis?: boolean;
  isDragTargetThis?: boolean;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
  folder,
  darkMode,
  isEditing = false,
  index = 0,
  onClick,
  onRemove,
  onLongPressStart,
  onLongPressEnd,
  onStartDrag,
  isDraggingThis = false,
  isDragTargetThis = false,
}) => {
  const displayApps = folder.apps.slice(0, 9);

  return (
    <div
      id={`folder-icon-${folder.id}`}
      className={`relative flex flex-col items-center justify-center select-none w-full h-full overflow-visible py-0.5 ${
        isEditing && !isDraggingThis
          ? index % 2 === 0
            ? 'animate-jiggle'
            : 'animate-jiggle-alt'
          : ''
      } ${isDraggingThis ? 'opacity-20 scale-95 transition-opacity' : 'transition-transform active:scale-95'} ${
        isDragTargetThis ? 'scale-110 ring-2 ring-blue-400/90 rounded-2xl bg-white/20' : ''
      } cursor-pointer`}
      onClick={() => {
        if (onLongPressEnd) onLongPressEnd();
        if (onClick) onClick();
      }}
      onMouseDown={(e) => {
        if (isEditing) {
          e.stopPropagation();
          if (onStartDrag) {
            e.preventDefault();
            onStartDrag(e);
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
          if (onStartDrag) {
            onStartDrag(e);
          }
        } else if (onLongPressStart) {
          onLongPressStart();
        }
      }}
      onTouchEnd={() => {
        if (onLongPressEnd) onLongPressEnd();
      }}
    >
      {/* iOS 原生质感文件夹外框 (50x50 磨砂圆角) */}
      <div
        className={`w-[50px] h-[50px] rounded-2xl ${
          darkMode
            ? 'bg-black/35 border-white/15'
            : 'bg-white/55 border-white/60'
        } backdrop-blur-xl border flex items-center justify-center p-1.5 transition-all duration-300 relative overflow-visible shrink-0 ${
          isEditing ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {/* 内部 3x3 迷你应用网格 */}
        <div className="w-full h-full grid grid-cols-3 gap-1 items-center justify-items-center">
          {displayApps.map((app, i) => {
            const AppIconComp = app?.icon;
            return (
              <div
                key={`${app?.name || 'app'}-${i}`}
                className={`w-[10px] h-[10px] rounded-[3px] ${
                  darkMode ? 'bg-gray-800/80' : (app?.color || 'bg-blue-500')
                } flex items-center justify-center overflow-hidden`}
              >
                <div className="transform scale-[0.35] pointer-events-none origin-center">
                  {AppIconComp ? (
                    <AppIconComp darkMode={darkMode} tintColor="#ffffff" />
                  ) : (
                    <span className="text-[6px] text-white font-bold">
                      {app?.name ? app.name.slice(0, 1) : '•'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 编辑模式下的解散/移除角标 */}
        {isEditing && !isDraggingThis && onRemove && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
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
            title="解散文件夹"
          >
            <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
            </svg>
          </button>
        )}
      </div>

      {/* 文件夹名称标签 (全居中对齐) */}
      <div className="w-full max-w-[68px] flex items-center justify-center mt-0.5 pointer-events-none overflow-visible text-center">
        <span className="text-white text-[11px] font-medium text-center leading-tight px-0.5 max-w-full truncate block">
          {folder.name || '文件夹'}
        </span>
      </div>
    </div>
  );
};

export default FolderIcon;
