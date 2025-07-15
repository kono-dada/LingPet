import { defineStore } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { eventBusService } from '../services/eventBus'
import type { AppSetting, AppearanceSetting } from '../types/settings';
import { DEFAULT_SETTINGS } from '../constants/settings_default';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { watch } from 'vue';
import { throttle } from 'lodash';

const { onConfigChanged, emitConfigChanged } = eventBusService()


export const useConfigStore = defineStore('config', {
  state: (): { config: AppSetting } => ({
    config: DEFAULT_SETTINGS,
  }),
  actions: {
    async initialize(isSettingWindow: boolean = false) {
      // 初始化时加载配置
      await this.loadConfig();
      // 如果不是设置窗口就需要监听配置变更事件
      if (!isSettingWindow) {
        onConfigChanged(getCurrentWebview().label, (appConfig: AppSetting) => {
          Object.assign(this.config, appConfig);
          this.throttledSaveConfig();
        });
      } else {
        // 设置窗口需要发射配置变更事件
        watch(
          () => this.config,
          (newConfig) => {
            console.log('来自store的配置变更提醒:', newConfig);
            emitConfigChanged(newConfig);
          },
          { deep: true }
        );
      }
    },
    async loadConfig() {
      const cfg = await invoke<AppSetting>('load_config')
      console.log('从后端加载配置:', cfg);
      Object.assign(this.config, cfg)
    },
    async saveConfig() {
      console.log(`配置已保存: ${JSON.stringify(this.config)}`);
      await invoke('save_config', { config: this.config })
    },
    throttledSaveConfig: throttle(
      async function (this: any) {
        await this.saveConfig();
      },
      1000,
      { leading: true, trailing: true }
    ),

    updateAppearance(partial: Partial<AppearanceSetting>) {
      console.log('准备外观设置:', partial);
      Object.assign(this.config.appearance, partial);
    }
  },
  getters: {
    appearance: (state) => state.config.appearance,
    ai: (state) => state.config.ai,
    window: (state) => state.config.window,
  }
})