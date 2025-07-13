<!--
  @fileoverview AI设置组件
  @description 提供AI聊天功能的配置界面，包括API配置、模型选择、对话参数等设置
  @features
    - API Key配置 (安全输入)
    - Base URL设置 (预设选项)
    - 模型选择
    - 温度值调节
    - 最大Token设置
    - 系统提示词配置
    - 配置验证和测试
    - 实时保存功能
  @sections
    - API配置: API Key, Base URL, 模型
    - 对话参数: 温度值, Token限制
    - 高级设置: 系统提示词
  @dependencies
    - useAI: AI功能管理
    - eventBusService: 事件总线服务
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <div class="ai-settings">
    <div class="settings-section">
      <h4 class="section-title">API 配置</h4>
      
      <!-- API Key -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">API Key</label>
          <span class="setting-description">你的AI服务API密钥</span>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <input
              v-model="aiConfigPreview.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              class="text-input"
              placeholder="输入你的API Key"
              @input="handleConfigChange"
            />
            <button
              @click="showApiKey = !showApiKey"
              class="toggle-visibility-btn"
              type="button"
            >
              <svg v-if="showApiKey" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <path d="M1 1l22 22"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Base URL -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">API 基础地址</label>
          <span class="setting-description">AI服务的API端点</span>
        </div>
        <div class="setting-control">
          <select v-model="aiConfigPreview.baseURL" class="select-input" @change="handleConfigChange">
            <option v-for="url in commonBaseUrls" :key="url" :value="url">
              {{ url }}
            </option>
          </select>
          <input
            v-if="isCustomBaseUrl"
            v-model="aiConfigPreview.baseURL"
            type="text"
            class="text-input mt-2"
            placeholder="输入自定义API地址"
            @input="handleConfigChange"
          />
        </div>
      </div>

      <!-- Model -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">模型</label>
          <span class="setting-description">选择AI模型</span>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <input
              v-model="aiConfigPreview.model"
              type="text"
              class="text-input"
              placeholder="输入自定义模型名称"
              @input="handleConfigChange"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h4 class="section-title">对话参数</h4>
      
      <!-- Temperature -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">Temperature</label>
          <span class="setting-value">{{ aiConfigPreview.temperature }}</span>
          <span class="setting-description">控制回复的随机性和创造性</span>
        </div>
        <div class="setting-control">
          <CustomSlider
            v-model="aiConfigPreview.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            :precision="1"
            unit=""
            @change="handleConfigChange"
          />
          <div class="slider-labels">
            <span>严谨</span>
            <span>平衡</span>
            <span>创造</span>
          </div>
        </div>
      </div>

      <!-- Max Tokens -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">最大回复长度</label>
          <span class="setting-value">{{ aiConfigPreview.maxTokens }}</span>
          <span class="setting-description">限制AI回复的最大长度</span>
        </div>
        <div class="setting-control">
          <CustomSlider
            v-model="aiConfigPreview.maxTokens"
            :min="50"
            :max="500"
            :step="10"
            unit="字符"
            @change="handleConfigChange"
          />
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h4 class="section-title">系统设置</h4>
      
      <!-- System Prompt -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">系统提示词</label>
          <span class="setting-description">定义宠物的性格和行为规则</span>
        </div>
        <div class="setting-control">
          <textarea
            v-model="aiConfigPreview.systemPrompt"
            class="textarea-input"
            placeholder="输入系统提示词来定义宠物的性格和行为..."
            rows="6"
            @input="handleConfigChange"
          />
        </div>
      </div>
    </div>

    <!-- 测试连接 -->
    <div class="settings-section">
      <div class="settings-actions">
        <button 
          @click="testConnection" 
          :disabled="!canTest || isLoading"
          class="test-btn"
        >
          {{ isLoading ? '测试中...' : '测试连接' }}
        </button>
      </div>

      <!-- 测试结果 -->
      <div v-if="testResult" :class="['test-result', testResult.success ? 'success' : 'error']">
        {{ testResult.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAISettings } from '../composables/settings/useAISettings';
import CustomSlider from './CustomSlider.vue';
import { AI_CONSTANTS } from '../constants/ai';

// 使用 AI 设置 Composable
const {
  aiConfigPreview,
  isLoading,
  testResult,
  isConfigured,
  testAIConnection,
  updatePreviewConfig
} = useAISettings();

// UI 状态
const showApiKey = ref(false);

// 计算属性
const commonBaseUrls = computed(() => [
  ...AI_CONSTANTS.COMMON_BASE_URLS,
  'custom'
]);

const isCustomBaseUrl = computed(() => 
  aiConfigPreview.value.baseURL === 'custom' || 
  !AI_CONSTANTS.COMMON_BASE_URLS.includes(aiConfigPreview.value.baseURL as any)
);

const canTest = computed(() => isConfigured.value);

// 处理配置变更
async function handleConfigChange() {
  // 使用 updatePreviewConfig 来触发自动保存
  await updatePreviewConfig(aiConfigPreview.value);
  
  // 清除测试结果
  if (testResult.value) {
    testResult.value = null;
  }
}

// 测试连接
async function testConnection() {
  if (!canTest.value) return;
  await testAIConnection();
}
</script>

<style scoped>
.ai-settings {
  padding: 20px;
}

.settings-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-info {
  margin-bottom: 8px;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.setting-description {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.setting-value {
  float: right;
  font-size: 14px;
  font-weight: 500;
  color: #059669;
}

.setting-control {
  width: 100%;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-input, .select-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.text-input:focus, .select-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  resize: vertical;
  font-family: inherit;
}

.textarea-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-visibility-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.toggle-visibility-btn:hover {
  background-color: #f9fafb;
}

.mt-2 {
  margin-top: 8px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.settings-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.test-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: #6b7280;
  color: white;
}

.test-btn:hover:not(:disabled) {
  background-color: #4b5563;
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-result {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}

.test-result.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.test-result.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
</style>
