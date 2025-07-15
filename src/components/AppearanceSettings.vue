<template>
  <v-container>
    <v-card flat class="pa-2">
      <v-card-text>
        
        <div class="mb-8">
          <h2 class="text-h6 font-weight-bold mb-4">外观配置</h2>
          <v-divider class="mb-6"></v-divider>

          <div class="mb-6">
            <div class="d-flex justify-space-between align-center mb-1">
              <v-label>宠物大小</v-label>
              <span class="text-primary font-weight-medium">{{ config.appearance.pet_size }}px</span>
            </div>
            <p class="text-caption text-medium-emphasis">调整桌面宠物的显示大小</p>
            <v-slider
              v-model="config.appearance.pet_size"
              :min="MIN_SIZE"
              :max="MAX_SIZE"
              :step="1"
              thumb-label
              hide-details
            ></v-slider>
          </div>

          <div class="mb-6">
            <div class="d-flex justify-space-between align-center mb-1">
              <v-label>透明度</v-label>
              <span class="text-primary font-weight-medium">{{ formattedOpacity }}</span>
            </div>
            <p class="text-caption text-medium-emphasis">调整宠物的透明度</p>
            <v-slider
              v-model="config.appearance.pet_opacity"
              :min="MIN_OPACITY"
              :max="MAX_OPACITY"
              :step="0.01"
              thumb-label
              hide-details
            ></v-slider>
          </div>
          
          <div class="d-flex justify-space-between align-center">
            <div>
              <v-label>显示轮廓</v-label>
              <p class="text-caption text-medium-emphasis">是否显示宠物轮廓线</p>
            </div>
            <v-switch
              v-model="config.appearance.pet_show_border"
              color="success"
              inset
              hide-details
            ></v-switch>
          </div>
        </div>

        <v-divider class="my-8"></v-divider>

        <div>
          <h2 class="text-h6 font-weight-bold mb-4">其他操作</h2>
          <v-divider class="mb-6"></v-divider>
          <v-btn 
            @click="quitApp" 
            color="red-darken-1" 
            variant="flat"
            block 
            size="large"
            prepend-icon="mdi-logout"
          >
            退出应用
          </v-btn>
        </div>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { SETTINGS_CONSTRAINTS } from '../constants/settings_default';
import { useConfigStore } from '../stores/config';
import { storeToRefs } from 'pinia';

// Constants
const { 
  minSize: MIN_SIZE, 
  maxSize: MAX_SIZE, 
  minOpacity: MIN_OPACITY, 
  maxOpacity: MAX_OPACITY 
} = SETTINGS_CONSTRAINTS;

// State management
const configStore = useConfigStore();
const { config } = storeToRefs(configStore);

// Computed property to format the opacity value for display
const formattedOpacity = computed(() => {
  if (!config.value || typeof config.value.appearance.pet_opacity !== 'number') {
    return '0%';
  }
  return `${Math.round(config.value.appearance.pet_opacity * 100)}%`;
});

// Quit the application
async function quitApp() {
  try {
    await invoke('quit_app');
  } catch (error) {
    console.error('Failed to quit application:', error);
  }
}

// Initialization
onMounted(() => {
  // The main window needs to listen for configuration changes
  configStore.initialize(true);
});
</script>

<style scoped>
/* All major styles are handled by Vuetify, this can be left empty or for minor tweaks. */
.v-label {
  font-size: 1rem;
  font-weight: 500;
  opacity: 1;
}
</style>