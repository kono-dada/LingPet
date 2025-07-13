/*!
 * @fileoverview 窗口管理相关命令模块
 * @description 处理窗口相关的Tauri命令，包括位置保存、大小管理、应用退出等
 * @features
 *   - 主窗口位置持久化
 *   - 设置窗口边界保存
 *   - 窗口配置获取
 *   - 应用退出功能
 * @commands
 *   - save_main_window_position: 保存主窗口位置
 *   - save_settings_window_bounds: 保存设置窗口边界
 *   - get_window_config: 获取窗口配置
 *   - quit_app: 退出应用
 * @persistence
 *   窗口位置和大小信息持久化存储，下次启动时恢复
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

use crate::state::AppState;
use crate::config::WindowConfig;

#[tauri::command]
pub async fn save_main_window_position(x: f64, y: f64, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    config_manager.save_main_window_position(x, y).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_settings_window_bounds(x: f64, y: f64, width: f64, height: f64, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    config_manager.save_settings_window_bounds(x, y, width, height).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_window_config(state: tauri::State<'_, AppState>) -> Result<WindowConfig, String> {
    let config_manager = state.config_manager.lock().await;
    let window_config = config_manager.get_window().await.map_err(|e| e.to_string())?;
    Ok(window_config)
}

#[tauri::command]
pub fn quit_app(app: tauri::AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}
