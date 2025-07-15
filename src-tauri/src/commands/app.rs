#[tauri::command]
pub async fn quit_app() {
    std::process::exit(0);
}