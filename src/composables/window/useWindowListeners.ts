import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useWindowPosition } from './useWindowPosition';

/**
 * 窗口事件监听器
 */
export function useWindowListeners() {
  const appWindow = getCurrentWebviewWindow();
  const { 
    isSettingsWindow, 
    debouncedSavePosition, 
    debouncedRepositionBubble,
    saveMainWindowPosition,
    saveSettingsWindowBounds 
  } = useWindowPosition();

  // 监听窗口移动事件
  async function setupWindowMoveListener() {
    const scaleFactor = await appWindow.scaleFactor();
    
    // 监听窗口移动
    const unlistenMove = await appWindow.listen('tauri://move', async (event) => {
      const physicalPosition = event.payload as { x: number; y: number };
      
      // 转换为逻辑坐标后保存
      const logicalX = physicalPosition.x / scaleFactor;
      const logicalY = physicalPosition.y / scaleFactor;
      
      if (isSettingsWindow.value) {
        // 对于设置窗口，同时保存位置和大小
        const physicalSize = await appWindow.innerSize();
        const logicalWidth = physicalSize.width / scaleFactor;
        const logicalHeight = physicalSize.height / scaleFactor;
        
        debouncedSavePosition(() => {
          saveSettingsWindowBounds(logicalX, logicalY, logicalWidth, logicalHeight);
        });
      } else {
        // 对于主窗口，保存位置并重新定位气泡窗口
        debouncedSavePosition(() => {
          saveMainWindowPosition(logicalX, logicalY);
        });
        
        // 重新定位气泡窗口（如果存在）- 使用防抖避免频繁调用
        debouncedRepositionBubble();
      }
    });

    // 监听窗口大小改变（仅设置窗口）
    let unlistenResize: (() => void) | null = null;
    if (isSettingsWindow.value) {
      unlistenResize = await appWindow.listen('tauri://resize', async (event) => {
        const physicalSize = event.payload as { width: number; height: number };
        const physicalPosition = await appWindow.outerPosition();
        
        // 转换为逻辑坐标
        const logicalX = physicalPosition.x / scaleFactor;
        const logicalY = physicalPosition.y / scaleFactor;
        const logicalWidth = physicalSize.width / scaleFactor;
        const logicalHeight = physicalSize.height / scaleFactor;
        
        debouncedSavePosition(() => {
          saveSettingsWindowBounds(logicalX, logicalY, logicalWidth, logicalHeight);
        });
      });
    }

    return () => {
      unlistenMove();
      if (unlistenResize) unlistenResize();
    };
  }

  return {
    setupWindowMoveListener
  };
}
