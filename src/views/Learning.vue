<template>
  <div
    ref="containerRef"
    class="learning-container fixed inset-0 w-full h-full overflow-hidden bg-[var(--background-color)] text-[var(--text-primary)] flex flex-col"
  >
    <!-- 顶部导航区 -->
    <div
      class="flex items-center p-4 bg-[var(--surface-color)] border-b-2 border-[var(--border-color)] z-20"
    >
      <button
        @click="goBack"
        class="w-10 h-10 rounded-xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] hover:border-[var(--primary-color)] text-[var(--primary-color)] active:scale-95 transition-all duration-200 flex items-center justify-center shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="text-sm font-bold text-[var(--primary-color)] shrink-0 ml-2">
        {{ currentLessonIndex + 1 }}/{{ totalLessons }}
      </div>
      <div class="text-sm font-medium text-[var(--text-primary)] truncate ml-2 flex-1">
        {{ courseStore.currentLesson?.title || "" }}
      </div>
    </div>

    <!-- 内容交互区 -->
    <div ref="contentRef" class="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
      <!-- 句子列表 -->
      <div
        v-for="(sentence, index) in courseStore.lessonData?.sentences"
        :key="sentence.id"
        :data-sentence-index="index"
        :class="[
          'mb-5 transition-all duration-300 py-6 px-5 rounded-2xl',
          index === learningStore.currentSentenceIndex
            ? 'opacity-100 bg-[var(--surface-color)] border-2 border-[var(--primary-color)]'
            : 'opacity-50 bg-[var(--surface-color)] border-2 border-[var(--border-color)] hover:border-[var(--primary-color)]/50',
        ]"
      >
        <!-- 中文释义 -->
        <div
          v-if="settingsStore.showChinese && sentence.translate"
          class="text-[var(--text-secondary)] mb-4 text-lg font-medium"
        >
          {{ sentence.translate }}
        </div>

        <!-- 英文原文显示和输入区域 -->
        <div class="text-2xl mb-4 leading-relaxed tracking-wide">
          <template
            v-for="(word, wordIndex) in splitSentenceToParts(sentence.text)"
            :key="wordIndex"
          >
            <!-- 空格处理 -->
            <template v-if="isSpace(word)">
              <span
                :class="getSpaceClass(index, getWordCharIndex(sentence.text, wordIndex))"
              >
                {{ getSpaceDisplay(index, getWordCharIndex(sentence.text, wordIndex)) }}
              </span>
            </template>
            <!-- 标点符号处理 -->
            <template v-else-if="isPunctuation(word)">
              <span
                :class="
                  getPunctuationClass(index, getWordCharIndex(sentence.text, wordIndex))
                "
              >
                {{
                  getPunctuationDisplay(index, getWordCharIndex(sentence.text, wordIndex))
                }}
              </span>
            </template>
            <!-- 单词处理：可点击播放语音和显示 -->
            <template v-else>
              <span
                class="inline-block cursor-pointer hover:text-[var(--primary-color)] transition-all duration-200 hover:scale-110 mr-2"
                @click="handleWordClick(index, wordIndex, word)"
              >
                <!-- 单词中的每个字符 -->
                <template v-for="(char, charIndex) in word" :key="charIndex">
                  <span
                    :class="
                      getCharClass(
                        index,
                        getWordCharIndex(sentence.text, wordIndex) + charIndex,
                        char
                      )
                    "
                  >
                    {{
                      getCharDisplay(
                        index,
                        getWordCharIndex(sentence.text, wordIndex) + charIndex,
                        char
                      )
                    }}
                  </span>
                </template>
              </span>
            </template>
          </template>
        </div>

        <!-- 音标显示区域 -->
        <div v-if="sentence.soundmark" class="text-sm text-[var(--text-secondary)] mt-2">
          音标：{{ sentence.soundmark }}
        </div>
      </div>

      <!-- 底部空白占位，解决键盘遮挡最后两行内容问题 -->
      <div class="h-60 md:h-60"></div>
    </div>

    <!-- 底部操作区 -->
    <div
      ref="bottomBarRef"
      class="bg-[var(--surface-color)] border-t-2 border-[var(--border-color)] p-6 z-20"
    >
      <!-- 错误提示 -->
      <div
        v-if="validationErrors.length > 0"
        class="mb-4 p-4 bg-[var(--error-color)]/10 border-2 border-[var(--error-color)]/30 rounded-3xl"
      >
        <div class="text-[var(--error-color)] text-sm font-bold mb-1">
          发现以下错误：
        </div>
        <div class="text-[var(--error-color)] text-sm space-y-2">
          <div v-for="error in validationErrors" :key="error.index">
            {{ error.message }}
          </div>
        </div>
      </div>

      <!-- 功能按钮组 -->
      <div class="flex items-center justify-between gap-3">
        <!-- 左侧按钮：重播、重新学习 -->
        <div class="flex items-center gap-3">
          <!-- 重播音频按钮 -->
          <button
            @click="replayAudio"
            class="w-12 h-12 rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] text-[var(--primary-color)] hover:bg-[var(--hover-color)] hover:border-[var(--primary-color)] active:scale-95 transition-all duration-200 flex items-center justify-center"
            title="重播当前音频"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          </button>

          <!-- 重新开始按钮 -->
          <button
            @click="handleRestart"
            :disabled="isSubmitting"
            class="w-12 h-12 rounded-2xl bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="重新学习本课"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>

        <!-- 右侧按钮：跳过、提交 -->
        <div class="flex items-center gap-3">
          <!-- 跳过按钮 -->
          <button
            @click="handleSkip"
            :disabled="isSubmitting"
            class="w-12 h-12 rounded-2xl bg-[var(--surface-color)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-color)] hover:border-[var(--primary-color)]/50 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="跳过当前课时"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- 提交按钮 -->
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="w-14 h-14 rounded-2xl text-white active:scale-95 transition-all duration-200 flex items-center justify-center"
            :class="isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90'"
            title="提交完成学习"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 隐藏的输入框 - 用于捕获用户输入 -->
    <input
      ref="hiddenInputRef"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      class="fixed opacity-0 w-1 h-1 focus:outline-none"
      @input="handleInput"
      @keydown="handleKeyDown"
    />
  </div>
