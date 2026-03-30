<template>
  <view class="learning-page" :style="pageThemeStyle">
    <!-- 顶部导航区 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <Icon name="arrow-left" size="lg" color="var(--text-primary)" />
        </view>
        <view class="progress">
          <text>{{ currentLessonIndex + 1 }} / {{ totalLessons }}</text>
        </view>
        <view class="lesson-title">
          <text>{{ lessonTitle }}</text>
        </view>
      </view>
    </view>

    <!-- 内容交互区 -->
    <scroll-view 
      class="content-area" 
      scroll-y 
      :scroll-top="scrollTopValue"
      scroll-with-animation="true"
      @click="focusInput"
      @touchstart="focusInput"
      @scroll="handleScroll"
      :style="{ height: contentAreaHeight + 'px' }"
      id="content-scroll-view"
    >
      <!-- 句子列表 - 使用 transform 实现滚动 -->
      <view 
        class="sentences-list"
        :style="{ transform: `translateY(${translateY}px)`, transition: 'transform 0.3s ease' }"
      >
        <view
          v-for="(sentence, index) in sentences"
          :key="sentence.id"
          :id="'sentence-' + index"
          :class="['sentence-card', { active: index === currentSentenceIndex }]"
        >
          <!-- 中文释义 -->
          <view v-if="showChinese && sentence.translate" class="chinese-translate">
            {{ sentence.translate }}
          </view>

          <!-- 英文句子显示 -->
          <view class="sentence-text" :style="{ fontSize: fontSize + 'px' }">
            <template v-for="(word, wordIndex) in splitSentenceToParts(sentence.text)" :key="wordIndex">
              <!-- 空格 -->
              <template v-if="isSpace(word)">
                <text :class="getSpaceClass(index, getCharIndex(sentence.text, wordIndex))">
                  {{ getSpaceDisplay(index, getCharIndex(sentence.text, wordIndex)) }}
                </text>
              </template>
              <!-- 标点符号 -->
              <template v-else-if="isPunctuation(word)">
                <text :class="getPunctuationClass(index, getCharIndex(sentence.text, wordIndex))">
                  {{ getPunctuationDisplay(index, getCharIndex(sentence.text, wordIndex)) }}
                </text>
              </template>
              <!-- 单词 -->
              <template v-else>
                <view
                  class="word-group"
                  @click="handleWordClick(index, wordIndex, word)"
                >
                  <text
                    v-for="(char, charIndex) in word"
                    :key="charIndex"
                    :class="getCharClass(index, getCharIndex(sentence.text, wordIndex) + charIndex, char)"
                  >
                    {{ getCharDisplay(index, getCharIndex(sentence.text, wordIndex) + charIndex, char) }}
                  </text>
                </view>
              </template>
            </template>
          </view>

          <!-- 音标 -->
          <view v-if="sentence.soundmark" class="soundmark">
            音标：{{ sentence.soundmark }}
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作区 -->
    <view class="bottom-bar">
      <!-- 错误提示 -->
      <view v-if="validationErrors.length > 0" class="error-tip">
        <text class="error-title">发现以下错误：</text>
        <text v-for="(error, idx) in validationErrors" :key="idx" class="error-text">
          {{ error.message }}
        </text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <!-- 左侧：重播、重新开始 -->
        <view class="left-buttons">
          <view class="btn-icon" @click="replayAudio" title="重播当前音频">
            <Icon name="volume" size="lg" color="var(--text-secondary)" />
          </view>
          <view class="btn-icon primary" @click="handleRestart" title="重新学习本课">
            <Icon name="refresh" size="lg" color="#fff" />
          </view>
        </view>

        <!-- 右侧：跳过、提交 -->
        <view class="right-buttons">
          <view class="btn-icon" @click="handleSkip" title="跳过当前课时">
            <Icon name="skip-forward" size="lg" color="var(--text-secondary)" />
          </view>
          <view class="btn-submit" @click="handleSubmit" title="提交完成学习">
            <Icon name="check" size="lg" color="#fff" />
          </view>
        </view>
      </view>
    </view>

    <!-- 输入框 - 用于捕获用户输入 -->
    <input
      ref="hiddenInputRef"
      type="text"
      :focus="inputFocused"
      :value="userInput"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      class="hidden-input"
      confirm-type="done"
      :confirm-hold="true"
      :cursor-spacing="120"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, getCurrentInstance, inject, reactive } from 'vue'
import Icon from '@/components/icon.vue'
import { useLearningStore, useCourseStore, useAuthStore } from '@/stores'
import { useSettingsStore } from '@/stores/settings'

// Scroll-view 内部容器的引用
let scrollViewRef: any = null

const learningStore = useLearningStore()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// 获取全局主题状态
const themeState = inject('themeState', reactive({ isDark: false, backgroundColor: '#f8fafc', color: '#0f172a' }))

// 页面主题样式 - 应用所有CSS变量
const pageThemeStyle = computed(() => ({
  backgroundColor: themeState.backgroundColor,
  color: themeState.color,
  '--background-color': themeState['--background-color'],
  '--surface-color': themeState['--surface-color'],
  '--text-primary': themeState['--text-primary'],
  '--text-secondary': themeState['--text-secondary'],
  '--text-tertiary': themeState['--text-tertiary'],
  '--border-color': themeState['--border-color'],
  '--hover-color': themeState['--hover-color'],
  '--primary-color': themeState['--primary-color'],
  '--primary-light': themeState['--primary-light'],
  '--accent-color': themeState['--accent-color'],
  '--error-color': themeState['--error-color'],
  '--success-color': themeState['--success-color'],
  '--warning-color': themeState['--warning-color'],
}))

// 音频播放功能
const audioContext = ref<any>(null)
const isPlaying = ref(false)

// 从 settings store 读取设置（直接访问 ref.value）
const pronunciationType = computed(() => {
  const value = settingsStore.settings.value?.pronunciationType || 2
  console.log('[Learning] 读取pronunciationType设置:', value, '原始值:', settingsStore.settings.value?.pronunciationType)
  return value
})

const fontSize = computed(() => {
  const value = settingsStore.settings.value?.fontSize || 16
  console.log('[Learning] 读取fontSize设置:', value, '原始值:', settingsStore.settings.value?.fontSize)
  return value
})

