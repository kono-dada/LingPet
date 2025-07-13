pub mod appearance;
pub mod ai;
pub mod window;
pub mod general;
pub mod chat_bubble;

// 重新导出所有命令函数，方便在 lib.rs 中使用
pub use appearance::*;
pub use ai::*;
pub use window::*;
pub use general::*;
pub use chat_bubble::*;
