<template>
  <v-container>
    <v-card flat class="pa-2">
      <div v-if="isLoading" class="d-flex flex-column align-center justify-center py-16">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="mt-4 text-medium-emphasis">加载应用信息中...</p>
      </div>

      <v-card-text v-else>
        <div class="text-center">
          <v-icon size="64" color="primary" class="mb-4">mdi-rocket-launch-outline</v-icon>
          <h1 class="text-h5 font-weight-bold">{{ appInfo.name }}</h1>
          <p class="text-subtitle-1 text-medium-emphasis">版本 {{ appInfo.version }}</p>
          <p class="text-body-2 mx-auto mt-4" style="max-width: 450px;">
            {{ appInfo.description }}
          </p>
        </div>

        <v-divider class="my-6"></v-divider>

        <v-list lines="one" bg-color="transparent">
          <v-list-item title="平台">
            <template v-slot:append>
              <span class="text-body-2 text-medium-emphasis">{{ appInfo.platform }}</span>
            </template>
          </v-list-item>
          <v-list-item title="构建日期">
            <template v-slot:append>
              <span class="text-body-2 text-medium-emphasis">{{ appInfo.buildDate }}</span>
            </template>
          </v-list-item>
          <v-list-item title="许可证">
            <template v-slot:append>
              <span class="text-body-2 text-medium-emphasis">{{ appInfo.license }}</span>
            </template>
          </v-list-item>
        </v-list>

        <div v-if="systemInfo">
          <v-divider class="my-8"></v-divider>
          <h2 class="text-h6 font-weight-bold mb-4">系统信息</h2>
          <v-divider class="mb-2"></v-divider>
          <v-list lines="one" bg-color="transparent">
            <v-list-item :title="`${getOSIcon(systemInfo.os)} 操作系统`">
              <template v-slot:append>
                <span class="text-body-2 text-medium-emphasis">{{ systemInfo.os }}</span>
              </template>
            </v-list-item>
            <v-list-item title="架构">
              <template v-slot:append>
                <span class="text-body-2 text-medium-emphasis">{{ systemInfo.arch }}</span>
              </template>
            </v-list-item>
            <v-list-item title="处理器" :subtitle="systemInfo.cpu" class="d-block text-wrap"></v-list-item>
            <v-list-item title="内存">
              <template v-slot:append>
                <span class="text-body-2 text-medium-emphasis">{{ formatMemory(systemInfo.memory) }}</span>
              </template>
            </v-list-item>
          </v-list>
        </div>
        
        <div>
          <v-divider class="my-8"></v-divider>
          <h2 class="text-h6 font-weight-bold mb-4">相关链接</h2>
          <v-divider class="mb-6"></v-divider>
          <v-row>
            <v-col cols="12" sm="6">
              <v-btn @click="openRepository" prepend-icon="mdi-github" variant="tonal" block>
                项目主页
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn @click="openDocumentation" prepend-icon="mdi-book-open-variant" variant="tonal" block>
                使用手册
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn @click="openFeedback" prepend-icon="mdi-message-alert" variant="tonal" block>
                问题反馈
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn @click="copyInfoToClipboard" prepend-icon="mdi-content-copy" color="primary" variant="flat" block>
                复制信息
              </v-btn>
            </v-col>
          </v-row>
        </div>
        
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAboutSettings } from '../composables/settings/useAboutSettings';

// Using the "About Settings" composable which handles all logic
const {
  appInfo,
  systemInfo,
  isLoading,
  
  // Helper methods
  formatMemory,
  getOSIcon,
  
  // Action methods
  copyInfoToClipboard,
  openRepository,
  openDocumentation,
  openFeedback,
} = useAboutSettings();
</script>

<style scoped>
/* All styles are now handled by Vuetify components and utility classes. */
.v-list-item--subtitle {
  white-space: normal;
}
</style>