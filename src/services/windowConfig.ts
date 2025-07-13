/**
 * @fileoverview 窗口配置服务
 * @description 管理窗口的配置信息，处理窗口属性的持久化存储和恢复
 * @features
 *   - 窗口位置持久化 (主窗口、设置窗口)
 *   - 窗口大小配置管理
 *   - 后端配置同步
 *   - 配置加载和保存
 * @interfaces
 *   - WindowConfig: 窗口配置接口
 * @methods
 *   - loadWindowConfig: 加载窗口配置
 *   - saveWindowConfig: 保存窗口配置
 *   - getMainWindowPosition: 获取主窗口位置
 *   - setMainWindowPosition: 设置主窗口位置
 *   - getSettingsWindowConfig: 获取设置窗口配置
 *   - setSettingsWindowConfig: 设置设置窗口配置
 * @dependencies
 *   - @tauri-apps/api/core: Tauri核心API调用
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { invoke } from '@tauri-apps/api/core';

export interface WindowConfig {
  main_window_x: number;
  main_window_y: number;
  settings_window_x?: number;
  settings_window_y?: number;
  settings_window_width?: number;
  settings_window_height?: number;
}

/**
 * 窗口配置管理
 */
export function windowConfig() {
  // 保存主窗口位置
  async function saveMainWindowPosition(x: number, y: number) {
    try {
      await invoke('save_main_window_position', { x, y });
      console.log(`主窗口位置已保存: (${x}, ${y})`);
    } catch (error) {
      console.error('保存主窗口位置失败:', error);
    }
  }

  // 保存设置窗口边界
  async function saveSettingsWindowBounds(x: number, y: number, width: number, height: number) {
    try {
      await invoke('save_settings_window_bounds', { x, y, width, height });
      console.log(`设置窗口边界已保存: (${x}, ${y}, ${width}, ${height})`);
    } catch (error) {
      console.error('保存设置窗口边界失败:', error);
    }
  }

  // 获取窗口配置
  async function getWindowConfig(): Promise<WindowConfig | null> {
    try {
      const config = await invoke('get_window_config');
      return config as WindowConfig;
    } catch (error) {
      console.error('获取窗口配置失败:', error);
      return null;
    }
  }

  return {
    saveMainWindowPosition,
    saveSettingsWindowBounds,
    getWindowConfig
  };
}
