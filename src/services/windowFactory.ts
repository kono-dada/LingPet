/**
 * @fileoverview 窗口工厂服务
 * @description 统一管理所有类型窗口的创建、配置和生命周期
 * @features
 *   - 统一的窗口创建接口
 *   - 窗口类型特化处理
 *   - 窗口配置管理
 *   - 窗口生命周期控制
 * @patterns
 *   - Factory Pattern: 根据类型创建不同的窗口
 *   - Strategy Pattern: 不同窗口类型有不同的创建策略
 * @window_types
 *   - settings: 设置窗口 (前端创建)
 *   - notification: 通知气泡窗口 (后端创建)
 *   - dialog: 对话框窗口 (前端创建)
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { invoke } from '@tauri-apps/api/core';
import { windowConfig } from './windowConfig';
import type { WindowConfig } from './windowConfig';

// 窗口类型定义
export type WindowType = 'settings' | 'chat-bubble' | 'dialog';

// 基础窗口配置接口
export interface BaseWindowConfig {
  type: WindowType;
  label: string;
  title?: string;
  url?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  center?: boolean;
  resizable?: boolean;
  transparent?: boolean;
  decorations?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

// 设置窗口特化配置
export interface SettingsWindowConfig extends BaseWindowConfig {
  type: 'settings';
  minWidth?: number;
  minHeight?: number;
  persistPosition?: boolean;
}

// 通知窗口特化配置
export interface ChatBubbleConfig extends BaseWindowConfig {
  type: 'chat-bubble';
  message: string;
  followMainWindow?: boolean;
  autoHide: boolean;
  autoHideDelay: number;
}

// 对话框窗口特化配置
export interface DialogWindowConfig extends BaseWindowConfig {
  type: 'dialog';
  modal?: boolean;
  buttons?: string[];
}

// 联合类型
export type WindowConfiguration = SettingsWindowConfig | ChatBubbleConfig | DialogWindowConfig;

// 窗口实例管理
class WindowInstance {
  public window: WebviewWindow | null = null;
  public config: WindowConfiguration;
  public createdAt: Date;

  constructor(config: WindowConfiguration) {
    this.config = config;
    this.createdAt = new Date();
  }

  async close(): Promise<void> {
    if (this.window) {
      try {
        await this.window.close();
      } catch (error) {
        console.error(`关闭窗口 ${this.config.label} 失败:`, error);
      }
      this.window = null;
    }
  }
}

// 窗口工厂类
export class WindowFactory {
  private static instances = new Map<string, WindowInstance>();
  private static windowConfigService = windowConfig();

  /**
   * 创建窗口的主入口
   */
  static async createWindow(config: WindowConfiguration): Promise<WebviewWindow | null> {
    // 关闭同标签的现有窗口
    await this.closeWindow(config.label);

    try {
      let window: WebviewWindow | null = null;

      switch (config.type) {
        case 'settings':
          window = await this.createSettingsWindow(config as SettingsWindowConfig);
          break;
        case 'chat-bubble':
          window = await this.createChatBubble(config as ChatBubbleConfig);
          break;
        case 'dialog':
          window = await this.createDialogWindow(config as DialogWindowConfig);
          break;
        default:
          throw new Error(`不支持的窗口类型: ${(config as any).type}`);
      }

      if (window) {
        const instance = new WindowInstance(config);
        instance.window = window;
        this.instances.set(config.label, instance);
        this.setupWindowEvents(instance);
      }

      return window;
    } catch (error) {
      console.error(`创建 ${config.type} 窗口失败:`, error);
      return null;
    }
  }

  /**
   * 创建设置窗口 (前端创建)
   */
  private static async createSettingsWindow(config: SettingsWindowConfig): Promise<WebviewWindow | null> {
    // 获取保存的窗口配置
    let savedConfig: WindowConfig | null = null;
    if (config.persistPosition) {
      try {
        savedConfig = await this.windowConfigService.getWindowConfig();
      } catch (error) {
        console.warn('获取窗口配置失败:', error);
      }
    }

    // 设置窗口选项
    const windowOptions: any = {
      url: config.url || '/#/settings',
      title: config.title || '设置',
      width: savedConfig?.settings_window_width || config.width || 800,
      height: savedConfig?.settings_window_height || config.height || 600,
      minWidth: config.minWidth || 700,
      minHeight: config.minHeight || 500,
      resizable: config.resizable !== false,
      transparent: config.transparent || false,
      decorations: config.decorations !== false,
      alwaysOnTop: config.alwaysOnTop || false,
      skipTaskbar: config.skipTaskbar || false,
    };

    // 设置窗口位置
    if (savedConfig?.settings_window_x !== undefined && savedConfig?.settings_window_y !== undefined) {
      windowOptions.x = savedConfig.settings_window_x;
      windowOptions.y = savedConfig.settings_window_y;
      windowOptions.center = false;
    } else {
      windowOptions.center = config.center !== false;
    }

    return new WebviewWindow(config.label, windowOptions);
  }

  /**
   * 创建通知窗口 (后端创建)
   */
  private static async createChatBubble(config: ChatBubbleConfig): Promise<WebviewWindow | null> {
    try {
      await invoke('show_chat_bubble', {
        message: config.message,
        autoHide: config.autoHide,
        autoHideDelay: config.autoHideDelay,
      });

      // 等待窗口创建并返回引用
      await new Promise(resolve => setTimeout(resolve, 100));
      return WebviewWindow.getByLabel(config.label) || null;
    } catch (error) {
      console.error('创建通知窗口失败:', error);
      return null;
    }
  }

  /**
   * 创建对话框窗口 (前端创建)
   */
  private static async createDialogWindow(config: DialogWindowConfig): Promise<WebviewWindow | null> {
    const windowOptions: any = {
      url: config.url || '/#/dialog',
      title: config.title || '对话框',
      width: config.width || 400,
      height: config.height || 300,
      resizable: config.resizable || false,
      transparent: config.transparent || false,
      decorations: config.decorations !== false,
      alwaysOnTop: config.alwaysOnTop || true,
      skipTaskbar: config.skipTaskbar !== false,
      center: config.center !== false,
    };

    return new WebviewWindow(config.label, windowOptions);
  }

  /**
   * 设置窗口事件监听
   */
  private static setupWindowEvents(instance: WindowInstance): void {
    if (!instance.window) return;

    const { window, config } = instance;

    // 通用事件
    window.once('tauri://created', () => {
      console.log(`${config.type} 窗口创建成功: ${config.label}`);
    });

    window.once('tauri://destroyed', () => {
      console.log(`${config.type} 窗口已销毁: ${config.label}`);
      this.instances.delete(config.label);
    });

    window.once('tauri://error', (error) => {
      console.error(`${config.type} 窗口错误:`, error);
      this.instances.delete(config.label);
    });

    // 设置窗口特殊处理
    if (config.type === 'settings') {
      const settingsConfig = config as SettingsWindowConfig;
      if (settingsConfig.persistPosition) {
        this.setupSettingsWindowPersistence(window);
      }
    }
  }

  /**
   * 设置窗口位置持久化
   */
  private static setupSettingsWindowPersistence(window: WebviewWindow): void {
    // 保存窗口位置和大小的防抖函数
    let saveTimeout: NodeJS.Timeout;
    const debouncedSave = async () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        try {
          const position = await window.innerPosition();
          const size = await window.innerSize();
          await this.windowConfigService.saveSettingsWindowBounds(
            position.x,
            position.y,
            size.width,
            size.height
          );
        } catch (error) {
          console.error('保存设置窗口位置失败:', error);
        }
      }, 500);
    };

    // 监听窗口移动和调整大小
    window.listen('tauri://move', debouncedSave);
    window.listen('tauri://resize', debouncedSave);
  }

  /**
   * 关闭指定窗口
   */
  static async closeWindow(label: string): Promise<void> {
    const instance = this.instances.get(label);
    if (instance) {
      await instance.close();
      this.instances.delete(label);
    }

    // 尝试关闭可能存在的同名窗口
    try {
      const existingWindow = await WebviewWindow.getByLabel(label);
      if (existingWindow) {
        await existingWindow.close();
      }
    } catch (error) {
      // 窗口不存在或已关闭
    }
  }

  /**
   * 关闭所有窗口
   */
  static async closeAllWindows(): Promise<void> {
    const promises = Array.from(this.instances.keys()).map(label => this.closeWindow(label));
    await Promise.all(promises);
  }

  /**
   * 获取窗口实例
   */
  static getWindow(label: string): WebviewWindow | null {
    return this.instances.get(label)?.window || null;
  }

  /**
   * 获取所有窗口实例
   */
  static getAllWindows(): Map<string, WindowInstance> {
    return new Map(this.instances);
  }
}

// 便捷方法
export const createSettingsWindow = (config?: Partial<SettingsWindowConfig>) =>
  WindowFactory.createWindow({
    type: 'settings',
    label: 'settings',
    title: '宠物设置',
    width: 800,
    height: 600,
    persistPosition: true,
    ...config,
  } as SettingsWindowConfig);

export const createNotificationWindow = (message: string, config?: Partial<ChatBubbleConfig>) =>
  WindowFactory.createWindow({
    type: 'chat-bubble',
    label: 'chat-bubble',
    message,
    autoHide: true,
    autoHideDelay: 3000,
    followMainWindow: true,
    ...config,
  } as ChatBubbleConfig);

export const createDialogWindow = (config?: Partial<DialogWindowConfig>) =>
  WindowFactory.createWindow({
    type: 'dialog',
    label: 'dialog',
    title: '对话框',
    width: 400,
    height: 300,
    ...config,
  } as DialogWindowConfig);

// 导出窗口工厂类和便捷方法
