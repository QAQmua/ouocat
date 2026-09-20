import React, { useState, useEffect, useRef } from 'react';
import { FolderData, AppInfo } from '../types';
import AppIcon from './AppIcon';

interface FolderViewModalProps {
  folder: FolderData;
  isOpen: boolean;
  isDarkMode: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onRename: (folderId: string, newName: string) => void;
  onAppOpen: (appName: string) => void;
  onRemoveAppFromFolder: (folderId: string, app: AppInfo) => void;
  onDisbandFolder?: (folderId: string) => void;
  onReorderApps?: (folderId: string, newApps: AppInfo[]) => void;
}

export const FolderViewModal: React.FC<FolderViewModalProps> = ({
  folder,
  isOpen,
  isDarkMode,
  onClose,
  onRename,
  onAppOpen,
  onRemoveAppFromFolder,
  onReorderApps,
}) => {
  const [folderName, setFolderName] = useState(folder.name || '文件夹');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  // 文件夹内部编辑状态：默认打开时不晃动，长按才进入编辑晃动
  const [isFolderEditing, setIsFolderEditing] = useState(false);

  // 内部软件拖拽重排位置与移出状态
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [hoverTargetIdx, setHoverTargetIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingOutside, setIsDraggingOutside] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const isOutsideRef = useRef(false);

  useEffect(() => {
    setFolderName(folder.name || '文件夹');
  }, [folder.name]);

  // 打开文件夹或切换文件夹时重置状态
  useEffect(() => {
    if (isOpen) {
      setIsFolderEditing(false);
      setIsEditingTitle(false);
      setDraggingIdx(null);
      setHoverTargetIdx(null);
      setDragPos(null);
      setIsDraggingOutside(false);
      isOutsideRef.current = false;
    }
  }, [isOpen, folder.id]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  // 长按触发文件夹内部应用进入晃动编辑模式
  const handleStartLongPress = () => {
    if (isFolderEditing || draggingIdx !== null) return;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setIsFolderEditing(true);
    }, 500);
  };

  const handleCancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    const trimmed = folderName.trim() || '文件夹';
    setFolderName(trimmed);
    onRename(folder.id, trimmed);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancelLongPress();
      handleTitleSubmit();
      if (isFolderEditing) {
        setIsFolderEditing(false);
      } else {
        onClose();
      }
    }
  };

  // 移动应用顺序（向左/向右微调）
  const handleShiftApp = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= folder.apps.length) return;
    const reordered = [...folder.apps];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    if (onReorderApps) {
      onReorderApps(folder.id, reordered);
    }
  };

  // 开始拖拽应用换位或移出文件夹
  const handleStartDragApp = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    handleCancelLongPress();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setDraggingIdx(index);
    setHoverTargetIdx(index);
    setDragPos({ x: clientX, y: clientY });
    setIsDraggingOutside(false);
    isOutsideRef.current = false;

    const handlePointerMove = (moveEvt: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : (moveEvt as MouseEvent).clientX;
      const curY = 'touches' in moveEvt ? moveEvt.touches[0].clientY : (moveEvt as MouseEvent).clientY;
      setDragPos({ x: curX, y: curY });

      // 实时计算指针是否拖离文件夹主卡片边界
      const gridRect = gridContainerRef.current?.getBoundingClientRect();
      const outside = gridRect
        ? curX < gridRect.left - 12 ||
          curX > gridRect.right + 12 ||
          curY < gridRect.top - 12 ||
          curY > gridRect.bottom + 12
        : false;

      isOutsideRef.current = outside;
      setIsDraggingOutside(outside);

      if (outside) {
        setHoverTargetIdx(null);
      } else {
        // 在文件夹内部时，计算当前指针落在哪个槽位上
        const targetElement = document.elementFromPoint(curX, curY);
        const slotElement = targetElement?.closest('[data-folder-slot-idx]');
        if (slotElement) {
          const slotIdx = Number(slotElement.getAttribute('data-folder-slot-idx'));
          if (!isNaN(slotIdx) && slotIdx >= 0 && slotIdx < folder.apps.length) {
            setHoverTargetIdx(slotIdx);
          }
        }
      }
    };

    const handlePointerEnd = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerEnd);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerEnd);

      // 1. 如果指针已拖出文件夹区域并松手：立即将应用移出文件夹，放回主屏幕桌面
      if (isOutsideRef.current) {
        const appToMove = folder.apps[index];
        setIsDraggingOutside(false);
        setDraggingIdx(null);
        setHoverTargetIdx(null);
        setDragPos(null);
        isOutsideRef.current = false;

        onRemoveAppFromFolder(folder.id, appToMove);
        onClose();
        return;
      }

      // 2. 文件夹内部槽位换位重排
      setHoverTargetIdx((finalTarget) => {
        if (finalTarget !== null && finalTarget !== index && onReorderApps) {
          const reordered = [...folder.apps];
          const [movedApp] = reordered.splice(index, 1);
          reordered.splice(finalTarget, 0, movedApp);
          onReorderApps(folder.id, reordered);
        }
        return null;
      });

      setIsDraggingOutside(false);
      setDraggingIdx(null);
      setDragPos(null);
      isOutsideRef.current = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerEnd);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerEnd);
  };

  if (!isOpen) return null;

  const draggedApp = draggingIdx !== null ? folder.apps[draggingIdx] : null;

  return (
    <div
      id="ios-folder-view-modal"
      className={`absolute inset-0 z-[120] flex flex-col items-center justify-center backdrop-blur-2xl ${
        isDarkMode ? 'bg-black/60' : 'bg-black/25'
      } select-none animate-fadeIn transition-all duration-300`}
      onClick={handleBackdropClick}
    >
      {/* 顶部文件夹标题区域 (全宽居中布局，无偏移，确保绝对水平居中) */}
      <div
        className="w-full flex flex-col items-center justify-center mb-6 z-10 px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-[280px] flex items-center justify-center text-center">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={folderName}
              style={{ textAlign: 'center' }}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              onChange={(e) => setFolderName(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.nativeEvent.isComposing || isComposingRef.current || (e as any).keyCode === 229) {
                    return;
                  }
                  handleTitleSubmit();
                  inputRef.current?.blur();
                }
              }}
              placeholder="文件夹名称"
              maxLength={24}
              className={`w-full text-center text-2xl font-semibold tracking-tight bg-transparent border-b-2 outline-none p-0 m-0 cursor-text transition-all ${
                isDarkMode
                  ? 'text-white placeholder-white/35 border-white/40'
                  : 'text-neutral-900 placeholder-neutral-400 border-neutral-400'
              }`}
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              style={{ textAlign: 'center' }}
              className={`text-2xl font-semibold tracking-tight text-center cursor-pointer transition-colors px-3 py-0.5 rounded-xl truncate select-none ${
                isDarkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-neutral-900 hover:bg-black/5'
              }`}
              title="点击修改名称"
            >
              {folderName || '文件夹'}
            </h2>
          )}
        </div>

        {/* 快捷命名建议胶囊 */}
        {isEditingTitle && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5 animate-fadeIn">
            {['常用', '社交', '工具', '生活'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setFolderName(tag);
                  onRename(folder.id, tag);
                  setIsEditingTitle(false);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/15 hover:bg-white/25 text-white/90'
                    : 'bg-black/10 hover:bg-black/15 text-neutral-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 文件夹主容器 (无阴影通透磨砂质感，自适应深色/日间，里面只显示软件) */}
      <div
        ref={gridContainerRef}
        className={`w-[290px] min-h-[290px] rounded-[38px] ${
          isDarkMode
            ? 'bg-[#1c1c1e]/80 border-white/15'
            : 'bg-white/70 border-white/70'
        } backdrop-blur-3xl p-6 border flex flex-col items-center justify-center relative transition-colors duration-300`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleStartLongPress}
        onMouseUp={handleCancelLongPress}
        onTouchStart={handleStartLongPress}
        onTouchEnd={handleCancelLongPress}
      >
        <div className="w-full grid grid-cols-3 gap-y-4 gap-x-3 items-center justify-items-center">
          {folder.apps.map((app, idx) => {
            const isThisDragging = draggingIdx === idx;
            const isThisTarget = hoverTargetIdx === idx && draggingIdx !== null && draggingIdx !== idx;

            return (
              <div
                key={`${app.name}-${idx}`}
                data-folder-slot-idx={idx}
                className={`relative flex flex-col items-center justify-center transition-all ${
                  isThisTarget ? 'scale-105' : ''
                }`}
              >
                <AppIcon
                  app={app}
                  darkMode={isDarkMode}
                  tintColor={isDarkMode ? '#ffffff' : '#000000'}
                  showLabels={true}
                  labelClassName={isDarkMode ? 'text-white' : 'text-neutral-900 font-medium'}
                  onClick={() => {
                    handleCancelLongPress();
                    if (!isFolderEditing) {
                      onClose();
                      onAppOpen(app.name);
                    }
                  }}
                  isEditing={isFolderEditing}
                  isDraggingThis={isThisDragging}
                  isDragTargetThis={isThisTarget}
                  index={idx}
                  total={folder.apps.length}
                  onRemove={() => onRemoveAppFromFolder(folder.id, app)}
                  onLongPressStart={handleStartLongPress}
                  onLongPressEnd={handleCancelLongPress}
                  onStartDragApp={(e) => handleStartDragApp(idx, e)}
                />

                {/* 编辑模式下提供轻触位置微调按键（拖拽与点按双支持） */}
                {isFolderEditing && folder.apps.length > 1 && !draggingIdx && (
                  <div className="flex items-center gap-1 mt-1 animate-fadeIn">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShiftApp(idx, -1);
                        }}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] transition-all cursor-pointer ${
                          isDarkMode ? 'bg-white/20 hover:bg-white/35 text-white' : 'bg-black/10 hover:bg-black/20 text-neutral-800'
                        }`}
                        title="向前移"
                      >
                        ‹
                      </button>
                    )}
                    {idx < folder.apps.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShiftApp(idx, 1);
                        }}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] transition-all cursor-pointer ${
                          isDarkMode ? 'bg-white/20 hover:bg-white/35 text-white' : 'bg-black/10 hover:bg-black/20 text-neutral-800'
                        }`}
                        title="向后移"
                      >
                        ›
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 拖拽中的跟随悬浮图标预览代理 */}
      {draggingIdx !== null && dragPos && draggedApp && (
        <div
          className="fixed pointer-events-none z-[150] -translate-x-1/2 -translate-y-1/2 scale-110 opacity-90 transition-transform"
          style={{
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
          }}
        >
          <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center overflow-hidden">
            <AppIcon
              app={draggedApp}
              darkMode={isDarkMode}
              tintColor={isDarkMode ? '#ffffff' : '#000000'}
              showLabels={false}
              isEditing={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderViewModal;
