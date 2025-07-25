/**
 * @fileoverview 设置管理组合式函数
 * @description 统一管理各种设置状态，提供设置窗口的打开/关闭功能，处理设置标签页的切换
 * @features
 *   - 设置窗口生命周期管理 (使用窗口工厂)
 *   - 多标签页状态管理
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
 *   - windowFactory: 统一窗口管理
 * @author dada
 * @version 2.0.0
 * @since 2025-07-13
 */

import { ref, computed, onMounted, onUnmounted } from "vue";
import { SETTINGS_TABS, DEFAULT_ACTIVE_TAB } from "../../constants/settings-ui";
import type { SettingsState } from '../../types/settings-ui';
import { WindowFactory } from '../../services/windowFactory';

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
  // UI状态管理方法
  // ===================
  
  // 切换标签页
  function switchTab(tabId: string) {
    const tab = SETTINGS_TABS.find(t => t.id === tabId);
    if (tab) {
      settingsState.value.activeTab = tabId;
    }
  }

  // ===================
  // 窗口管理方法
  // ===================

  // 关闭设置窗口
  async function closeSettings() {
    try {
      await WindowFactory.closeWindow('settings');
      console.log('设置窗口已关闭');
    } catch (error) {
      console.error('关闭设置窗口失败:', error);
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
    currentTab,
    availableTabs,
    switchTab
  };
}
