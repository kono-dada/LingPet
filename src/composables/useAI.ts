/**
 * @fileoverview AI功能管理组合式函数
 * @description 管理AI配置、处理AI对话请求、提供桌面宠物的智能聊天功能
 * @features
 *   - AI配置管理 (API Key, Base URL, 模型等)
 *   - AI API调用封装
 *   - 对话上下文管理
 *   - 配置验证和错误处理
 *   - 后端配置同步
 *   - 响应式配置状态
 * @api
 *   - chatWithPet: 与宠物对话
 *   - loadAIConfig: 加载AI配置
 *   - saveAIConfig: 保存AI配置
 *   - validateAIConfig: 验证配置
 *   - callAI: 底层AI API调用
 * @types
 *   - AIConfig: AI配置接口
 *   - AIMessage: AI消息格式
 *   - PetResponse: 宠物响应格式
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// AI 配置管理和对话功能
import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import type { AIConfig, AIResponse, ChatRequest, AIMessage, PetResponse } from '../types/ai';

// 默认配置常量
const DEFAULT_AI_CONFIG: AIConfig = {
  apiKey: '',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 150,
  systemPrompt: '',
};

export function useAI() {
  // ===================
  // 响应式状态
  // ===================
  
  // AI 配置状态
  const aiConfig = ref<AIConfig>({ ...DEFAULT_AI_CONFIG });
  const isConfigured = computed(() => Boolean(aiConfig.value.apiKey && aiConfig.value.baseURL));

  // ===================
  // 核心API调用方法
  // ===================

  /**
   * 检查AI配置是否完整
   */
  function validateAIConfig(): boolean {
    return Boolean(
      aiConfig.value.apiKey && 
      aiConfig.value.baseURL && 
      aiConfig.value.model
    );
  }

  /**
   * 调用AI API
   */
  async function callAI(messages: AIMessage[]): Promise<AIResponse> {
    const requestBody: ChatRequest = {
      messages,
      temperature: aiConfig.value.temperature,
      max_tokens: aiConfig.value.maxTokens,
      stream: false,
    };

    const response = await fetch(`${aiConfig.value.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.value.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.value.model,
        ...requestBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API 调用失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    return await response.json();
  }

  /**
   * 桌宠对话
   */
  async function chatWithPet(userMessage: string): Promise<PetResponse> {
    // 每次对话前先加载最新配置，确保配置同步
    await loadAIConfig();
    
    // 检查配置是否完整
    if (!validateAIConfig()) {
      return { message: '请正确配置AI服务' };
    }

    try {
      const messages: AIMessage[] = [];
      if (aiConfig.value.systemPrompt) {
        messages.push({ role: 'system', content: aiConfig.value.systemPrompt });
      }
      messages.push({ role: 'user', content: userMessage });

      const response = await callAI(messages);
      return { message: response.choices[0]?.message?.content || 'AI服务返回空响应' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return { message: `对话失败: ${errorMessage}` };
    }
  }

  // ===================
  // 配置管理方法
  // ===================

  // 加载AI配置
  async function loadAIConfig() {
    const config = await invoke('get_ai_config');
    if (config && typeof config === 'object') {
      // 确保必需字段有默认值
      aiConfig.value = {
        ...DEFAULT_AI_CONFIG,
        ...config as Partial<AIConfig>,
        temperature: (config as any).temperature ?? DEFAULT_AI_CONFIG.temperature,
        maxTokens: (config as any).maxTokens ?? DEFAULT_AI_CONFIG.maxTokens,
      };
    }
  }

  // 保存AI配置
  async function saveAIConfig(config: Partial<AIConfig>) {
    const newConfig = { ...aiConfig.value, ...config };
    await invoke('save_ai_config', { config: newConfig });
    aiConfig.value = newConfig;
    return true;
  }

  // 测试AI连接
  async function testAIConnection(): Promise<{ success: boolean; message: string }> {
    // 先加载最新配置
    await loadAIConfig();
    
    // 检查配置是否完整
    if (!validateAIConfig()) {
      return { success: false, message: '请正确配置AI服务' };
    }

    try {
      const messages: AIMessage[] = [
        { role: 'user', content: '你好' }
      ];
      
      await callAI(messages);
      return { success: true, message: '连接成功' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return { success: false, message: `连接失败: ${errorMessage}` };
    }
  }

  return {
    // 响应式状态
    aiConfig,
    isConfigured,
    
    // 配置管理
    loadAIConfig,
    saveAIConfig,
    testAIConnection,
    
    // AI对话
    chatWithPet,
    
    // 常量
    DEFAULT_AI_CONFIG,
  };
}
