/*!
 * @fileoverview Tauri命令模块统一导出
 * @description 组织和导出所有Tauri命令处理函数，提供前端可调用的API接口
 * @modules
 *   - appearance: 外观设置相关命令
 *   - ai: AI配置和功能相关命令
 *   - window: 窗口管理相关命令
 *   - general: 通用功能命令
 *   - chat_bubble: 聊天气泡相关命令
 * @exports
 *   重新导出所有子模块的公共函数，便于在lib.rs中统一注册
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

pub mod config;
pub mod app;

pub use config::*;
pub use app::quit_app;