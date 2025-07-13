# 桌面宠物 Desktop Pet

一个使用 Tauri + Vue 3 构建的跨平台桌面宠物应用。

## 功能特性

- 🎭 18种不同的表情状态
- 🖱️ 点击切换随机表情
- 🪟 透明窗口，无边框设计
- 📍 窗口置顶，不遮挡其他应用
- 🔄 平滑的动画过渡效果

## 表情列表

宠物拥有以下18种表情：
- 正常、高兴、伤心、生气、害怕
- 惊讶、厌恶、害羞、兴奋、担心
- 调皮、慌张、紧张、认真、无奈
- 心动、羞耻、自信、疑惑

## 开发运行

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm tauri dev

# 构建应用
pnpm tauri build
```

## 使用说明

1. 启动应用后，桌面上会出现一个圆形的宠物头像
2. 鼠标悬停会显示"点击切换表情"的提示
3. 点击宠物头像可以随机切换到其他表情
4. 宠物窗口会始终保持在其他窗口之上

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **桌面**: Tauri 2.x
- **样式**: 原生CSS with 动画效果

## 文件结构

```
src/
├── App.vue          # 主要的宠物组件
├── main.ts          # 应用入口
public/
├── avatar/          # 宠物表情图片资源
src-tauri/
├── tauri.conf.json  # Tauri配置文件
```

## 自定义

如果要添加更多表情或修改宠物外观：

1. 在 `public/avatar/` 目录添加新的表情图片
2. 在 `App.vue` 的 `emotions` 数组中添加新文件名
3. 调整CSS样式来改变宠物大小或动画效果

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's Take Over mode by following these steps:

1. Run `Extensions: Show Built-in Extensions` from VS Code's command palette, look for `TypeScript and JavaScript Language Features`, then right click and select `Disable (Workspace)`. By default, Take Over mode will enable itself if the default TypeScript extension is disabled.
2. Reload the VS Code window by running `Developer: Reload Window` from the command palette.

You can learn more about Take Over mode [here](https://github.com/johnsoncodehk/volar/discussions/471).
