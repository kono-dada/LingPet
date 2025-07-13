/*!
 * @fileoverview Tauri应用程序主入口文件
 * @description 桌面宠物应用的Rust主程序入口，负责启动Tauri应用
 * @features
 *   - Windows平台控制台窗口隐藏
 *   - 应用程序初始化和启动
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    desktop_pet_lib::run()
}
