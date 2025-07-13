<!--
  @fileoverview 关于页面组件
  @description 显示应用信息、版本号、开发者信息等，提供使用说明和帮助信息
  @features
    - 应用基本信息显示
    - 版本号和构建信息
    - 开发者信息
    - 使用说明和帮助
    - 加载状态处理
    - 错误状态处理
    - 现代化卡片布局
  @sections
    - 应用信息: 名称、版本、描述
    - 系统信息: 平台、架构等
    - 开发信息: 开发者、技术栈
    - 帮助链接: 文档、反馈等
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <div class="about-settings">
    <div v-if="isLoading" class="loading-state">
      <svg class="loading-icon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
      </svg>
      <p>加载应用信息中...</p>
    </div>
    
    <div v-else class="about-content">
      <!-- 应用信息 -->
      <div class="app-section">
        <div class="app-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.2 7.8l-7.7 7.7-4.2-4.2-1.4 1.4 5.6 5.6 9.1-9.1-1.4-1.4z"/>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="app-name">{{ appInfo.name }}</h3>
        <p class="app-version">版本 {{ appInfo.version }}</p>
        <p class="app-description">{{ appInfo.description }}</p>
        
        <div class="app-details">
          <div class="detail-item">
            <span class="detail-label">平台</span>
            <span class="detail-value">{{ appInfo.platform }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">构建日期</span>
            <span class="detail-value">{{ appInfo.buildDate }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">许可证</span>
            <span class="detail-value">{{ appInfo.license }}</span>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="system-section" v-if="systemInfo">
        <h4>系统信息</h4>
        <div class="system-details">
          <div class="detail-item">
            <span class="detail-label">
              {{ getOSIcon(systemInfo.os) }} 操作系统
            </span>
            <span class="detail-value">{{ systemInfo.os }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">架构</span>
            <span class="detail-value">{{ systemInfo.arch }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">处理器</span>
            <span class="detail-value">{{ systemInfo.cpu }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">内存</span>
            <span class="detail-value">{{ formatMemory(systemInfo.memory) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <div class="action-buttons">
          <button @click="openRepository" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            项目主页
          </button>
          
          <button @click="openDocumentation" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            使用手册
          </button>
          
          <button @click="openFeedback" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"/>
            </svg>
            问题反馈
          </button>
          
          <button @click="copyInfoToClipboard" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
            </svg>
            复制信息
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAboutSettings } from '../composables/settings/useAboutSettings';

// 使用关于设置组合式函数
const {
  appInfo,
  systemInfo,
  isLoading,
  
  // 辅助方法
  formatMemory,
  getOSIcon,
  
  // 功能方法
  copyInfoToClipboard,
  openRepository,
  openDocumentation,
  openFeedback,
} = useAboutSettings();
</script>

<style scoped>
.about-settings {
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6b7280;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  color: #3b82f6;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 应用信息区域 */
.app-section {
  text-align: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.app-icon {
  margin-bottom: 16px;
  color: #3b82f6;
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.app-version {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.app-description {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 24px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.app-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

/* 系统信息区域 */
.system-section {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.system-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.system-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 详细信息项 */
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #1f2937;
  font-family: 'SF Mono', Consolas, monospace;
}

/* 操作按钮区域 */
.actions-section {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.btn svg {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-settings {
    padding: 20px;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
