import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppIconDefault, { AppIcon as AppIconNamed } from './AppIcon';
import FolderIconDefault, { FolderIcon as FolderIconNamed } from './FolderIcon';
import FolderViewModalDefault, { FolderViewModal as FolderViewModalNamed } from './FolderViewModal';
import DockDefault, { Dock as DockNamed } from './Dock';
import AppLibraryScreenDefault, { AppLibraryScreen as AppLibraryScreenNamed } from './AppLibraryScreen';
import WidgetDisplayDefault, { WidgetDisplay as WidgetDisplayNamed } from './WidgetDisplay';
import { WidgetItemConfig, WidgetType, WidgetStyle } from './WidgetsSection';
import { DEFAULT_PHOTO_URL } from './PhotoWidget';
import { AppInfo, FolderData } from '../types';
import { QQIcon, SettingsAppIcon, AlipayAppIcon, MessagesAppIcon, PhoneAppIcon } from './icons';

const AppIcon = AppIconDefault || AppIconNamed;
const FolderIcon = FolderIconDefault || FolderIconNamed;
const FolderViewModal = FolderViewModalDefault || FolderViewModalNamed;
const Dock = DockDefault || DockNamed;
const AppLibraryScreen = AppLibraryScreenDefault || AppLibraryScreenNamed;
const WidgetDisplay = WidgetDisplayDefault || WidgetDisplayNamed;

interface HomeScreenProps {
  onAppOpen: (appName: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onEditingChange?: (isEditing: boolean) => void;
}

// 4 列 x 6 行的主屏幕坐标系
// col: 0..3, row: 0..5
// 普通应用占 colSpan: 1, rowSpan: 1
// 经典小组件占 colSpan: 2, rowSpan: 2
// 4x2 相册横幅小组件占 colSpan: 4, rowSpan: 2
// 文件夹占 colSpan: 1, rowSpan: 1
export interface HomeItem {
  id: string;
  kind: 'app' | 'widget' | 'folder';
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  appData?: AppInfo;
  widgetData?: WidgetItemConfig;
  folderData?: FolderData;
}

const TOTAL_COLS = 4;
const TOTAL_ROWS = 6;

// 初始网格：1个 4x2 完整圆角相册图片小组件与 2个应用（支付宝、设置）
// 原三个组件（日历、天气、股市）收纳进 ➕ 号小组件抽屉中，随时可重新添加回桌面
const initialHomeItems: HomeItem[] = [
  {
    id: 'w-photo-main',
    kind: 'widget',
    col: 0,
    row: 0,
    colSpan: 4,
    rowSpan: 2,
    widgetData: {
      id: 'w-photo-main',
      type: 'photo',
      style: 'standard',
      photoUrl: DEFAULT_PHOTO_URL,
    },
  },
  {
    id: 'app-settings',
    kind: 'app',
    col: 0,
    row: 2,
    colSpan: 1,
    rowSpan: 1,
    appData: { name: '设置', icon: SettingsAppIcon, color: 'bg-[#636366]' },
  },
];

const initialDockApps: AppInfo[] = [
  { name: '电话', icon: PhoneAppIcon, color: 'bg-green-500' },
  { name: '信息', icon: MessagesAppIcon, color: 'bg-green-500' },
  { name: 'QQ', icon: QQIcon, color: 'bg-blue-500' },
  { name: '支付宝', icon: AlipayAppIcon, color: 'bg-[#1677FF]' },
];

export const APP_REGISTRY: Record<string, AppInfo> = {
  '电话': { name: '电话', icon: PhoneAppIcon, color: 'bg-green-500' },
  'Phone': { name: '电话', icon: PhoneAppIcon, color: 'bg-green-500' },
  '信息': { name: '信息', icon: MessagesAppIcon, color: 'bg-green-500' },
  'Messages': { name: '信息', icon: MessagesAppIcon, color: 'bg-green-500' },
  'QQ': { name: 'QQ', icon: QQIcon, color: 'bg-blue-500' },
  '支付宝': { name: '支付宝', icon: AlipayAppIcon, color: 'bg-[#1677FF]' },
  'Alipay': { name: '支付宝', icon: AlipayAppIcon, color: 'bg-[#1677FF]' },
  '设置': { name: '设置', icon: SettingsAppIcon, color: 'bg-[#636366]' },
  'Settings': { name: '设置', icon: SettingsAppIcon, color: 'bg-[#636366]' },
};

const STORAGE_KEY_ITEMS = 'ios_home_items_v2';
const STORAGE_KEY_DOCK = 'ios_dock_apps_v2';

function loadSavedHomeItems(): HomeItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const rehydrated: HomeItem[] = [];
    for (const item of parsed) {
      if (item.kind === 'app') {
        const appName = item.appName || item.appData?.name || item.name;
        const appInfo = APP_REGISTRY[appName];
        if (appInfo) {
          rehydrated.push({
            id: item.id,
            kind: 'app',
            col: Number(item.col) || 0,
            row: Number(item.row) || 0,
            colSpan: Number(item.colSpan) || 1,
            rowSpan: Number(item.rowSpan) || 1,
            appData: appInfo,
          });
        }
      } else if (item.kind === 'folder' && item.folderData) {
        const rawNames: string[] = Array.isArray(item.folderData.appNames)
          ? item.folderData.appNames
          : Array.isArray(item.folderData.apps)
          ? item.folderData.apps.map((a: any) => (typeof a === 'string' ? a : a?.name)).filter(Boolean)
          : [];
        const folderApps: AppInfo[] = [];
        for (const name of rawNames) {
          if (APP_REGISTRY[name]) {
            folderApps.push(APP_REGISTRY[name]);
          }
        }
        if (folderApps.length > 0) {
          rehydrated.push({
            id: item.id,
            kind: 'folder',
            col: Number(item.col) || 0,
            row: Number(item.row) || 0,
            colSpan: 1,
            rowSpan: 1,
            folderData: {
              id: item.folderData.id || item.id,
              name: item.folderData.name || '文件夹',
              apps: folderApps,
            },
          });
        }
      } else if (item.kind === 'widget' && item.widgetData) {
        rehydrated.push({
          id: item.id,
          kind: 'widget',
          col: Number(item.col) || 0,
          row: Number(item.row) || 0,
          colSpan: Number(item.colSpan) || 2,
          rowSpan: Number(item.rowSpan) || 2,
          widgetData: item.widgetData,
        });
      }
    }
    return rehydrated.length > 0 ? rehydrated : null;
  } catch (e) {
    console.error('Failed to load saved home items:', e);
    return null;
  }
}

function saveHomeItems(items: HomeItem[]) {
  try {
    const serialized = items.map((item) => {
      if (item.kind === 'app') {
        return {
          id: item.id,
          kind: 'app',
          col: item.col,
          row: item.row,
          colSpan: item.colSpan,
          rowSpan: item.rowSpan,
          appName: item.appData?.name,
        };
      }
      if (item.kind === 'folder' && item.folderData) {
        return {
          id: item.id,
          kind: 'folder',
          col: item.col,
          row: item.row,
          colSpan: 1,
          rowSpan: 1,
          folderData: {
            id: item.folderData.id,
            name: item.folderData.name,
            appNames: item.folderData.apps.map((a) => a.name),
          },
        };
      }
      return {
        id: item.id,
        kind: 'widget',
        col: item.col,
        row: item.row,
        colSpan: item.colSpan,
        rowSpan: item.rowSpan,
        widgetData: item.widgetData,
      };
    });
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(serialized));
  } catch (e) {
    console.error('Failed to save home items:', e);
  }
}

