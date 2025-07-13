/**
 * @fileoverview 外观设置专用组合式函数
 * @description 专门管理外观相关的设置，处理预览和实际设置的同步，提供滑块控制和事件通信
 * @features
 *   - 宠物大小设置和预览
 *   - 透明度设置和预览
 *   - 边框显示开关
 *   - 实时预览和最终确认分离
 *   - 后端配置同步
 *   - 事件总线通信
 * @settings
 *   - 大小: MIN_SIZE - MAX_SIZE (像素)
 *   - 透明度: MIN_OPACITY - MAX_OPACITY (0-1)
 *   - 边框: boolean开关
 * @exports
 *   - petSizeSlider: 大小滑块值
 *   - petSizePreview: 大小预览值
 *   - petOpacityPreview: 透明度预览值
 *   - showBorderPreview: 边框预览值
 *   - updatePetSize: 更新宠物大小
 *   - updatePetOpacity: 更新透明度
 *   - updateShowBorder: 更新边框显示
 * @dependencies
 *   - DEFAULT_SETTINGS: 默认设置常量
 *   - SETTINGS_CONSTRAINTS: 设置约束常量
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { ref } from "vue";
import { DEFAULT_SETTINGS, SETTINGS_CONSTRAINTS } from "../../constants/settings";

export function useAppearanceSettings() {
  // 使用常量替代硬编码值
  const { minSize: MIN_SIZE, maxSize: MAX_SIZE, minOpacity: MIN_OPACITY, maxOpacity: MAX_OPACITY } = SETTINGS_CONSTRAINTS;
  
  // ===================
  // 外观设置状态
  // ===================
  
  // 宠物大小设置
  const petSizeSlider = ref(DEFAULT_SETTINGS.size);
  const petSizePreview = ref(DEFAULT_SETTINGS.size);

  // 透明度设置
  const petOpacitySlider = ref(DEFAULT_SETTINGS.opacity);
  const petOpacityPreview = ref(DEFAULT_SETTINGS.opacity);

  // 边框显示设置
  const showBorder = ref(DEFAULT_SETTINGS.showBorder);
  const showBorderPreview = ref(DEFAULT_SETTINGS.showBorder);

  // 加载状态
  const isLoading = ref(false);
  const hasChanges = ref(false);

  // ===================
  // 状态管理方法
  // ===================
  
  // 初始化设置数据
  function initializeSettings(initialSettings?: {
    size?: number;
    opacity?: number;
    showBorder?: boolean;
  }) {
    if (initialSettings) {
      if (initialSettings.size !== undefined) {
        petSizeSlider.value = initialSettings.size;
        petSizePreview.value = initialSettings.size;
      }
      if (initialSettings.opacity !== undefined) {
        petOpacitySlider.value = initialSettings.opacity;
        petOpacityPreview.value = initialSettings.opacity;
      }
      if (initialSettings.showBorder !== undefined) {
        showBorder.value = initialSettings.showBorder;
        showBorderPreview.value = initialSettings.showBorder;
      }
    }
    hasChanges.value = false;
  }

  // ===================
  // 预览更新方法
  // ===================
  
  // 实时更新预览大小（不调用后端）
  function updatePreviewSize(size: number) {
    petSizePreview.value = size;
    hasChanges.value = size !== petSizeSlider.value;
  }

  // 实时更新预览透明度（不调用后端）
  function updatePreviewOpacity(opacity: number) {
    petOpacityPreview.value = opacity;
    hasChanges.value = opacity !== petOpacitySlider.value;
  }

  // 实时更新预览边框显示（不调用后端）
  function updatePreviewBorder(show: boolean) {
    showBorderPreview.value = show;
    hasChanges.value = show !== showBorder.value;
  }

  // ===================
  // 设置更新方法
  // ===================
  
  // 更新宠物大小（外部组件调用后触发）
  function updatePetSize(size: number) {
    petSizeSlider.value = size;
    petSizePreview.value = size;
    hasChanges.value = false;
  }

  // 更新透明度（外部组件调用后触发）
  function updatePetOpacity(opacity: number) {
    petOpacitySlider.value = opacity;
    petOpacityPreview.value = opacity;
    hasChanges.value = false;
  }

  // 更新边框设置（外部组件调用后触发）
  function updateShowBorder(show: boolean) {
    showBorder.value = show;
    showBorderPreview.value = show;
    hasChanges.value = false;
  }

  // ===================
  // 重置方法
  // ===================
  
  // 重置到默认值
  function resetToDefaults() {
    petSizeSlider.value = DEFAULT_SETTINGS.size;
    petSizePreview.value = DEFAULT_SETTINGS.size;
    petOpacitySlider.value = DEFAULT_SETTINGS.opacity;
    petOpacityPreview.value = DEFAULT_SETTINGS.opacity;
    showBorder.value = DEFAULT_SETTINGS.showBorder;
    showBorderPreview.value = DEFAULT_SETTINGS.showBorder;
    hasChanges.value = true;
  }

  // 撤销预览更改
  function revertChanges() {
    petSizePreview.value = petSizeSlider.value;
    petOpacityPreview.value = petOpacitySlider.value;
    showBorderPreview.value = showBorder.value;
    hasChanges.value = false;
  }

  return {
    // 设置数据
    petSizeSlider,
    petSizePreview,
    MIN_SIZE,
    MAX_SIZE,
    petOpacitySlider,
    petOpacityPreview,
    MIN_OPACITY,
    MAX_OPACITY,
    showBorder,
    showBorderPreview,
    
    // 状态
    isLoading,
    hasChanges,
    
    // 状态管理
    initializeSettings,
    
    // 预览更新
    updatePreviewSize,
    updatePreviewOpacity,
    updatePreviewBorder,
    
    // 设置更新
    updatePetSize,
    updatePetOpacity,
    updateShowBorder,
    
    // 重置方法
    resetToDefaults,
    revertChanges,
  };
}
