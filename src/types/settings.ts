/**
 * @fileoverview 设置相关类型定义
 * @description 定义宠物设置、约束条件、预览状态等相关的TypeScript类型接口
 * @interfaces
 *   - PetSettings: 宠物基础设置 (大小、透明度、边框)
 *   - SettingsConstraints: 设置约束条件 (最小/最大值限制)
 *   - SettingsPreview: 预览状态设置 (实时显示但不保存)
 * @usage
 *   import type { PetSettings, SettingsConstraints } from '@/types/settings'
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// 设置相关类型定义
export interface PetSettings {
  size: number;
  opacity: number;
  showBorder: boolean;
}

export interface SettingsConstraints {
  minSize: number;
  maxSize: number;
  minOpacity: number;
  maxOpacity: number;
}

export interface SettingsPreview extends PetSettings {
  // 预览状态，用于实时显示但不保存到后端
}
