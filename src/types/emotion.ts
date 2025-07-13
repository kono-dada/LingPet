/**
 * @fileoverview 表情相关类型定义
 * @description 定义桌面宠物表情名称和状态的TypeScript类型，提供表情管理的类型安全
 * @types
 *   - EmotionName: 表情文件名联合类型 (19种表情)
 *   - EmotionState: 表情状态接口 (当前表情、抖动状态)
 * @emotions
 *   正常、高兴、伤心、生气、害怕、惊讶、厌恶、害羞、兴奋、担心、
 *   调皮、慌张、紧张、认真、无奈、心动、羞耻、自信、疑惑
 * @usage
 *   import type { EmotionName, EmotionState } from '@/types/emotion'
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// 表情相关类型定义
export type EmotionName = 
  | "正常.png" | "高兴.png" | "伤心.png" | "生气.png" | "害怕.png"
  | "惊讶.png" | "厌恶.png" | "害羞.png" | "兴奋.png" | "担心.png"
  | "调皮.png" | "慌张.png" | "紧张.png" | "认真.png" | "无奈.png"
  | "心动.png" | "羞耻.png" | "自信.png" | "疑惑.png";

export interface EmotionState {
  currentEmotion: EmotionName;
  isShaking: boolean;
}
