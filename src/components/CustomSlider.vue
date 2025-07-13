<!--
  @fileoverview 自定义滑块组件
  @description 可定制的滑块输入组件，支持自定义样式、精度、单位显示等功能
  @features
    - 可自定义颜色 (滑块、填充)
    - 支持精度控制和单位显示
    - 鼠标和触摸事件支持
    - 响应式设计
    - 范围标签显示
    - 实时值更新和格式化
  @props
    - modelValue: number - 当前值
    - min: number - 最小值
    - max: number - 最大值  
    - step: number - 步长
    - precision: number - 小数精度
    - unit: string - 单位显示
    - thumbColor: string - 滑块颜色
    - fillColor: string - 填充颜色
  @emits
    - update:modelValue: 值更新事件
    - input: 输入事件 (拖拽中)
    - change: 变化事件 (拖拽结束)
  @author dada
  @version 1.0.0
  @since 2025-07-13
-->

<template>
  <div class="slider-wrapper">
    <span class="range-label">{{ formattedMin }}</span>
    <div 
      class="custom-slider"
      ref="sliderRef"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <div class="slider-track">
        <div 
          class="slider-fill"
          :style="{ 
            width: thumbPosition + '%',
            background: fillColor 
          }"
        ></div>
      </div>
      <div 
        class="slider-thumb"
        :style="{ 
          left: thumbPosition + '%',
          borderColor: thumbColor 
        }"
      ></div>
    </div>
    <span class="range-label">{{ formattedMax }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

// Props 定义
interface Props {
  modelValue: number;
  min: number;
  max: number;
  step?: number;
  unit?: string; // 单位，如 'px', '%' 等
  precision?: number; // 小数位数
  thumbColor?: string;
  fillColor?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  unit: '',
  precision: 0,
  thumbColor: '#007AFF',
  fillColor: 'linear-gradient(90deg, #007AFF, #34C759)',
  disabled: false
});

// Emits 定义
const emit = defineEmits<{
  'update:modelValue': [value: number];
  'change': [value: number];
  'input': [value: number];
}>();

// 响应式引用
const sliderRef = ref<HTMLElement>();
const isDragging = ref(false);

// 计算属性
const thumbPosition = computed(() => {
  const range = props.max - props.min;
  const value = props.modelValue - props.min;
  return Math.max(0, Math.min(100, (value / range) * 100));
});

const formattedMin = computed(() => {
  const value = props.precision > 0 ? props.min.toFixed(props.precision) : Math.round(props.min);
  return props.unit === '%' ? `${Math.round(props.min * 100)}%` : `${value}${props.unit}`;
});

const formattedMax = computed(() => {
  const value = props.precision > 0 ? props.max.toFixed(props.precision) : Math.round(props.max);
  return props.unit === '%' ? `${Math.round(props.max * 100)}%` : `${value}${props.unit}`;
});

// 拖拽功能
function startDrag(event: MouseEvent | TouchEvent) {
  if (props.disabled) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  isDragging.value = true;
  
  // 添加全局事件监听
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', handleDrag);
  document.addEventListener('touchend', stopDrag);
  
  // 立即处理当前位置
  handleDrag(event);
}

function handleDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value || !sliderRef.value || props.disabled) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const rect = sliderRef.value.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  
  // 计算相对位置
  const x = clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
  
  // 转换为实际值
  const range = props.max - props.min;
  let newValue = props.min + (percentage / 100) * range;
  
  // 处理步长
  if (props.step > 0) {
    newValue = Math.round(newValue / props.step) * props.step;
  }
  
  // 确保值在范围内
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  
  // 处理精度
  if (props.precision > 0) {
    newValue = Number(newValue.toFixed(props.precision));
  }
  
  // 发射事件
  emit('update:modelValue', newValue);
  emit('input', newValue);
}

function stopDrag() {
  if (!isDragging.value) return;
  isDragging.value = false;
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', stopDrag);
  
  // 发射 change 事件
  emit('change', props.modelValue);
}

// 清理事件监听
onUnmounted(() => {
  stopDrag();
});
</script>

<style scoped>
.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-label {
  font-size: 11px;
  color: #666;
  min-width: 32px;
  text-align: center;
  font-weight: 500;
}

.custom-slider {
  flex: 1;
  height: 20px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
}

.custom-slider.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.slider-track {
  width: 100%;
  height: 6px;
  background: #e8e8e8;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #34C759);
  border-radius: 3px;
  transition: width 0.1s ease;
  box-shadow: 0 1px 2px rgba(0, 122, 255, 0.3);
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  background: white;
  border: 2px solid #007AFF;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
}

.slider-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
}

.slider-thumb:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.custom-slider.disabled .slider-thumb {
  cursor: not-allowed;
}

.custom-slider.disabled .slider-thumb:hover,
.custom-slider.disabled .slider-thumb:active {
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
