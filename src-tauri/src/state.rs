use std::sync::Arc;
use crate::config::ConfigManager;

// 全局状态管理
pub struct AppState {
    pub config_manager: Arc<tokio::sync::Mutex<ConfigManager>>,
}
