/*!
 * @fileoverview 聊天气泡相关命令模块
 * @description 处理聊天气泡窗口的创建、显示、隐藏和定位管理
 * @features
 *   - 聊天气泡窗口创建和管理
 *   - 气泡窗口自动定位 (相对于主窗口)
 *   - 窗口跟随状态管理
 *   - 动态尺寸计算
 *   - 窗口关闭和清理
 * @commands
 *   - show_chat_bubble: 显示聊天气泡
 *   - close_chat_bubble: 关闭聊天气泡
 *   - reposition_bubble_on_drag_end: 拖拽结束后重新定位气泡
 * @window_management
 *   - 气泡窗口相对主窗口定位
 *   - 自动计算窗口尺寸
 *   - 跟随主窗口移动
 * @global_state
 *   使用lazy_static管理全局气泡跟随状态
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

use tauri::{AppHandle, Manager};
use crate::state::{AppState, BubbleFollowState};

// 气泡窗口属性
struct BubbleWindowProps {
    width: f64,
    height: f64,
    x: f64,
    y: f64,
}

// 统一的气泡窗口属性计算函数
fn calculate_bubble_window_props(
    main_window: &tauri::WebviewWindow,
    message: &str
) -> Result<BubbleWindowProps, String> {
    // 获取主窗口信息
    let (main_physical_position, main_physical_size, scale_factor) = (
        main_window.inner_position().map_err(|e| format!("获取主窗口位置失败: {}", e))?,
        main_window.inner_size().map_err(|e| format!("获取主窗口尺寸失败: {}", e))?,
        main_window.scale_factor().map_err(|e| format!("获取缩放因子失败: {}", e))?
    );
    
    // 根据消息长度动态计算气泡尺寸（统一计算逻辑）
    let message_length = message.chars().count();
    let bubble_width = 320.0;
    
    // 根据消息长度估算高度（考虑换行）
    let estimated_lines = (message_length as f64 / 15.0).ceil().max(1.0);
    let bubble_height = (estimated_lines * 24.0 + 60.0).min(250.0).max(80.0);
    
    // 将物理坐标转换为逻辑坐标
    let logical_main_x = main_physical_position.x as f64 / scale_factor;
    let logical_main_y = main_physical_position.y as f64 / scale_factor;
    let logical_main_width = main_physical_size.width as f64 / scale_factor;
    
    // 计算气泡逻辑位置：主窗口正上方居中
    let bubble_logical_x = logical_main_x + (logical_main_width / 2.0) - (bubble_width / 2.0);
    let bubble_logical_y = logical_main_y - bubble_height;
    
    Ok(BubbleWindowProps {
        width: bubble_width,
        height: bubble_height,
        x: bubble_logical_x,
        y: bubble_logical_y,
    })
}

#[tauri::command]
pub async fn show_chat_bubble(
    app: AppHandle,
    message: String,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    // 停止之前的跟随
    stop_bubble_following(&state).await;
    
    // 关闭所有现有的气泡窗口
    close_all_bubble_windows(&app).await?;
    
    // 使用固定的窗口标签
    let window_label = "chat-bubble";

    // 获取主窗口并计算气泡属性
    if let Some(main_window) = app.get_webview_window("main") {
        let bubble_props = calculate_bubble_window_props(&main_window, &message)?;
        
        // 构建URL
        let url = format!(
            "/#/chat-bubble?message={}&autoHide=true&autoHideDelay=3000",
            urlencoding::encode(&message)
        );
        
        // 创建气泡窗口 - 使用逻辑坐标
        match tauri::WebviewWindowBuilder::new(
            &app,
            window_label,
            tauri::WebviewUrl::App(url.into())
        )
        .title("")
        .inner_size(bubble_props.width, bubble_props.height)
        .position(bubble_props.x, bubble_props.y) // 使用逻辑坐标
        .resizable(false)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(true)
        .focused(false)
        .build() {
            Ok(bubble_window) => {
                let _ = bubble_window.set_always_on_top(true);
            },
            Err(e) => {
                return Err(format!("创建气泡窗口失败: {}", e));
            }
        }
    } else {
        return Err("找不到主窗口".to_string());
    }

    // 启动窗口跟随
    start_bubble_following(app.clone(), window_label.to_string(), message.clone(), &state).await?;

    Ok(())
}

#[tauri::command]
pub async fn close_chat_bubble(app: AppHandle, state: tauri::State<'_, AppState>) -> Result<(), String> {
    stop_bubble_following(&state).await;
    close_all_bubble_windows(&app).await?;
    Ok(())
}

// 重新定位气泡窗口（在拖拽结束时由前端主动调用）
#[tauri::command] 
pub async fn reposition_bubble_on_drag_end(app: AppHandle, state: tauri::State<'_, AppState>) -> Result<(), String> {
    if let (Some(main_window), Some(bubble_window)) = (
        app.get_webview_window("main"),
        app.get_webview_window("chat-bubble")
    ) {
        // 从状态获取当前消息
        let current_message = {
            let guard = state.bubble_state.lock().await;
            guard.as_ref()
                .map(|bubble_state| bubble_state.current_message.clone())
                .ok_or_else(|| "找不到当前气泡消息".to_string())?
        };
        
        // 使用统一的计算函数，传入当前消息重新计算尺寸和位置
        let bubble_props = calculate_bubble_window_props(&main_window, &current_message)?;
        
        // 设置气泡窗口位置
        bubble_window.set_position(tauri::LogicalPosition::new(bubble_props.x, bubble_props.y))
            .map_err(|e| format!("设置气泡窗口位置失败: {}", e))?;
    } else {
        return Err("找不到主窗口或气泡窗口".to_string());
    }
    
    Ok(())
}

// 启动气泡窗口跟随
async fn start_bubble_following(_app: AppHandle, _bubble_label: String, message: String, state: &tauri::State<'_, AppState>) -> Result<(), String> {
    let follow_state = BubbleFollowState {
        current_message: message,
    };
    
    *state.bubble_state.lock().await = Some(follow_state);
    
    Ok(())
}

// 停止气泡窗口跟随
async fn stop_bubble_following(state: &tauri::State<'_, AppState>) {
    *state.bubble_state.lock().await = None;
}

// 关闭所有气泡窗口
async fn close_all_bubble_windows(app: &AppHandle) -> Result<(), String> {
    let windows = app.webview_windows();
    if let Some(existing_bubble) = windows.get("chat-bubble") {
        existing_bubble.close().map_err(|e| format!("关闭气泡窗口失败: {}", e))?;
    }
    Ok(())
}
