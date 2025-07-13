/*!
 * @fileoverview AI配置相关命令模块
 * @description 处理AI功能相关的Tauri命令，包括API配置的获取和保存
 * @features
 *   - AI配置获取和保存
 *   - API密钥管理
 *   - 模型和参数配置
 *   - 配置持久化存储
 * @commands
 *   - get_ai_config: 获取AI配置
 *   - save_ai_config: 保存AI配置
 * @structures
 *   使用AIConfig结构体进行配置管理
 * @security
 *   API密钥等敏感信息通过配置文件安全存储
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

use crate::state::AppState;
use crate::config::AIConfig;

#[tauri::command]
pub async fn get_ai_config(state: tauri::State<'_, AppState>) -> Result<AIConfig, String> {
    let config_manager = state.config_manager.lock().await;
    let config = config_manager.get_ai().await.map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
pub async fn save_ai_config(config: AIConfig, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    config_manager.update_ai(config).await.map_err(|e| e.to_string())?;
    Ok(())
}
