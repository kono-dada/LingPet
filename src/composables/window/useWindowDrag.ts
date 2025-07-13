import { ref } from "vue";
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

/**
 * 窗口拖拽管理
 */
export function useWindowDrag() {
  const appWindow = getCurrentWebviewWindow();
  const isDragging = ref(false);

  // 处理窗口拖拽
  function handleWindowDrag(event: MouseEvent) {
    // 如果点击的是设置面板或其子元素，不触发窗口拖拽
    const target = event.target as HTMLElement;
    
    // 更严格的检查：包括滑块相关的元素
    if (target.closest('.settings-panel') || 
        target.closest('.size-slider') ||
        target.closest('.slider-container') ||
        (target as HTMLInputElement).type === 'range') {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    
    // 确保只有左键点击才触发拖拽
    if (event.button !== 0) {
      return;
    }
    
    isDragging.value = true;
    
    appWindow.startDragging().finally(() => {
      // 拖拽结束后稍等一下再重新计算正方形，避免抖动
      setTimeout(() => {
        isDragging.value = false;
      }, 100);
    });
  }

  return {
    isDragging,
    handleWindowDrag
  };
}
