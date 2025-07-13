<!--
  @fileoverview 应用程序根组件
  @description 提供路由视图渲染，根据当前路由动态设置页面样式，为设置页面和主页面提供不同的背景样式
  @features
    - 路由视图渲染
    - 动态页面样式设置
    - 透明背景处理
    - 全局CSS样式配置
    - 防止文本选中和拖拽
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <router-view />
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

// 根路由组件，用于渲染不同的页面
const route = useRoute();

// 判断当前是否为设置页面
const isSettingsPage = computed(() => route.path === '/settings');

// 动态设置body样式和CSS类
function updatePageStyles() {
  if (isSettingsPage.value) {
    // 设置页面
    document.body.classList.add('settings-page');
    document.body.style.background = '#f5f5f5';
    document.documentElement.style.background = '#f5f5f5';
  } else {
    // 主页面
    document.body.classList.remove('settings-page');
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
  }
}

// 监听路由变化
watch(isSettingsPage, updatePageStyles, { immediate: true });

onMounted(() => {
  updatePageStyles();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* 全局防止文本选中 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  /* 防止高亮选中效果 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

/* 只对主页面应用透明背景 */
body:not(.settings-page) {
  background: transparent !important;
}

body:not(.settings-page) #app {
  background: transparent !important;
}

body:not(.settings-page) * {
  background: transparent !important;
}

:root {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
</style>
