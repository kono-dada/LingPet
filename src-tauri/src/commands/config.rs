use tauri::{Emitter, Manager};
use crate::state::AppState;

#[tauri::command]
pub async fn get_app_config(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let config_manager = state.config_manager.lock().await;
    config_manager.get_app_config().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_app_config(state: tauri::State<'_, AppState>, config: String) -> Result<(), String> {
    let config_manager = state.config_manager.lock().await;
    config_manager.update_app_config(config).await.map_err(|e| e.to_string())
}