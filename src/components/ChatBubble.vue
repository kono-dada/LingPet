<!--
  @fileoverview 聊天气泡组件
  @description 显示对话消息的气泡样式组件，支持打字机效果、自动隐藏等功能
  @features
    - 打字机效果动画
    - 自动隐藏功能
    - 可配置显示时长
    - 可调节打字速度
    - 响应式气泡设计
    - 窗口自动管理
  @props
    - message: string - 要显示的消息内容
    - autoHide: boolean - 是否自动隐藏 (默认: true)
    - autoHideDelay: number - 自动隐藏延迟 (默认: 3000ms)
    - typeSpeed: number - 打字速度 (默认: 50ms)
  @animation
    - 逐字符显示的打字机效果
    - 光标闪烁动画
  @dependencies
    - @tauri-apps/api/webviewWindow: 窗口管理
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <div class="chat-bubble-window">
    <div class="bubble-container">
      <div class="bubble-content">
        <div class="bubble-text" :style="{ textAlign }">
          {{ displayedMessage }}<span v-if="isTyping" class="typing-cursor">|</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

interface Props {
  message: string;
  autoHide?: boolean;
  autoHideDelay?: number;
  typeSpeed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoHide: true,
  autoHideDelay: 3000,
  typeSpeed: 50
});

const displayedMessage = ref('');
const isTyping = ref(false);
const textAlign = ref<'center' | 'left'>('center');

// 打字机效果
const typeMessage = async (message: string) => {
  if (!message) return;
  
  // 根据文字长度决定对齐方式
  textAlign.value = message.length > 30 ? 'left' : 'center';
  
  isTyping.value = true;
  displayedMessage.value = '';
  
  for (let i = 0; i <= message.length; i++) {
    displayedMessage.value = message.slice(0, i);
    await new Promise(resolve => setTimeout(resolve, props.typeSpeed));
  }
  
  isTyping.value = false;
};

// 监听消息变化
watch(() => props.message, (newMessage) => {
  typeMessage(newMessage);
}, { immediate: true });

onMounted(async () => {
  const window = getCurrentWebviewWindow();
  
  // 等待打字完成后再设置自动隐藏
  watch(isTyping, (typing) => {
    if (!typing && props.autoHide && props.message) {
      setTimeout(async () => {
        try {
          await window.close();
        } catch (error) {
          console.error('关闭气泡窗口失败:', error);
        }
      }, props.autoHideDelay);
    }
  });
  
  console.log(`气泡窗口已挂载，消息: "${props.message}"`);
});
</script>

<style scoped>
.chat-bubble-window {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end; /* 固定在底部 */
  justify-content: center;
  background: transparent;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  padding-bottom: 5px; /* 为尾巴留出空间 */
}

.bubble-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bubbleAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 999999; /* 确保在最上层 */
  width: 100%;
}

.bubble-content {
  /* 毛玻璃背景效果 */
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* 边框和阴影 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;

  
  position: relative;
  z-index: 1000000;
  width: 260px; /* 固定宽度 */
  min-width: 260px;
  
  /* 高级毛玻璃效果 */
  background-image: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.99) 0%,
      rgba(255, 255, 255, 0.96) 50%,
      rgba(255, 255, 255, 0.94) 100%
    );
}

.bubble-text {
  /* 文本样式 */
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  padding: 14px 18px;
  word-wrap: break-word;
  word-break: break-word; /* 确保长单词能被正确换行 */
  white-space: pre-wrap; /* 保留换行符和空格 */
  
  /* 滚动支持 */
  max-height: 200px; /* 增加最大高度 */
  overflow-y: auto;
  
  /* 高清文本渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga", "kern";
  
  /* 文本阴影增强可读性 */
  text-shadow: 0 0.5px 1px rgba(255, 255, 255, 0.8);
}

/* 打字机光标 */
.typing-cursor {
  animation: blink 1s infinite;
  color: #1a1a1a;
  font-weight: 400;
}

/* 自定义滚动条样式 */
.bubble-text::-webkit-scrollbar {
  width: 4px;
}

.bubble-text::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.bubble-text::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}

.bubble-text::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* 光标闪烁动画 */
@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 气泡出现动画 */
@keyframes bubbleAppear {
  0% {
    opacity: 0;
    transform: scale(0.2) translateY(30px);
    filter: blur(2px);
  }
  30% {
    opacity: 0.6;
    transform: scale(0.8) translateY(10px);
    filter: blur(1px);
  }
  60% {
    opacity: 0.9;
    transform: scale(1.1) translateY(-5px);
    filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }
}

/* 气泡消失动画 */
@keyframes bubbleDisappear {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }
  100% {
    opacity: 0;
    transform: scale(0.7) translateY(-15px);
    filter: blur(1px);
  }
}

.bubble-container.disappearing {
  animation: bubbleDisappear 0.25s ease-in-out;
}

/* 响应式文本大小 */
@media (max-width: 200px) {
  .bubble-content {
    font-size: 13px;
    padding: 12px 16px;
  }
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2) {
  .bubble-content {
    font-weight: 400;
    letter-spacing: 0.1px;
  }
}
</style>
