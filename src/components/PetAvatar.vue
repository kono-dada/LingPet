<!--
  @fileoverview 宠物头像组件
  @description 桌面宠物的核心组件，显示宠物表情、处理交互、集成AI聊天功能
  @features
    - 宠物表情显示和切换
    - 点击抖动动画效果
    - 设置按钮集成
    - AI聊天输入框
    - 表情随机切换
    - 图片预加载优化
    - 防拖拽和选中
  @props
    - petSize: number - 宠物大小
    - showBorder: boolean - 是否显示边框
  @emits
    - open-settings: 打开设置窗口事件
  @dependencies
    - usePet: 宠物行为管理
    - useAI: AI功能管理
    - eventBusService: 事件总线服务
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <div class="pet-content" @click.stop="handlePetClick">
    <div class="avatar-container" :class="{ 'shaking': isShaking }">
      <img 
        :src="`/avatar/${currentEmotion + '.png'}`" 
        :alt="currentEmotion"
        class="pet-avatar"
        :class="{ 'no-border': !showBorder }"
        :style="{ 
          width: `${petSize}px`, 
          height: `${petSize}px` 
        }"
        draggable="false"
      />
      <button 
        class="settings-button"
        :class="{ 'no-border': !showBorder }"
        @click.stop="openSettings"
        title="打开设置"
      >
        ⚙️
      </button>
    </div>
    <div class="input-container">
      <input 
        type="text" 
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        @keydown.enter="preventSendWhenThinking"
        :readonly="isSending"
        :placeholder="placeholder"
        class="chat-input"
        :class="{ 'thinking': isSending }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, withDefaults, ref, onMounted, computed } from "vue";
import { usePet } from "../composables/chat/usePet";
import { useAI } from "../composables/chat/useAI";
import { useConversation } from "../composables/chat/useConversation";
import { eventBusService } from "../services/eventBus";
import { createNotificationWindow } from "../services/windowFactory";

interface Props {
  petSize: number;
  showBorder?: boolean;
}

interface Emits {
  (e: 'open-settings'): void;
}

const emit = defineEmits<Emits>();

// 设置默认值
const props = withDefaults(defineProps<Props>(), {
  showBorder: true
});

// 解构 props
const { showBorder } = toRefs(props);

// 抖动状态
const isShaking = ref(false);

// 输入框状态
const inputMessage = ref('');
const isSending = ref(false);

// 动态提示文字
const thinkingMessages = ['正在思考中', '正在思考中.', '正在思考中..', '正在思考中...'];
const thinkingIndex = ref(0);
const placeholder = computed(() => {
  return isSending.value ? thinkingMessages[thinkingIndex.value] : '和我聊天吧...';
});

// 使用组合式函数
const { currentEmotion } = usePet();
const { chatWithPet, loadAIConfig } = useAI();
const { isInConversation, startConversation, playNext } = useConversation();
const eventBus = eventBusService();

// 抖动效果函数
function triggerShakeEffect() {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 600);
}

// 初始化AI配置
onMounted(async () => {
  await loadAIConfig();
  
  // 监听AI配置保存事件，自动重新加载配置
  await eventBus.onAIConfigSaved(async () => {
    console.log('检测到AI配置变更，重新加载配置...');
    await loadAIConfig();
  });
});

// 处理宠物点击 - 用于对话控制
function handlePetClick() {
  console.log('宠物被点击，当前对话状态:', isInConversation.value);
  if (isInConversation.value) {
    playNext(
      (emotion) => currentEmotion.value = emotion,
      triggerShakeEffect
    );
  }
}

// 打开设置
function openSettings() {
  emit('open-settings');
}

// 发送消息
async function sendMessage() {
  if (inputMessage.value.trim() && !isSending.value) {
    const userMessage = inputMessage.value.trim();
    
    // 立即清空输入框，这样 placeholder 就能显示
    inputMessage.value = '';
    
    // 设置发送状态
    isSending.value = true;
    
    // 启动思考动画
    const thinkingTimer = setInterval(() => {
      thinkingIndex.value = (thinkingIndex.value + 1) % thinkingMessages.length;
    }, 500);
    
    try {
      // 添加一个短暂延迟以确保UI更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 调用AI生成回答
      const aiResponse = await chatWithPet(userMessage);
      
      if (aiResponse.success && aiResponse.data && aiResponse.data.length > 0) {
        // 播放多句话对话
        await playConversation(aiResponse.data);
      } else {
        // 显示错误信息
        console.error('AI回复格式错误或为空:', aiResponse);
        await createNotificationWindow('AI回复格式错误或为空');
      }
      
    } catch (error) {
      console.error('AI对话或显示气泡窗口失败:', error);
      
      // 显示错误提示
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      await createNotificationWindow(`操作失败: ${errorMessage}`);
    } finally {
      // 停止思考动画
      clearInterval(thinkingTimer);
      thinkingIndex.value = 0;
      
      // 无论成功还是失败，都要重置发送状态
      isSending.value = false;
    }
  }
}

