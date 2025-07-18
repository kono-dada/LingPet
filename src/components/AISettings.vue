<template>
  <v-container>
    <v-card flat class="pa-2">
      <v-card-text>

        <div class="mb-8">
          <h2 class="text-h6 font-weight-bold mb-4">API 配置</h2>
          <v-divider class="mb-6"></v-divider>

          <v-text-field v-model="config.ai.api_key" :type="showApiKey ? 'text' : 'password'" label="API Key"
            variant="outlined" density="compact" persistent-hint
            :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showApiKey = !showApiKey"
            class="mb-4"></v-text-field>

          <v-text-field v-model="config.ai.base_url" label="API 基础地址" variant="outlined" density="compact"
            persistent-hint class="mb-4"></v-text-field>

          <v-text-field v-model="config.ai.model" label="模型" variant="outlined" density="compact"
            persistent-hint></v-text-field>
        </div>

        <v-divider class="my-8"></v-divider>

        <div class="mb-8">
          <h2 class="text-h6 font-weight-bold mb-4">对话参数</h2>
          <v-divider class="mb-6"></v-divider>

          <div class="mb-6">
            <div class="d-flex justify-space-between align-center mb-1">
              <v-label>Temperature</v-label>
              <span class="text-primary font-weight-medium">{{ config.ai.temperature }}</span>
            </div>
            <p class="text-caption text-medium-emphasis">控制回复的随机性和创造性</p>
            <v-slider v-model="config.ai.temperature" :min="0" :max="1" :step="0.1" thumb-label></v-slider>
            <div class="d-flex justify-space-between text-caption text-medium-emphasis">
              <span>严谨</span>
              <span>平衡</span>
              <span>创造</span>
            </div>
          </div>

          <div>
            <div class="d-flex justify-space-between align-center mb-1">
              <v-label>最大回复长度</v-label>
              <span class="text-primary font-weight-medium">{{ config.ai.max_tokens }}</span>
            </div>
            <p class="text-caption text-medium-emphasis">限制AI回复的最大长度</p>
            <v-slider v-model="config.ai.max_tokens" :min="1000" :max="20000" :step="200" thumb-label></v-slider>
          </div>
        </div>

        <v-divider class="my-8"></v-divider>

        <div class="mb-8">
          <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h6 font-weight-bold">系统设置</h2>
            <v-btn variant="text" size="small" @click="config.ai.system_prompt = DEFAULT_CHARACTER_PROMPT;">
              重置为默认
            </v-btn>
          </div>
          <v-divider class="mb-6"></v-divider>

          <v-textarea v-model="config.ai.system_prompt" label="系统提示词" variant="outlined" rows="6" auto-grow
            hint="定义宠物的性格和行为规则" persistent-hint></v-textarea>
        </div>

        <v-divider class="my-8"></v-divider>

        <div>
          <v-btn :disabled="isTesting" @click="testConnection" color="primary" size="large" block>
            {{ isTesting ? '测试中...' : '测试连接' }}
          </v-btn>

          <v-alert v-if="testResult" :type="testResult.success ? 'success' : 'error'" :text="testResult.message"
            variant="tonal" density="compact" class="mt-4" closable @click:close="testResult = null"></v-alert>
        </div>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DEFAULT_CHARACTER_PROMPT } from '../constants/ai';
import { useConfigStore } from '../stores/config';
import { storeToRefs } from 'pinia';
import { useAIService } from '../services/aiService';

// 测试相关
const testResult = ref<{ success: boolean; message: string } | null>(null);
const isTesting = ref(false);

const configStore = useConfigStore();
const { config } = storeToRefs(configStore);

const showApiKey = ref(false);

onMounted(() => {
  console.log(config.value.ai);
});

// 测试连接
async function testConnection() {
  isTesting.value = true;
  const aiService = useAIService();
  const result = await aiService.testAIConnection();
  isTesting.value = false;
  testResult.value = result;
}

</script>

<style scoped>
/* Scoped styles are no longer needed as Vuetify handles the component styling. */
/* You can add specific overrides here if necessary. */
.v-label {
  font-size: 1rem;
  font-weight: 500;
  opacity: 1;
}
</style>