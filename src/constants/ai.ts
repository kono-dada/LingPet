/**
 * @fileoverview AI相关常量定义
 * @description 定义AI功能相关的常量配置，包括API URL、温度预设、Token限制等
 * @constants
 *   - COMMON_BASE_URLS: 常用AI服务API基础URL
 *   - TEMPERATURE_PRESETS: 温度值预设 (创意、平衡、专注、确定性)
 *   - MAX_TOKENS: Token数量限制预设 (短、中、长、超长)
 *   - TIMEOUT: API请求超时时间
 * @providers
 *   - OpenAI, Anthropic, DeepSeek, 阿里云等主流AI服务
 * @usage
 *   import { AI_CONSTANTS } from '@/constants/ai'
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// AI 相关常量
export const AI_CONSTANTS = {
  
  // 常用的API基础URL
  COMMON_BASE_URLS: [
    'https://api.openai.com/v1',
    'https://api.anthropic.com/v1',
    'https://api.deepseek.com/v1',
    'https://dashscope.aliyuncs.com/compatible-mode/v1',
  ],
  
  // 温度值预设
  TEMPERATURE_PRESETS: {
    CREATIVE: 0.9,
    BALANCED: 0.7,
    FOCUSED: 0.3,
    DETERMINISTIC: 0.1,
  },
  
  // 最大Token限制
  MAX_TOKENS: {
    SHORT: 100,
    MEDIUM: 300,
    LONG: 800,
    VERY_LONG: 2000,
  },
  
  // 响应超时时间（毫秒）
  TIMEOUT: 30000,
} as const;