// 播放对话序列
async function playConversation(messages: Array<{message: string, emotion: string, japanese: string}>) {
  await startConversation(
    messages,
    (emotion) => currentEmotion.value = emotion,
    triggerShakeEffect
  );
}

// 防止在思考状态时重复发送
function preventSendWhenThinking(event: KeyboardEvent) {
  if (isSending.value) {
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>

<style scoped>
.pet-content {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
}

.pet-content:hover {
  transform: scale(1.05);
}

.pet-content:active {
  transform: scale(0.95);
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.settings-button {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.settings-button:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
}

.settings-button.no-border {
  /* 隐藏轮廓时，设置按钮也移除边框和阴影 */
  box-shadow: none;
  border: none;
  background: rgba(255, 255, 255, 0.7);
}

.settings-button.no-border:hover {
  box-shadow: none;
  border: none;
  background: rgba(255, 255, 255, 0.9);
}

.avatar-container:hover .settings-button {
  opacity: 1;
}

.pet-avatar {
  object-fit: contain;
  border-radius: 50%;
  /* 默认显示轮廓：阴影 + 边框 */
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.15);
  border: none;
  transition: all 0.3s ease;
  background: transparent;
  /* 防止图片被选中和拖拽 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  /* 防止图片加载时的闪烁 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.pet-avatar:hover {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 1);
}

.pet-avatar.no-border {
  /* 隐藏轮廓：移除阴影和边框 */
  box-shadow: none;
  border: none;
}

.input-container {
  margin-top: 8px;
  width: 160px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.pet-content:hover .input-container {
  opacity: 1;
  pointer-events: auto;
}

.chat-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  font-size: 12px;
  color: #333;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  /* 防止文本选中 */
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

.chat-input::placeholder {
  color: rgba(100, 100, 100, 0.8);
  font-size: 11px;
}

.chat-input:focus {
  border-color: rgba(100, 150, 255, 0.8);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 8px rgba(100, 150, 255, 0.2);
  transform: scale(1.02);
}

.chat-input:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.95);
}

/* 思考状态样式 */
.chat-input.thinking,
.chat-input[readonly] {
  background: rgba(255, 248, 230, 0.95);
  border-color: rgba(255, 165, 0, 0.8);
  color: rgba(100, 100, 100, 0.8);
  cursor: not-allowed;
  animation: thinking-breathing 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.3);
}

.chat-input.thinking::placeholder,
.chat-input[readonly]::placeholder {
  color: rgba(255, 140, 0, 0.9);
  font-style: italic;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(255, 165, 0, 0.5);
  animation: text-breathing 2s ease-in-out infinite;
}

/* 呼吸动画效果 */
@keyframes thinking-breathing {
  0%, 100% {
    opacity: 0.85;
    transform: scale(1);
    border-color: rgba(255, 165, 0, 0.6);
    box-shadow: 0 0 8px rgba(255, 165, 0, 0.2);
  }
  50% {
    opacity: 1;
    transform: scale(1.015);
    border-color: rgba(255, 165, 0, 1);
    box-shadow: 0 0 15px rgba(255, 165, 0, 0.5);
  }
}

/* 文本呼吸动画 */
@keyframes text-breathing {
  0%, 100% {
    opacity: 0.8;
    text-shadow: 0 0 3px rgba(255, 165, 0, 0.3);
  }
  50% {
    opacity: 1;
    text-shadow: 0 0 8px rgba(255, 165, 0, 0.7);
  }
}

/* 一惊一乍的伸缩动画 */
@keyframes startled {
  0% { transform: scaleY(1) scaleX(1); }
  20% { transform: scaleY(0.9) scaleX(1.05); }
  40% { transform: scaleY(1.1) scaleX(0.95); }
  60% { transform: scaleY(0.95) scaleX(1.02); }
  80% { transform: scaleY(1.05) scaleX(0.98); }
  100% { transform: scaleY(1) scaleX(1); }
}

.avatar-container.shaking {
  animation: startled 0.6s ease-out;
  transform-origin: center bottom;
}
</style>
