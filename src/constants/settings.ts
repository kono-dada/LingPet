/**
 * @fileoverview 设置相关常量定义
 * @description 定义设置的默认值和限制范围，提供设置相关的常量配置
 * @constants
 *   - SETTINGS_CONSTRAINTS: 设置约束条件 (最小/最大值限制)
 *   - DEFAULT_SETTINGS: 默认设置值
 * @ranges
 *   - 宠物大小: 100-300px
 *   - 透明度: 0.1-1.0 (10%-100%)
 *   - 边框显示: true (默认显示)
 * @usage
 *   import { DEFAULT_SETTINGS, SETTINGS_CONSTRAINTS } from '@/constants/settings'
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// 设置默认值和限制常量
import type { PetSettings, SettingsConstraints } from '../types/settings';

export const SETTINGS_CONSTRAINTS: SettingsConstraints = {
  minSize: 100,
  maxSize: 300,
  minOpacity: 0.1,
  maxOpacity: 1.0,
};

export const DEFAULT_SETTINGS: PetSettings = {
  size: 150,
  opacity: 1.0,
  showBorder: true,
};
