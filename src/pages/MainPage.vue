<!--
  @fileoverview 主页面组件
  @description 桌面宠物的主要显示页面，负责渲染宠物头像、处理窗口交互、管理外观设置
  @features
    - 宠物头像组件渲染
    - 窗口拖拽功能
    - 外观设置管理（大小、透明度、边框）
    - 实时预览更新监听
    - 配置持久化加载
    - 窗口位置和大小管理
    - 事件总线通信
  @dependencies
    - PetAvatar: 宠物头像组件
    - useWindow: 窗口管理组合函数
    - useSettings: 设置管理组合函数
    - eventBusService: 事件总线服务
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import PetAvatar from "../components/PetAvatar.vue";
import { useWindow } from "../composables/window";
import { useSettings } from "../composables/useSettings";
import { eventBusService } from "../services/eventBus";

// 窗口元素引用
const windowElement = ref<HTMLElement>();

// 使用组合式函数
const { handleWindowDrag, initializeWindowSize, resizeWindow } = useWindow();
const { 
  appearanceSettings,
  openSettings, 
  handleClick
} = useSettings();

// 解构外观设置
const {
  petSizeSlider,
  petSizePreview,
  petOpacityPreview,
  showBorderPreview,
  updatePreviewSize,
  updatePreviewOpacity,
  updatePreviewBorder,
  updatePetSize,
  updatePetOpacity,
  updateShowBorder
} = appearanceSettings;

// 事件总线
const eventBus = eventBusService();

// 窗口位置持久化（现在集成在 useWindow 中）
useWindow();

// 宠物头像大小（使用预览值实现实时响应）
const petSize = computed(() => petSizePreview.value);

// 宠物头像透明度（使用预览值实现实时响应）
const petOpacity = computed(() => petOpacityPreview.value);

// 宠物轮廓线显示（使用预览值实现实时响应）
const showBorder = computed(() => showBorderPreview.value);

// 监听来自设置窗口的预览更新
onMounted(async () => {
  // 首先等待窗口持久化系统应用保存的窗口位置
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 先从后端加载宠物大小配置
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    
    // 加载宠物大小
    const savedSize = await invoke('get_pet_size');
    if (typeof savedSize === 'number') {
      // 更新外观设置中的宠物大小
      updatePetSize(savedSize);
      // 然后根据加载的 petSize 初始化窗口大小
      initializeWindowSize(savedSize);
    } else {
      // 如果没有保存的大小，使用默认值
      initializeWindowSize(petSizeSlider.value);
    }
    
    // 加载透明度设置
    const savedOpacity = await invoke('get_pet_opacity');
    if (typeof savedOpacity === 'number') {
      updatePetOpacity(savedOpacity);
    }
    
    // 加载边框显示设置
    const savedShowBorder = await invoke('get_show_border');
    if (typeof savedShowBorder === 'boolean') {
      updateShowBorder(savedShowBorder);
    }
    
  } catch (error) {
    console.error('加载外观设置失败:', error);
    // 出错时使用默认值
    initializeWindowSize(petSizeSlider.value);
  }
  
  // 使用事件总线替代直接的 listen 调用
  await eventBus.onPreviewPetSize((newSize) => {
    updatePreviewSize(newSize);
    // 不在预览时调整窗口大小，避免窗口乱动
  });

  // 监听设置最终确定事件（拖拽结束时）
  await eventBus.onPetSizeChanged((newSize) => {
    console.log('宠物大小已更新:', newSize);
    // 只在设置确定时调整窗口大小
    resizeWindow(newSize);
  });

  // 监听后端保存完成事件 - 但不调整窗口大小，避免重复调整
  await eventBus.onPetSizeSaved((newSize) => {
    console.log('宠物大小已保存到后端:', newSize);
    // 不再调用 resizeWindow，因为 pet-size-changed 已经调整过了
  });

  await eventBus.onPreviewPetOpacity((newOpacity) => {
    updatePreviewOpacity(newOpacity);
  });

  await eventBus.onPreviewPetBorder((newShowBorder) => {
    updatePreviewBorder(newShowBorder);
  });

  await eventBus.onPetBorderChanged((newShowBorder) => {
    console.log('轮廓线显示设置已更新:', newShowBorder);
  });
});
</script>

<template>
  <div 
    ref="windowElement"
    class="desktop-pet" 
    @mousedown.left="handleWindowDrag"
    @click="handleClick"
    :style="{ opacity: petOpacity }"
  >
    <PetAvatar 
      :pet-size="petSize" 
      :show-border="showBorder"
      @open-settings="openSettings"
    />
  </div>
</template>

<style scoped>
.desktop-pet {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent !important;
  overflow: hidden;
  position: relative;
  /* 防止文本选中 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