function loadSavedDockApps(): AppInfo[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCK);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const rehydrated: AppInfo[] = [];
    for (const entry of parsed) {
      const name = typeof entry === 'string' ? entry : entry?.name;
      if (name && APP_REGISTRY[name]) {
        rehydrated.push(APP_REGISTRY[name]);
      }
    }
    return rehydrated.length > 0 ? rehydrated : null;
  } catch (e) {
    console.error('Failed to load saved dock apps:', e);
    return null;
  }
}

function saveDockApps(dockApps: AppInfo[]) {
  try {
    const names = dockApps.map((a) => a.name);
    localStorage.setItem(STORAGE_KEY_DOCK, JSON.stringify(names));
  } catch (e) {
    console.error('Failed to save dock apps:', e);
  }
}

interface DraggingContext {
  fromZone: 'grid' | 'dock';
  item: HomeItem | AppInfo;
  originalCol?: number;
  originalRow?: number;
  dockIndex?: number;
  x: number;
  y: number;
}

interface DropPreviewState {
  zone: 'grid' | 'dock';
  col?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
  dockIndex?: number;
  stackTargetId?: string; // 叠放目标应用或文件夹的 ID
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onAppOpen, isDarkMode, onEditingChange }) => {
  const [currentPage, setCurrentPage] = useState<0 | 1>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);

  // 主屏幕坐标项 (优先从本地持久化加载，没有则使用初始配置)
  const [items, setItems] = useState<HomeItem[]>(() => {
    return loadSavedHomeItems() || initialHomeItems;
  });

  // 底部 Dock 栏应用 (优先从本地持久化加载，支持4槽位)
  const [dockApps, setDockApps] = useState<AppInfo[]>(() => {
    return loadSavedDockApps() || initialDockApps;
  });

  // 状态变动时立即自动持久化保存，防止切换界面或刷新页面丢失
  useEffect(() => {
    saveHomeItems(items);
  }, [items]);

  useEffect(() => {
    saveDockApps(dockApps);
  }, [dockApps]);

  // 拖拽上下文与落点预览状态
  const [dragging, setDragging] = useState<DraggingContext | null>(null);
  const [dropPreview, setDropPreview] = useState<DropPreviewState | null>(null);

  // 保持最新 ref，防止事件监听闭包中读取到旧值导致丢项
  const itemsRef = useRef<HomeItem[]>(items);
  itemsRef.current = items;

  const dockAppsRef = useRef<AppInfo[]>(dockApps);
  dockAppsRef.current = dockApps;

  const draggingRef = useRef<DraggingContext | null>(dragging);
  draggingRef.current = dragging;

  const dropPreviewRef = useRef<DropPreviewState | null>(dropPreview);
  dropPreviewRef.current = dropPreview;

  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridAreaRef = useRef<HTMLDivElement>(null);

  // 长按定时器
  const longPressTimer = useRef<any>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isScreenSwiping = useRef<boolean>(false);
  const justEnteredEditing = useRef<boolean>(false);

  // 页面指示器：平时为搜索胶囊，滑动时为两个等大圆点滑动动画
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const slideTimerRef = useRef<any>(null);

  const triggerSlidingState = useCallback(() => {
    setIsSliding(true);
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
    }
    slideTimerRef.current = setTimeout(() => {
      setIsSliding(false);
    }, 1400);
  }, []);

  const isInitialMount = useRef<boolean>(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    triggerSlidingState();
  }, [currentPage, triggerSlidingState]);

  useEffect(() => {
    return () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
    };
  }, []);

  const startLongPress = () => {
    if (isEditing) return;
    longPressTimer.current = setTimeout(() => {
      setIsEditing(true);
      justEnteredEditing.current = true;
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMoveScreen = (clientX: number, clientY: number) => {
    cancelLongPress();
    if (!isScreenSwiping.current || touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;
    // 出现水平滑动趋势时触发滑动圆点状态
    if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
      triggerSlidingState();
    }
  };

  // 小组件样式切换
  const handleCycleWidgetStyle = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id || !it.widgetData) return it;
        const styles: WidgetStyle[] = ['standard', 'minimal', 'glass'];
        const currentIdx = styles.indexOf(it.widgetData.style || 'standard');
        const nextStyle = styles[(currentIdx + 1) % styles.length];
        return {
          ...it,
          widgetData: { ...it.widgetData, style: nextStyle },
        };
      })
    );
  };

  // 手动点击减号移除应用或组件
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleRemoveDockApp = (index: number) => {
    setDockApps((prev) => prev.filter((_, i) => i !== index));
  };

  // 文件夹展开弹窗状态
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // 文件夹重命名 (支持自定义命名，实时自动持久化保存)
  const handleRenameFolder = (folderId: string, newName: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === folderId && it.folderData
          ? { ...it, folderData: { ...it.folderData, name: newName } }
          : it
      )
    );
  };

  // 文件夹内软件位置顺序重排 (实时自动持久化保存)
  const handleReorderFolderApps = (folderId: string, newApps: AppInfo[]) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === folderId && it.folderData
          ? { ...it, folderData: { ...it.folderData, apps: newApps } }
          : it
      )
    );
  };

  // 从文件夹中移出单个应用放回主屏幕桌面
  const handleRemoveAppFromFolder = (folderId: string, appToRemove: AppInfo) => {
    setItems((prev) => {
      const targetFolder = prev.find((it) => it.id === folderId);
      if (!targetFolder || !targetFolder.folderData) return prev;

      const remainingApps = targetFolder.folderData.apps.filter((a) => a.name !== appToRemove.name);

      const occ = buildOccupiedMatrix(prev);
      const freeSlot =
        findBestFreeSlot(occ, targetFolder.col, targetFolder.row, 1, 1) ||
        findBestFreeSlot(occ, 0, 0, 1, 1);

      const restoredAppItem: HomeItem = {
        id: `app-${Date.now()}`,
        kind: 'app',
        col: freeSlot ? freeSlot.col : 0,
        row: freeSlot ? freeSlot.row : 0,
        colSpan: 1,
        rowSpan: 1,
        appData: appToRemove,
      };

      if (remainingApps.length <= 1) {
        // 若文件夹只剩 1 个应用，自动解散恢复为该位置的普通应用图标
        const withoutFolder = prev.filter((it) => it.id !== folderId);
        if (remainingApps.length === 1) {
          withoutFolder.push({
            id: `app-${Date.now() + 1}`,
            kind: 'app',
            col: targetFolder.col,
            row: targetFolder.row,
            colSpan: 1,
            rowSpan: 1,
            appData: remainingApps[0],
          });
        }
        withoutFolder.push(restoredAppItem);
        setActiveFolderId(null);
        return withoutFolder;
      }

      return prev
        .map((it) =>
          it.id === folderId && it.folderData
            ? { ...it, folderData: { ...it.folderData, apps: remainingApps } }
            : it
        )
        .concat(restoredAppItem);
    });
  };

  // 解散文件夹：将所有应用全部退回主屏幕网格
  const handleDisbandFolder = (folderId: string) => {
    setItems((prev) => {
      const targetFolder = prev.find((it) => it.id === folderId);
      if (!targetFolder || !targetFolder.folderData) return prev;

      const appsToRestore = targetFolder.folderData.apps;
      const withoutFolder = prev.filter((it) => it.id !== folderId);

      const newlyRestored: HomeItem[] = [];
      for (let i = 0; i < appsToRestore.length; i++) {
        const app = appsToRestore[i];
        const occ = buildOccupiedMatrix([...withoutFolder, ...newlyRestored]);
        const slot =
          i === 0
            ? { col: targetFolder.col, row: targetFolder.row }
            : findBestFreeSlot(occ, targetFolder.col, targetFolder.row, 1, 1) ||
              findBestFreeSlot(occ, 0, 0, 1, 1);

        newlyRestored.push({
          id: `app-${Date.now()}-${i}`,
          kind: 'app',
          col: slot ? slot.col : 0,
          row: slot ? slot.row : 0,
          colSpan: 1,
          rowSpan: 1,
          appData: app,
        });
      }

      setActiveFolderId(null);
      return [...withoutFolder, ...newlyRestored];
    });
  };

  // 严格空间重叠判定 (A 与 B 矩形相交)
  const isRectOverlap = (
    c1: number,
    r1: number,
    w1: number,
    h1: number,
    c2: number,
    r2: number,
    w2: number,
    h2: number
  ): boolean => {
    return c1 < c2 + w2 && c1 + w1 > c2 && r1 < r2 + h2 && r1 + h1 > r2;
  };

  // 全局碰撞检测：任何两项绝不允许相交重叠
  const hasAnyCollision = (itemList: HomeItem[]): boolean => {
    for (let i = 0; i < itemList.length; i++) {
      for (let j = i + 1; j < itemList.length; j++) {
        const a = itemList[i];
        const b = itemList[j];
        if (isRectOverlap(a.col, a.row, a.colSpan, a.rowSpan, b.col, b.row, b.colSpan, b.rowSpan)) {
          return true;
        }
      }
    }
    return false;
  };

  // 6 个标准 2x2 小组件象限坐标
  const CANONICAL_WIDGET_QUADRANTS: { col: number; row: number }[] = [
    { col: 0, row: 0 },
    { col: 2, row: 0 },
    { col: 0, row: 2 },
    { col: 2, row: 2 },
    { col: 0, row: 4 },
    { col: 2, row: 4 },
  ];

  // 构建二维占用矩阵
  const buildOccupiedMatrix = (placed: HomeItem[]): boolean[][] => {
    const grid = Array.from({ length: TOTAL_ROWS }, () =>
      Array.from({ length: TOTAL_COLS }, () => false)
    );
    for (const p of placed) {
      for (let dr = 0; dr < p.rowSpan; dr++) {
        for (let dc = 0; dc < p.colSpan; dc++) {
          if (p.row + dr < TOTAL_ROWS && p.col + dc < TOTAL_COLS) {
            grid[p.row + dr][p.col + dc] = true;
          }
        }
      }
    }
    return grid;
  };

  // 在二维占用矩阵中寻找距离目标坐标最近的合法空闲区域 (支持任意单横排行位)
  const findBestFreeSlot = (
    occupied: boolean[][],
    preferCol: number,
    preferRow: number,
    colSpan: number,
    rowSpan: number
  ): { col: number; row: number } | null => {
    let bestSlot: { col: number; row: number } | null = null;
    let minDistance = Infinity;

    for (let r = 0; r <= TOTAL_ROWS - rowSpan; r++) {
      for (let c = 0; c <= TOTAL_COLS - colSpan; c++) {
        // 对于 2x2 组件，在4列布局中优先吸附左两列(c=0)或右两列(c=2)
        if (colSpan === 2 && c !== 0 && c !== 2 && c !== preferCol) {
          continue;
        }

        let isFree = true;
        for (let dr = 0; dr < rowSpan; dr++) {
          for (let dc = 0; dc < colSpan; dc++) {
            if (occupied[r + dr][c + dc]) {
              isFree = false;
              break;
            }
          }
          if (!isFree) break;
        }

        if (isFree) {
          const dist = Math.hypot(c - preferCol, r - preferRow);
          if (dist < minDistance) {
            minDistance = dist;
            bestSlot = { col: c, row: r };
          }
        }
      }
    }

    return bestSlot;
  };

  // 严密无重叠、绝不丢项、绝无克隆的 iOS 级自动让位物理重排引擎
  // 支持组件任意向上/向下以单横排（1 行）为单位自由移动
  const resolveMoveWithReflow = (
    movingItem: HomeItem,
    targetCol: number,
    targetRow: number
  ): HomeItem[] => {
    // 边界限制：行可自由逐行（1 行）吸附，列根据尺寸限制
    const boundedCol = movingItem.colSpan === 4
      ? 0
      : (movingItem.colSpan === 2
          ? (targetCol < 2 ? 0 : 2)
          : Math.max(0, Math.min(TOTAL_COLS - movingItem.colSpan, targetCol)));
    // 允许在 0 至 TOTAL_ROWS - rowSpan 之间任意单行移动（例如 4x2 组件可在 0, 1, 2, 3, 4 行自由放置）
    const boundedRow = Math.max(0, Math.min(TOTAL_ROWS - movingItem.rowSpan, targetRow));

    const updatedMoving: HomeItem = {
      ...movingItem,
      col: boundedCol,
      row: boundedRow,
    };

    const currentItems = itemsRef.current;
    const otherItems = currentItems.filter((it) => it.id !== movingItem.id);

    // 筛选与目标落点发生重叠的冲突项
    const conflicts = otherItems.filter((it) =>
      isRectOverlap(
        boundedCol,
        boundedRow,
        movingItem.colSpan,
        movingItem.rowSpan,
        it.col,
        it.row,
        it.colSpan,
        it.rowSpan
      )
    );

    // 1. 无冲突，直接安全落位
    if (conflicts.length === 0) {
      const exists = currentItems.some((it) => it.id === movingItem.id);
      return exists
        ? currentItems.map((it) => (it.id === movingItem.id ? updatedMoving : it))
        : [...otherItems, updatedMoving];
    }

    // 2. 相同尺寸一对一对调 (例如：组件换组件，或者 App 换 App)
    if (
      conflicts.length === 1 &&
      conflicts[0].colSpan === movingItem.colSpan &&
      conflicts[0].rowSpan === movingItem.rowSpan &&
      movingItem.col !== undefined &&
      movingItem.row !== undefined
    ) {
      const other = conflicts[0];
      const sourceCol = movingItem.col;
      const sourceRow = movingItem.row;

      // 验证将 other 放入 sourceCol, sourceRow 是否会与其它项重叠
      const thirdConflicts = otherItems.filter(
        (it) =>
          it.id !== other.id &&
          isRectOverlap(sourceCol, sourceRow, other.colSpan, other.rowSpan, it.col, it.row, it.colSpan, it.rowSpan)
      );

      if (thirdConflicts.length === 0) {
        return otherItems
          .map((it) => (it.id === other.id ? { ...other, col: sourceCol, row: sourceRow } : it))
          .concat(updatedMoving);
      }
    }

    // 3. 计算 movingItem 移动所腾出的原空位 (Vacated Slots)
    const sourceCol = movingItem.col ?? 0;
    const sourceRow = movingItem.row ?? 0;
    const vacatedSlots: { col: number; row: number }[] = [];
    if (movingItem.col !== undefined && movingItem.row !== undefined) {
      for (let r = sourceRow; r < sourceRow + movingItem.rowSpan; r++) {
        for (let c = sourceCol; c < sourceCol + movingItem.colSpan; c++) {
          if (
            r < boundedRow ||
            r >= boundedRow + movingItem.rowSpan ||
            c < boundedCol ||
            c >= boundedCol + movingItem.colSpan
          ) {
            vacatedSlots.push({ col: c, row: r });
          }
        }
      }
    }

    // 4. 通用物理重排：放置 movingItem 和所有未冲突项
    const placedList: HomeItem[] = [
      updatedMoving,
      ...otherItems.filter((it) => !conflicts.some((c) => c.id === it.id)),
    ];

    // 冲突项队列：按尺寸降序排列（大组件先安置，小应用后安置）
    const toPlaceQueue: HomeItem[] = [...conflicts].sort(
      (a, b) => b.colSpan * b.rowSpan - a.colSpan * a.rowSpan
    );

    // 跟踪已使用的 vacatedSlots
    const usedVacatedIndices = new Set<number>();

    while (toPlaceQueue.length > 0) {
      const current = toPlaceQueue.shift()!;
      let assignedSlot: { col: number; row: number } | null = null;

      // 如果是 1x1 应用，且有腾出的空位，优先匹配同列（垂直平移一横排）或最近的空位
      if (current.colSpan === 1 && current.rowSpan === 1 && vacatedSlots.length > 0) {
        let bestVacatedIdx = -1;
        let minColDist = Infinity;
        vacatedSlots.forEach((slot, idx) => {
          if (usedVacatedIndices.has(idx)) return;
          const colDist = Math.abs(slot.col - current.col);
          const rowDist = Math.abs(slot.row - current.row);
          const totalDist = colDist * 2 + rowDist;
          if (totalDist < minColDist) {
            minColDist = totalDist;
            bestVacatedIdx = idx;
          }
        });

        if (bestVacatedIdx !== -1) {
          const occ = buildOccupiedMatrix(placedList);
          const candidate = vacatedSlots[bestVacatedIdx];
          if (!occ[candidate.row][candidate.col]) {
            usedVacatedIndices.add(bestVacatedIdx);
            assignedSlot = candidate;
          }
        }
      }

      // 如果没从腾出空位中匹配到，或者为组件，在当前已占矩阵中寻找最近的空闲槽位
      if (!assignedSlot) {
        const occupied = buildOccupiedMatrix(placedList);
        assignedSlot = findBestFreeSlot(
          occupied,
          current.col,
          current.row,
          current.colSpan,
          current.rowSpan
        );
      }

      // 保底：若没找到附近的，寻找屏幕任意空位
      if (!assignedSlot) {
        const occupied = buildOccupiedMatrix(placedList);
        assignedSlot = findBestFreeSlot(occupied, 0, 0, current.colSpan, current.rowSpan);
      }

      if (assignedSlot) {
        placedList.push({ ...current, col: assignedSlot.col, row: assignedSlot.row });
      } else {
        placedList.push(current);
      }
    }

    // 5. 终极安全校验：若出现任何异常相交，以当前目标落点优先无相交保底打包
    if (hasAnyCollision(placedList)) {
      const finalPlaced: HomeItem[] = [updatedMoving];
      const allOtherItemsToPlace = otherItems.slice();

      // 先排大组件，再排应用
      const otherWidgets = allOtherItemsToPlace.filter((it) => it.colSpan > 1 || it.rowSpan > 1);
      const otherApps = allOtherItemsToPlace.filter((it) => it.colSpan === 1 && it.rowSpan === 1);

      for (const w of otherWidgets) {
        const occ = buildOccupiedMatrix(finalPlaced);
        const slot = findBestFreeSlot(occ, w.col, w.row, w.colSpan, w.rowSpan) || findBestFreeSlot(occ, 0, 0, w.colSpan, w.rowSpan);
        if (slot) {
          finalPlaced.push({ ...w, col: slot.col, row: slot.row });
        } else {
          finalPlaced.push(w);
        }
      }

      for (const a of otherApps) {
        const occ = buildOccupiedMatrix(finalPlaced);
        const slot = findBestFreeSlot(occ, a.col, a.row, 1, 1) || findBestFreeSlot(occ, 0, 0, 1, 1);
        if (slot) {
          finalPlaced.push({ ...a, col: slot.col, row: slot.row });
        } else {
          finalPlaced.push(a);
        }
      }

      return finalPlaced;
    }

    return placedList;
  };

  // 添加小组件 (支持 2x2 经典小组件与 4x2 相册横幅小组件)
  const handleAddWidget = (type: WidgetType) => {
    const isPhoto = type === 'photo';
    const colSpan = isPhoto ? 4 : 2;
    const rowSpan = 2;

    const occ = buildOccupiedMatrix(itemsRef.current);
    const freeSlot = findBestFreeSlot(occ, 0, 0, colSpan, rowSpan);

    const newWidget: HomeItem = {
      id: `w-${type}-${Date.now()}`,
      kind: 'widget',
      col: freeSlot ? freeSlot.col : 0,
      row: freeSlot ? freeSlot.row : 0,
      colSpan,
      rowSpan,
      widgetData: {
        id: `w-${type}-${Date.now()}`,
        type,
        style: 'standard',
        photoUrl: isPhoto ? (localStorage.getItem('ios_photo_widget_url') || DEFAULT_PHOTO_URL) : undefined,
      },
    };

    if (freeSlot) {
      setItems((prev) => [...prev, newWidget]);
    } else {
      setItems(resolveMoveWithReflow(newWidget, 0, 4));
    }
    setShowAddWidgetModal(false);
  };

  // 开始拖拽主网格项
  const startDragGridItem = (item: HomeItem, e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditing) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    setDragging({
      fromZone: 'grid',
      item,
      originalCol: item.col,
      originalRow: item.row,
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    });

    setDropPreview({
      zone: 'grid',
      col: item.col,
      row: item.row,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan,
    });
  };

  // 开始拖拽 Dock 应用
  const startDragDockApp = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditing) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    setDragging({
      fromZone: 'dock',
      item: dockAppsRef.current[index],
      dockIndex: index,
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    });

    setDropPreview({
      zone: 'dock',
      dockIndex: index,
    });
  };

  // 全局拖拽追踪与安全 Drop 逻辑
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const currentDrag = draggingRef.current;
      if (!currentDrag || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const nextX = clientX - containerRect.left;
      const nextY = clientY - containerRect.top;

      setDragging((prev) => (prev ? { ...prev, x: nextX, y: nextY } : null));

      // 1. 判断是否悬停在底部 Dock 栏
      const dockEl = document.getElementById('ios-dock');
      if (dockEl) {
        const dockRect = dockEl.getBoundingClientRect();
        if (
          clientX >= dockRect.left &&
          clientX <= dockRect.right &&
          clientY >= dockRect.top &&
          clientY <= dockRect.bottom
        ) {
          // 小组件禁止进入 Dock
          if ('kind' in currentDrag.item && currentDrag.item.kind === 'widget') {
            return;
          }
          const relX = clientX - dockRect.left;
          const maxSlots = 4;
          const slotWidth = dockRect.width / maxSlots;
          const dockIndex = Math.max(0, Math.min(maxSlots - 1, Math.floor(relX / slotWidth)));
          setDropPreview({
            zone: 'dock',
            dockIndex,
          });
          return;
        }
      }

      // 2. 判断是否悬停在主网格（无论有无内容，均可吸附到任意坐标）
      if (gridAreaRef.current) {
        const gridRect = gridAreaRef.current.getBoundingClientRect();
        if (
          clientX >= gridRect.left &&
          clientX <= gridRect.right &&
          clientY >= gridRect.top &&
          clientY <= gridRect.bottom
        ) {
          const relX = clientX - gridRect.left;
          const relY = clientY - gridRect.top;

          const colWidth = gridRect.width / TOTAL_COLS;
          const rowHeight = gridRect.height / TOTAL_ROWS;

          const rawCol = Math.floor(relX / colWidth);
          const rawRow = Math.floor(relY / rowHeight);

          const colSpan = 'colSpan' in currentDrag.item ? currentDrag.item.colSpan : 1;
          const rowSpan = 'rowSpan' in currentDrag.item ? currentDrag.item.rowSpan : 1;

          let targetCol = 0;
          // 行位置：自由以“单横排”（1 行）为单位上下移动，不再被大组件尺寸死板锁死在 0/2/4
          const targetRow = Math.max(0, Math.min(TOTAL_ROWS - rowSpan, rawRow));

          if (colSpan === 4) {
            targetCol = 0;
          } else if (colSpan === 2) {
            targetCol = rawCol < 2 ? 0 : 2;
          } else {
            targetCol = Math.max(0, Math.min(TOTAL_COLS - colSpan, rawCol));
          }

          const isMovingAnApp =
            (currentDrag.fromZone === 'grid' && (currentDrag.item as HomeItem).kind === 'app') ||
            currentDrag.fromZone === 'dock';

          let stackTargetId: string | undefined = undefined;

          if (isMovingAnApp) {
            const currentDragId = currentDrag.fromZone === 'grid' ? (currentDrag.item as HomeItem).id : null;
            const currentGridItems = itemsRef.current;
            const hoveredItem = currentGridItems.find(
              (it) => it.col === targetCol && it.row === targetRow && it.id !== currentDragId
            );
            if (hoveredItem && (hoveredItem.kind === 'app' || hoveredItem.kind === 'folder')) {
              stackTargetId = hoveredItem.id;
            }
          }

          setDropPreview({
            zone: 'grid',
            col: targetCol,
            row: targetRow,
            colSpan,
            rowSpan,
            stackTargetId,
          });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggingRef.current) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
        handleMove(e.clientX, e.clientY);
      }
    };

    // 终结拖拽：无论拖到哪里，软件和组件永远保留，绝不消失，绝无克隆
    const handleEnd = () => {
      const currentDrag = draggingRef.current;
      const currentPreview = dropPreviewRef.current;

      if (!currentDrag) return;

      const currentItems = itemsRef.current;
      const currentDock = dockAppsRef.current;

      // 确定落点：如果当前有 preview，则落到 preview；如果拖出边界没有 preview，则安全落回原位，绝不消失
      const previewZone = currentPreview?.zone || currentDrag.fromZone;

      // ================= A. 最终落在主网格 =================
      if (previewZone === 'grid') {
        const targetCol = currentPreview?.col !== undefined ? currentPreview.col : (currentDrag.originalCol || 0);
        const targetRow = currentPreview?.row !== undefined ? currentPreview.row : (currentDrag.originalRow || 0);

        // 检查是否叠放成文件夹 (Stack into Folder)
        const isMovingAnApp =
          (currentDrag.fromZone === 'grid' && (currentDrag.item as HomeItem).kind === 'app') ||
          currentDrag.fromZone === 'dock';

        if (isMovingAnApp && currentPreview?.stackTargetId) {
          const targetItem = currentItems.find((it) => it.id === currentPreview.stackTargetId);
          if (targetItem && (targetItem.kind === 'app' || targetItem.kind === 'folder')) {
            const movingApp: AppInfo =
              currentDrag.fromZone === 'grid'
                ? (currentDrag.item as HomeItem).appData!
                : (currentDrag.item as AppInfo);

            // 叠放创建新文件夹
            if (targetItem.kind === 'app' && targetItem.appData) {
              const folderId = `folder-${Date.now()}`;
              const newFolderItem: HomeItem = {
                id: folderId,
                kind: 'folder',
                col: targetItem.col,
                row: targetItem.row,
                colSpan: 1,
                rowSpan: 1,
                folderData: {
                  id: folderId,
                  name: '文件夹',
                  apps: [targetItem.appData, movingApp],
                },
              };

              setItems((prev) => {
                const filtered = prev.filter(
                  (it) =>
                    it.id !== targetItem.id &&
                    (currentDrag.fromZone === 'grid' ? it.id !== (currentDrag.item as HomeItem).id : true)
                );
                return [...filtered, newFolderItem];
              });

              if (currentDrag.fromZone === 'dock' && currentDrag.dockIndex !== undefined) {
                setDockApps((prev) => prev.filter((_, i) => i !== currentDrag.dockIndex));
              }

              setActiveFolderId(folderId);
              setDragging(null);
              setDropPreview(null);
              return;
            }

            // 叠放加入现有文件夹
            if (targetItem.kind === 'folder' && targetItem.folderData) {
              setItems((prev) =>
                prev
                  .filter((it) =>
                    currentDrag.fromZone === 'grid' ? it.id !== (currentDrag.item as HomeItem).id : true
                  )
                  .map((it) => {
                    if (it.id === targetItem.id && it.folderData) {
                      const exists = it.folderData.apps.some((a) => a.name === movingApp.name);
                      return {
                        ...it,
                        folderData: {
                          ...it.folderData,
                          apps: exists ? it.folderData.apps : [...it.folderData.apps, movingApp],
                        },
                      };
                    }
                    return it;
                  })
              );

              if (currentDrag.fromZone === 'dock' && currentDrag.dockIndex !== undefined) {
                setDockApps((prev) => prev.filter((_, i) => i !== currentDrag.dockIndex));
              }

              setDragging(null);
              setDropPreview(null);
              return;
            }
          }
        }

        // 来源是主网格
        if (currentDrag.fromZone === 'grid') {
          const movingItem = currentDrag.item as HomeItem;
          const newLayout = resolveMoveWithReflow(movingItem, targetCol, targetRow);
          setItems(newLayout);
        }
        // 来源是 Dock 栏
        else if (currentDrag.fromZone === 'dock' && currentDrag.dockIndex !== undefined) {
          const fromDockIdx = currentDrag.dockIndex;
          const app = currentDrag.item as AppInfo;

          // 检查目标网格位置是否有已有应用可以对调
          const existingApp = currentItems.find(
            (it) => it.col === targetCol && it.row === targetRow && it.kind === 'app'
          );

          if (existingApp && existingApp.appData) {
            // 对调：网格 App 下沉入 Dock，Dock App 上浮到网格
            const swapApp = existingApp.appData;
            setDockApps((prev) => {
              const c = [...prev];
              c[fromDockIdx] = swapApp;
              return c;
            });
            setItems((prev) =>
              prev.map((it) => (it.id === existingApp.id ? { ...it, appData: app } : it))
            );
          } else {
            // 目标是空位或组件位：将该应用从 Dock 移到网格
            const newItem: HomeItem = {
              id: `app-${Date.now()}`,
              kind: 'app',
              col: targetCol,
              row: targetRow,
              colSpan: 1,
              rowSpan: 1,
              appData: app,
            };
            // 从 Dock 移除该项
            setDockApps((prev) => prev.filter((_, i) => i !== fromDockIdx));
            setItems(resolveMoveWithReflow(newItem, targetCol, targetRow));
          }
        }
      }

      // ================= B. 最终落在底部 Dock 栏 =================
      else if (previewZone === 'dock') {
        const targetDockIndex = currentPreview?.dockIndex !== undefined ? currentPreview.dockIndex : (currentDrag.dockIndex || 0);

        // 来源是 Dock 栏（内部换位）
        if (currentDrag.fromZone === 'dock') {
          const fromIdx = currentDrag.dockIndex!;
          const toIdx = targetDockIndex;
          if (fromIdx !== toIdx) {
            setDockApps((prev) => {
              const copy = [...prev];
              const [moved] = copy.splice(fromIdx, 1);
              copy.splice(toIdx, 0, moved);
              return copy;
            });
          }
        }
        // 来源是主网格
        else if (currentDrag.fromZone === 'grid') {
          const movingItem = currentDrag.item as HomeItem;
          if (movingItem.kind === 'app' && movingItem.appData) {
            // 如果 Dock 已经满 4 个应用，则与目标位置的已有应用交换对调
            if (currentDock.length >= 4) {
              const swapIdx = Math.min(targetDockIndex, currentDock.length - 1);
              const dockSwapApp = currentDock[swapIdx];
              // 互相交换，不产生任何多余副本，也不丢失软件
              setDockApps((prev) => {
                const c = [...prev];
                c[swapIdx] = movingItem.appData!;
                return c;
              });
              setItems((prev) =>
                prev.map((it) => (it.id === movingItem.id ? { ...it, appData: dockSwapApp } : it))
              );
            } else {
              // Dock 未满 4 个，插入到对应槽位中，从主网格移走
              const insertIdx = Math.min(targetDockIndex, currentDock.length);
              setDockApps((prev) => {
                const copy = [...prev];
                copy.splice(insertIdx, 0, movingItem.appData!);
                return copy;
              });
              setItems((prev) => prev.filter((it) => it.id !== movingItem.id));
            }
          }
        }
      }

      setDragging(null);
      setDropPreview(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  // 屏幕翻页
  const handleStartScreen = (clientX: number, clientY: number, target?: EventTarget | null) => {
    if (target instanceof HTMLElement && target.closest('#add-widget-btn, #add-widget-modal, #done-editing-btn, button, input')) {
      return;
    }
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    isScreenSwiping.current = true;
    startLongPress();
  };

  const handleEndScreen = (clientX: number, clientY: number, target?: EventTarget | null) => {
    cancelLongPress();

    if (target instanceof HTMLElement && target.closest('#add-widget-btn, #add-widget-modal, #done-editing-btn, button, input')) {
      touchStartX.current = null;
      touchStartY.current = null;
      isScreenSwiping.current = false;
      return;
    }

    if (!isScreenSwiping.current || touchStartX.current === null || touchStartY.current === null) {
      isScreenSwiping.current = false;
      return;
    }

    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;
    const isClick = Math.hypot(deltaX, deltaY) < 12;

    // 如果这次抬手是刚刚长按触发进入编辑模式的手势，不立即退出编辑模式
    if (justEnteredEditing.current) {
      justEnteredEditing.current = false;
      touchStartX.current = null;
      touchStartY.current = null;
      isScreenSwiping.current = false;
      return;
    }

    // 编辑模式下点击空白处：完成并退出编辑模式
    if (isEditing && !draggingRef.current && isClick) {
      setIsEditing(false);
      setDragging(null);
      setDropPreview(null);
      setShowAddWidgetModal(false);
      touchStartX.current = null;
      touchStartY.current = null;
      isScreenSwiping.current = false;
      return;
    }

    if (!isEditing && !dragging && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0 && currentPage === 0) {
        setCurrentPage(1);
        triggerSlidingState();
      } else if (deltaX > 0 && currentPage === 1) {
        setCurrentPage(0);
        triggerSlidingState();
      } else {
        triggerSlidingState();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isScreenSwiping.current = false;
  };

  return (
    <div
      ref={containerRef}
      id="home-screen"
      className="relative w-full h-full overflow-hidden select-none transition-colors duration-500"
      style={{ touchAction: 'pan-x', overscrollBehavior: 'none' }}
      onClick={(e) => {
        if ((e.target as HTMLElement)?.closest('#add-widget-btn, #add-widget-modal, #done-editing-btn, button, input')) {
          return;
        }
        // 点击空白处完成编辑
        if (isEditing && !draggingRef.current && !justEnteredEditing.current) {
          setIsEditing(false);
          setDragging(null);
          setDropPreview(null);
          setShowAddWidgetModal(false);
        }
      }}
      onWheel={(e) => {
        // 严格禁止主页面上下滚动
        e.preventDefault();
      }}
      onTouchStart={(e) => handleStartScreen(e.touches[0].clientX, e.touches[0].clientY, e.target)}
      onTouchMove={(e) => {
        cancelLongPress();
        if (e.touches.length > 0) {
          handleMoveScreen(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchEnd={(e) => {
        if (e.changedTouches.length > 0) {
          handleEndScreen(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.target);
        } else {
          cancelLongPress();
        }
      }}
      onMouseDown={(e) => {
        if (e.button === 0) handleStartScreen(e.clientX, e.clientY, e.target);
      }}
      onMouseMove={(e) => {
        cancelLongPress();
        handleMoveScreen(e.clientX, e.clientY);
      }}
      onMouseUp={(e) => {
        if (e.button === 0) handleEndScreen(e.clientX, e.clientY, e.target);
      }}
    >
      {/* ================= 全局浮动跟随代理 (跟随手指/光标) ================= */}
      {dragging && (
        <div
          className="fixed pointer-events-none z-[140] transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `${containerRef.current ? containerRef.current.getBoundingClientRect().left + dragging.x : dragging.x}px`,
            top: `${containerRef.current ? containerRef.current.getBoundingClientRect().top + dragging.y : dragging.y}px`,
          }}
        >
          {'kind' in dragging.item && dragging.item.kind === 'widget' && dragging.item.widgetData ? (
            <div className={`${dragging.item.colSpan === 4 ? 'w-[320px] h-[155px]' : 'w-[155px] h-[155px]'} scale-105 rounded-[24px] ring-4 ring-blue-400/80 overflow-hidden`}>
              <WidgetDisplay item={dragging.item.widgetData} isDarkMode={isDarkMode} isEditing={true} />
            </div>
          ) : 'kind' in dragging.item && dragging.item.kind === 'folder' && dragging.item.folderData ? (
            <div className="w-[60px] h-[60px] scale-110 flex items-center justify-center pointer-events-none">
              <FolderIcon
                folder={dragging.item.folderData}
                darkMode={isDarkMode}
                isEditing={false}
              />
            </div>
          ) : (
            (() => {
              const appData = ('kind' in dragging.item ? dragging.item.appData : dragging.item) as AppInfo | undefined;
              const IconComp = appData?.icon;
              const appName = appData?.name || '';
              const appColor = appData?.color || 'bg-blue-500';

              return (
                <div className="flex flex-col items-center justify-center scale-110">
                  <div
                    className={`w-16 h-16 ${
                      isDarkMode ? 'bg-gray-800/90' : appColor
                    } rounded-2xl flex items-center justify-center ring-4 ring-white/70 overflow-hidden`}
                  >
                    <div className="transform scale-75">
                      {IconComp ? (
                        <IconComp darkMode={isDarkMode} tintColor={isDarkMode ? '#ffffff' : '#000000'} />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                          {appName ? appName.slice(0, 1) : '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-white text-[11px] mt-1 font-semibold tracking-wide bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    {appName}
                  </span>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* 壁纸背景 */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isDarkMode
            ? 'bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e293b]'
            : 'bg-gradient-to-tr from-[#fdfbfb] via-[#ebedee] to-[#e2ebf0]'
        }`}
      />

      {/* 氛围渐变光晕 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -bottom-10 -left-10 w-52 h-52 rounded-full blur-3xl transition-opacity duration-1000 ${
            isDarkMode ? 'bg-indigo-600/25' : 'bg-blue-400/25'
          }`}
        />
        <div
          className={`absolute -bottom-8 right-0 w-48 h-48 rounded-full blur-3xl transition-opacity duration-1000 ${
            isDarkMode ? 'bg-purple-600/20' : 'bg-indigo-300/30'
          }`}
        />
        <div
          className={`absolute top-1/3 left-1/4 w-60 h-60 rounded-full blur-3xl transition-opacity duration-1000 ${
            isDarkMode ? 'bg-blue-900/15' : 'bg-sky-200/40'
          }`}
        />
      </div>

      <div className="relative w-full h-full flex flex-col z-10">
        {/* 编辑状态顶部操作栏：替代原状态栏时间和电池位置（真机 iOS 原生体验） */}
        {isEditing && (
          <>
            <div
              className="absolute top-[17px] left-6 z-[90] pointer-events-auto animate-fadeIn flex items-center h-[30px]"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="add-widget-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddWidgetModal((prev) => !prev);
                }}
                className="w-[28px] h-[28px] rounded-full bg-white/25 dark:bg-white/20 backdrop-blur-xl hover:bg-white/35 active:scale-95 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                title="添加小组件"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div
              className="absolute top-[17px] right-6 z-[90] pointer-events-auto animate-fadeIn flex items-center h-[30px]"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="done-editing-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setShowAddWidgetModal(false);
                  setDragging(null);
                  setDropPreview(null);
                }}
                className="h-[28px] px-3.5 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
              >
                完成
              </button>
            </div>
          </>
        )}

        {/* 添加小组件抽屉 (处于顶部按钮下方，绝不覆盖顶部按钮或灵动岛) */}
        {isEditing && showAddWidgetModal && (
          <div
            id="add-widget-modal"
            className="absolute inset-x-4 top-[56px] z-[100] p-4 rounded-3xl bg-neutral-900/95 backdrop-blur-2xl border border-white/20 text-white animate-fadeIn"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold tracking-wide">添加小组件</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddWidgetModal(false);
                }}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'photo' as WidgetType, name: '相册', icon: '🖼️', size: '4x2' },
                { type: 'calendar' as WidgetType, name: '日历', icon: '📅', size: '2x2' },
                { type: 'weather' as WidgetType, name: '天气', icon: '🌤️', size: '2x2' },
                { type: 'stock' as WidgetType, name: '股市', icon: '📈', size: '2x2' },
              ].map((w) => (
                <button
                  key={w.type}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddWidget(w.type);
                    setShowAddWidgetModal(false);
                  }}
                  className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer group"
                >
                  <span className="text-xl mb-1">{w.icon}</span>
                  <span className="text-[11px] font-medium truncate">{w.name}</span>
                  <span className="text-[9px] text-white/50">{w.size}</span>
                  <span className="text-[9px] mt-1 px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-medium">
                    + 添加
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 主屏幕滑动视图 */}
        <div className="flex-1 w-full overflow-hidden relative">
          <div
            id="home-pages-slider"
            className="w-[200%] h-full flex transition-transform duration-350 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${currentPage * 50}%)`, touchAction: 'pan-x', overscrollBehavior: 'none' }}
          >
            {/* Page 0: iOS 真正的完全自由放置坐标网格 */}
            <div
              className="w-1/2 h-full flex flex-col pt-[72px] px-3.5 pb-2 select-none overflow-visible"
              style={{ touchAction: 'pan-x', overscrollBehavior: 'none' }}
            >
              <div
                ref={gridAreaRef}
                id="ios-absolute-grid"
                className="relative w-full max-w-[340px] h-[440px] mx-auto transition-all select-none overflow-visible"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
                  columnGap: '14px',
                  rowGap: '12px',
                }}
              >
                {/* 1. 编辑状态下的所有网格空位槽位指示器 */}
                {isEditing && (
                  Array.from({ length: TOTAL_ROWS * TOTAL_COLS }).map((_, slotIdx) => {
                    const r = Math.floor(slotIdx / TOTAL_COLS);
                    const c = slotIdx % TOTAL_COLS;
                    return (
                      <div
                        key={`empty-slot-${r}-${c}`}
                        style={{
                          gridColumnStart: c + 1,
                          gridColumnEnd: c + 2,
                          gridRowStart: r + 1,
                          gridRowEnd: r + 2,
                        }}
                        className="rounded-2xl border border-dashed border-white/10 pointer-events-none transition-all flex items-center justify-center"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                      </div>
                    );
                  })
                )}

                {/* 2. 拖拽悬停时的高亮吸附框 */}
                {dropPreview && dropPreview.zone === 'grid' && dropPreview.col !== undefined && dropPreview.row !== undefined && (
                  <div
                    style={{
                      gridColumnStart: dropPreview.col + 1,
                      gridColumnEnd: dropPreview.col + 1 + (dropPreview.colSpan || 1),
                      gridRowStart: dropPreview.row + 1,
                      gridRowEnd: dropPreview.row + 1 + (dropPreview.rowSpan || 1),
                    }}
                    className={`rounded-[24px] pointer-events-none z-10 transition-all ${
                      dropPreview.stackTargetId
                        ? 'bg-blue-400/30 border-2 border-blue-400 scale-105 shadow-lg shadow-blue-500/20 flex items-center justify-center'
                        : 'bg-blue-500/20 border-2 border-blue-400/80 animate-pulse'
                    }`}
                  >
                    {dropPreview.stackTargetId && (
                      <span className="text-[10px] font-semibold text-white bg-blue-600/90 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                        叠放成文件夹
                      </span>
                    )}
                  </div>
                )}

                {/* 3. 渲染主屏幕上所有自由放置的项目 */}
                {items.map((item, index) => {
                  const isBeingDragged = dragging?.fromZone === 'grid' && (dragging.item as HomeItem).id === item.id;

                  return (
                    <div
                      key={item.id}
                      style={{
                        gridColumnStart: item.col + 1,
                        gridColumnEnd: item.col + 1 + item.colSpan,
                        gridRowStart: item.row + 1,
                        gridRowEnd: item.row + 1 + item.rowSpan,
                      }}
                      className={`relative select-none overflow-visible transition-all duration-300 transform ${
                        isBeingDragged ? 'opacity-20 scale-95 pointer-events-none' : ''
                      } ${isEditing ? (index % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt') : ''}`}
                    >
                      {/* 如果是小组件 (2x2) */}
                      {item.kind === 'widget' && item.widgetData && (
                        <div
                          className="w-full h-full relative"
                          onMouseDown={(e) => {
                            if (isEditing) e.stopPropagation();
                            startDragGridItem(item, e);
                          }}
                          onTouchStart={(e) => {
                            if (isEditing) e.stopPropagation();
                            startDragGridItem(item, e);
                          }}
                        >
                          <div className={isEditing ? 'cursor-grab active:cursor-grabbing w-full h-full' : 'w-full h-full'}>
                            <WidgetDisplay
                              item={item.widgetData}
                              isDarkMode={isDarkMode}
                              isEditing={isEditing}
                              onUpdatePhoto={(newUrl) => {
                                setItems((prev) =>
                                  prev.map((it) =>
                                    it.id === item.id && it.widgetData
                                      ? { ...it, widgetData: { ...it.widgetData, photoUrl: newUrl } }
                                      : it
                                  )
                                );
                              }}
                            />
                          </div>

                          {/* 编辑删除按钮 (阻止任何父级拖拽冒泡，确保点击必删) */}
                          {isEditing && !isBeingDragged && (
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
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(item.id);
                              }}
                              className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-neutral-800/95 text-white flex items-center justify-center border border-white/30 hover:scale-110 active:scale-95 transition-transform z-30 cursor-pointer"
                              title="删除"
                            >
                              <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}

                      {/* 如果是普通 App (1x1) */}
                      {item.kind === 'app' && item.appData && (
                        <div className="w-full h-full flex flex-col items-center justify-center overflow-visible">
                          <AppIcon
                            app={item.appData}
                            darkMode={isDarkMode}
                            tintColor={isDarkMode ? '#ffffff' : '#000000'}
                            showLabels={true}
                            onClick={() => onAppOpen(item.appData!.name)}
                            isEditing={isEditing}
                            index={index}
                            total={items.length}
                            onRemove={() => handleRemoveItem(item.id)}
                            onLongPressStart={startLongPress}
                            onLongPressEnd={cancelLongPress}
                            onStartDragApp={(e) => {
                              if (isEditing) e.stopPropagation();
                              startDragGridItem(item, e);
                            }}
                            isDraggingThis={isBeingDragged}
                            isDragTargetThis={dropPreview?.stackTargetId === item.id}
                          />
                        </div>
                      )}

                      {/* 如果是文件夹 (1x1) */}
                      {item.kind === 'folder' && item.folderData && (
                        <div className="w-full h-full flex flex-col items-center justify-center overflow-visible">
                          <FolderIcon
                            folder={item.folderData}
                            darkMode={isDarkMode}
                            isEditing={isEditing}
                            index={index}
                            onClick={() => {
                              cancelLongPress();
                              setActiveFolderId(item.id);
                            }}
                            onRemove={() => handleDisbandFolder(item.id)}
                            onLongPressStart={startLongPress}
                            onLongPressEnd={cancelLongPress}
                            onStartDrag={(e) => {
                              if (isEditing) e.stopPropagation();
                              startDragGridItem(item, e);
                            }}
                            isDraggingThis={isBeingDragged}
                            isDragTargetThis={dropPreview?.stackTargetId === item.id}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Page 1: App 资源库 (左滑直接进入) */}
            <div className="w-1/2 h-full">
              <AppLibraryScreen
                onAppOpen={onAppOpen}
                isDarkMode={isDarkMode}
                onBackToHome={() => setCurrentPage(0)}
              />
            </div>
          </div>
        </div>

        {/* 页面指示器：未出现滑动时为搜索胶囊（放大镜+搜索），出现滑动时呈现两个一样大小的圆点滑动动画 */}
        <div className="flex items-center justify-center mb-[20px]">
          <div
            id="page-indicator"
            className={`h-[26px] ${
              isSliding ? 'w-[52px]' : 'w-[68px]'
            } rounded-full bg-black/30 dark:bg-white/15 backdrop-blur-md cursor-pointer hover:bg-black/40 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center select-none overflow-hidden relative`}
            onClick={(e) => {
              e.stopPropagation();
              const targetPage = currentPage === 0 ? 1 : 0;
              setCurrentPage(targetPage);
              triggerSlidingState();
              if (targetPage === 1) {
                setTimeout(() => {
                  const searchInput = document.getElementById('app-library-search') as HTMLInputElement | null;
                  if (searchInput) searchInput.focus();
                }, 320);
              }
            }}
            title={isSliding ? '切换页面' : '搜索'}
          >
            {/* 1. 滑动圆点层：无论是否处于 isSliding 都平滑淡入淡出，避免卡顿突变 */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
                isSliding ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              {/* 两个等大圆点轨道容器，固定宽度 24px (两个 7px 圆点 + 10px 间距) */}
              <div className="relative w-[24px] h-[7px] flex items-center justify-between">
                {/* 两个固定底色圆点，通透纯粹 */}
                <div className="w-[7px] h-[7px] rounded-full bg-white/30" />
                <div className="w-[7px] h-[7px] rounded-full bg-white/30" />

                {/* 纯白活动高亮圆点：以丝滑贝塞尔曲线在两点之间物理平移滑动，彻底解决突兀变色与生硬问题 */}
                <div
                  className="absolute top-0 left-0 w-[7px] h-[7px] rounded-full bg-white transition-transform duration-350 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{
                    transform: `translateX(${currentPage === 0 ? 0 : 17}px)`,
                  }}
                />
              </div>
            </div>

            {/* 2. 搜索胶囊层：未滑动时显示，滑动时平滑淡出缩放 (全居中绝对布局，杜绝不对称边距) */}
            <div
              className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-300 ease-out ${
                isSliding ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
              }`}
            >
              {/* 放大镜搜索图标 */}
              <svg
                className="w-3 h-3 text-white/90 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2.2" />
                <line x1="15.5" y1="15.5" x2="19.5" y2="19.5" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              {/* 右边搜索两个字 (无偏移居中对齐) */}
              <span className="text-[11px] font-medium text-white/90 leading-none text-center select-none pt-[0.5px]">
                搜索
              </span>
            </div>
          </div>
        </div>

        {/* 底部 Dock 栏 */}
        <div id="dock-wrapper" className="pb-5">
          <Dock
            apps={dockApps}
            darkMode={isDarkMode}
            tintColor={isDarkMode ? '#ffffff' : '#000000'}
            onAppOpen={onAppOpen}
            isEditing={isEditing}
            onRemoveDockApp={handleRemoveDockApp}
            onStartDragDockApp={(idx, e) => startDragDockApp(idx, e)}
            draggingDockIndex={dragging?.fromZone === 'dock' ? dragging.dockIndex : null}
            targetHoverDockIndex={dropPreview?.zone === 'dock' ? dropPreview.dockIndex : null}
          />
        </div>

        {/* 文件夹全屏展开模态框 (支持自定义命名、打开应用、移出或解散) */}
        {(() => {
          const activeFolderItem = items.find((it) => it.id === activeFolderId && it.kind === 'folder');
          if (!activeFolderItem || !activeFolderItem.folderData) return null;
          return (
            <FolderViewModal
              folder={activeFolderItem.folderData}
              isOpen={Boolean(activeFolderItem)}
              isDarkMode={isDarkMode}
              isEditing={isEditing}
              onClose={() => setActiveFolderId(null)}
              onRename={handleRenameFolder}
              onAppOpen={onAppOpen}
              onRemoveAppFromFolder={handleRemoveAppFromFolder}
              onDisbandFolder={handleDisbandFolder}
              onReorderApps={handleReorderFolderApps}
            />
          );
        })()}
      </div>
    </div>
  );
};

export { HomeScreen };
export default HomeScreen;
