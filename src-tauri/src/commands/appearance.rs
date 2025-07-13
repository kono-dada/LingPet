/*!
 * @fileoverview 外观设置相关命令模块
 * @description 处理宠物外观相关的Tauri命令，包括大小、透明度、边框显示等设置
 * @features
 *   - 宠物大小获取和保存
 *   - 透明度获取和保存
 *   - 边框显示开关
 *   - 配置持久化存储
 *   - 实时事件通知
 * @commands
 *   - get_pet_size: 获取宠物大小
 *   - set_pet_size: 设置宠物大小
 *   - save_pet_size: 保存宠物大小
 *   - get_pet_opacity: 获取透明度
 *   - set_pet_opacity: 设置透明度
 *   - save_pet_opacity: 保存透明度
 *   - get_show_border: 获取边框显示状态
 *   - save_show_border: 保存边框显示状态
 * @events
 *   发射事件通知前端更新UI状态
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

use tauri::{Emitter, Manager};
use crate::state::AppState;

#[tauri::command]
pub async fn get_show_border(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let config_manager = state.config_manager.lock().await;
    let appearance = config_manager.get_appearance().await.map_err(|e| e.to_string())?;
    Ok(appearance.show_border)
}

#[tauri::command]
pub async fn save_show_border(show_border: bool, state: tauri::State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    let mut appearance = config_manager.get_appearance().await.map_err(|e| e.to_string())?;
    
    // 如果边框设置没有变化，直接返回
    if appearance.show_border == show_border {
        return Ok(());
    }
    
    // 更新配置
    appearance.show_border = show_border;
    config_manager.update_appearance(appearance).await.map_err(|e| e.to_string())?;
    
    // 通知主窗口更新边框显示
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.emit("pet-border-changed", show_border).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn get_pet_opacity(state: tauri::State<'_, AppState>) -> Result<f64, String> {
    let config_manager = state.config_manager.lock().await;
    let appearance = config_manager.get_appearance().await.map_err(|e| e.to_string())?;
    Ok(appearance.pet_opacity)
}

#[tauri::command]
pub async fn save_pet_opacity(opacity: f64, state: tauri::State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    let mut appearance = config_manager.get_appearance().await.map_err(|e| e.to_string())?;
    
    // 如果透明度没有变化，直接返回
    if (appearance.pet_opacity - opacity).abs() < 0.01 {
        return Ok(());
    }
    
    // 更新配置
    appearance.pet_opacity = opacity;
    config_manager.update_appearance(appearance).await.map_err(|e| e.to_string())?;
    
    // 通知主窗口更新透明度
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.emit("pet-opacity-changed", opacity).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn set_pet_opacity(opacity: f64, state: tauri::State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    save_pet_opacity(opacity, state, app).await
}

#[tauri::command]
pub async fn get_pet_size(state: tauri::State<'_, AppState>) -> Result<i32, String> {
    let config_manager = state.config_manager.lock().await;
    let appearance = config_manager.get_appearance().await.map_err(|e| e.to_string())?;
    Ok(appearance.pet_size)
}

#[tauri::command]
pub async fn save_pet_size(size: i32, state: tauri::State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    let mut appearance = config_manager.get_appearance().await.map_err(|e| e.to_string())?;
    
    // 如果大小没有变化，直接返回
    if appearance.pet_size == size {
        return Ok(());
    }
    
    // 更新配置
    appearance.pet_size = size;
    config_manager.update_appearance(appearance).await.map_err(|e| e.to_string())?;
    
    // 发射事件通知大小已保存，让前端处理窗口大小调整
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.emit("pet-size-saved", size).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn set_pet_size(size: i32, state: tauri::State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    let mut appearance = config_manager.get_appearance().await.map_err(|e| e.to_string())?;
    
    // 如果大小没有变化，直接返回
    if appearance.pet_size == size {
        return Ok(());
    }
    
    // 更新配置
    appearance.pet_size = size;
    config_manager.update_appearance(appearance).await.map_err(|e| e.to_string())?;
    
    // 通知主窗口更新宠物大小 - 只发射事件，让前端处理窗口大小调整
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.emit("pet-size-changed", size).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}
