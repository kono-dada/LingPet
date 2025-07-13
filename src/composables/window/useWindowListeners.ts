import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useWindowPosition } from './useWindowPosition';
import { onMounted } from 'vue';

/**
 * 窗口事件监听器
 */
export function useWindowListeners() {
  const appWindow = getCurrentWebviewWindow();
  const {
    debouncedSavePosition,
    saveMainWindowPosition,
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

      // 对于主窗口，只保存位置
      debouncedSavePosition(() => {
        saveMainWindowPosition(logicalX, logicalY);
      });
    });
    onMounted(() => {
      if (unlistenMove) {
        unlistenMove();
      }
    });
  }
  return {
    setupWindowMoveListener
  };
}
