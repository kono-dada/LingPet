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
import { onMounted, watchEffect } from "vue";
import PetAvatar from "../components/PetAvatar.vue";
import { useConfigStore } from "../stores/config";
import { storeToRefs } from "pinia";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { throttle } from "lodash";
import { useMainWindowResize } from "../services/useMainWindowResize";
import { useWindowDrag } from "../composables/window/useWindowDrag";
import { watch  } from "vue";

const { initializeWindowSize, throttledResizeWindow } = useMainWindowResize();
const { handleWindowDrag } = useWindowDrag();

const configStore = useConfigStore();

// 使用组合式函数

const { config } = storeToRefs(configStore); // 直接解构出 config ref

function setupMainWindowPositionPersistence() {
  const mainWindow = getCurrentWebviewWindow();
  mainWindow.listen('tauri://move', throttle(
    async () => {
    const scaleFactor = await mainWindow.scaleFactor();
    const windowPosition = await mainWindow.innerPosition();
    const windowSize = await mainWindow.innerSize();
    // 计算窗口中心
    const centerX = windowPosition.x + windowSize.width / 2;
    const centerY = windowPosition.y + windowSize.height / 2;
    // 更新配置
    configStore.window.main_window_x = centerX / scaleFactor;
    configStore.window.main_window_y = centerY / scaleFactor;
    console.log('主窗口位置已更新：', windowPosition);
  }, 200, { leading: true, trailing: true })
  );
}

onMounted(async () => {
  await configStore.initialize(false)  // 主页面需要监听配置变更事件，刷新配置
  initializeWindowSize(config.value.appearance.pet_size);

  watchEffect(() => {
    throttledResizeWindow(config.value.appearance.pet_size);
  });

  watch(
    () => configStore.window,
    () => {
      configStore.throttledSaveConfig();
      console.log('窗口配置已更新并保存:', configStore.window);
    },
    { deep: true, immediate: true }
  )

  setupMainWindowPositionPersistence();
});
</script>

<template>
  <div ref="windowElement" class="desktop-pet" @mousedown.left="handleWindowDrag"
    :style="{ opacity: config.appearance.pet_opacity }">
    <PetAvatar :pet-size="config.appearance.pet_size" :show-border="config.appearance.pet_show_border" />
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
