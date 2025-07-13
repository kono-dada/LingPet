import { ref } from "vue";
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';
import { useDebounceFn } from '@vueuse/core';
import { invoke } from '@tauri-apps/api/core';
import { windowConfig } from '../../services/windowConfig';

/**
 * 窗口位置管理
 */
export function useWindowPosition() {
  const appWindow = getCurrentWebviewWindow();
  const isSettingsWindow = ref(false);
  const { saveMainWindowPosition, saveSettingsWindowBounds, getWindowConfig } = windowConfig();
  
  let saveTimer: NodeJS.Timeout | null = null;

  // 检测当前是否是设置窗口
  function detectWindowType() {
    isSettingsWindow.value = appWindow.label === 'settings';
  }

  // 防抖保存位置
  function debouncedSavePosition(callback: () => void, delay: number = 1000) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(callback, delay);
  }

  // 防抖重新定位气泡窗口
  const debouncedRepositionBubble = useDebounceFn(async () => {
    try {
      await invoke('reposition_bubble_on_drag_end');
      console.log('拖拽结束后气泡窗口重新定位成功');
    } catch (error) {
      // 如果没有气泡窗口或重新定位失败，不做处理（这是正常情况）
      console.debug('气泡窗口重新定位:', error);
    }
  }, 300);

  // 应用保存的窗口配置
  async function applyWindowConfig() {
    const config = await getWindowConfig();
    if (!config) return;

    if (isSettingsWindow.value && config.settings_window_x != null && config.settings_window_y != null) {
      try {
        const currentPosition = await appWindow.outerPosition();
        const scaleFactor = await appWindow.scaleFactor();
        
        const currentLogicalX = currentPosition.x / scaleFactor;
        const currentLogicalY = currentPosition.y / scaleFactor;
        
        // 如果位置已经正确（允许少量误差），就不需要再移动
        const positionTolerance = 10;
        const isPositionCorrect = 
          Math.abs(currentLogicalX - config.settings_window_x) < positionTolerance &&
          Math.abs(currentLogicalY - config.settings_window_y) < positionTolerance;
        
        if (!isPositionCorrect) {
          await appWindow.setPosition(new LogicalPosition(
            config.settings_window_x,
            config.settings_window_y
          ));
        }
        
        // 检查大小配置
        if (config.settings_window_width && config.settings_window_height) {
          const currentSize = await appWindow.outerSize();
          const currentLogicalWidth = currentSize.width / scaleFactor;
          const currentLogicalHeight = currentSize.height / scaleFactor;
          
          const sizeTolerance = 20;
          const isSizeCorrect = 
            Math.abs(currentLogicalWidth - config.settings_window_width) < sizeTolerance &&
            Math.abs(currentLogicalHeight - config.settings_window_height) < sizeTolerance;
          
          if (!isSizeCorrect) {
            await appWindow.setSize(new LogicalSize(
              config.settings_window_width,
              config.settings_window_height
            ));
          }
        }
      } catch (error) {
        console.error('应用设置窗口配置失败:', error);
      }
    } else if (!isSettingsWindow.value) {
      // 应用主窗口配置
      try {
        await appWindow.setPosition(new LogicalPosition(
          config.main_window_x,
          config.main_window_y
        ));
      } catch (error) {
        console.error('应用主窗口配置失败:', error);
      }
    }
  }

  return {
    isSettingsWindow,
    detectWindowType,
    debouncedSavePosition,
    debouncedRepositionBubble,
    applyWindowConfig,
    saveMainWindowPosition,
    saveSettingsWindowBounds,
    saveTimer
  };
}
