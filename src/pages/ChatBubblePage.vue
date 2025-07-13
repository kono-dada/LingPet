<!--
  @fileoverview 聊天气泡页面组件
  @description 专门用于显示聊天对话的独立窗口页面，管理聊天气泡的显示和自动隐藏
  @features
    - 独立聊天窗口
    - 自动隐藏功能
    - 消息显示管理
    - 窗口生命周期控制
  @dependencies
    - ChatBubble: 聊天气泡组件
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <ChatBubble 
    :message="message"
    :auto-hide="autoHide"
    :auto-hide-delay="autoHideDelay"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ChatBubble from '../components/ChatBubble.vue';

// 从URL参数获取消息内容
const message = ref('');
const autoHide = ref(true);
const autoHideDelay = ref(3000);

const route = useRoute();

onMounted(() => {
  // 从Vue Router查询参数获取消息
  message.value = (route.query.message as string) || '你好！';
  
  const autoHideParam = route.query.autoHide as string;
  if (autoHideParam !== undefined) {
    autoHide.value = autoHideParam === 'true';
  }
  
  const delayParam = route.query.autoHideDelay as string;
  if (delayParam) {
    const delay = parseInt(delayParam, 10);
    if (!isNaN(delay)) {
      autoHideDelay.value = delay;
    }
  }

  console.log('气泡窗口接收到的消息:', message.value);
});
</script>

<style scoped>
/* 确保页面占满整个窗口 */
</style>
