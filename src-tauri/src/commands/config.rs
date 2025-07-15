use tauri::State;
use crate::config::{AppConfig};
use crate::AppState;
use crate::config::AppearanceConfig;
use crate::config::AIConfig;
use crate::config::WindowConfig;

#[tauri::command]
pub async fn load_config(state: State<'_, AppState>) -> Result<AppConfig, String> {
    let manager = state.config_manager.lock().await;
    manager.load().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_config(
    state: State<'_, AppState>,
    config: AppConfig,
) -> Result<(), String> {
    let manager = state.config_manager.lock().await;
    manager.save(&config).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_appearance_config(state: State<'_, AppState>) -> Result<AppearanceConfig, String> {
    let manager = state.config_manager.lock().await;
    manager.get_appearance().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_ai_config(state: State<'_, AppState>) -> Result<AIConfig, String> {
    let manager = state.config_manager.lock().await;
    manager.get_ai().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_window_config(state: State<'_, AppState>) -> Result<WindowConfig, String> {
    let manager = state.config_manager.lock().await;
    manager.get_window().await.map_err(|e| e.to_string())
}