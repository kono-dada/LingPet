/**
 * @fileoverview 组合式函数统一导出文件
 * @description 提供所有组合式函数的集中导出，简化组件中的导入操作
 * @exports
 *   - useSettings: 设置管理组合函数
 *   - useAppearanceSettings: 外观设置专用组合函数
 *   - useAISettings: AI设置专用组合函数
 *   - useAboutSettings: 关于页面专用组合函数
 *   - useWindow: 窗口管理组合函数
 *   - usePet: 宠物行为管理组合函数
 *   - useAI: AI功能管理组合函数
 *   - useEventBus: 事件总线服务 (别名导出)
 * @types
 *   - WindowConfig: 窗口配置类型
 * @usage
 *   import { useSettings, usePet, useAI } from '@/composables'
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// Composables 统一导出
export { useSettings } from './useSettings';
export { useAppearanceSettings } from './settings/useAppearanceSettings';
export { useAISettings } from './settings/useAISettings';
export { useAboutSettings } from './settings/useAboutSettings';
export { useWindow, type WindowConfig } from './window';
export { usePet } from './usePet';
export { useAI } from './useAI';
export { eventBusService as useEventBus } from '../services/eventBus';

// 兼容性导出（为了向后兼容，避免立即破坏现有代码）
export { useSettings as useSettingsUI } from './useSettings';
export { usePet as useEmotions } from './usePet';
