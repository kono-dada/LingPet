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
