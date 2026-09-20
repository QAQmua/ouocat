import React from 'react';
import AppIcon from './AppIcon';
import { AppInfo } from '../types';

interface DockProps {
  apps: AppInfo[];
  darkMode: boolean;
  tintColor: string;
  onAppOpen?: (appName: string) => void;
  isEditing?: boolean;
  onStartDragDockApp?: (index: number, e: React.MouseEvent | React.TouchEvent) => void;
  draggingDockIndex?: number | null;
  targetHoverDockIndex?: number | null;
  onRemoveDockApp?: (index: number) => void;
}

const Dock: React.FC<DockProps> = ({
  apps,
  darkMode,
  tintColor,
  onAppOpen,
  isEditing = false,
  onStartDragDockApp,
  draggingDockIndex = null,
  targetHoverDockIndex = null,
  onRemoveDockApp,
}) => {
  return (
    <div
      id="ios-dock"
      className={`mx-auto w-[92%] max-w-[340px] relative rounded-[32px] py-3 px-3 min-h-[86px] flex items-center justify-center transition-all duration-300 transform-gpu ${
        darkMode
          ? 'bg-white/[0.12] border border-white/15'
          : 'bg-white/40 border border-white/60'
      }`}
      style={{
        backdropFilter: 'blur(30px) saturate(190%) contrast(102%)',
        WebkitBackdropFilter: 'blur(30px) saturate(190%) contrast(102%)',
      }}
    >
      {/* Specular glass reflection sheen on the top rim */}
      <div
        className={`absolute inset-x-5 top-0 h-[1px] rounded-full pointer-events-none ${
          darkMode
            ? 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/80 to-transparent'
        }`}
      />

      <div className="flex items-center justify-around w-full px-2">
        {apps.map((app, index) => {
          const isDragging = draggingDockIndex === index;
          const isTarget = targetHoverDockIndex === index && !isDragging;

          return (
            <div
              key={app.name}
              data-drag-zone="dock"
              data-drag-index={index}
              className={`relative transition-all duration-300 transform ${
                isDragging ? 'opacity-20 scale-90' : ''
              } ${isTarget ? 'scale-110 ring-2 ring-blue-400 rounded-2xl bg-white/20' : ''}`}
            >
              <AppIcon
                app={app}
                darkMode={darkMode}
                tintColor={tintColor}
                showLabels={false}
                onClick={() => onAppOpen?.(app.name)}
                isEditing={isEditing}
                index={index}
                total={apps.length}
                onRemove={onRemoveDockApp ? () => onRemoveDockApp(index) : undefined}
                onStartDragApp={(e) => {
                  if (onStartDragDockApp) {
                    onStartDragDockApp(index, e);
                  }
                }}
                isDraggingThis={isDragging}
                isDragTargetThis={isTarget}
              />
            </div>
          );
        })}

        {/* 当拖拽悬停至 Dock 未占用槽位时，显示吸附提示虚线框 */}
        {targetHoverDockIndex !== null && targetHoverDockIndex >= apps.length && apps.length < 4 && (
          <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-blue-400/80 bg-blue-500/20 animate-pulse flex items-center justify-center" />
        )}
      </div>
    </div>
  );
};

export { Dock };
export default Dock;
