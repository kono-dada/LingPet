import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useWindowSize, useDebounceFn } from '@vueuse/core';

/**
 * 窗口大小管理
 */
export function useWindowResize() {
  const appWindow = getCurrentWebviewWindow();
  const { width, height } = useWindowSize();

  // 强制保持正方形窗口
  const forceSquare = useDebounceFn(async (isDragging: boolean, isSettingsWindow: boolean) => {
    if (isDragging || isSettingsWindow) return; // 拖拽时或设置窗口时不执行
    
    if (Math.abs(width.value - height.value) > 2) {
      const size = Math.min(width.value, height.value);
      const logicalSize = new LogicalSize(size, size);
      await appWindow.setSize(logicalSize);
    }
  }, 200);

  // 调整窗口大小，保持中心位置不变
  async function resizeWindow(petSize: number) {
    try {
      // 获取当前窗口的缩放因子来统一坐标系
      const scaleFactor = await appWindow.scaleFactor();

      // 获取当前窗口的逻辑位置和大小
      const currentPhysicalPosition = await appWindow.innerPosition();
      const currentPhysicalSize = await appWindow.innerSize();
      
      // 计算新的窗口大小（逻辑大小）
      const newLogicalSize = Math.max(70, petSize + 80);
      
      // 计算当前窗口中心点（使用逻辑坐标）
      const currentCenterX = (currentPhysicalPosition.x + currentPhysicalSize.width / 2) / scaleFactor;
      const currentCenterY = (currentPhysicalPosition.y + currentPhysicalSize.height / 2) / scaleFactor;
      
      // 重新计算窗口左上角位置（逻辑坐标），使中心保持不变
      const newLogicalX = currentCenterX - newLogicalSize / 2;
      const newLogicalY = currentCenterY - newLogicalSize / 2;
      
      // 创建逻辑大小和位置对象
      const logicalSize = new LogicalSize(newLogicalSize, newLogicalSize);
      const logicalPosition = new LogicalPosition(newLogicalX, newLogicalY);
      
      // 先设置大小，再设置位置
      await appWindow.setSize(logicalSize);
      await appWindow.setPosition(logicalPosition);
      
      console.log('窗口调整完成');
    } catch (error) {
      console.warn('Failed to resize window:', error);
      
      // 降级处理：只调整大小，不移动位置
      try {
        const newWindowSize = Math.max(70, petSize + 80);
        const logicalSize = new LogicalSize(newWindowSize, newWindowSize);
        await appWindow.setSize(logicalSize);
        console.log('降级处理：仅调整大小');
      } catch (fallbackError) {
        console.error('降级处理也失败了:', fallbackError);
      }
    }
  }

  // 初始化窗口大小
  async function initializeWindowSize(petSize: number) {
    try {
      const windowSize = petSize + 80;
      const logicalSize = new LogicalSize(windowSize, windowSize);
      await appWindow.setSize(logicalSize);
    } catch (error) {
      console.warn('Failed to initialize window size:', error);
    }
  }

  return {
    width,
    height,
    forceSquare,
    resizeWindow,
    initializeWindowSize
  };
}
