/**
 * @fileoverview Vite环境类型声明文件
 * @description 为Vite特定的功能提供TypeScript类型支持，确保导入资源文件时的类型安全
 * @features
 *   - Vite客户端类型引用
 *   - Vue单文件组件类型声明
 *   - 静态资源导入类型支持
 * @declarations
 *   - *.vue文件模块声明
 *   - DefineComponent类型导入支持
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
