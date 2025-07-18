/*!
 * @fileoverview 应用状态管理模块
 * @description 定义和管理应用的全局状态，提供线程安全的状态访问
 * @features
 *   - 全局应用状态定义
 *   - 配置管理器的线程安全封装
 *   - Arc + Mutex模式确保并发安全
 * @structures
 *   - AppState: 应用全局状态结构
 * @concurrency
 *   - 使用Arc<Mutex<T>>模式实现线程安全
 *   - 支持多线程并发访问配置
 * @note
 *   聊天气泡相关状态已移除，功能完全由前端管理
 * @author dada
 * @version 2.0.0
 * @since 2025-07-13
 */

use std::sync::Arc;
use crate::config::ConfigManager;

// 全局状态管理
pub struct AppState {
    pub config_manager: Arc<tokio::sync::Mutex<ConfigManager>>,
}
