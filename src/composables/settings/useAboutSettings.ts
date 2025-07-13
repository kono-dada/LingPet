/**
 * @fileoverview 关于页面专用组合式函数
 * @description 管理关于页面的状态和数据，加载应用信息、版本号、系统信息等
 * @features
 *   - 应用信息加载和显示
 *   - 版本信息获取
 *   - 系统平台信息
 *   - 构建日期和许可证信息
 *   - 加载状态管理
 *   - 错误状态处理
 * @dataItems
 *   - 应用名称、版本、描述
 *   - 作者和许可证信息
 *   - 代码仓库链接
 *   - 构建日期和平台信息
 * @exports
 *   - appInfo: 应用信息对象
 *   - isLoading: 加载状态
 *   - error: 错误状态
 *   - loadAppInfo: 加载应用信息函数
 * @dependencies
 *   - @tauri-apps/api/core: Tauri核心API
 *   - @tauri-apps/api/app: 应用信息API
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { ref, onMounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';

// 应用信息接口
interface AppInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: string;
  buildDate: string;
  platform: string;
}

// 系统信息接口
interface SystemInfo {
  os: string;
  arch: string;
  platform: string;
  memory: string;
  cpu: string;
}

// 默认应用信息
const DEFAULT_APP_INFO: AppInfo = {
  name: 'Desktop Pet',
  version: '1.0.0',
  description: '一个可爱的桌面宠物应用，提供AI对话和表情交互功能',
  author: 'Desktop Pet Team',
  license: 'MIT',
  repository: 'https://github.com/your-username/desktop-pet',
  buildDate: new Date().toISOString().split('T')[0],
  platform: 'Cross-platform',
};

export function useAboutSettings() {
  // ===================
  // 关于页面状态
  // ===================
  
  // 应用信息
  const appInfo = ref<AppInfo>({ ...DEFAULT_APP_INFO });
  const systemInfo = ref<SystemInfo | null>(null);
  
  // 加载状态
  const isLoading = ref(false);

  // ===================
  // 数据加载方法
  // ===================
  
  // 加载应用信息
  async function loadAppInfo() {
    try {
      // 获取应用版本
      const version = await getVersion();
      appInfo.value.version = version;
      
      // 检测平台
      const platform = navigator.platform;
      appInfo.value.platform = platform;
      
      console.log('应用信息已加载:', appInfo.value);
    } catch (error) {
      console.error('加载应用信息失败:', error);
    }
  }

  // 加载系统信息
  async function loadSystemInfo() {
    try {
      // 这里可以添加具体的系统信息获取
      // const sysInfo = await invoke('get_system_info');
      
      // 暂时使用客户端检测
      const userAgent = navigator.userAgent;
      let os = 'Unknown';
      let arch = 'Unknown';
      
      if (userAgent.includes('Windows')) {
        os = 'Windows';
      } else if (userAgent.includes('Mac')) {
        os = 'macOS';
      } else if (userAgent.includes('Linux')) {
        os = 'Linux';
      }
      
      if (userAgent.includes('x64') || userAgent.includes('AMD64')) {
        arch = 'x64';
      } else if (userAgent.includes('ARM64') || userAgent.includes('aarch64')) {
        arch = 'ARM64';
      }
      
      systemInfo.value = {
        os,
        arch,
        platform: navigator.platform,
        memory: `${(navigator as any).deviceMemory || 'Unknown'} GB`,
        cpu: `${navigator.hardwareConcurrency || 'Unknown'} cores`,
      };
      
      console.log('系统信息已加载:', systemInfo.value);
    } catch (error) {
      console.error('加载系统信息失败:', error);
    }
  }

  // 加载所有关于信息
  async function loadAllAboutInfo() {
    isLoading.value = true;
    try {
      await Promise.all([
        loadAppInfo(),
        loadSystemInfo(),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  // ===================
  // 辅助方法
  // ===================
  
  // 格式化文件大小
  function formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 格式化内存大小
  function formatMemory(memory: string): string {
    if (memory === 'Unknown') return '未知';
    return memory;
  }

  // 获取操作系统图标
  function getOSIcon(os: string): string {
    switch (os.toLowerCase()) {
      case 'windows':
        return '🪟';
      case 'macos':
        return '🍎';
      case 'linux':
        return '🐧';
      default:
        return '💻';
    }
  }

  // 打开外部链接
  async function openLink(url: string) {
    try {
      await invoke('open_url', { url });
    } catch (error) {
      console.error('打开链接失败:', error);
      // 降级到 window.open
      window.open(url, '_blank');
    }
  }

  // ===================
  // 功能方法
  // ===================
  
  // 复制信息到剪贴板
  async function copyInfoToClipboard() {
    const info = [
      `${appInfo.value.name} v${appInfo.value.version}`,
      `Platform: ${appInfo.value.platform}`,
      `Build Date: ${appInfo.value.buildDate}`,
      '',
      'System Information:',
      `OS: ${systemInfo.value?.os || 'Unknown'}`,
      `Architecture: ${systemInfo.value?.arch || 'Unknown'}`,
      `CPU Cores: ${systemInfo.value?.cpu || 'Unknown'}`,
      `Memory: ${systemInfo.value?.memory || 'Unknown'}`,
      '',
      `Generated at: ${new Date().toLocaleString()}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(info);
      console.log('信息已复制到剪贴板');
      return true;
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      return false;
    }
  }

  // 检查更新（占位符功能）
  async function checkForUpdates() {
    try {
      // 这里可以添加具体的更新检查逻辑
      // const updateInfo = await invoke('check_for_updates');
      
      console.log('检查更新功能暂未实现');
      return {
        hasUpdate: false,
        currentVersion: appInfo.value.version,
        latestVersion: appInfo.value.version,
        message: '当前已是最新版本',
      };
    } catch (error) {
      console.error('检查更新失败:', error);
      return {
        hasUpdate: false,
        currentVersion: appInfo.value.version,
        latestVersion: 'Unknown',
        message: '检查更新失败',
      };
    }
  }

  // 反馈和支持
  function openFeedback() {
    const feedbackUrl = 'https://github.com/your-username/desktop-pet/issues';
    openLink(feedbackUrl);
  }

  function openDocumentation() {
    const docsUrl = 'https://github.com/your-username/desktop-pet/wiki';
    openLink(docsUrl);
  }

  function openRepository() {
    openLink(appInfo.value.repository);
  }

  // ===================
  // 生命周期
  // ===================
  
  // 组件挂载时初始化
  onMounted(async () => {
    await loadAllAboutInfo();
  });

  return {
    // 数据
    appInfo,
    systemInfo,
    
    // 状态
    isLoading,
    
    // 数据加载
    loadAllAboutInfo,
    loadAppInfo,
    loadSystemInfo,
    
    // 辅助方法
    formatFileSize,
    formatMemory,
    getOSIcon,
    openLink,
    
    // 功能方法
    copyInfoToClipboard,
    checkForUpdates,
    
    // 链接方法
    openFeedback,
    openDocumentation,
    openRepository,
  };
}
