/**
 * @fileoverview 设置管理组合式函数
 * @description 统一管理各种设置状态，提供设置窗口的打开/关闭功能，处理设置标签页的切换
 * @features
 *   - 设置窗口生命周期管理
 *   - 多标签页状态管理
 *   - 窗口配置和位置持久化
 *   - 各设置模块的集成管理
 *   - 响应式状态更新
 * @modules
 *   - useAppearanceSettings: 外观设置管理
 *   - useAISettings: AI设置管理
 *   - useAboutSettings: 关于页面管理
 * @exports
 *   - currentTab: 当前活跃标签页
 *   - availableTabs: 可用标签页列表
 *   - switchTab: 切换标签页函数
 *   - openSettings: 打开设置窗口
 *   - closeSettings: 关闭设置窗口
 *   - appearanceSettings: 外观设置功能
 * @dependencies
 *   - @tauri-apps/api/webviewWindow: 窗口管理
 *   - windowConfig: 窗口配置服务
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { ref, computed, onMounted, onUnmounted } from "vue";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { SETTINGS_TABS, DEFAULT_ACTIVE_TAB } from "../constants/settings-ui";
import type { SettingsState } from '../types/settings-ui';
import { windowConfig } from '../services/windowConfig';
import type { WindowConfig } from '../services/windowConfig';

// 导入各个设置页面的组合式函数
import { useAppearanceSettings } from './settings/useAppearanceSettings';
import { useAISettings } from './settings/useAISettings';
import { useAboutSettings } from './settings/useAboutSettings';

export function useSettings() {
  // ===================
  // 设置UI状态管理
  // ===================
  
  // 设置页面状态
  const settingsState = ref<SettingsState>({
    activeTab: DEFAULT_ACTIVE_TAB,
    isLoading: false,
  });

  // 计算属性
  const currentTab = computed(() => 
    SETTINGS_TABS.find(tab => tab.id === settingsState.value.activeTab) || SETTINGS_TABS[0]
  );

  const availableTabs = computed(() => SETTINGS_TABS);

  // ===================
  // 子组合式函数实例
  // ===================
  
  // 各个设置页面的组合式函数
  const appearanceSettings = useAppearanceSettings();
  const aiSettings = useAISettings();
  const aboutSettings = useAboutSettings();

  // 检查是否正在加载（保留加载状态用于UI反馈）
  const isLoading = computed(() => {
    return appearanceSettings.isLoading.value || 
           aiSettings.isLoading.value ||
           aboutSettings.isLoading.value;
  });

  // ===================
  // 设置窗口管理
  // ===================
  
  // 设置窗口引用
  let settingsWindow: WebviewWindow | null = null;

  // 获取窗口配置函数
  const { getWindowConfig } = windowConfig();

  // ===================
  // UI状态管理方法
  // ===================
  
  // 切换标签页
  function switchTab(tabId: string) {
    const tab = SETTINGS_TABS.find(t => t.id === tabId);
    if (tab) {
      settingsState.value.activeTab = tabId;
    }
  }

  // 设置加载状态
  function setLoading(loading: boolean) {
    settingsState.value.isLoading = loading;
  }

  // 重置到默认标签页
  function resetToDefault() {
    settingsState.value.activeTab = DEFAULT_ACTIVE_TAB;
  }

  // ===================
  // 窗口管理方法
  // ===================
  
  // 打开设置窗口
  async function openSettings() {
    try {
      // 首先尝试关闭任何现有的设置窗口
      try {
        const existingWindow = await WebviewWindow.getByLabel('settings');
        if (existingWindow) {
          await existingWindow.close();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        // 窗口不存在或已关闭，继续
      }

      // 获取保存的窗口配置
      let windowConfig: WindowConfig | null = null;
      try {
        windowConfig = await getWindowConfig();
      } catch (error) {
        console.warn('获取窗口配置失败:', error);
      }

      // 设置窗口选项
      const windowOptions: any = {
        url: '/#/settings',
        title: '宠物设置',
        width: windowConfig?.settings_window_width || 800,
        height: windowConfig?.settings_window_height || 600,
        minWidth: 700,
        minHeight: 500,
        resizable: true,
        transparent: false,
        decorations: true,
        alwaysOnTop: false,
        skipTaskbar: false,
      };

      // 如果有保存的位置，使用保存的位置，否则居中显示
      if (windowConfig?.settings_window_x !== undefined && windowConfig?.settings_window_y !== undefined) {
        windowOptions.x = windowConfig.settings_window_x;
        windowOptions.y = windowConfig.settings_window_y;
        windowOptions.center = false;
      } else {
        windowOptions.center = true;
      }

      // 创建新的设置窗口
      settingsWindow = new WebviewWindow('settings', windowOptions);

      // 监听窗口事件
      settingsWindow.once('tauri://created', () => {
        console.log('设置窗口创建成功');
      });

      settingsWindow.once('tauri://destroyed', () => {
        console.log('设置窗口已销毁');
        settingsWindow = null;
      });

      settingsWindow.once('tauri://error', (error) => {
        console.error('设置窗口错误:', error);
        settingsWindow = null;
      });
    } catch (error) {
      console.error('打开设置窗口失败:', error);
      settingsWindow = null;
    }
  }

  // 关闭设置窗口
  async function closeSettings() {
    if (settingsWindow) {
      try {
        await settingsWindow.close();
      } catch (error) {
        console.error('关闭设置窗口失败:', error);
      }
      settingsWindow = null;
    }
  }

  // ===================
  // 事件处理
  // ===================
  
  // 处理键盘快捷键
  function handleKeydown(event: KeyboardEvent) {
    // Escape 关闭设置窗口
    if (event.key === 'Escape') {
      closeSettings();
    }
  }

  // 处理点击事件
  function handleClick(_event: MouseEvent) {
    // 可以在这里添加其他点击处理逻辑
  }

  // ===================
  // 生命周期
  // ===================
  
  // 组件挂载时初始化
  onMounted(async () => {
    document.addEventListener('keydown', handleKeydown);
  });

  // 组件卸载时清理
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    closeSettings();
  });

  return {
    // UI状态
    settingsState,
    currentTab,
    availableTabs,
    isLoading,
    
    // 子组合式函数实例
    appearanceSettings,
    aiSettings,
    aboutSettings,
    
    // UI状态管理
    switchTab,
    setLoading,
    resetToDefault,
    
    // 窗口管理
    openSettings,
    closeSettings,
    
    // 事件处理
    handleClick,
  };
}