const autoNextAfterCorrect = computed(() => {
  const value = settingsStore.settings.value?.autoNextAfterCorrect ?? true
  console.log('[Learning] 读取autoNextAfterCorrect设置:', value, '原始值:', settingsStore.settings.value?.autoNextAfterCorrect)
  return value
})

const playbackSpeed = computed(() => {
  const value = settingsStore.settings.value?.playbackSpeed || 1.0
  console.log('[Learning] 读取playbackSpeed设置:', value, '原始值:', settingsStore.settings.value?.playbackSpeed)
  return value
})

const playbackCount = computed(() => {
  const value = settingsStore.settings.value?.playbackCount || 1
  console.log('[Learning] 读取playbackCount设置:', value, '原始值:', settingsStore.settings.value?.playbackCount)
  return value
})

const playbackInterval = computed(() => {
  const value = settingsStore.settings.value?.playbackInterval || 0
  console.log('[Learning] 读取playbackInterval设置:', value, '原始值:', settingsStore.settings.value?.playbackInterval)
  return value
})

/**
 * 获取有道词典发音 URL
 * @param text 要发音的文本（单词或句子）
 * @returns 有道词典 API URL
 */
function getPronunciationUrl(text: string): string {
  if (!text) return ''
  
  // 处理文本：移除中文
  let processedText = text.trim().replace(/[\u4e00-\u9fa5]/g, '')
  
  // 限制文本长度
  if (processedText.length > 500) {
    processedText = processedText.substring(0, 500)
  }
  
  if (!processedText) return ''
  
  // URL 编码
  const encodedText = encodeURIComponent(processedText)
  
  // 有道词典 API
  // type=1: 英音
  // type=2: 美音
  return `https://dict.youdao.com/dictvoice?type=${pronunciationType.value}&audio=${encodedText}`
}

/**
 * 播放单词发音
 */
function handlePlayWordSound(word: string) {
  if (!word || word.trim() === '') return
  
  const pronunciationUrl = getPronunciationUrl(word)
  console.log('播放单词发音:', word, pronunciationUrl)
  
  playAudio(pronunciationUrl)
}

/**
 * 播放当前句子发音
 */
const playCurrentLineAudio = () => {
  const currentSentence = sentences.value[currentSentenceIndex.value]
  if (!currentSentence) return
  
  let sentenceText = currentSentence.text
  if (!sentenceText) return
  
  // 移除人名前缀（如 MR. BLAKE:）
  sentenceText = sentenceText.replace(/^[A-Z][a-zA-Z]*\.?\s*[:：]/i, '')
  sentenceText = sentenceText.trim()
  
  const pronunciationUrl = getPronunciationUrl(sentenceText)
  console.log('播放句子发音:', sentenceText, pronunciationUrl)
  
  playAudio(pronunciationUrl)
}

function initAudio() {
  if (!audioContext.value) {
    audioContext.value = uni.createInnerAudioContext()
    // 设置音频类型
    audioContext.value.audioType = 'audio/mp3'
  }
}

function playAudio(url: string) {
  if (!url) {
    console.error('音频URL为空')
    uni.showToast({ title: '暂无音频', icon: 'none' })
    return
  }
  
  initAudio()
  
  // 停止当前播放
  if (isPlaying.value) {
    audioContext.value.stop()
  }
  
  // 应用播放速度设置
  console.log('[Learning] 应用播放设置 - 速度:', playbackSpeed.value, '次数:', playbackCount.value, '间隔:', playbackInterval.value)
  audioContext.value.playbackRate = playbackSpeed.value
  console.log('[Learning] 设置音频playbackRate为:', audioContext.value.playbackRate)
  audioContext.value.src = url
  
  audioContext.value.onPlay(() => {
    isPlaying.value = true
    console.log('开始播放音频:', url, '速度:', playbackSpeed.value)
  })
  
  audioContext.value.onError((error: any) => {
    console.error('音频播放失败:', error)
    isPlaying.value = false
    uni.showToast({ title: '音频播放失败', icon: 'none' })
  })
  
  audioContext.value.onEnded(() => {
    isPlaying.value = false
    console.log('音频播放结束')
    // 处理播放次数
    handlePlaybackCount()
  })
  
  audioContext.value.play()
}

// 处理播放次数
let currentPlaybackCount = 0
function handlePlaybackCount() {
  currentPlaybackCount++
  if (currentPlaybackCount < playbackCount.value) {
    // 延迟后再次播放
    setTimeout(() => {
      if (audioContext.value) {
        audioContext.value.play()
      }
    }, playbackInterval.value * 1000)
  } else {
    currentPlaybackCount = 0
  }
}

function stopAudio() {
  if (audioContext.value && isPlaying.value) {
    audioContext.value.stop()
    isPlaying.value = false
  }
}

function destroyAudio() {
  if (audioContext.value) {
    audioContext.value.destroy()
    audioContext.value = null
    isPlaying.value = false
  }
}

const statusBarHeight = ref(20)
const lessonTitle = ref('')
const sentences = ref<any[]>([])
const validationErrors = ref<any[]>([])
const inputFocused = ref(false)
const userInput = ref('')
const currentLessonIndex = ref(0)
const totalLessons = ref(0)
const currentCourseId = ref('') // 当前课程ID
const currentLessonId = ref('') // 当前课时ID
const scrollTopValue = ref(0) // scroll-view 的滚动位置
const scrollIntoViewId = ref('') // scroll-into-view 的目标 ID
const translateY = ref(0) // 使用 CSS transform 实现滚动
const hiddenInputRef = ref<any>(null) // 隐藏输入框的引用
const isSentenceSwitching = ref(false) // 句子切换锁，防止切换时处理旧输入
const maxInputLength = ref(0) // 当前句子允许的最大输入长度，用于过滤旧输入
const previousSentenceIndex = ref(0) // 之前的句子索引，用于判断滚动方向
const contentAreaHeight = ref(300) // scroll-view 的高度
const isSubmitting = ref(false) // 是否正在提交

