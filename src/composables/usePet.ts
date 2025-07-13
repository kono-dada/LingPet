/**
 * @fileoverview 宠物行为管理组合式函数
 * @description 管理桌面宠物的表情、状态和行为，提供表情切换、互动响应等核心功能
 * @features
 *   - 表情状态管理和随机切换
 *   - 宠物行为状态跟踪
 *   - 用户交互响应处理
 *   - 表情图片预加载优化
 *   - 心情和活跃度管理
 * @exports
 *   - currentEmotion: 当前表情状态
 *   - emotions: 所有可用表情列表
 *   - switchEmotion: 切换表情函数
 *   - setEmotion: 设置指定表情
 *   - getRandomEmotion: 获取随机表情
 *   - petState: 宠物状态
 *   - triggerInteraction: 触发交互
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { ref } from "vue";
import type { EmotionName } from "../types/emotion";
import { EMOTIONS, DEFAULT_EMOTION } from "../constants/emotions";

export function usePet() {
  // ===================
  // 表情管理
  // ===================
  
  // 当前表情
  const currentEmotion = ref<EmotionName>(DEFAULT_EMOTION);

  // 获取随机表情
  function getRandomEmotion(): EmotionName {
    const randomIndex = Math.floor(Math.random() * EMOTIONS.length);
    return EMOTIONS[randomIndex];
  }

  // 点击切换表情
  function switchEmotion(event: MouseEvent) {
    event.stopPropagation();
    
    let newEmotion: EmotionName;
    do {
      newEmotion = getRandomEmotion();
    } while (newEmotion === currentEmotion.value && EMOTIONS.length > 1);
    
    currentEmotion.value = newEmotion;
  }

  // 设置指定表情
  function setEmotion(emotion: EmotionName) {
    if (EMOTIONS.includes(emotion)) {
      currentEmotion.value = emotion;
    }
  }

  // 防止表情图片加载期间的闪烁
  function preloadImages() {
    EMOTIONS.forEach((emotion: EmotionName) => {
      const img = new Image();
      img.src = `/avatar/${emotion}.png`;
    });
  }

  // ===================
  // 宠物行为管理
  // ===================
  
  // 宠物状态
  const petState = ref({
    isActive: true,
    lastInteraction: Date.now(),
    mood: 'normal' as 'happy' | 'normal' | 'sad' | 'excited'
  });

  // 更新宠物状态
  function updatePetState(state: Partial<typeof petState.value>) {
    Object.assign(petState.value, state);
  }

  // 触发宠物互动
  function triggerInteraction(type: 'click' | 'hover' | 'touch' = 'click') {
    petState.value.lastInteraction = Date.now();
    
    // 根据互动类型更新情绪
    switch (type) {
      case 'click':
        updatePetState({ mood: 'happy' });
        switchEmotion(new MouseEvent('click'));
        break;
      case 'hover':
        updatePetState({ mood: 'excited' });
        break;
      case 'touch':
        updatePetState({ mood: 'happy' });
        break;
    }
    
    // 一段时间后恢复正常状态
    setTimeout(() => {
      updatePetState({ mood: 'normal' });
    }, 3000);
  }

  // ===================
  // 初始化
  // ===================
  
  // 预加载所有表情图片
  preloadImages();

  return {
    // 表情相关
    currentEmotion,
    emotions: EMOTIONS,
    switchEmotion,
    setEmotion,
    getRandomEmotion,
    
    // 宠物状态
    petState,
    updatePetState,
    triggerInteraction
  };
}
