/**
 * @fileoverview 应用程序入口文件
 * @description 桌面宠物应用的启动点，负责创建Vue应用实例、注册路由器并挂载到DOM
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 创建Vue应用实例，注册路由器并挂载到DOM元素
createApp(App).use(router).mount("#app");
