# 窗口管理重构文档

## 概述

本次重构采用了**窗口工厂模式**来统一管理所有类型的窗口，提供了更清晰的架构和更好的可维护性。

## 新架构特点

### 1. 窗口工厂模式
- **统一入口**: 所有窗口创建都通过 `WindowFactory` 类
- **类型特化**: 不同窗口类型有不同的创建策略
- **配置统一**: 使用类型化的配置接口

### 2. 窗口类型分类
```typescript
export type WindowType = 'settings' | 'notification' | 'dialog';
```

- **settings**: 设置窗口 (前端创建，支持持久化)
- **notification**: 通知气泡窗口 (后端创建，自动管理)
- **dialog**: 对话框窗口 (前端创建，模态显示)

### 3. 配置接口层次
```
BaseWindowConfig (基础配置)
├── SettingsWindowConfig (设置窗口特化)
├── NotificationWindowConfig (通知窗口特化)
└── DialogWindowConfig (对话框窗口特化)
```

## 主要变更

### 文件结构变更

#### 新增文件
- `src/services/windowFactory.ts` - 窗口工厂核心实现
- `src/composables/useChat.ts` - 聊天管理组合式函数

#### 修改文件
- `src/composables/useSettings.ts` - 简化，使用窗口工厂
- `src/composables/index.ts` - 新增导出

#### 保留文件
- `src/services/windowConfig.ts` - 窗口配置持久化服务
- `src/components/ChatBubble.vue` - 聊天气泡组件（无变更）
- 后端 Rust 代码 - 通知窗口创建逻辑（无变更）

### 代码变更对比

#### useSettings.ts (重构前 vs 重构后)

**重构前 (复杂的直接窗口管理)**:
```typescript
// 76 行窗口管理代码
let settingsWindow: WebviewWindow | null = null;
const { getWindowConfig } = windowConfig();

async function openSettings() {
  // 大量的配置处理代码...
  settingsWindow = new WebviewWindow('settings', windowOptions);
  // 事件监听代码...
}
```

**重构后 (简洁的工厂调用)**:
```typescript
// 22 行窗口管理代码
async function openSettings() {
  try {
    const window = await createSettingsWindow();
    if (window) {
      console.log('设置窗口已打开');
    }
  } catch (error) {
    console.error('打开设置窗口失败:', error);
  }
}
```

#### 聊天功能新增

**重构前**: 聊天气泡窗口管理分散在各处，需要直接调用 Tauri 命令

**重构后**: 统一的聊天管理接口
```typescript
// 使用新的 useChat 组合函数
const { showChatBubble, closeChatBubble, quickMessage } = useChat();

// 简单显示消息
await quickMessage("你好！");

// 批量显示消息
await showMessageSequence(["消息1", "消息2", "消息3"]);
```

## 使用方式

### 1. 基础窗口操作

```typescript
import { WindowFactory, createSettingsWindow, createNotificationWindow } from '@/composables';

// 方式1: 使用工厂类
const settingsWindow = await WindowFactory.createWindow({
  type: 'settings',
  label: 'settings',
  title: '设置',
  persistPosition: true,
});

// 方式2: 使用便捷函数
const settingsWindow = await createSettingsWindow();
const notificationWindow = await createNotificationWindow("Hello!");
```

### 2. 组合式函数

```typescript
import { useSettings, useChat } from '@/composables';

// 设置管理
const { openSettings, closeSettings, switchTab } = useSettings();

// 聊天管理
const { showChatBubble, quickMessage, showMessageSequence } = useChat();
```

### 3. 窗口生命周期管理

```typescript
// 关闭特定窗口
await WindowFactory.closeWindow('settings');

// 关闭所有窗口
await WindowFactory.closeAllWindows();

// 获取窗口实例
const window = WindowFactory.getWindow('settings');
```

## 优势

### 1. 代码简化
- **useSettings.ts**: 从 249 行减少到 ~150 行
- **窗口创建**: 复杂的配置逻辑被封装
- **错误处理**: 统一的错误处理机制

### 2. 类型安全
- 强类型的窗口配置接口
- TypeScript 编译时检查
- 更好的 IDE 支持

### 3. 可维护性
- 单一职责原则
- 关注点分离
- 便于测试和调试

### 4. 可扩展性
- 新窗口类型只需添加配置接口
- 统一的创建流程
- 易于添加新功能

### 5. 一致性
- 统一的 API 接口
- 一致的配置模式
- 标准化的事件处理

## 向后兼容性

为了保持向后兼容，保留了以下导出：
```typescript
export { useSettings as useSettingsUI } from './useSettings';
export { usePet as useEmotions } from './usePet';
export { useChat as useChatBubble } from './useChat';
```

现有代码可以继续工作，新代码建议使用新的 API。

## 迁移指南

### 对于现有代码使用者

**无需立即修改**: 现有的 `useSettings()` 调用仍然有效

**推荐迁移**:
```typescript
// 旧方式 (仍然有效)
const { openSettings } = useSettings();

// 新方式 (推荐)
const { openSettings } = useSettings(); // API 相同，内部实现改进
const { showChatBubble } = useChat();   // 新的聊天管理
```

### 对于新功能开发

**使用新的窗口工厂**:
```typescript
import { WindowFactory, createDialogWindow } from '@/composables';

// 创建自定义对话框
const dialog = await createDialogWindow({
  title: '确认操作',
  width: 400,
  height: 200,
  modal: true,
});
```

## 总结

通过引入窗口工厂模式，我们实现了：

1. **代码减少**: 删除了大量重复的窗口管理代码
2. **职责分离**: 每个组件只关注自己的核心功能
3. **类型安全**: 强类型的配置和更好的开发体验
4. **统一管理**: 所有窗口通过统一的工厂创建和管理
5. **向后兼容**: 现有代码无需修改即可继续使用

这个重构为项目提供了更稳固的基础，便于后续功能的开发和维护。