// 计算属性
const showChinese = computed(() => settingsStore.settings.value?.showChinese ?? true)
const currentSentenceIndex = computed(() => learningStore.currentSentenceIndex || 0)

// 标点符号正则
const punctuationRegex = /[.,!?;:'"()\[\]{}\-—–…。，！？；：""''（）【】《》]/
const spaceRegex = /\s/

const isPunctuation = (char: string) => punctuationRegex.test(char)
const isSpace = (char: string) => spaceRegex.test(char)

// 将句子分割为单词、空格和标点
const splitSentenceToParts = (sentence: string) => {
  if (!sentence) return []
  const parts = sentence.match(/\w+|[\s,.!?;:'"()\[\]{}\-—–…。，！？；：""''（）【】《》]/g) || []
  return parts
}

// 获取单词在句子中的字符索引
const getCharIndex = (sentence: string, wordIndex: number) => {
  const parts = splitSentenceToParts(sentence)
  let charIndex = 0
  for (let i = 0; i < wordIndex; i++) {
    charIndex += parts[i]?.length || 0
  }
  return charIndex
}

// 获取字符样式类
const getCharClass = (sentenceIndex: number, charIndex: number, correctChar: string) => {
  const progress = learningStore.sentenceProgress[sentenceIndex] || { userInput: '', charIndex: -1 }
  const { userInput: userText, completed } = progress

  const isCurrentSentence = sentenceIndex === currentSentenceIndex.value
  const isPreviousSentence = sentenceIndex < currentSentenceIndex.value
  
  // 对于之前的句子，如果已完成显示正确/错误颜色，否则显示待处理
  if (isPreviousSentence) {
    if (completed) {
      // 检查该字符是否正确输入
      const userChar = userText[charIndex]
      if (userChar !== undefined) {
        const shouldIgnoreCase = settingsStore.settings.value?.ignoreCase ?? true
        const isCorrect = shouldIgnoreCase
          ? userChar?.toLowerCase() === correctChar.toLowerCase()
          : userChar === correctChar
        return isCorrect ? 'text-correct' : 'text-incorrect'
      }
      return 'text-correct' // 已完成但该字符未输入（可能是标点/空格自动填充）
    }
    return 'text-pending' // 未完成的之前句子
  }

  // 检查是否显示英文
  const isShowEnglish = settingsStore.settings.value?.defaultShowEnglish ?? settingsStore.settings.value?.showEnglish ?? true

  // 检查字符是否被提示
  const isHinted = learningStore.isCharHinted(sentenceIndex, charIndex)

  const userChar = userText[charIndex]
  const isCharEntered = userChar !== undefined

  // 当前句子：已输入字符标记对错
  if (isCharEntered) {
    const shouldIgnoreCase = settingsStore.settings.value?.ignoreCase ?? true
    const isCorrect = shouldIgnoreCase
      ? userChar?.toLowerCase() === correctChar.toLowerCase()
      : userChar === correctChar
    return isCorrect ? 'text-correct' : 'text-incorrect'
  }

  // 显示英文或被提示的字符：显示提示颜色
  if (isShowEnglish || isHinted) {
    return 'text-gray'
  }

  // 未输入字符：显示灰色
  return 'text-pending'
}

// 获取字符显示内容
const getCharDisplay = (sentenceIndex: number, charIndex: number, correctChar: string) => {
  const progress = learningStore.sentenceProgress[sentenceIndex] || { userInput: '', charIndex: -1 }
  const { userInput: userText, completed } = progress
  const userChar = userText[charIndex]

  const isCurrentSentence = sentenceIndex === currentSentenceIndex.value
  const isPreviousSentence = sentenceIndex < currentSentenceIndex.value
  const isSentenceCompleted = completed || isPreviousSentence

  // 已输入字符
  if (isSentenceCompleted || userChar !== undefined) {
    if (userChar !== undefined) {
      return userChar === ' ' ? ' ' : userChar
    }
    return correctChar === ' ' ? ' ' : correctChar
  }

  // 显示英文或被提示的字符：显示正确字符
  const isShowEnglish = settingsStore.settings.value?.defaultShowEnglish ?? settingsStore.settings.value?.showEnglish ?? true
  const isHinted = learningStore.isCharHinted(sentenceIndex, charIndex)
  
  if (isShowEnglish || isHinted) {
    return correctChar === ' ' ? ' ' : correctChar
  }

  // 未输入字符：显示下划线
  return '_'
}

// 获取空格样式类
const getSpaceClass = (sentenceIndex: number, charIndex: number) => {
  const progress = learningStore.sentenceProgress[sentenceIndex] || { userInput: '', charIndex: -1 }
  const { charIndex: currentCharIndex } = progress

  const isEntered = charIndex <= currentCharIndex || sentenceIndex < currentSentenceIndex.value

  if (settingsStore.settings.value?.requireSpace) {
    return isEntered ? 'text-correct' : 'text-pending'
  } else {
    return 'text-gray'
  }
}

// 获取空格显示内容
const getSpaceDisplay = (sentenceIndex: number, charIndex: number) => {
  return ' '
}

// 获取标点符号样式类
const getPunctuationClass = (sentenceIndex: number, charIndex: number) => {
  const sentence = sentences.value[sentenceIndex]
  if (!sentence) return 'text-gray'
  const correctChar = sentence.text[charIndex]

  const progress = learningStore.sentenceProgress[sentenceIndex] || { userInput: '', charIndex: -1 }
  const { userInput: userText, completed } = progress

  const isCurrentSentence = sentenceIndex === currentSentenceIndex.value
  const isPreviousSentence = sentenceIndex < currentSentenceIndex.value
  
  // 对于之前的句子，如果已完成显示正确/错误颜色，否则显示待处理
  if (isPreviousSentence) {
    if (completed) {
      // 检查该字符是否正确输入
      const userChar = userText[charIndex]
      if (userChar !== undefined) {
        return userChar === correctChar ? 'text-correct' : 'text-incorrect'
      }
      return 'text-correct' // 已完成但该字符未输入（可能是自动填充）
    }
    return 'text-pending' // 未完成的之前句子
  }

  const userChar = userText[charIndex]
  const isCharEntered = userChar !== undefined

  // 当前句子：已输入字符标记对错
  if (isCharEntered) {
    return userChar === correctChar ? 'text-correct' : 'text-incorrect'
  }

  // 未输入字符：显示灰色（标点符号不显示下划线）
  return 'text-gray'
}

// 获取标点符号显示内容
const getPunctuationDisplay = (sentenceIndex: number, charIndex: number) => {
  const sentence = sentences.value[sentenceIndex]
  if (!sentence) return ''
  return sentence.text[charIndex]
}

// 事件处理
const handleWordClick = (sentenceIndex: number, wordIndex: number, word: string) => {
  const sentence = sentences.value[sentenceIndex]
  if (!sentence) return

  const currentIdx = currentSentenceIndex.value
  
  // 禁止通过点击切换到上一行（只能通过退格键回退）
  if (sentenceIndex < currentIdx) {
    console.log('禁止通过点击切换到上一行')
    return
  }
  
  // 只允许点击当前句子或下一行
  if (sentenceIndex > currentIdx) {
    // 点击下一行时，不允许直接跳转（必须通过输入完成当前行）
    console.log('禁止通过点击跳转到下一行')
    return
  }
  
  // 当前句子的点击：播放单词发音
  handlePlayWordSound(word)
  
  // 聚焦输入框
  inputFocused.value = true
  
  // 延迟执行，确保 DOM 更新
  setTimeout(() => {
    inputFocused.value = true
  }, 100)

  // 如果关闭显示英文开关，则显示单词（标记为已提示）
  if (!settingsStore.settings.value?.defaultShowEnglish && !settingsStore.settings.value?.showEnglish) {
    // 计算单词在句子中的起始和结束位置
    const parts = splitSentenceToParts(sentence.text)
    let startIndex = 0
    for (let i = 0; i < wordIndex; i++) {
      startIndex += parts[i]?.length || 0
    }
    const endIndex = startIndex + word.length
    
    // 标记单词为已提示（显示）- 这里需要在 learningStore 中添加相应方法
    // 暂时直接设置显示状态
    if (!learningStore.hintedChars[sentenceIndex]) {
      learningStore.hintedChars[sentenceIndex] = {}
    }
    for (let i = startIndex; i < endIndex; i++) {
      learningStore.hintedChars[sentenceIndex][i] = true
    }
  }

  // 播放单词语音（需要实现音频播放功能）
  // handlePlayWordSound(word)
}

const handleInput = (event: any) => {
  // UniApp 小程序中，input 事件的值在 event.detail.value
  const inputValue = event.detail.value
  
  const currentSentenceIdx = learningStore.currentSentenceIndex || 0
  const currentSentence = sentences.value[currentSentenceIdx]
  if (!currentSentence) return

  const sentenceText = currentSentence.text
  
  // 获取当前句子的进度
  let progress = learningStore.sentenceProgress[currentSentenceIdx]
  
  // 如果没有进度，初始化
  if (!progress) {
    learningStore.updateSentenceProgress(currentSentenceIdx, '', -1)
    // 重新获取 progress
    progress = learningStore.sentenceProgress[currentSentenceIdx]
  }
  
  // 如果句子已完成，跳过处理
  if (progress.completed) {
    // 句子已完成但输入框还有值，说明是旧输入，直接清空
    if (inputValue.length > 0) {
      console.log('句子已完成，清空输入框')
      userInput.value = ''
    }
    return
  }
  
  // 计算新增的字符数
  const currentInput = progress.userInput || ''
  const lengthDiff = inputValue.length - currentInput.length
  
  console.log('handleInput:', { inputValue, currentInput, lengthDiff })
  
  if (lengthDiff > 0) {
    // 新增字符
    // 获取当前输入的字符数
    const currentCharIndex = progress.charIndex
    const nextCharIndex = currentCharIndex + 1
    
    // 检查是否还有字符需要输入
    if (nextCharIndex >= sentenceText.length) {
      // 句子已输入完毕，不需要再处理输入
      console.log('句子已输入完毕')
      return
    }
    
    // 获取当前应该输入的字符
    const correctChar = sentenceText[nextCharIndex]
    if (!correctChar) {
      console.log('正确字符不存在')
      return
    }
    
    console.log('处理字符, nextCharIndex:', nextCharIndex, 'correctChar:', correctChar)
    // 新增字符
    const newChar = inputValue[inputValue.length - 1] // 只取最后一个字符
    
    // 处理标点符号自动填充
    if (isPunctuation(correctChar) && !settingsStore.settings.value?.requirePunctuation) {
      const newInput = currentInput + correctChar
      learningStore.updateSentenceProgress(currentSentenceIdx, newInput, nextCharIndex)
      userInput.value = newInput
      
      console.log('自动填充标点:', correctChar)
      
      // 检查是否完成句子
      if (nextCharIndex >= sentenceText.length - 1) {
        handleSentenceComplete(currentSentenceIdx)
      }
    }
    // 处理空格自动填充
    else if (isSpace(correctChar) && !settingsStore.settings.value?.requireSpace) {
      const newInput = currentInput + correctChar
      learningStore.updateSentenceProgress(currentSentenceIdx, newInput, nextCharIndex)
      userInput.value = newInput
      
      console.log('自动填充空格')
      
      // 检查是否完成句子
      if (nextCharIndex >= sentenceText.length - 1) {
        handleSentenceComplete(currentSentenceIdx)
      }
    }
    // 处理普通字符
    else {
      const newInput = currentInput + newChar
      learningStore.updateSentenceProgress(currentSentenceIdx, newInput, nextCharIndex)
      
      // 检查是否正确
      const isCorrect = settingsStore.settings.value?.ignoreCase
        ? newChar.toLowerCase() === correctChar.toLowerCase()
        : newChar === correctChar
      
      if (!isCorrect && settingsStore.settings.value?.vibration) {
        uni.vibrateShort()
      }
      
      userInput.value = newInput
      
      console.log('处理字符:', newChar, '正确字符:', correctChar, 'isCorrect:', isCorrect)
      
      // 检查是否完成句子
      if (nextCharIndex >= sentenceText.length - 1) {
        handleSentenceComplete(currentSentenceIdx)
      }
    }
  } else if (lengthDiff < 0) {
    // 删除字符
    console.log('处理删除')
    
    // 先调用 store 的 handleBackspace
    learningStore.handleBackspace()
    
    // 检查是否需要跳转到上一句
    // 获取更新后的当前句子索引和进度
    const newSentenceIdx = learningStore.currentSentenceIndex
    const newProgress = learningStore.sentenceProgress[newSentenceIdx]
    
    // 如果当前句子没有字符了（userInput 为空），跳转到上一句
    if (newSentenceIdx > 0 && (!newProgress || !newProgress.userInput || newProgress.userInput.length === 0)) {
      console.log('当前句子已清空，跳转到上一句')
      
      const prevIdx = newSentenceIdx - 1
      const prevProgress = learningStore.sentenceProgress[prevIdx]
      
      learningStore.currentSentenceIndex = prevIdx
      
      if (prevProgress) {
        // 如果上一句已完成，需要重新设置 charIndex 以允许删除
        if (prevProgress.completed) {
          prevProgress.completed = false
          // 重新计算 charIndex：基于实际输入的字符数
          // charIndex 应该指向下一个要输入的位置，但允许删除到位置 0
          prevProgress.charIndex = Math.max(0, prevProgress.userInput.length - 1)
        }
        userInput.value = prevProgress.userInput
      } else {
        userInput.value = ''
      }
      
      // 滚动到上一句并聚焦
      nextTick(() => {
        scrollToCurrentSentence()
        inputFocused.value = true
      })
      
      return
    }
    
    // 同步输入框值
    userInput.value = newProgress?.userInput || ''
  } else {
    // 长度相同，直接同步
    userInput.value = inputValue
  }
}

// 处理句子完成，跳转到下一句
const handleSentenceComplete = (sentenceIndex: number) => {
  console.log('句子完成，索引:', sentenceIndex)
  
  const currentSentence = sentences.value[sentenceIndex]
  const fullText = currentSentence?.text || ''
  
  // 使用 store 方法标记当前句子完成，传入完整文本
  learningStore.markSentenceComplete(sentenceIndex, fullText)
  
  // 立即清空输入框并设置切换锁
  userInput.value = ''
  isSentenceSwitching.value = true
  
  // 检查是否还有下一句
  if (sentenceIndex < sentences.value.length - 1) {
    const nextIdx = sentenceIndex + 1
    const nextSentence = sentences.value[nextIdx]
    
    // 设置新句子的最大允许输入长度
    if (nextSentence) {
      maxInputLength.value = nextSentence.text.length
      console.log('设置新句子最大输入长度:', maxInputLength.value)
    }
    
    // 如果设置了自动下一题，则跳转到下一句
    console.log('[Learning] 检查autoNextAfterCorrect设置:', autoNextAfterCorrect.value, '当前句子索引:', sentenceIndex)
    if (autoNextAfterCorrect.value) {
      // 立即更新当前句子索引
      learningStore.currentSentenceIndex = nextIdx
      
      // 延迟滚动、聚焦和重置切换锁
      setTimeout(() => {
        scrollToCurrentSentence()
        inputFocused.value = true
        setTimeout(() => {
          inputFocused.value = true
          // 重置切换锁，允许处理新输入
          isSentenceSwitching.value = false
          console.log('句子切换完成，重置切换锁')
        }, 100)
      }, 300)
    } else {
      // 不自动下一题，重置切换锁
      isSentenceSwitching.value = false
      // 显示提示
      uni.showToast({
        title: '请输入下一句',
        icon: 'none',
        duration: 1500
      })
    }
  } else {
    // 没有下一句，重置切换锁
    isSentenceSwitching.value = false
    maxInputLength.value = 0
  }
}

// 处理输入框获取焦点
const handleFocus = (event: any) => {
  console.log('输入框获取焦点:', event)
  inputFocused.value = true
}

// 处理输入框失去焦点
const handleBlur = (event: any) => {
  console.log('输入框失去焦点:', event)
  inputFocused.value = false
}

const processCharacter = (char: string, sentenceIndex: number, sentenceText: string) => {
  // 获取当前进度
  const progress = learningStore.sentenceProgress[sentenceIndex]
  
  // 如果句子已完成或没有进度，跳过处理
  if (!progress || progress.completed) {
    console.log('句子已完成或无进度，跳过:', sentenceIndex, progress?.completed)
    return
  }
  
  const currentCharIndex = progress.charIndex + 1
  
  // 检查索引是否越界
  if (currentCharIndex > sentenceText.length) {
    console.log('索引越界，忽略输入:', currentCharIndex, sentenceText.length)
    return
  }
  
  // 获取正确字符
  const correctChar = sentenceText[Math.min(currentCharIndex, sentenceText.length - 1)]
  
  console.log('processCharacter:', char, currentCharIndex, sentenceText.length, correctChar)
  
  // 检查字符是否正确
  const isCorrect = checkCharCorrect(char, correctChar)
  
  // 检查是否即将完成句子（在处理字符之前检查）
  const isLastChar = currentCharIndex >= sentenceText.length - 1
  
  // 处理标点符号
  if (isPunctuation(correctChar)) {
    if (!settingsStore.settings.value?.requirePunctuation) {
      // 自动填充标点
      const newInput = (progress.userInput || '') + correctChar
      learningStore.updateSentenceProgress(sentenceIndex, newInput, currentCharIndex)
      
      if (!isCorrect && settingsStore.settings.value?.vibration) {
        uni.vibrateShort()
      }
      
      // 检查是否完成
      if (isLastChar) {
        // 立即标记完成并跳转到下一句
        handleSentenceComplete(sentenceIndex)
      }
      return
    }
  }
  // 处理空格
  else if (isSpace(correctChar)) {
    if (!settingsStore.settings.value?.requireSpace) {
      // 自动填充空格
      const newInput = (progress.userInput || '') + correctChar
      learningStore.updateSentenceProgress(sentenceIndex, newInput, currentCharIndex)
      
      if (!isCorrect && settingsStore.settings.value?.vibration) {
        uni.vibrateShort()
      }
      
      // 检查是否完成
      if (isLastChar) {
        // 立即标记完成并跳转到下一句
        handleSentenceComplete(sentenceIndex)
      }
      return
    }
  }
  
  // 处理普通字符（需要用户输入的）
  const newInput = (progress.userInput || '') + char
  learningStore.updateSentenceProgress(sentenceIndex, newInput, currentCharIndex)
  
  if (!isCorrect && settingsStore.settings.value?.vibration) {
    uni.vibrateShort()
  }
  
  // 检查是否完成
  if (isLastChar) {
    // 立即标记完成并跳转到下一句
    handleSentenceComplete(sentenceIndex)
  }
}

const checkCharCorrect = (inputChar: string, correctChar: string): boolean => {
  // 如果 correctChar 为 undefined 或 null，返回 false
  if (!correctChar) return false
  
  const ignoreCase = settingsStore.settings.value?.ignoreCase ?? true
  
  if (ignoreCase) {
    return inputChar.toLowerCase() === correctChar.toLowerCase()
  }
  return inputChar === correctChar
}

// 处理键盘事件（小程序中通过 input 事件的 keyCode 判断）
const handleKeyDown = (event: any) => {
  console.log('键盘事件:', event)
  
  // 获取按键码
  const keyCode = event.detail.keyCode || event.keyCode || event.which
  console.log('按键码:', keyCode)
  
  // UniApp 小程序中，退格键的 keyCode 是 8
  if (keyCode === 8) {
    event.preventDefault()
    
    const currentIdx = learningStore.currentSentenceIndex
    const currentProgress = learningStore.sentenceProgress[currentIdx]
    
    console.log('当前句子索引:', currentIdx)
    console.log('当前句子进度:', currentProgress)
    
    // 如果当前句子有内容，正常删除
    if (currentProgress && currentProgress.userInput && currentProgress.userInput.length > 0) {
      console.log('删除当前句子的字符')
      learningStore.handleBackspace()
      userInput.value = learningStore.sentenceProgress[learningStore.currentSentenceIndex]?.userInput || ''
    }
    // 如果当前句子为空，跳转到上一句
    else if (currentIdx > 0) {
      console.log('跳转到上一句')
      // 跳转到上一句
      learningStore.currentSentenceIndex = currentIdx - 1
      
      // 获取上一句的输入
      const prevProgress = learningStore.sentenceProgress[currentIdx - 1]
      if (prevProgress && prevProgress.userInput) {
        // 删除上一句的最后一个字符
        learningStore.handleBackspace()
      }
      
      // 同步输入框值
      userInput.value = learningStore.sentenceProgress[learningStore.currentSentenceIndex]?.userInput || ''
      
      // 滚动到上一句
      setTimeout(() => {
        scrollToCurrentSentence()
      }, 100)
      
      // 聚焦输入框
      inputFocused.value = true
      setTimeout(() => {
        inputFocused.value = true
      }, 50)
    }
  }
}

const replayAudio = () => {
  // 使用有道词典 API 播放当前句子发音
  playCurrentLineAudio()
}

// 重新学习当前课时
const handleRestart = () => {
  // 显示确认对话框
  uni.showModal({
    title: '提示',
    content: '确定要重新学习当前课时吗？当前进度将被重置。',
    success: (res) => {
      if (res.confirm) {
        // 重置学习状态
        learningStore.initLearning()
        
        // 重置滚动位置
        translateY.value = 0
        previousSentenceIndex.value = 0
        scrollTopValue.value = 0
        
        // 重置输入框
        userInput.value = ''
        
        // 延迟聚焦，确保 DOM 更新
        setTimeout(() => {
          inputFocused.value = true
          
          // 再次聚焦确保键盘弹出
          setTimeout(() => {
            inputFocused.value = true
          }, 100)
        }, 50)
        
        uni.showToast({
          title: '已重新开始',
          icon: 'none'
        })
      }
    }
  })
}

// 验证所有句子并收集错词
function validateAllSentences() {
  const wrongWords: any[] = []
  let hasError = false

  if (!sentences.value || sentences.value.length === 0) {
    return { hasError: false, wrongWords: [] }
  }

  // 遍历所有句子进行验证
  sentences.value.forEach((sentence, index) => {
    const progress = learningStore.sentenceProgress[index]
    
    // 检查是否完成
    if (!progress || !progress.completed) {
      hasError = true
      return
    }

    const expectedText = sentence.text
    const actualText = progress.userInput || ''
    
    // 按空格分割单词
    const expectedWords = expectedText.split(/\s+/).filter((word: string) => word.length > 0)
    const actualWords = actualText.split(/\s+/).filter((word: string) => word.length > 0)

    // 检查输入长度
    if (actualText.length < expectedText.length) {
      hasError = true
      return
    }

    // 检查每个单词，只比较用户实际输入的单词
    for (let i = 0; i < Math.min(expectedWords.length, actualWords.length); i++) {
      // 移除标点符号，只比较字母部分
      const expectedWord = expectedWords[i].toLowerCase().replace(/[^a-zA-Z]/g, '')
      const actualWord = actualWords[i]?.toLowerCase().replace(/[^a-zA-Z]/g, '') || ''
      const userAnswer = actualWords[i] || ''

      if (expectedWord && actualWord !== expectedWord && userAnswer) {
        wrongWords.push({
          word: expectedWord,
          userAnswer: userAnswer,
          correctAnswer: expectedWords[i],
          sentenceIndex: index,
          sentence: sentence.text
        })
        hasError = true
      }
    }

    // 检查是否有遗漏的单词
    if (actualWords.length < expectedWords.length) {
      hasError = true
    }
  })

  return { hasError, wrongWords }
}

// 将错词添加到错题库
async function addWrongWordsToWordBook(wrongWords: any[]) {
  if (wrongWords.length === 0) return

  try {
    // 去重
    const uniqueWrongWords: any[] = []
    const wordSet = new Set()

    for (const wrongWord of wrongWords) {
      if (!wordSet.has(wrongWord.word)) {
        wordSet.add(wrongWord.word)
        uniqueWrongWords.push(wrongWord)
      }
    }

    // 逐个添加到错词库
    for (const wrongWord of uniqueWrongWords) {
      await uni.request({
        url: `http://localhost:8000/api/word-books/wrong-words`,
        method: 'POST',
        data: {
          word: wrongWord.word,
          question_type: 'learning',
          course_id: currentCourseId.value,
          lesson_id: currentLessonId.value,
          user_answer: wrongWord.userAnswer,
          correct_answer: wrongWord.correctAnswer,
          explanation: `学习内容: ${wrongWord.sentence}`
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        }
      })
    }

    console.log(`成功添加 ${uniqueWrongWords.length} 个错词到错题本`)
  } catch (error) {
    console.error('添加错词到错题本失败:', error)
  }
}

// 跳转到下一课时
const navigateToNextLesson = async () => {
  const lessons = courseStore.currentCourse?.lessons || []
  const currentIdx = lessons.findIndex((l: any) => l.id === currentLessonId.value)
  
  if (currentIdx < 0) {
    console.log('未找到当前课时')
    return null
  }
  
  // 确定下一课时
  let nextLesson
  if (currentIdx < lessons.length - 1) {
    // 有下一课时
    nextLesson = lessons[currentIdx + 1]
  } else {
    // 没有下一课时，循环到第一课时
    uni.showModal({
      title: '提示',
      content: '已是本课程最后一个课时，是否回到第一个课时？',
      success: (res) => {
        if (res.confirm) {
          nextLesson = lessons[0]
          navigateToLesson(nextLesson)
        }
      }
    })
    return
  }
  
  return nextLesson
}

// 跳转到指定课时
const navigateToLesson = (lesson: any) => {
  const url = `/pages/learning/index?courseId=${currentCourseId.value}&lessonId=${lesson.id}`
  uni.redirectTo({ url })
}

// 跳过当前课时
const handleSkip = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    const nextLesson = await navigateToNextLesson()
    if (nextLesson) {
      navigateToLesson(nextLesson)
    }
  } catch (error) {
    console.error('跳过课时失败:', error)
    uni.showToast({
      title: '跳过失败',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 提交当前课时
const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    // 1. 验证所有句子是否完成
    const allCompleted = sentences.value.every((sentence, index) => {
      const progress = learningStore.sentenceProgress[index]
      return progress && progress.completed
    })
    
    if (!allCompleted) {
      uni.showToast({
        title: '请完成所有句子',
        icon: 'none'
      })
      return
    }
    
    // 2. 验证并收集错词
    const { wrongWords } = validateAllSentences()
    
    // 3. 如果有错词，添加到错题库
    if (wrongWords.length > 0) {
      await addWrongWordsToWordBook(wrongWords)
    }
    
    console.log('提交学习记录, 错词数量:', wrongWords.length)
    
    // 4. 显示成功提示
    uni.showToast({
      title: wrongWords.length > 0 ? `完成！发现 ${wrongWords.length} 个错词` : '学习完成！',
      icon: 'success'
    })
    
    // 5. 延迟跳转到下一课时
    setTimeout(async () => {
      const nextLesson = await navigateToNextLesson()
      if (nextLesson) {
        navigateToLesson(nextLesson)
      } else {
        // 没有下一课时，返回课程详情页
        uni.navigateBack()
      }
    }, 1500)
  } catch (error) {
    console.error('提交失败', error)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const focusInput = () => {
  console.log('触发焦点获取')
  // 直接设置 focus 为 true，UniApp 会自动处理
  inputFocused.value = true
  
  // 延迟再次设置确保生效
  setTimeout(() => {
    inputFocused.value = true
  }, 100)
}

// 滚动到当前句子
const scrollToCurrentSentence = () => {
  console.log('scrollToCurrentSentence 被调用')
  
  const currentIdx = currentSentenceIndex.value
  const prevIdx = previousSentenceIndex.value
  console.log('当前句子索引:', currentIdx, '之前索引:', prevIdx)
  
  // 使用 CSS transform: translateY() 来实现滚动效果
  // 前进时向上滚动（translateY 减小），后退时向下滚动（translateY 增大）
  const SENTENCE_HEIGHT = 120 // 每个句子的高度
  const SCROLL_OFFSET = 50    // 偏移量
  
  // 计算目标 translateY 值
  // 目标：让当前句子显示在可视区域上方
  const targetTranslateY = currentIdx * SENTENCE_HEIGHT - SCROLL_OFFSET
  const finalTranslateY = Math.min(0, -targetTranslateY) // 确保是负数或0
  
  console.log('计算 translateY:', finalTranslateY)
  
  // 设置 transform 值（负值表示向上滚动）
  translateY.value = finalTranslateY
  console.log('设置 translateY:', translateY.value)
  
  // 同时也尝试设置 scrollTop 作为备用
  const targetScrollTop = Math.max(0, targetTranslateY)
  scrollTopValue.value = targetScrollTop
  
  // 更新之前的索引
  previousSentenceIndex.value = currentIdx
}

// 处理滚动事件
const handleScroll = (event: any) => {
  // 可以在这里处理滚动时的逻辑
  console.log('滚动位置:', event.detail.scrollTop)
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  // 获取课程和课时ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  const courseId = options.courseId
  const lessonId = options.lessonId

  // 保存到组件变量
  currentCourseId.value = courseId || ''
  currentLessonId.value = lessonId || ''

  if (courseId && lessonId) {
    // 重置学习状态，确保每个课时独立
    learningStore.initLearning()
    
    // 重置滚动位置
    translateY.value = 0
    previousSentenceIndex.value = 0
    
    // 先获取课程详情（包含 lessons 数组）
    await courseStore.fetchCourseDetail(courseId)
    
    // 获取当前课程的所有课时
    const lessons = courseStore.currentCourse?.lessons || []
    console.log('课程课时列表:', lessons)
    
    // 找到当前课时在课程中的位置
    const lessonIndexInCourse = lessons.findIndex((l: any) => l.id === lessonId)
    console.log('当前课时在课程中的位置:', lessonIndexInCourse)
    
    // 设置总课时数和当前课时索引
    totalLessons.value = lessons.length
    currentLessonIndex.value = lessonIndexInCourse >= 0 ? lessonIndexInCourse + 1 : 1
    
    // 加载课时数据
    const lessonData = await courseStore.fetchLessonDetail(lessonId)
    console.log('课时详情原始数据:', lessonData)
    
    if (lessonData) {
      lessonTitle.value = lessonData.title || ''
      
      // 尝试多种可能的数据结构
      let sentencesData: any[] = []
      let isObjectArray = false // 标记是否是对象数组
      
      // 方式1: content.sentences (后端API返回的数据格式)
      if (lessonData.content?.sentences) {
        sentencesData = lessonData.content.sentences
        // 检查是否是对象数组
        isObjectArray = sentencesData.length > 0 && typeof sentencesData[0] === 'object'
      }
      // 方式2: 直接是 sentences
      else if (lessonData.sentences) {
        sentencesData = lessonData.sentences
        isObjectArray = sentencesData.length > 0 && typeof sentencesData[0] === 'object'
      }
      // 方式3: content.lines (字符串数组)
      else if (lessonData.content?.lines) {
        sentencesData = lessonData.content.lines
      }
      // 方式4: 直接是 lines (字符串数组)
      else if (lessonData.lines) {
        sentencesData = lessonData.lines
      }
      // 方式5: content 是字符串数组
      else if (Array.isArray(lessonData.content)) {
        sentencesData = lessonData.content
      }
      
      console.log('解析到的句子数据:', sentencesData, '是否对象数组:', isObjectArray)
      
      if (sentencesData.length > 0) {
        if (isObjectArray) {
          // 对象数组格式：后端API返回 {chinese, english, soundmark}
          sentences.value = sentencesData.map((item: any, index: number) => ({
            id: `${lessonId}_${index}`,
            text: item.english?.trim() || '',      // 英文作为题目
            translate: item.chinese?.trim() || '', // 中文作为翻译
            soundmark: item.soundmark?.trim() || '' // 音标
          }))
        } else {
          // 字符串数组格式：直接使用字符串作为题目
          const filteredLines = sentencesData.filter((line: string) => line && line.trim() !== '')
          
          // 获取翻译数据
          const translates = lessonData.content?.textTranslate?.split('\n') || []
          
          sentences.value = filteredLines.map((line: string, index: number) => ({
            id: `${lessonId}_${index}`,
            text: line.trim(),
            translate: translates[index]?.trim() || '',
            soundmark: ''
          }))
        }
        
        console.log('处理后的句子列表:', sentences.value)
      } else {
        sentences.value = []
      }
    }
  }
  
  // 聚焦输入框，确保键盘能被调起
  setTimeout(() => {
    inputFocused.value = true
  }, 500)
  
  // 计算 scroll-view 的高度
  // 屏幕高度 - 状态栏高度 - 头部高度 - 底部操作栏高度
  const headerHeight = 44 + (systemInfo.statusBarHeight || 20)
  const bottomBarHeight = 80
  contentAreaHeight.value = systemInfo.windowHeight - headerHeight - bottomBarHeight
  console.log('scroll-view 高度:', contentAreaHeight.value, '屏幕高度:', systemInfo.windowHeight)
  
  // 监听系统键盘高度变化（UniApp 特有）
  uni.onKeyboardHeightChange((res) => {
    console.log('键盘高度变化:', res.height)
    // 键盘高度变化时，重新滚动到当前句子
    setTimeout(() => {
      scrollToCurrentSentence()
    }, 300)
  })
})

onUnmounted(() => {
  // 销毁音频上下文
  destroyAudio()
  
  // 清理键盘监听
  uni.offKeyboardHeightChange(() => {})
  
  // 重置学习状态
  learningStore.initLearning()
  
  // 重置滚动状态
  translateY.value = 0
  scrollTopValue.value = 0
  previousSentenceIndex.value = 0
})
</script>

<style scoped>
.learning-page {
  min-height: 100vh;
  width: 100%;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
}

/* 头部 */
.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--surface-color);
  z-index: var(--z-sticky);
}

.header-content {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-3);
  color: var(--primary-color);
}

.progress {
  background: var(--primary-color);
  color: #fff;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  font-size: 12px;
  font-weight: 600;
  margin-right: var(--space-3);
}

.lesson-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 内容区 */
.content-area {
  flex: 1;
  padding: var(--space-4);
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.sentences-list {
  display: flex;
  flex-direction: column;
}

.sentences-list > view {
  margin-bottom: var(--space-4);
}

.sentences-list > view:last-child {
  margin-bottom: 0;
}

.sentence-card {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  background: var(--surface-color);
  border: 2px solid transparent;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
  box-sizing: border-box;
  width: 100%;
  opacity: 0.5;
}

.sentence-card.active {
  opacity: 1;
  border: 2px solid var(--primary-color);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15), var(--shadow-md);
}

.chinese-translate {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: var(--space-3);
}

.sentence-text {
  font-size: 21px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.word-group {
  display: inline-flex;
  margin-right: var(--space-2);
  cursor: pointer;
}

.word-group:active {
  transform: scale(1.05);
}

.soundmark {
  margin-top: var(--space-3);
  font-size: 13px;
  color: var(--text-tertiary);
}

/* 字符样式 */
.text-correct {
  color: var(--success-color);
}

.text-incorrect {
  color: var(--error-color);
}

.text-pending {
  color: var(--text-tertiary);
}

.text-gray {
  color: var(--text-secondary);
}

.bottom-placeholder {
  height: 100px;
}

/* 底部操作区 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  flex-shrink: 0;
  background: var(--surface-color);
  padding: var(--space-3) var(--space-4);
  padding-bottom: calc(var(--space-3) + constant(safe-area-inset-bottom));
  padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
  z-index: var(--z-fixed);
}

.error-tip {
  background: var(--error-bg);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
}

.error-title {
  color: var(--error-color);
  font-weight: 600;
  font-size: 13px;
}

.error-text {
  color: var(--error-color);
  font-size: 12px;
  margin-top: var(--space-1);
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-buttons,
.right-buttons {
  display: flex;
  gap: var(--space-3);
}

.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.btn-icon.primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-submit {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--accent-color);
  color: var(--text-primary); /* 高亮背景上使用深色文字 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 隐藏输入框 */
.hidden-input {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  opacity: 0.01;
  z-index: -1;
}
</style>