/**
 * @fileoverview 对话管理组合式函数
 * @description 管理桌面宠物的多句话对话功能，包括对话状态、进度控制、表情切换等
 * @features
 *   - 对话状态管理
 *   - 对话进度控制
 *   - 表情同步切换
 *   - 跨窗口通信
 * @author dada
 * @version 1.0.0
 * @since 2025-07-13
 */

import { ref } from 'vue';
import type { EmotionName } from '../../types/emotion';
import { createNotificationWindow } from '../../services/windowFactory';
import { DEFAULT_EMOTION } from '../../constants/emotions';

export interface ConversationMessage {
    message: string;
    emotion: string;
    japanese: string;
}

export function useConversation() {
    // 对话状态
    const isInConversation = ref(false);
    const conversationMessages = ref<ConversationMessage[]>([]);
    const conversationIndex = ref(0);

    // 开始对话
    async function startConversation(
        messages: ConversationMessage[],
        onEmotionChange: (emotion: EmotionName) => void,
        onShakeEffect: () => void
    ) {
        isInConversation.value = true;
        conversationMessages.value = messages;
        conversationIndex.value = 0;

        // 切换到第一句话的表情并触发抖动
        if (messages[0]?.emotion) {
            onShakeEffect();
            onEmotionChange(messages[0].emotion as EmotionName);
        }

        // 存储数据供气泡窗口使用
        localStorage.setItem('bubbleMessages', JSON.stringify(messages));
        localStorage.setItem('currentMessageIndex', '0');
        localStorage.setItem('bubbleMessage', messages[0]?.message || '');
        localStorage.setItem('currentEmotion', messages[0]?.emotion || DEFAULT_EMOTION);

        // 创建气泡窗口
        await createNotificationWindow(messages[0]?.message || '');
    }

    // 播放下一句话
    function playNext(onEmotionChange: (emotion: EmotionName) => void, onShakeEffect: () => void) {
        if (!isInConversation.value) return false;

        // 触发抖动效果
        onShakeEffect();

        if (conversationIndex.value < conversationMessages.value.length - 1) {
            // 播放下一句
            conversationIndex.value++;
            const nextMessage = conversationMessages.value[conversationIndex.value];

            if (nextMessage) {
                // 切换表情
                onEmotionChange(nextMessage.emotion as EmotionName);

                // 更新气泡内容
                localStorage.setItem('currentMessageIndex', conversationIndex.value.toString());
                localStorage.setItem('bubbleMessage', nextMessage.message);
                localStorage.setItem('currentEmotion', nextMessage.emotion);
            }
            return true;
        } else {
            // 对话结束
            endConversation();
            onEmotionChange(DEFAULT_EMOTION); // 重置表情
            return false;
        }
    }

    // 结束对话
    function endConversation() {
        isInConversation.value = false;
        conversationMessages.value = [];
        conversationIndex.value = 0;

        // 清理数据并触发关闭事件
        localStorage.removeItem('bubbleMessages');
        localStorage.removeItem('currentMessageIndex');
        localStorage.removeItem('bubbleMessage');
        localStorage.setItem('closeBubble', Date.now().toString());
    }

    return {
        // 状态
        isInConversation,
        conversationMessages,
        conversationIndex,

        // 方法
        startConversation,
        playNext,
        endConversation,
    };
}