</template>

<script setup>
// 导入依赖
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLearningStore } from "@/stores/learning";
import { useCourseStore } from "@/stores/course";
import { useSettingsStore } from "@/stores/settings";
import { useAuthStore } from "@/stores/auth";
import { usePlayWordSound } from "@/composables/audio";

// ========================== 状态管理与路由 ==========================
/**
 * 路由对象 - 用于获取当前路由参数
 */
const route = useRoute();

/**
 * 路由导航对象 - 用于页面跳转
 */
const router = useRouter();

/**
 * 学习状态管理 - 管理学习进度、输入状态等
 */
const learningStore = useLearningStore();

/**
 * 课程状态管理 - 管理课程数据、课时数据等
 */
const courseStore = useCourseStore();

/**
 * 设置状态管理 - 管理学习设置，如忽略大小写、需要输入标点符号等
 */
const settingsStore = useSettingsStore();

/**
 * 认证状态管理 - 管理用户认证状态
 */
const authStore = useAuthStore();

// ========================== 音频播放 ==========================
/**
 * 音频播放组合式函数 - 用于播放单词发音
 */
const { handlePlayWordSound } = usePlayWordSound();

// ========================== DOM引用 ==========================
/**
 * 容器DOM引用 - 用于布局和样式调整
 */
const containerRef = ref(null);

/**
 * 内容区DOM引用 - 用于滚动和事件监听
 */
const contentRef = ref(null);

/**
 * 底部操作区DOM引用 - 用于布局调整
 */
const bottomBarRef = ref(null);

/**
 * 隐藏输入框DOM引用 - 用于捕获用户输入
 */
const hiddenInputRef = ref(null);

// ========================== 状态变量 ==========================
/**
 * 提交状态 - 用于控制提交按钮的加载状态
 */
const isSubmitting = ref(false);

/**
 * 验证错误 - 用于显示验证错误信息
 */
const validationErrors = ref([]);

/**
 * 内容区样式 - 用于动态调整内容区样式
 */
const contentStyle = ref({});

// ========================== 计算属性 ==========================
/**
 * 当前课时索引 - 计算当前课时在总课时中的位置
 */
