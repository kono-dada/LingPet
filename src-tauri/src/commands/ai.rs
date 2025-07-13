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
