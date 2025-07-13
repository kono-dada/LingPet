/**
 * @fileoverview 聊天管理组合式函数
 * @description 管理聊天气泡的显示和交互，使用统一的窗口工厂
 * @features
 *   - 聊天气泡窗口管理
 *   - 消息显示控制
 *   - 自动隐藏配置
 *   - 统一窗口生命周期
 * @exports
 *   - showChatBubble: 显示聊天气泡
 *   - closeChatBubble: 关闭聊天气泡
 *   - isChatBubbleVisible: 气泡可见状态
 * @dependencies
 *   - windowFactory: 统一窗口管理
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { ref, computed } from "vue";
import { createNotificationWindow, WindowFactory } from '../../services/windowFactory';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useDebounceFn } from '@vueuse/core';
import { LogicalPosition } from '@tauri-apps/api/dpi';

export function useChat() {
  // ===================
  // 聊天状态管理
  // ===================
  
  // 当前消息状态
  const currentMessage = ref<string>('');
  const isVisible = ref<boolean>(false);
  const lastShowTime = ref<Date | null>(null);

  // 计算属性
  const isChatBubbleVisible = computed(() => isVisible.value);
  const hasRecentMessage = computed(() => {
    if (!lastShowTime.value) return false;
    const now = new Date();
    const diff = now.getTime() - lastShowTime.value.getTime();
    return diff < 5000; // 5秒内算作最近消息
  });

  // ===================
  // 气泡窗口跟随功能
  // ===================
  
  let followUnlisten: (() => void) | null = null;

  // 设置气泡窗口跟随主窗口
  const setupBubbleFollow = useDebounceFn(async (bubbleWindow: WebviewWindow, message: string) => {
    try {
      // 清理之前的监听器
      if (followUnlisten) {
        followUnlisten();
        followUnlisten = null;
      }

      // 获取主窗口
      const mainWindow = await WebviewWindow.getByLabel('main');
      if (!mainWindow) return;

      // 监听主窗口移动事件
      followUnlisten = await mainWindow.listen('tauri://move', async () => {
        try {
          // 重新计算并设置气泡位置
          await repositionBubble(bubbleWindow, message);
        } catch (error) {
          console.debug('气泡跟随失败:', error);
        }
      });

      console.log('气泡窗口跟随已启用');
    } catch (error) {
      console.error('设置气泡跟随失败:', error);
    }
  }, 300);

  // 重新定位气泡窗口
  async function repositionBubble(bubbleWindow: WebviewWindow, message: string) {
    try {
      const mainWindow = await WebviewWindow.getByLabel('main');
      if (!mainWindow) return;

      // 获取主窗口信息
      const [mainPosition, mainSize, scaleFactor] = await Promise.all([
        mainWindow.innerPosition(),
        mainWindow.innerSize(),
        mainWindow.scaleFactor()
      ]);

      // 计算新的气泡位置
      const messageLength = message.length;
      const bubbleWidth = 320;
      const estimatedLines = Math.ceil(messageLength / 15);
      const bubbleHeight = Math.min(Math.max(estimatedLines * 24 + 60, 80), 250);
      
      const logicalMainX = mainPosition.x / scaleFactor;
      const logicalMainY = mainPosition.y / scaleFactor;
      const logicalMainWidth = mainSize.width / scaleFactor;
      
      const bubbleX = logicalMainX + (logicalMainWidth / 2) - (bubbleWidth / 2);
      const bubbleY = logicalMainY - bubbleHeight - 10;

      // 设置新位置
      await bubbleWindow.setPosition(new LogicalPosition(bubbleX, bubbleY));
    } catch (error) {
      console.debug('重新定位气泡失败:', error);
    }
  }

  // ===================
  // 聊天管理方法
  // ===================
  
  // 显示聊天气泡
  async function showChatBubble(
    message: string,
    options?: {
      autoHide?: boolean;
      autoHideDelay?: number;
    }
  ) {
    try {
      // 更新状态
      currentMessage.value = message;
      isVisible.value = true;
      lastShowTime.value = new Date();

      // 使用窗口工厂创建通知窗口
      const window = await createNotificationWindow(message, {
        autoHide: options?.autoHide ?? true,
        autoHideDelay: options?.autoHideDelay ?? 3000,
      });

      if (window) {
        console.log(`聊天气泡已显示: "${message}"`);
        
        // 监听窗口关闭事件来更新状态
        window.once('tauri://destroyed', () => {
          // 清理跟随监听器
          if (followUnlisten) {
            followUnlisten();
            followUnlisten = null;
          }
          
          isVisible.value = false;
          currentMessage.value = '';
        });

        // 设置主窗口跟随监听器
        setupBubbleFollow(window, message);
      }

      return window;
    } catch (error) {
      console.error('显示聊天气泡失败:', error);
      isVisible.value = false;
      return null;
    }
  }

  // 关闭聊天气泡
  async function closeChatBubble() {
    try {
      // 清理跟随监听器
      if (followUnlisten) {
        followUnlisten();
        followUnlisten = null;
      }

      await WindowFactory.closeWindow('chat-bubble');
      
      // 更新状态
      isVisible.value = false;
      currentMessage.value = '';
      
      console.log('聊天气泡已关闭');
    } catch (error) {
      console.error('关闭聊天气泡失败:', error);
    }
  }

  // 快速显示消息（带有默认配置）
  async function quickMessage(message: string) {
    return showChatBubble(message, {
      autoHide: true,
      autoHideDelay: 2000, // 2秒后自动隐藏
    });
  }

  // 显示持久消息（不自动隐藏）
  async function persistentMessage(message: string) {
    return showChatBubble(message, {
      autoHide: false,
    });
  }

  // 批量显示消息（按顺序显示）
  async function showMessageSequence(
    messages: string[],
    options?: {
      interval?: number;
      autoHide?: boolean;
      autoHideDelay?: number;
    }
  ) {
    const interval = options?.interval ?? 1000;
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const isLast = i === messages.length - 1;
      
      await showChatBubble(message, {
        autoHide: options?.autoHide ?? isLast, // 最后一条消息才自动隐藏
        autoHideDelay: options?.autoHideDelay ?? 3000,
      });
      
      // 如果不是最后一条消息，等待指定间隔
      if (!isLast) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  // ===================
  // 工具方法
  // ===================
  
  // 检查气泡窗口是否存在
  function getChatBubbleWindow() {
    return WindowFactory.getWindow('chat-bubble');
  }

  // 获取所有聊天相关窗口
  function getAllChatWindows() {
    const allWindows = WindowFactory.getAllWindows();
    const chatWindows = new Map();
    
    for (const [label, instance] of allWindows) {
      if (instance.config.type === 'chat-bubble') {
        chatWindows.set(label, instance);
      }
    }
    
    return chatWindows;
  }

  return {
    // 状态
    currentMessage,
    isVisible,
    lastShowTime,
    isChatBubbleVisible,
    hasRecentMessage,
    
    // 基础方法
    showChatBubble,
    closeChatBubble,
    
    // 便捷方法
    quickMessage,
    persistentMessage,
    showMessageSequence,
    
    // 工具方法
    getChatBubbleWindow,
    getAllChatWindows,
  };
}
