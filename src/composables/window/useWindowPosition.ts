import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { LogicalPosition } from '@tauri-apps/api/dpi';
import { windowConfig } from '../../services/windowConfig';

/**
 * 窗口位置管理
 */
export function useWindowPosition() {
  const appWindow = getCurrentWebviewWindow();
  const { saveMainWindowPosition, getWindowConfig } = windowConfig();

  let saveTimer: NodeJS.Timeout | null = null;

  // 防抖保存位置
  function debouncedSavePosition(callback: () => void, delay: number = 1000) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(callback, delay);
  }

  // 应用保存的窗口配置
  async function applyWindowConfig() {
    const config = await getWindowConfig();
    if (!config) return;
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

  return {
    debouncedSavePosition,
    applyWindowConfig,
    saveMainWindowPosition,
    saveTimer
  };
}
