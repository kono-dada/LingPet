/*!
 * @fileoverview Tauri应用程序核心库
 * @description 桌面宠物应用的核心逻辑，包含应用初始化、状态管理、命令注册等
 * @features
 *   - 应用程序构建和配置
 *   - 状态管理和配置持久化
 *   - 平台特定设置 (macOS)
 *   - 窗口位置和大小管理
 *   - 命令处理器注册
 *   - 插件集成
 * @modules
 *   - macos: macOS平台特定功能
 *   - config: 配置管理
 *   - commands: Tauri命令处理
 *   - state: 应用状态管理
 * @dependencies
 *   - tauri: Tauri框架核心
 *   - tokio: 异步运行时
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::Arc;
use tauri::Manager;

// 模块导入
mod commands;
mod config;
mod macos;
mod state;
mod windows;

use commands::*;
use config::ConfigManager;
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 创建配置管理器
            let config_manager = ConfigManager::new("desktop_pet")
                .map_err(|e| format!("初始化配置管理器失败: {}", e))?;

            // 设置应用状态
            let app_state = AppState {
                config_manager: Arc::new(tokio::sync::Mutex::new(config_manager)),
            };

            // 异步加载窗口配置并设置主窗口位置
            let config_manager_clone = app_state.config_manager.clone();
            let main_window = app.get_webview_window("main").unwrap();
            let main_window_clone = main_window.clone();

            tauri::async_runtime::spawn(async move {
                let manager = config_manager_clone.lock().await;
                if let Ok(window_config) = manager.get_window().await {
                    if let Ok(size) = main_window_clone.inner_size() {
                        let width = size.width as f64;
                        let height = size.height as f64;

                        // 中心点 => 左上角
                        let left = window_config.main_window_x - width / 2.0;
                        let top = window_config.main_window_y - height / 2.0;

                        let _ =
                            main_window_clone.set_position(tauri::LogicalPosition::new(left, top));
                    }
                }
            });

            app.manage(app_state);

            // 设置平台特定配置
            if macos::is_macos() {
                macos::setup_app();
            }

            if windows::is_windows() {
                windows::setup_app();
            }

            // 设置窗口特定配置
            if let Err(e) = macos::setup_window(&main_window) {
                eprintln!("设置macOS窗口配置时出错: {}", e);
            }

            if let Err(e) = windows::setup_window(&main_window) {
                eprintln!("设置Windows窗口配置时出错: {}", e);
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            get_ai_config,
            get_appearance_config,
            get_window_config,
            quit_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
