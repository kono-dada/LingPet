/**
 * @fileoverview 窗口管理组合式函数集成
 * @description 整合所有窗口相关功能，提供统一的窗口管理接口
 * @features
 *   - 窗口拖拽功能集成
 *   - 窗口大小调整管理
 *   - 窗口位置持久化
 *   - 窗口事件监听器管理
 *   - 窗口配置统一管理
 * @modules
 *   - useWindowDrag: 拖拽功能
 *   - useWindowResize: 大小调整
 *   - useWindowPosition: 位置管理  
 *   - useWindowListeners: 事件监听
 * @exports
 *   - handleWindowDrag: 处理窗口拖拽
 *   - initializeWindowSize: 初始化窗口大小
 *   - resizeWindow: 调整窗口大小
 *   - saveWindowPosition: 保存窗口位置
 *   - loadWindowPosition: 加载窗口位置
 * @dependencies
 *   - windowConfig: 窗口配置服务
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { watch, onMounted, onUnmounted } from "vue";
import { useWindowDrag } from './useWindowDrag';
import { useWindowResize } from './useWindowResize';
import { useWindowPosition } from './useWindowPosition';
import { useWindowListeners } from './useWindowListeners';
import { windowConfig } from '../../services/windowConfig';

// 重新导出接口
export { type WindowConfig } from '../../services/windowConfig';

/**
 * 主窗口管理 Composable - 整合所有窗口相关功能
 */
export function useWindow() {
  // 导入各个子功能
  const { isDragging, handleWindowDrag } = useWindowDrag();
  const { width, height, forceSquare, resizeWindow, initializeWindowSize } = useWindowResize();
  const { 
    isSettingsWindow, 
    detectWindowType, 
    applyWindowConfig,
    saveMainWindowPosition,
    saveSettingsWindowBounds,
    saveTimer
  } = useWindowPosition();
  const { getWindowConfig } = windowConfig();
  const { setupWindowMoveListener } = useWindowListeners();

  // 监听窗口大小变化，在非拖拽状态时强制保持正方形（仅主窗口）
  watch([width, height], () => {
    if (!isDragging.value && !isSettingsWindow.value) {
      forceSquare(isDragging.value, isSettingsWindow.value);
    }
  });

  // 拖拽结束后的处理
  watch(isDragging, (newValue) => {
    if (!newValue && !isSettingsWindow.value) {
      // 延迟执行强制正方形，让拖拽完全结束（仅主窗口）
      setTimeout(() => {
        forceSquare(false, isSettingsWindow.value);
      }, 50);
    }
  });

  // 生命周期
  onMounted(() => {
    detectWindowType();
    setupWindowMoveListener();
    applyWindowConfig();
  });

  onUnmounted(() => {
    if (saveTimer) clearTimeout(saveTimer);
  });

  return {
    // 状态
    isDragging,
    isSettingsWindow,
    width,
    height,
    
    // 大小管理
    resizeWindow,
    initializeWindowSize,
    
    // 拖拽管理
    handleWindowDrag,
    
    // 位置持久化
    saveMainWindowPosition,
    saveSettingsWindowBounds,
    applyWindowConfig,
    
    // 配置管理
    getWindowConfig
  };
}
