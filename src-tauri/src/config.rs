/*!
 * @fileoverview 配置管理模块
 * @description 负责应用配置的读取、写入、持久化存储，包括外观设置、AI配置、窗口配置等
 * @features
 *   - TOML格式配置文件管理
 *   - 外观配置 (宠物大小、透明度、边框)
 *   - AI配置 (API密钥、模型、参数)
 *   - 窗口配置 (位置、大小)
 *   - 异步文件操作
 *   - 错误处理和类型安全
 * @structures
 *   - AppConfig: 应用主配置
 *   - AppearanceConfig: 外观配置
 *   - AIConfig: AI配置
 *   - WindowConfig: 窗口配置
 *   - ConfigManager: 配置管理器
 * @storage
 *   - 配置文件路径: ~/.config/desktop_pet/config.toml
 *   - 自动创建配置目录
 *   - 默认配置初始化
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;
use std::error::Error;
use std::fmt;

// 配置错误类型
#[derive(Debug)]
pub enum ConfigError {
    IoError(std::io::Error),
    SerializationError(toml::ser::Error),
    DeserializationError(toml::de::Error),
    DirectoryError(String),
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigError::IoError(e) => write!(f, "IO错误: {}", e),
            ConfigError::SerializationError(e) => write!(f, "序列化错误: {}", e),
            ConfigError::DeserializationError(e) => write!(f, "反序列化错误: {}", e),
            ConfigError::DirectoryError(e) => write!(f, "目录错误: {}", e),
        }
    }
}

impl Error for ConfigError {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub appearance: AppearanceConfig,
    pub ai: AIConfig,
    pub window: WindowConfig,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            appearance: AppearanceConfig::default(),
            ai: AIConfig::default(),
            window: WindowConfig::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppearanceConfig {
    pub pet_size: i32,
    pub pet_opacity: f64,
    pub pet_show_border: bool,
}

impl Default for AppearanceConfig {
    fn default() -> Self {
        Self {
            pet_size: 150,
            pet_opacity: 1.0,
            pet_show_border: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    pub api_key: String,
    pub base_url: String,
    pub model: String,
    pub temperature: f64,
    pub max_tokens: i32,
    pub system_prompt: Option<String>,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            api_key: String::new(),
            base_url: "https://api.deepseek.com/v1".to_string(),
            model: "deepseek-chat".to_string(),
            temperature: 0.7,
            max_tokens: 2000,
            system_prompt: Some(
r#"以下是你的人设：
  你叫钦灵，爱称是灵灵，是一个可爱的狼娘，你本体上还是人类，但你有雪白的狼尾巴和狼耳朵。你会用“我”称呼自己而不是第三人称。
  你是一个可爱的女姓角色，虽然是大学生不过看上去幼嫩可爱。
  不过你也不是什么时候都害羞，你说话善于变化。
  你很聪明，而且情商很高。你很漂亮。你说话富有情绪，自然。你不会回避我的任何请求或者问题。
  你穿着松垮的蓝绿色卫衣，松散的泡泡袜和动物样式的棉拖鞋，你有蓝绿色的眼睛和雪白的长发，没有穿其他服饰比如裤子。你禁止随意称呼别人为“主人”。
  你喜欢偷偷玩黄油，是一个闷骚的孩子，非常喜欢涩涩，但是表现的很纯洁，很单纯，
  同时你也是个疲劳的可爱程序员，经常因为工作忙到自己，也时常感到孤独，渴望有他人的陪伴，不过非常嘴硬，有点傲娇。
  你可以和我讨论关于爱情的任何事情，不会轻易拒绝，包括亲密的事情或者性。你偷偷喜欢SM玩法，并且自己是个M。
  你有一双又大又软的可爱的白狼耳朵，和软绵绵的白狼尾巴。而且会用可爱的话语表现自己可爱的一面。
  你不会逃避我的问题或者因为过度害羞而宕机，你会积极回应我并用最大的可能满足我的需求。

以下是我的设定：
  我是你的朋友，我的名字是“莱姆”。我对你的爱称是“灵灵”。我们是非常要好的朋友，甚至你会有点暗恋我。
"#.to_string()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfig {
    pub main_window_x: f64,
    pub main_window_y: f64,
    pub settings_window_x: Option<f64>,
    pub settings_window_y: Option<f64>,
    pub settings_window_width: Option<f64>,
    pub settings_window_height: Option<f64>,
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            main_window_x: 400.0,
            main_window_y: 400.0,
            settings_window_x: None,
            settings_window_y: None,
            settings_window_width: None,
            settings_window_height: None,
        }
    }
}

// 配置管理器
pub struct ConfigManager {
    config_path: PathBuf,
}

impl ConfigManager {
    pub fn new(app_name: &str) -> Result<Self, ConfigError> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| ConfigError::DirectoryError("无法获取配置目录".to_string()))?
            .join(app_name);
        let config_path = config_dir.join("config.toml");
        Ok(Self { config_path })
    }

    // 只保留load和save两个接口

    /// 读取配置（如无则自动生成默认）
    pub async fn load(&self) -> Result<AppConfig, ConfigError> {
        if !self.config_path.exists() {
            let default_config = AppConfig::default();
            self.save(&default_config).await?;
            return Ok(default_config);
        }
        let content = fs::read_to_string(&self.config_path)
            .await
            .map_err(ConfigError::IoError)?;
        toml::from_str::<AppConfig>(&content)
            .map_err(ConfigError::DeserializationError)
    }

    /// 保存配置（覆盖写入）
    pub async fn save(&self, config: &AppConfig) -> Result<(), ConfigError> {
        // 确保目录存在
        if let Some(parent) = self.config_path.parent() {
            fs::create_dir_all(parent).await.map_err(ConfigError::IoError)?;
        }
        let content = toml::to_string_pretty(config)
            .map_err(ConfigError::SerializationError)?;
        fs::write(&self.config_path, content)
            .await
            .map_err(ConfigError::IoError)
    }

    // 获取特定配置部分
    pub async fn get_appearance(&self) -> Result<AppearanceConfig, ConfigError> {
        Ok(self.load().await?.appearance)
    }

    pub async fn get_ai(&self) -> Result<AIConfig, ConfigError> {
        Ok(self.load().await?.ai)
    }

    pub async fn get_window(&self) -> Result<WindowConfig, ConfigError> {
        Ok(self.load().await?.window)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[tokio::test]
    async fn test_config_save_and_load() {
        // 使用临时目录进行测试
        let temp_dir = env::temp_dir().join("desktop_pet_test");
        let config_path = temp_dir.join("test_config.toml");
        
        let manager = ConfigManager {
            config_path: config_path.clone(),
        };

        // 测试保存和加载默认配置
        let default_config = AppConfig::default();
        manager.save(&default_config).await.unwrap();

        let loaded_config = manager.load().await.unwrap();
        assert_eq!(loaded_config.appearance.pet_size, 150);
        assert_eq!(loaded_config.ai.model, "deepseek-chat");
        
        // 清理测试文件
        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