const currentLessonIndex = computed(() => {
  if (courseStore.currentCourse && courseStore.currentCourse.lessons) {
    const currentLesson = courseStore.currentCourse.lessons.find(
      (lesson) => lesson.id === route.params.lessonId
    );
    if (currentLesson && currentLesson.order) {
      return currentLesson.order - 1;
    }
    return courseStore.currentCourse.lessons.findIndex(
      (lesson) => lesson.id === route.params.lessonId
    );
  }
  return 0;
});

/**
 * 总课时数 - 计算课程的总课时数
 */
const totalLessons = computed(() => {
  return courseStore.currentCourse?.lessons?.length || 0;
});

// ========================== 辅助函数与正则表达式 ==========================
/**
 * 标点符号正则表达式 - 用于匹配各种标点符号
 */
const punctuationRegex = /[.,!?;:'"()\[\]{}\-—–…。，！？；：""''（）【】《》]/;

/**
 * 空格正则表达式 - 用于匹配空格字符
 */
const spaceRegex = /\s/;

/**
 * 判断字符是否为标点符号
 * @param {string} char - 要判断的字符
 * @returns {boolean} - 是否为标点符号
 */
const isPunctuation = (char) => punctuationRegex.test(char);

/**
 * 判断字符是否为空格
 * @param {string} char - 要判断的字符
 * @returns {boolean} - 是否为空格
 */
const isSpace = (char) => spaceRegex.test(char);

/**
 * 将句子分割为单词、空格和标点符号
 * @param {string} sentence - 要分割的句子
 * @returns {string[]} - 分割后的单词、空格和标点符号数组
 */
const splitSentenceToParts = (sentence) => {
  if (!sentence) return [];

  // 使用正则表达式分割句子，保留单词、空格和标点符号
  const parts =
    sentence.match(/\w+|[\s,.!?;:'"()\[\]{}\-—–…。，！？；：""''（）【】《》]/g) || [];
  return parts;
};

/**
 * 获取单词在句子中的字符索引
 * @param {string} sentence - 句子文本
 * @param {number} wordIndex - 单词索引
 * @returns {number} - 字符索引
 */
const getWordCharIndex = (sentence, wordIndex) => {
  const parts = splitSentenceToParts(sentence);
  let charIndex = 0;

  for (let i = 0; i < wordIndex; i++) {
    charIndex += parts[i]?.length || 0;
  }

  return charIndex;
};

// ========================== 样式和显示逻辑 ==========================
/**
 * 获取字符样式类
 * @param {number} sentenceIndex - 句子索引
 * @param {number} charIndex - 字符索引
 * @param {string} correctChar - 正确的字符
 * @returns {string} - 样式类名
 */
const getCharClass = (sentenceIndex, charIndex, correctChar) => {
  // 获取当前句子的进度信息
  const progress = learningStore.sentenceProgress[sentenceIndex] || {
    userInput: "",
    charIndex: -1,
  };
  const { userInput, completed } = progress;

  // 判断字符状态
  const isCurrentSentence = sentenceIndex === learningStore.currentSentenceIndex;
  const isPreviousSentence = sentenceIndex < learningStore.currentSentenceIndex;
  const isSentenceCompleted = completed || isPreviousSentence;

  // 检查是否显示英文
  const isShowEnglish = learningStore.showEnglish;

  // 检查字符是否被提示
  const isHinted = learningStore.isCharHinted(sentenceIndex, charIndex);

  // 检查字符是否已输入：直接检查userInput中对应位置是否有字符
  const userChar = userInput[charIndex];
  const isCharEntered = userChar !== undefined;

  // 已输入字符：标记对错
  if (isSentenceCompleted || isCharEntered) {
    // 应用忽略大小写设置
    const shouldIgnoreCase = settingsStore.ignoreCase;
    const isCorrect = shouldIgnoreCase
      ? userChar.toLowerCase() === correctChar.toLowerCase()
      : userChar === correctChar;
    return isCorrect ? "text-green-400" : "text-red-500";
  }

  // 显示英文或被提示的字符：显示提示颜色
  if (isShowEnglish || isHinted) {
    return "text-gray-400";
  }

  // 未输入字符：显示灰色
  return "text-gray-600";
};

/**
 * 获取字符显示内容
 * @param {number} sentenceIndex - 句子索引
 * @param {number} charIndex - 字符索引
 * @param {string} correctChar - 正确的字符
 * @returns {string} - 显示的内容
 */
const getCharDisplay = (sentenceIndex, charIndex, correctChar) => {
  // 获取当前句子的进度信息
  const progress = learningStore.sentenceProgress[sentenceIndex] || {
    userInput: "",
    charIndex: -1,
  };
  const { userInput, completed } = progress;
  const userChar = userInput[charIndex];

  // 判断字符状态
  const isCurrentSentence = sentenceIndex === learningStore.currentSentenceIndex;
  const isPreviousSentence = sentenceIndex < learningStore.currentSentenceIndex;
  const isSentenceCompleted = completed || isPreviousSentence;

  // 检查是否显示英文
  const isShowEnglish = learningStore.showEnglish;

  // 检查字符是否被提示
  const isHinted = learningStore.isCharHinted(sentenceIndex, charIndex);

  // 检查字符是否已输入：直接检查userInput中对应位置是否有字符
  const isCharEntered = userChar !== undefined;

  // 已输入字符：显示用户实际输入的内容
  if (isSentenceCompleted || isCharEntered) {
    if (userChar !== undefined) {
      // 如果用户输入了空格，并且正确字符不是空格，显示可见的空格（使用■表示）
      if (userChar === " " && correctChar !== " ") {
        return "■";
      }
      // 否则显示用户输入的字符或非断行空格
      return userChar === " " ? "\u00A0" : userChar;
    }
    return correctChar === " " ? "\u00A0" : correctChar;
  }

  // 显示英文或被提示的字符：显示正确字符
  if (isShowEnglish || isHinted) {
    return correctChar === " " ? "\u00A0" : correctChar;
  }

  // 未输入字符：显示下划线
  return "_";
};

/**
 * 获取空格样式类
 * @param {number} sentenceIndex - 句子索引
 * @param {number} charIndex - 字符索引
 * @returns {string} - 样式类名
 */
const getSpaceClass = (sentenceIndex, charIndex) => {
  // 获取当前句子的进度信息
  const progress = learningStore.sentenceProgress[sentenceIndex] || {
    userInput: "",
    charIndex: -1,
  };
  const { charIndex: currentCharIndex } = progress;

  // 判断字符状态
  const isEntered =
    charIndex <= currentCharIndex || sentenceIndex < learningStore.currentSentenceIndex;

  // 根据设置决定是否需要输入空格
  if (settingsStore.requireSpace) {
    // 需要输入空格：未输入时显示下划线，已输入时显示空格
    return isEntered ? "text-green-400" : "text-gray-600";
  } else {
    // 不需要输入空格：自动显示空格
    return "text-gray-400";
  }
};

/**
 * 获取空格显示内容
 * @param {number} sentenceIndex - 句子索引
 * @param {number} charIndex - 字符索引
 * @returns {string} - 显示的内容
 */
const getSpaceDisplay = (sentenceIndex, charIndex) => {
  // 获取当前句子的进度信息
  const progress = learningStore.sentenceProgress[sentenceIndex] || {
    userInput: "",
    charIndex: -1,
  };
  const { charIndex: currentCharIndex } = progress;

  // 判断字符状态
  const isEntered =
    charIndex <= currentCharIndex || sentenceIndex < learningStore.currentSentenceIndex;

  // 无论设置如何，都显示空格，用户仍然需要根据设置输入
  return "\u00A0";
};

/**
 * 获取标点符号样式类
 * @param {number} sentenceIndex - 句子索引
 * @param {number} charIndex - 字符索引
 * @returns {string} - 样式类名
 */
const getPunctuationClass = (sentenceIndex, charIndex) => {
  // 获取当前句子和正确的标点符号
  const sentence = courseStore.lessonData?.sentences[sentenceIndex];
  if (!sentence) return "text-gray-400";
  const correctChar = sentence.text[charIndex];

  // 获取当前句子的进度信息
  const progress = learningStore.sentenceProgress[sentenceIndex] || {
    userInput: "",
    charIndex: -1,
  };
  const { userInput, completed } = progress;

  // 判断字符状态
  const isCurrentSentence = sentenceIndex === learningStore.currentSentenceIndex;
  const isPreviousSentence = sentenceIndex < learningStore.currentSentenceIndex;
  const isSentenceCompleted = completed || isPreviousSentence;

  // 检查字符是否已输入：直接检查userInput中对应位置是否有字符
  const userChar = userInput[charIndex];
  const isCharEntered = userChar !== undefined;

  // 如果句子已完成，直接显示正确/错误颜色
  if (isSentenceCompleted) {
    if (userChar === correctChar) {
      return "text-green-400";
    } else {
      return "text-red-500";
    }
  }

  // 如果是当前句子，且字符已输入，检查是否正确
  if (isCurrentSentence && isCharEntered) {
    if (userChar === correctChar) {
      return "text-green-400";
    } else {
      return "text-red-500";
    }
  }

  // 其他情况显示灰色
  return "text-gray-600";
};

/**
 * 获取标点符号显示内容
 * @param {number} sentenceIndex - 句子索引
 * @param {number} charIndex - 字符索引
 * @returns {string} - 显示的内容
 */
const getPunctuationDisplay = (sentenceIndex, charIndex) => {
  // 获取当前句子
  const sentence = courseStore.lessonData?.sentences[sentenceIndex];
  if (!sentence) return "";

  // 获取正确的标点符号
  const correctChar = sentence.text[charIndex];

  // 获取当前句子的进度信息
  const progress = learningStore.sentenceProgress[sentenceIndex] || {
    userInput: "",
    charIndex: -1,
  };
  const { userInput, charIndex: currentCharIndex, completed } = progress;
  const userChar = userInput[charIndex];

  // 判断字符状态
  const isCurrentSentence = sentenceIndex === learningStore.currentSentenceIndex;
  const isPreviousSentence = sentenceIndex < learningStore.currentSentenceIndex;
  const isSentenceCompleted = completed || isPreviousSentence;

  // 判断字符是否已输入
  const isEntered =
    isSentenceCompleted || (isCurrentSentence && charIndex <= currentCharIndex);

  // 已输入字符：显示用户实际输入的内容或正确字符
  if (isEntered && userChar) {
    return userChar;
  } else if (isEntered) {
    return correctChar;
  }

  // 未输入字符：自动显示标点符号
  // 无论设置如何，都显示标点符号，用户仍然需要根据设置输入
  return correctChar;
};

// ========================== 事件处理 ==========================
/**
 * 处理单词点击事件
 * @param {number} sentenceIndex - 句子索引
 * @param {number} wordIndex - 单词索引
 * @param {string} word - 单词文本
 */
const handleWordClick = (sentenceIndex, wordIndex, word) => {
  // 获取当前句子
  const sentence = courseStore.lessonData?.sentences[sentenceIndex];
  if (!sentence) return;

  // 聚焦输入框，确保键盘能被调起
  focusInput();

  // 播放单词语音
  handlePlayWordSound(word);

  // 如果关闭显示英文开关，则显示单词
  if (!learningStore.showEnglish) {
    // 计算单词在句子中的起始和结束位置
    const parts = splitSentenceToParts(sentence.text);
    let startIndex = 0;
    for (let i = 0; i < wordIndex; i++) {
      startIndex += parts[i]?.length || 0;
    }
    const endIndex = startIndex + word.length;

    // 标记单词为已提示（显示）
    learningStore.addHintedWord(sentenceIndex, startIndex, endIndex);
  }
};

/**
 * 处理用户输入事件
 * @param {Event} event - 输入事件对象
 */
const handleInput = (event) => {
  const inputChar = event.data;
  if (!inputChar) return;

  // 获取当前句子
  const currentSentence =
    courseStore.lessonData?.sentences[learningStore.currentSentenceIndex];
  if (!currentSentence) return;

  // 处理用户输入的字符，直到输入的字符被处理完毕
  let remainingInput = inputChar;

  while (remainingInput) {
    // 获取当前位置的正确字符
    const correctChar = currentSentence.text[learningStore.currentCharIndex];
    if (!correctChar) break;

    // 处理标点符号：根据设置决定是否需要输入
    if (isPunctuation(correctChar)) {
      if (!settingsStore.requirePunctuation) {
        // 不需要输入标点符号：自动填充
        learningStore.handleInput(correctChar);
        // 继续处理下一个字符，不需要递归
        continue;
      } else {
        // 需要输入标点符号：直接处理用户输入
        const charToProcess = remainingInput.charAt(0);
        learningStore.handleInput(charToProcess);
        // 移除已处理的字符
        remainingInput = remainingInput.slice(1);
      }
    }
    // 处理空格：根据设置决定是否需要输入
    else if (isSpace(correctChar)) {
      if (!settingsStore.requireSpace) {
        // 不需要输入空格：自动填充
        learningStore.handleInput(correctChar);
        // 继续处理下一个字符，不需要递归
        continue;
      } else {
        // 需要输入空格：直接处理用户输入
        const charToProcess = remainingInput.charAt(0);
        learningStore.handleInput(charToProcess);
        // 移除已处理的字符
        remainingInput = remainingInput.slice(1);
      }
    }
    // 处理普通字符输入
    else {
      const charToProcess = remainingInput.charAt(0);
      learningStore.handleInput(charToProcess);
      // 移除已处理的字符
      remainingInput = remainingInput.slice(1);
    }
  }

  // 同步输入框值
  event.target.value = learningStore.inputText;
};

/**
 * 处理键盘事件
 * @param {KeyboardEvent} event - 键盘事件对象
 */
const handleKeyDown = (event) => {
  // 阻止退格键默认行为
  if (event.key === "Backspace") {
    event.preventDefault();
    learningStore.handleBackspace();
  }
  // 阻止删除键默认行为
  else if (event.key === "Delete") {
    event.preventDefault();
  }
  // 阻止其他特殊键
  else if (event.key.length > 1 && !["Space", "Enter"].includes(event.key)) {
    event.preventDefault();
  }
};

// ========================== 功能按钮处理 ==========================
/**
 * 重播当前行语音
 */
const replayAudio = () => {
  learningStore.playCurrentLineAudio();
};

/**
 * 重新学习当前课时
 */
const handleRestart = () => {
  if (isSubmitting.value) return;

  if (confirm("确定要重新学习当前课时吗？当前进度将被重置。")) {
    // 重置学习状态，恢复到第一行
    learningStore.reset();
    // 重新聚焦输入框
    focusInput();
  }
};

/**
 * 跳过当前课时
 */
const handleSkip = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    await navigateToNextLesson();
  } catch (error) {
    console.error("跳过课时失败:", error);
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * 提交当前课时
 */
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    // 1. 调用学习状态管理的提交函数，它会处理错误单词保存和进度更新
    await learningStore.submitLesson();

    // 2. 跳转到下一课时
    await navigateToNextLesson();
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// ========================== 错误处理与数据提交 ==========================
/**
 * 收集错误单词
 * @returns {Array<{correctWord: string, userWord: string}>} - 错误单词列表，包含正确单词和用户输入
 */
const collectErrorWords = () => {
  const errorWords = [];
  const sentences = courseStore.lessonData?.sentences || [];

  // 遍历所有句子
  sentences.forEach((sentence, sentenceIndex) => {
    const progress = learningStore.sentenceProgress[sentenceIndex] || {};
    const userInput = progress.userInput || "";

    // 分割句子为单词
    const correctWords = sentence.text.split(/\s+/).filter((word) => word.trim());
    const userWords = userInput.split(/\s+/).filter((word) => word.trim());

    // 比较每个单词，只比较用户实际输入的单词
    for (
      let wordIndex = 0;
      wordIndex < Math.min(correctWords.length, userWords.length);
      wordIndex++
    ) {
      const correctWord = correctWords[wordIndex];
      const userWord = userWords[wordIndex] || "";

      // 应用忽略大小写设置
      const shouldIgnoreCase = settingsStore.ignoreCase;
      const isCorrect = shouldIgnoreCase
        ? userWord.toLowerCase() === correctWord.toLowerCase()
        : userWord === correctWord;

      // 如果单词错误，并且用户实际输入了内容，添加到错误单词列表
      if (!isCorrect && correctWord.trim() && userWord) {
        errorWords.push({
          correctWord,
          userWord,
        });
      }
    }
  });

  return errorWords;
};

/**
 * 保存错误单词到后端
 * @param {Array<{correctWord: string, userWord: string}>} errorWords - 错误单词列表，包含正确单词和用户输入
 */
const saveErrorWords = async (errorWords) => {
  try {
    const { courseId, lessonId } = route.params;

    // 导入API客户端
    const { wrongWordApi } = await import("@/api/client");

    // 去重，避免重复提交同一个单词，使用correctWord作为去重键
    const uniqueErrorWords = [];
    const seenCorrectWords = new Set();

    for (const errorWord of errorWords) {
      if (!seenCorrectWords.has(errorWord.correctWord)) {
        seenCorrectWords.add(errorWord.correctWord);
        uniqueErrorWords.push(errorWord);
      }
    }

    // 遍历所有错误单词，逐个保存
    for (const errorWord of uniqueErrorWords) {
      await wrongWordApi.addWrongWord({
        word: errorWord.correctWord,
        question_type: "learning",
        course_id: courseId,
        lesson_id: lessonId,
        user_answer: errorWord.userWord, // 使用用户的实际输入作为错误答案
        correct_answer: errorWord.correctWord,
        explanation: `来自课程 ${courseId} 的课时 ${lessonId}`,
      });
    }


  } catch (error) {
    console.error("保存错误单词失败:", error);
    throw error;
  }
};

// ========================== 页面导航 ==========================
/**
 * 跳转到下一课时
 */
const navigateToNextLesson = async () => {
  const { courseId, lessonId } = route.params;

  // 获取当前课程和课时信息
  const currentCourse = courseStore.currentCourse;
  if (!currentCourse || !currentCourse.lessons) {
    return;
  }

  // 查找当前课时索引
  const currentLessonIndex = currentCourse.lessons.findIndex(
    (lesson) => lesson.id === lessonId
  );

  // 确定下一课时
  let nextLesson;
  if (currentLessonIndex < currentCourse.lessons.length - 1) {
    // 有下一课时
    nextLesson = currentCourse.lessons[currentLessonIndex + 1];
  } else {
    // 没有下一课时，返回第一课时
    nextLesson = currentCourse.lessons[0];
  }

  // 跳转到下一课时
  await router.replace({
    name: "Learning",
    params: {
      courseId,
      lessonId: nextLesson.id,
    },
  });
};

// ========================== 初始化与生命周期 ==========================
/**
 * 初始化学习页面
 */
const initLearningPage = async () => {
  const { courseId, lessonId } = route.params;

  // 初始化认证状态
  if (!authStore.isAuthenticated) {
    await authStore.init();
  }

  // 加载课时数据
  const lessonData = await courseStore.loadLessonData(courseId, lessonId);
  if (!lessonData) {
    router.back();
    return;
  }

  // 初始化学习状态
  learningStore.initLearning(lessonData);

  // 聚焦输入框 - 使用nextTick确保DOM更新完成
  nextTick(() => {
    focusInput();
  });
};

// 监听路由参数变化，重新初始化学习页面
watch(
  () => [route.params.courseId, route.params.lessonId],
  async ([newCourseId, newLessonId]) => {
    if (newCourseId && newLessonId) {
      await initLearningPage();
    }
  },
  { immediate: false }
);

/**
 * 返回上一页
 */
const goBack = () => {
  router.back();
};

/**
 * 聚焦隐藏输入框
 */
const focusInput = () => {
  nextTick(() => {
    if (hiddenInputRef.value) {
      try {
        // 聚焦输入框
        hiddenInputRef.value.focus();
        
        // 对于移动设备，触发click事件有助于调起键盘
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        hiddenInputRef.value.dispatchEvent(clickEvent);
      } catch (error) {
        console.error('聚焦输入框失败:', error);
      }
    }
  });
};

/**
 * 处理键盘高度变化，调整滚动位置
 */
const handleKeyboardResize = () => {
  // 延迟执行，确保键盘完全弹出
  setTimeout(() => {
    learningStore.scrollToCurrentSentence();
  }, 100);
};

/**
 * 组件挂载生命周期钩子
 */
onMounted(async () => {
  // 初始化学习页面
  await initLearningPage();

  // 点击内容区聚焦输入框
  contentRef.value.addEventListener("click", focusInput);
  contentRef.value.addEventListener("touchstart", focusInput);

  // 添加窗口大小变化监听，用于处理键盘弹出/收起
  window.addEventListener("resize", handleKeyboardResize);

  // 监听输入事件，在用户输入时调整滚动位置
  hiddenInputRef.value?.addEventListener("input", handleKeyboardResize);
});

/**
 * 组件卸载生命周期钩子
 */
onUnmounted(() => {
  // 清理事件监听
  if (contentRef.value) {
    contentRef.value.removeEventListener("click", focusInput);
    contentRef.value.removeEventListener("touchstart", focusInput);
  }

  // 重置学习状态
  learningStore.reset();
});
</script>

<style scoped>
.learning-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
