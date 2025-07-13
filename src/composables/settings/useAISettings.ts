/**
 * @fileoverview AI设置专用组合式函数
 * @description 专门管理AI相关的配置，处理AI配置的验证、保存和UI状态管理
 * @features
 *   - AI配置表单管理
 *   - 配置验证和测试
 *   - 自动保存功能
 *   - 错误状态处理
 *   - 成功提示显示
 *   - 事件总线通信
 * @configItems
 *   - API Key: 安全输入和验证
 *   - Base URL: 预设选项和自定义
 *   - Model: 模型选择
 *   - Temperature: 温度值调节
 *   - Max Tokens: Token限制设置
 *   - System Prompt: 系统提示词
 * @exports
 *   - aiConfig: AI配置响应式对象
 *   - isConfigValid: 配置有效性状态
 *   - saveStatus: 保存状态管理
 *   - saveAISettings: 保存AI设置函数
 *   - testAIConnection: 测试AI连接
 * @dependencies
 *   - useAI: 核心AI功能
 *   - eventBusService: 事件总线服务
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { ref, computed, onMounted} from 'vue';
import { useAI } from '../chat/useAI';
import { eventBusService } from '../../services/eventBus';
import type { AIConfig } from '../../types/ai';

export function useAISettings() {
  // ===================
  // 使用核心AI功能
  // ===================
  
  const coreAI = useAI();
  const eventBus = eventBusService();

  // ===================
  // 设置UI专用状态
  // ===================
  
  // 预览配置（用于设置界面的实时编辑）
  const aiConfigPreview = ref<AIConfig>({ ...coreAI.DEFAULT_AI_CONFIG });
  
  // UI状态
  const isLoading = ref(false);
  const isTesting = ref(false);
  const hasChanges = ref(false);
  const testResult = ref<{ success: boolean; message: string } | null>(null);
  
  // 基于预览配置的计算属性
  const previewIsConfigured = computed(() => 
    Boolean(aiConfigPreview.value.apiKey && aiConfigPreview.value.baseURL)
  );

  // ===================
  // 数据同步方法
  // ===================
  
  // 从核心加载配置到预览
  async function syncFromCore() {
    isLoading.value = true;
    try {
      await coreAI.loadAIConfig();
      aiConfigPreview.value = { ...coreAI.aiConfig.value };
      hasChanges.value = false;
    } catch (error) {
      console.error('同步配置失败:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // ===================
  // 预览更新方法
  // ===================
  
  // 更新预览配置（自动保存）
  async function updatePreviewConfig(updates: Partial<AIConfig>) {
    aiConfigPreview.value = { ...aiConfigPreview.value, ...updates };
    hasChanges.value = JSON.stringify(coreAI.aiConfig.value) !== JSON.stringify(aiConfigPreview.value);
    
    // 自动保存配置
    try {
      await coreAI.saveAIConfig(aiConfigPreview.value);
      console.log('AI配置已自动保存');
      
      // 发射配置保存事件
      await eventBus.emitAIConfigSaved();
    } catch (error) {
      console.error('自动保存AI配置失败:', error);
    }
  }

  // ===================
  // 配置测试方法
  // ===================
  
  // 测试当前配置（只在用户点击测试按钮时调用）
  async function testCurrentConfig() {
    if (!previewIsConfigured.value) {
      testResult.value = { success: false, message: '请先配置API Key和Base URL' };
      return;
    }

    isTesting.value = true;
    testResult.value = null;

    try {
      // 临时保存预览配置进行测试
      await coreAI.saveAIConfig(aiConfigPreview.value);
      const result = await coreAI.testAIConnection();
      testResult.value = result;
    } catch (error) {
      console.error('测试配置失败:', error);
      testResult.value = { 
        success: false, 
        message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    } finally {
      isTesting.value = false;
    }
  }

  // ===================
  // 设置保存方法
  // ===================
  
  // 应用预览配置
  async function applyPreviewConfig() {
    isLoading.value = true;
    try {
      await coreAI.saveAIConfig(aiConfigPreview.value);
      hasChanges.value = false;
      console.log('AI配置已保存');
      
      // 发射AI配置保存事件，通知主页面重新加载配置
      await eventBus.emitAIConfigSaved();
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  // ===================
  // 重置方法
  // ===================
  
  // 重置到默认值
  function resetToDefaults() {
    aiConfigPreview.value = { ...coreAI.DEFAULT_AI_CONFIG };
    hasChanges.value = JSON.stringify(coreAI.aiConfig.value) !== JSON.stringify(aiConfigPreview.value);
    testResult.value = null;
  }

  // ===================
  // 验证方法
  // ===================
  
  // 验证配置格式
  function validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!aiConfigPreview.value.apiKey.trim()) {
      errors.push('API Key 不能为空');
    }
    
    if (!aiConfigPreview.value.baseURL.trim()) {
      errors.push('Base URL 不能为空');
    } else {
      try {
        new URL(aiConfigPreview.value.baseURL);
      } catch {
        errors.push('Base URL 格式不正确');
      }
    }
    
    if (!aiConfigPreview.value.model.trim()) {
      errors.push('模型名称不能为空');
    }
    
    if (aiConfigPreview.value.temperature < 0 || aiConfigPreview.value.temperature > 2) {
      errors.push('温度值必须在 0-2 之间');
    }
    
    if (aiConfigPreview.value.maxTokens < 1 || aiConfigPreview.value.maxTokens > 4000) {
      errors.push('最大Token数必须在 1-4000 之间');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ===================
  // 生命周期
  // ===================
  
  // 组件挂载时初始化
  onMounted(async () => {
    await syncFromCore();
  });

  return {
    // 配置数据
    aiConfig: coreAI.aiConfig,
    aiConfigPreview,
    
    // 状态
    isLoading,
    isTesting,
    hasChanges,
    testResult,
    isConfigured: previewIsConfigured,
    
    // 数据加载
    loadAIConfig: syncFromCore,
    
    // 预览更新
    updatePreviewConfig,
    
    // 配置测试
    testAIConnection: testCurrentConfig,
    
    // 设置保存
    saveAIConfig: applyPreviewConfig,
    
    // 重置方法
    resetToDefaults,
    
    // 验证方法
    validateConfig,
  };
}
