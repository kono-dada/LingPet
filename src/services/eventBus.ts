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

export function eventBusService() {
  // 监听设置预览事件
  async function onPreviewPetSize(callback: (size: number) => void) {
    return await listen('preview-pet-size', (event) => {
      callback(event.payload as number);
    });
  }

  async function onPreviewPetOpacity(callback: (opacity: number) => void) {
    return await listen('preview-pet-opacity', (event) => {
      callback(event.payload as number);
    });
  }

  async function onPreviewPetBorder(callback: (showBorder: boolean) => void) {
    return await listen('preview-pet-border', (event) => {
      callback(event.payload as boolean);
    });
  }

  // 监听设置确定事件
  async function onPetSizeChanged(callback: (size: number) => void) {
    return await listen('pet-size-changed', (event) => {
      callback(event.payload as number);
    });
  }

  async function onPetOpacityChanged(callback: (opacity: number) => void) {
    return await listen('pet-opacity-changed', (event) => {
      callback(event.payload as number);
    });
  }

  async function onPetBorderChanged(callback: (showBorder: boolean) => void) {
    return await listen('pet-border-changed', (event) => {
      callback(event.payload as boolean);
    });
  }

  // 监听设置保存完成事件
  async function onPetSizeSaved(callback: (size: number) => void) {
    return await listen('pet-size-saved', (event) => {
      callback(event.payload as number);
    });
  }

  async function onPetOpacitySaved(callback: (opacity: number) => void) {
    return await listen('pet-opacity-saved', (event) => {
      callback(event.payload as number);
    });
  }

  async function onPetBorderSaved(callback: (showBorder: boolean) => void) {
    return await listen('pet-border-saved', (event) => {
      callback(event.payload as boolean);
    });
  }

  // 监听AI配置保存事件
  async function onAIConfigSaved(callback: () => void) {
    return await listen('ai-config-saved', () => {
      callback();
    });
  }

  // 发射事件
  async function emitPreviewPetSize(size: number) {
    await emit('preview-pet-size', size);
  }

  async function emitPreviewPetOpacity(opacity: number) {
    await emit('preview-pet-opacity', opacity);
  }

  async function emitPreviewPetBorder(showBorder: boolean) {
    await emit('preview-pet-border', showBorder);
  }

  // 发射AI配置保存事件
  async function emitAIConfigSaved() {
    await emit('ai-config-saved');
  }

  return {
    // 监听器
    onPreviewPetSize,
    onPreviewPetOpacity,
    onPreviewPetBorder,
    onPetSizeChanged,
    onPetOpacityChanged,
    onPetBorderChanged,
    onPetSizeSaved,
    onPetOpacitySaved,
    onPetBorderSaved,
    onAIConfigSaved,
    // 发射器
    emitPreviewPetSize,
    emitPreviewPetOpacity,
    emitPreviewPetBorder,
    emitAIConfigSaved,
  };
}
