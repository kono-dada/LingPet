<!--
  @fileoverview 外观设置组件
  @description 提供宠物外观相关的设置功能，包括大小、透明度、边框显示等配置
  @features
    - 宠物大小调节 (自定义滑块)
    - 透明度调节 (百分比显示)
    - 边框显示开关
    - 实时预览功能
    - 设置持久化保存
    - 事件总线通信
    - 响应式UI设计
  @settings
    - 大小范围: MIN_SIZE - MAX_SIZE px
    - 透明度范围: MIN_OPACITY - MAX_OPACITY
    - 边框显示: boolean开关
  @dependencies
    - CustomSlider: 自定义滑块组件
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <div class="appearance-settings">
    <div class="settings-section">
      <h4 class="section-title">外观配置</h4>
      
      <!-- 宠物大小设置 -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">宠物大小</label>
          <span class="setting-value">{{ currentSize }}px</span>
          <span class="setting-description">调整桌面宠物的显示大小</span>
        </div>
        <div class="setting-control">
          <CustomSlider
            v-model="previewSize"
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            unit="px"
            @input="handleSizeInput"
            @change="handleSizeChange"
          />
        </div>
      </div>

      <!-- 透明度设置 -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">透明度</label>
          <span class="setting-value">{{ Math.round(currentOpacity * 100) }}%</span>
          <span class="setting-description">调整宠物的透明度</span>
        </div>
        <div class="setting-control">
          <CustomSlider
            v-model="previewOpacity"
            :min="MIN_OPACITY"
            :max="MAX_OPACITY"
            :step="0.01"
            :precision="2"
            unit="%"
            thumb-color="#FF6B35"
            fill-color="linear-gradient(90deg, #FF6B35, #F7931E)"
            @input="handleOpacityInput"
            @change="handleOpacityChange"
          />
        </div>
      </div>

      <!-- 边框显示设置 -->
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">显示轮廓</label>
          <span class="setting-value">{{ currentShowBorder ? '开启' : '关闭' }}</span>
          <span class="setting-description">是否显示宠物轮廓线</span>
        </div>
        <div class="setting-control">
          <div class="toggle-switch">
            <input
              type="checkbox"
              id="border-toggle"
              v-model="previewShowBorder"
              @change="handleBorderChange"
              class="toggle-input"
            />
            <label for="border-toggle" class="toggle-label">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h4 class="section-title">其他设置</h4>
      
      <!-- 退出应用 -->
      <div class="setting-item quit-section">
        <button 
          @click="quitApp" 
          class="quit-button"
          title="退出桌面宠物应用"
        >
          <svg class="quit-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          退出应用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import CustomSlider from './CustomSlider.vue';
import { SETTINGS_CONSTRAINTS } from '../constants/settings';

// 常量
const { minSize: MIN_SIZE, maxSize: MAX_SIZE, minOpacity: MIN_OPACITY, maxOpacity: MAX_OPACITY } = SETTINGS_CONSTRAINTS;

// 响应式数据
const petSize = ref(150);
const previewSize = ref(150);
const petOpacity = ref(1.0);
const previewOpacity = ref(1.0);
const petShowBorder = ref(true);
const previewShowBorder = ref(true);

// 计算属性
const currentSize = computed(() => Math.round(previewSize.value));
const currentOpacity = computed(() => previewOpacity.value);
const currentShowBorder = computed(() => previewShowBorder.value);

// 方法
async function loadPetSize() {
  try {
    const size = await invoke('get_pet_size');
    if (typeof size === 'number') {
      petSize.value = size;
      previewSize.value = size;
    }
  } catch (error) {
    console.error('获取宠物大小失败:', error);
  }
}

async function loadPetOpacity() {
  try {
    const opacity = await invoke('get_pet_opacity');
    if (typeof opacity === 'number') {
      petOpacity.value = opacity;
      previewOpacity.value = opacity;
    }
  } catch (error) {
    console.error('获取透明度失败:', error);
  }
}

async function loadPetBorder() {
  try {
    const showBorder = await invoke('get_show_border');
    if (typeof showBorder === 'boolean') {
      petShowBorder.value = showBorder;
      previewShowBorder.value = showBorder;
    }
  } catch (error) {
    console.error('获取边框设置失败:', error);
  }
}

function handleSizeInput(newSize: number) {
  previewSize.value = newSize;
  emit('preview-pet-size', newSize);
}

async function handleSizeChange(newSize: number) {
  try {
    await invoke('set_pet_size', { size: newSize });
    petSize.value = newSize;
    emit('pet-size-changed', newSize);
  } catch (error) {
    console.error('设置宠物大小失败:', error);
    previewSize.value = petSize.value;
  }
}

function handleOpacityInput(newOpacity: number) {
  previewOpacity.value = newOpacity;
  emit('preview-pet-opacity', newOpacity);
}

async function handleOpacityChange(newOpacity: number) {
  try {
    await invoke('set_pet_opacity', { opacity: newOpacity });
    petOpacity.value = newOpacity;
    emit('pet-opacity-changed', newOpacity);
  } catch (error) {
    console.error('设置透明度失败:', error);
    previewOpacity.value = petOpacity.value;
  }
}

async function handleBorderChange() {
  const newShowBorder = previewShowBorder.value;
  
  // 立即发送预览事件，让主窗口实时显示效果
  emit('preview-pet-border', newShowBorder);
  
  try {
    await invoke('save_show_border', { showBorder: newShowBorder });
    petShowBorder.value = newShowBorder;
    emit('pet-border-changed', newShowBorder);
  } catch (error) {
    console.error('设置边框失败:', error);
    previewShowBorder.value = petShowBorder.value;
  }
}

async function quitApp() {
  try {
    await invoke('quit_app');
  } catch (error) {
    console.error('退出应用失败:', error);
  }
}

// 初始化
onMounted(async () => {
  await loadPetSize();
  await loadPetOpacity();
  await loadPetBorder();
});
</script>

<style scoped>
.appearance-settings {
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

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 24px;
  transition: 0.3s;
}

.toggle-slider {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-input:checked + .toggle-label {
  background-color: #4ade80;
}

.toggle-input:checked + .toggle-label .toggle-slider {
  transform: translateX(26px);
}

.quit-section {
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.quit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.quit-button:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.quit-icon {
  width: 16px;
  height: 16px;
}
</style>
