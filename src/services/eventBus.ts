/**
 * @fileoverview 事件总线服务
 * @description 基于Tauri事件系统实现的组件间通信服务，提供设置预览、更新、保存等事件管理
 * @features
 *   - 设置预览事件 (实时预览，不保存)
 *   - 设置确定事件 (最终确认并应用)
 *   - 设置保存事件 (后端保存完成通知)
 *   - AI配置变更事件
 *   - 事件监听器和发射器封装
 * @events
 *   预览事件: preview-pet-size, preview-pet-opacity, preview-pet-border
 *   确定事件: pet-size-changed, pet-opacity-changed, pet-border-changed
 *   保存事件: pet-size-saved, pet-opacity-saved, pet-border-saved
 *   AI事件: ai-config-saved
 * @dependencies
 *   - @tauri-apps/api/event: Tauri事件API
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// 事件总线组合式函数，用于组件间通信
import { listen, emit } from '@tauri-apps/api/event';
import { AppSetting } from '../types/settings';

export function eventBusService() {
  // 设置变更，一般需要保存
  async function emitConfigChanged(appConfig: AppSetting) {
    await emit('config-changed', appConfig);
  }

  async function onConfigChanged(receiver: string, callback: (appConfig: AppSetting) => void) {
    await listen('config-changed', (event) => {
      console.log(`${receiver} received a config-changed event`);
      callback(event.payload as AppSetting);
    });
  }

  return {
    onConfigChanged,
    emitConfigChanged,
  };
}
