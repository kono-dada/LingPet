import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useWindowSize } from '@vueuse/core';
import { useConfigStore } from '../stores/config';
import { throttle } from 'lodash';

/**
 * 窗口大小管理
 */
export function useMainWindowResize() {
  const configStore = useConfigStore();
  const appWindow = getCurrentWebviewWindow();
  const { width, height } = useWindowSize();

  function computeLogicalMainWindowState(petSize: number) {
    const logicalSize = new LogicalSize(petSize + 80, petSize + 80);
    const logicalPosition = new LogicalPosition(
      configStore.window.main_window_x - logicalSize.width / 2,
      configStore.window.main_window_y - logicalSize.height / 2
    );
    return { logicalSize, logicalPosition };
  }

  // 调整窗口大小，保持中心位置不变
  async function resizeMainWindow(petSize: number) {
    const { logicalSize, logicalPosition } = computeLogicalMainWindowState(petSize);
    await appWindow.setSize(logicalSize);
    await appWindow.setPosition(logicalPosition);
  }

  const throttledResizeWindow = throttle(
    resizeMainWindow,
    16,
    { leading: true, trailing: true }
  )

  // 初始化窗口大小
  async function initializeWindowSize(petSize: number) {
    try {
      const windowSize = petSize + 80;
      const logicalSize = new LogicalSize(windowSize, windowSize);
      await appWindow.setSize(logicalSize);
      console.log('窗口大小初始化为:', windowSize);
    } catch (error) {
      console.error('Failed to initialize window size:', error);
    }
  }

  return {
    width,
    height,
    resizeWindow: resizeMainWindow,
    initializeWindowSize,
    throttledResizeWindow
  };
}
