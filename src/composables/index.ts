/**
 * @fileoverview 组合式函数统一导出文件
 * @description 提供所有组合式函数的集中导出，简化组件中的导入操作
 * @exports
 *   - useSettings: 设置管理组合函数 (使用窗口工厂)
 *   - useChat: 聊天管理组合函数 (使用窗口工厂)
 *   - useAppearanceSettings: 外观设置专用组合函数
 *   - useAISettings: AI设置专用组合函数
 *   - useAboutSettings: 关于页面专用组合函数
 *   - useWindow: 窗口管理组合函数
 *   - usePet: 宠物行为管理组合函数
 *   - useAI: AI功能管理组合函数
 *   - useEventBus: 事件总线服务 (别名导出)
 * @services
 *   - WindowFactory: 窗口工厂服务
 *   - createSettingsWindow: 设置窗口创建便捷方法
 *   - createNotificationWindow: 通知窗口创建便捷方法
 * @types
 *   - WindowConfig: 窗口配置类型
 * @usage
 *   import { useSettings, useChat, usePet, useAI } from '@/composables'
 *   import { WindowFactory } from '@/composables'
 * @author dada
 * @version 2.0.0
 * @since 2025-07-13
 */

// Composables 统一导出
export { useSettings } from './useSettings';
export { useChat } from './useChat';
export { useAppearanceSettings } from './settings/useAppearanceSettings';
export { useAISettings } from './settings/useAISettings';
export { useAboutSettings } from './settings/useAboutSettings';
export { useWindow, type WindowConfig } from './window';
export { usePet } from './usePet';
export { useAI } from './useAI';
export { eventBusService as useEventBus } from '../services/eventBus';

// 窗口管理服务导出
export { 
  WindowFactory, 
  createSettingsWindow, 
  createNotificationWindow,
  createDialogWindow 
} from '../services/windowFactory';
export type { 
  WindowConfiguration, 
  SettingsWindowConfig, 
  ChatBubbleConfig as NotificationWindowConfig, 
  DialogWindowConfig 
} from '../services/windowFactory';

// 兼容性导出（为了向后兼容，避免立即破坏现有代码）
export { useSettings as useSettingsUI } from './useSettings';
export { usePet as useEmotions } from './usePet';
export { useChat as useChatBubble } from './useChat';
