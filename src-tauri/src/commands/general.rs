/*!
 * @fileoverview 通用功能命令模块
 * @description 提供通用的Tauri命令功能，包括测试和工具类命令
 * @features
 *   - 基础功能测试
 *   - 通用工具命令
 * @commands
 *   - greet: 测试用的问候命令
 * @note
 *   这个模块主要用于开发测试，实际应用中可能包含更多通用功能
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
