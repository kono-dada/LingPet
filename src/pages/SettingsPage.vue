<!--
  @fileoverview 设置页面组件
  @description 提供完整的设置界面，包含侧边栏导航和主内容区，支持多个设置标签页
  @features
    - 侧边栏导航系统
    - 多标签页设置管理
    - 外观设置、AI设置、关于页面
    - 现代化UI设计
    - 图标和响应式布局
  @components
    - AppearanceSettings: 外观设置组件
    - AISettings: AI设置组件
    - AboutSettings: 关于页面组件
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- 侧边栏 -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
          <h3>设置</h3>
        </div>
        <nav class="sidebar-nav">
          <button
            v-for="tab in availableTabs"
            :key="tab.id"
            @click="switchTab(tab.id)"
            :class="['nav-item', { active: currentTab.id === tab.id }]"
          >
            <div class="nav-icon">
              <svg v-if="tab.icon === 'appearance'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                <path d="M12 22c5.421 0 10-4.579 10-10 0-5.421-4.579-10-10-10S2 6.579 2 12c0 5.421 4.579 10 10 10zM6.306 6.306a8.027 8.027 0 1 1 11.388 11.388A8.027 8.027 0 0 1 6.306 6.306z"/>
                <circle cx="12" cy="12" r="5"/>
              </svg>
              <svg v-else-if="tab.icon === 'ai'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9 8.5 8.5 0 0 1 7.6 4.7 8.38 8.38 0 0 1 .9 3.8z"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="m13.5 7.5-.5 3h-2l-.5-3"/>
                <path d="m13.5 16.5-.5-3h-2l-.5 3"/>
              </svg>
              <svg v-else-if="tab.icon === 'about'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
            </div>
            <span class="nav-text">{{ tab.name }}</span>
          </button>
        </nav>
      </div>

      <!-- 主内容区 -->
      <div class="settings-main">
        <div class="main-header">
          <h2>{{ currentTab.name }}</h2>
        </div>
        
        <div class="main-content">
          <!-- 外观设置 -->
          <AppearanceSettings v-if="currentTab.id === 'appearance'" />
          
          <!-- AI设置 -->
          <AISettings v-if="currentTab.id === 'ai'" />
          
          <!-- 关于页面 -->
          <AboutSettings v-if="currentTab.id === 'about'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettings } from '../composables/useSettings';
import AppearanceSettings from '../components/AppearanceSettings.vue';
import AISettings from '../components/AISettings.vue';
import AboutSettings from '../components/AboutSettings.vue';

// 组合式函数
const { 
  currentTab, 
  availableTabs, 
  switchTab,
} = useSettings();

// 初始化
onMounted(() => {
  // 可以在这里加载初始设置
});
</script>

<style scoped>
.settings-page {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

.settings-container {
  display: flex;
  height: 100%;
  min-width: 800px;
  min-height: 600px;
}

/* 侧边栏样式 */
.settings-sidebar {
  width: 160px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 16px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 13px;
  color: #6b7280;
}

.nav-item:hover {
  background-color: #f9fafb;
  color: #374151;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #2563eb;
  border-right: 3px solid #2563eb;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-weight: 500;
  flex: 1;
}

/* 主内容区样式 */
.settings-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 0;
}

.main-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.main-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 占位符内容样式 */
.placeholder-content, .about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.placeholder-icon, .about-icon {
  margin-bottom: 16px;
  color: #9ca3af;
}

.placeholder-content h3, .about-content h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #374151;
}

.placeholder-content p {
  font-size: 14px;
}

.about-content .version {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.about-content .description {
  font-size: 14px;
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: 24px;
}

.about-links {
  display: flex;
  gap: 16px;
}

.about-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid #2563eb;
  border-radius: 6px;
  transition: all 0.2s;
}

.about-link:hover {
  background-color: #2563eb;
  color: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .settings-container {
    min-width: 700px;
  }
  
  .settings-sidebar {
    width: 140px;
  }
  
  .main-header {
    padding: 16px 24px;
  }
  
  .main-header h2 {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .settings-container {
    min-width: 600px;
  }
  
  .settings-sidebar {
    width: 120px;
  }
  
  .nav-text {
    font-size: 12px;
  }
  
  .main-header {
    padding: 12px 20px;
  }
}
</style>
