<template>
  <view class="settings-page" :class="{ 'dark': isDark }" :style="pageThemeStyle">
    <!-- 顶部导航栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <image src="/static/images/left.png" class="back-icon" mode="aspectFit" />
        </view>
        <view class="title-area">
          <text class="title">{{ settingTitle }}</text>
        </view>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view class="content-area" scroll-y>
      <!-- 外观设置 -->
      <view v-if="settingType === 'appearance'" class="settings-section">
        <!-- 主题设置 -->
        <view class="setting-card">
          <text class="setting-title">主题设置</text>
          <view class="button-group">
            <view 
              class="theme-btn"
              :class="{ active: settings.theme === 'light' }"
              @click="updateSetting('theme', 'light')"
            >
              <text>浅色</text>
            </view>
            <view 
              class="theme-btn"
              :class="{ active: settings.theme === 'dark' }"
              @click="updateSetting('theme', 'dark')"
            >
              <text>深色</text>
            </view>
            <view 
              class="theme-btn"
              :class="{ active: settings.theme === 'system' }"
              @click="updateSetting('theme', 'system')"
            >
              <text>跟随系统</text>
            </view>
          </view>
        </view>

        <!-- 字体设置 -->
        <view class="setting-card">
          <text class="setting-title">字体设置</text>
          <view class="option-list">
            <view 
              class="option-item"
              :class="{ active: settings.fontFamily === 'system' }"
              @click="updateSetting('fontFamily', 'system')"
            >
              <text>系统默认字体</text>
              <view v-if="settings.fontFamily === 'system'" class="check-icon">
                <text>✓</text>
              </view>
            </view>
            <view 
              class="option-item"
              :class="{ active: settings.fontFamily === 'fredoka' }"
              @click="updateSetting('fontFamily', 'fredoka')"
            >
              <text>Fredoka</text>
              <view v-if="settings.fontFamily === 'fredoka'" class="check-icon">
                <text>✓</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 音标大小 -->
        <view class="setting-card">
          <text class="setting-title">音标大小</text>
          <view class="button-group">
            <view 
              class="phonetic-btn"
              :class="{ active: settings.phoneticSize === 'small' }"
              @click="updateSetting('phoneticSize', 'small')"
            >
              <text class="phonetic-text small">/helǝʊ/</text>
              <text class="phonetic-label">小</text>
            </view>
            <view 
              class="phonetic-btn"
              :class="{ active: settings.phoneticSize === 'medium' }"
              @click="updateSetting('phoneticSize', 'medium')"
            >
              <text class="phonetic-text medium">/helǝʊ/</text>
              <text class="phonetic-label">中</text>
            </view>
            <view 
              class="phonetic-btn"
              :class="{ active: settings.phoneticSize === 'large' }"
              @click="updateSetting('phoneticSize', 'large')"
            >
              <text class="phonetic-text large">/hɛləʊ/</text>
              <text class="phonetic-label">大</text>
            </view>
          </view>
        </view>

        <!-- 预览文本 - 与 Web 端一致 -->
        <view class="setting-card">
          <text class="setting-title">预览文本</text>
          <view class="preview-text" :style="{ fontFamily: settings.fontFamily === 'fredoka' ? 'Fredoka, sans-serif' : 'system-ui, sans-serif' }">
            <text>你好,世界! Hello, World!</text>
          </view>
        </view>

        <!-- 声音设置 -->
        <view class="setting-card">
          <text class="setting-title">声音</text>
          <view class="option-list">
            <view class="option-item">
              <text>打字音效</text>
              <switch 
                :checked="settings.keypressSound"
                @change="(e) => updateSetting('keypressSound', e.detail.value)"
                :color="themeState['--primary-color']"
              />
            </view>
            <view class="option-item">
              <text>自动播放音频</text>
              <switch 
                :checked="settings.autoPlayAudio"
                @change="(e) => updateSetting('autoPlayAudio', e.detail.value)"
                color="#6366f1"
              />
            </view>
          </view>
          <view class="option-group">
            <text class="option-label">发音类型</text>
            <view class="button-group">
              <view 
                class="pronunciation-btn"
                :class="{ active: settings.pronunciationType === 1 }"
                @click="updateSetting('pronunciationType', 1)"
              >
                <text>英音</text>
              </view>
              <view 
                class="pronunciation-btn"
                :class="{ active: settings.pronunciationType === 2 }"
                @click="updateSetting('pronunciationType', 2)"
              >
                <text>美音</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 答题设置 -->
      <view v-else-if="settingType === 'answering'" class="settings-section">
        <view class="setting-card">
          <view class="option-item">
            <text>答题正确后自动下一题</text>
            <switch 
              :checked="settings.autoNextAfterCorrect"
              @change="(e) => updateSetting('autoNextAfterCorrect', e.detail.value)"
              :color="themeState['--primary-color']"
            />
          </view>
          <view class="divider"></view>
          <view class="option-item">
            <text>忽略大小写</text>
            <switch 
              :checked="settings.ignoreCase"
              @change="(e) => updateSetting('ignoreCase', e.detail.value)"
              color="#6366f1"
            />
          </view>
          <view class="divider"></view>
          <view class="option-item">
            <text>需要输入标点符号</text>
            <switch 
              :checked="settings.requirePunctuation"
              @change="(e) => updateSetting('requirePunctuation', e.detail.value)"
              color="#6366f1"
            />
          </view>
          <view class="divider"></view>
          <view class="option-item">
            <text>需要输入空格</text>
            <switch 
              :checked="settings.requireSpace"
              @change="(e) => updateSetting('requireSpace', e.detail.value)"
              color="#6366f1"
            />
          </view>
          <view class="divider"></view>
          <view class="option-group">
            <text class="option-label">答题输入框样式</text>
            <picker 
              mode="selector" 
              :range="inputBoxStyles" 
              :value="inputBoxStyles.indexOf(settings.inputBoxStyle)"
              @change="(e) => updateSetting('inputBoxStyle', inputBoxStyles[e.detail.value])"
            >
              <view class="picker-btn">
                <text>{{ inputBoxStyleLabels[settings.inputBoxStyle] }}</text>
                <text>›</text>
              </view>
            </picker>
          </view>
          <view class="divider"></view>
          <view class="option-group">
            <text class="option-label">自动显示答案</text>
            <picker 
              mode="selector" 
              :range="autoShowAnswerOptions" 
              :value="autoShowAnswerOptions.indexOf(settings.autoShowAnswer)"
              @change="(e) => updateSetting('autoShowAnswer', autoShowAnswerOptions[e.detail.value])"
            >
              <view class="picker-btn">
                <text>{{ autoShowAnswerLabels[settings.autoShowAnswer] }}</text>
                <text>›</text>
              </view>
            </picker>
          </view>
          <view class="divider"></view>
          <view class="option-group">
            <text class="option-label">显示</text>
            <view class="option-list">
              <view class="option-item">
                <text>默认显示中文</text>
                <switch 
                  :checked="settings.showChinese"
                  @change="(e) => updateSetting('showChinese', e.detail.value)"
                  color="#6366f1"
                />
              </view>
              <view class="option-item">
                <text>默认显示英文</text>
                <switch 
                  :checked="settings.defaultShowEnglish"
                  @change="(e) => updateSetting('defaultShowEnglish', e.detail.value)"
                  color="#6366f1"
                />
              </view>
              <view class="option-item">
                <text>默认显示人名</text>
                <switch 
                  :checked="settings.defaultShowName"
                  @change="(e) => updateSetting('defaultShowName', e.detail.value)"
                  color="#6366f1"
                />
              </view>
            </view>
          </view>
          <view class="divider"></view>
          <view class="option-group">
            <view class="slider-header">
              <text>字体大小</text>
              <text class="slider-value">{{ settings.fontSize }}px</text>
            </view>
            <slider 
              :value="settings.fontSize" 
              min="14" 
              max="24" 
              step="1"
              activeColor="#6366f1"
              @change="(e) => updateSetting('fontSize', e.detail.value)"
            />
          </view>
        </view>
      </view>

      <!-- 播放设置 -->
      <view v-else-if="settingType === 'playback'" class="settings-section">
        <view class="setting-card">
          <view class="option-group">
            <view class="slider-header">
              <text>倍速</text>
              <text class="slider-value">{{ settings.playbackSpeed }}x</text>
            </view>
            <slider 
              :value="settings.playbackSpeed" 
              min="0.5" 
              max="2" 
              step="0.25"
              activeColor="#6366f1"
              @change="(e) => updateSetting('playbackSpeed', e.detail.value)"
            />
          </view>
          <view class="divider"></view>
          <view class="option-group">
            <view class="slider-header">
              <text>播放次数</text>
              <text class="slider-value">{{ settings.playbackCount }}次</text>
            </view>
            <slider 
              :value="settings.playbackCount" 
              min="1" 
              max="5" 
              step="1"
              activeColor="#6366f1"
              @change="(e) => updateSetting('playbackCount', e.detail.value)"
            />
          </view>
          <view class="divider"></view>
          <view class="option-group">
            <view class="slider-header">
              <text>播放间隔</text>
              <text class="slider-value">{{ settings.playbackInterval }}秒</text>
            </view>
            <slider 
              :value="settings.playbackInterval" 
              min="0" 
              max="5" 
              step="0.5"
              activeColor="#6366f1"
              @change="(e) => updateSetting('playbackInterval', e.detail.value)"
            />
          </view>
          <view class="divider"></view>
          <view class="option-item">
            <text>课程循环播放</text>
            <switch 
              :checked="settings.loopCourse"
              @change="(e) => updateSetting('loopCourse', e.detail.value)"
              color="#6366f1"
            />
          </view>
          <view class="divider"></view>
          <view class="option-item">
            <text>隐藏答案</text>
            <switch 
              :checked="settings.hideAnswer"
              @change="(e) => updateSetting('hideAnswer', e.detail.value)"
              color="#6366f1"
            />
          </view>
          <view class="divider"></view>
          <view class="option-item">
            <text>自动跳到下一题</text>
            <switch 
              :checked="settings.autoSkipNext"
              @change="(e) => updateSetting('autoSkipNext', e.detail.value)"
              color="#6366f1"
            />
          </view>
        </view>
      </view>

      <!-- 听力设置 -->
      <view v-else-if="settingType === 'listening'" class="settings-section">
        <view class="setting-card">
          <text class="empty-text">暂无设置项</text>
        </view>
      </view>

      <!-- 口语设置 -->
      <view v-else-if="settingType === 'speaking'" class="settings-section">
        <view class="setting-card">
          <text class="setting-title">显示模式</text>
          <view class="speaking-modes">
            <view 
              class="speaking-mode-item"
              :class="{ active: settings.speakingDisplayMode === 'english' }"
              @click="updateSetting('speakingDisplayMode', 'english')"
            >
              <view class="mode-radio">
                <view v-if="settings.speakingDisplayMode === 'english'" class="radio-checked"></view>
              </view>
              <view class="mode-content">
                <text class="mode-title">显示英文</text>
                <text class="mode-desc">看英文原句,练习朗读发音</text>
              </view>
              <view v-if="settings.speakingDisplayMode === 'english'" class="mode-check">
                <text>✓</text>
              </view>
            </view>
            
            <view 
              class="speaking-mode-item"
              :class="{ active: settings.speakingDisplayMode === 'chinese' }"
              @click="updateSetting('speakingDisplayMode', 'chinese')"
            >
              <view class="mode-radio">
                <view v-if="settings.speakingDisplayMode === 'chinese'" class="radio-checked"></view>
              </view>
              <view class="mode-content">
                <text class="mode-title">显示中文</text>
                <text class="mode-desc">看中文翻译,练习口语翻译</text>
              </view>
              <view v-if="settings.speakingDisplayMode === 'chinese'" class="mode-check">
                <text>✓</text>
              </view>
            </view>
            
            <view 
              class="speaking-mode-item"
              :class="{ active: settings.speakingDisplayMode === 'blind' }"
              @click="updateSetting('speakingDisplayMode', 'blind')"
            >
              <view class="mode-radio">
                <view v-if="settings.speakingDisplayMode === 'blind'" class="radio-checked"></view>
              </view>
              <view class="mode-content">
                <text class="mode-title">盲读模式</text>
                <text class="mode-desc">不显示任何提示,挑战记忆</text>
              </view>
              <view v-if="settings.speakingDisplayMode === 'blind'" class="mode-check">
                <text>✓</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject, reactive } from 'vue'
import Icon from '@/components/icon.vue'
import { useSettingsStore } from '@/stores/settings'
import { onLoad, onShow } from '@dcloudio/uni-app'

const settingsStore = useSettingsStore()
const statusBarHeight = ref(20)

// 获取全局主题状态
const themeState = inject('themeState', reactive({ isDark: false, backgroundColor: '#f8fafc', color: '#0f172a' }))

// 页面主题样式 - 使用全局主题状态
const pageThemeStyle = computed(() => ({
  backgroundColor: themeState.backgroundColor,
  color: themeState.color,
  '--background-color': themeState['--background-color'],
  '--surface-color': themeState['--surface-color'],
  '--text-primary': themeState['--text-primary'],
  '--text-secondary': themeState['--text-secondary'],
  '--border-color': themeState['--border-color'],
  '--hover-color': themeState['--hover-color'],
  '--primary-color': themeState['--primary-color'],
}))

// 直接从 store 读取设置（已经是响应式 ref）
const isDark = computed(() => settingsStore.isDark.value)
const pageStyle = computed(() => settingsStore.pageStyle.value)
const settings = computed(() => settingsStore.settings.value)

// 获取设置类型
const getSettingType = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  
  // 在 UniApp 中，页面参数可能在不同位置
  // 尝试多种方式获取
  let type = null
  
  // 方式1: 直接从 currentPage 获取
  if (currentPage.type) {
    type = currentPage.type
  }
  // 方式2: 从 options 获取
  else if (currentPage.options && currentPage.options.type) {
    type = currentPage.options.type
  }
  // 方式3: 从 $page 获取
  else if (currentPage.$page && currentPage.$page.options && currentPage.$page.options.type) {
    type = currentPage.$page.options.type
  }
  // 方式4: 从 URL 解析（如果存在）- 小程序环境手动解析
  else if (currentPage.__route__) {
    const queryString = currentPage.__route__.split('?')[1] || ''
    type = parseQueryString(queryString).type
  }
  
  console.log('获取到的 type:', type)
  return type || 'appearance'
}

const settingType = ref(getSettingType())
console.log('settingType:', settingType.value)

// 解析查询字符串 - 小程序环境兼容
function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {}
  if (!queryString) return params
  
  const pairs = queryString.split('&')
  pairs.forEach(pair => {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })
  return params
}

// 设置标题映射
const settingTitles: Record<string, string> = {
  appearance: '外观设置',
  answering: '答题设置',
  playback: '播放设置',
  listening: '听力设置',
  speaking: '口语设置'
}

const settingTitle = computed(() => settingTitles[settingType.value] || '设置')

// 设置数据 - 已在顶部定义安全版本

// 输入框样式选项
const inputBoxStyles = ['word-length', 'fixed', 'auto']
const inputBoxStyleLabels: Record<string, string> = {
  'word-length': '单词长度',
  'fixed': '固定宽度',
  'auto': '自动宽度'
}

// 自动显示答案选项
const autoShowAnswerOptions = ['never', 'after-3-errors', 'after-5-errors']
const autoShowAnswerLabels: Record<string, string> = {
  'never': '从不',
  'after-3-errors': '错误3次后',
  'after-5-errors': '错误5次后'
}

// 更新设置
function updateSetting(key: string, value: any) {
  console.log('[Settings] updateSetting called:', key, value)
  settingsStore.updateSettings({ [key]: value })
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// UniApp 页面生命周期 - 获取页面参数
onLoad((options: any) => {
  console.log('onLoad options:', options)
  if (options && options.type) {
    settingType.value = options.type
    console.log('从 onLoad 设置 settingType:', settingType.value)
  }
})

onShow(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  // 如果 settingType 还是默认值，尝试从页面栈获取
  if (!settingType.value || settingType.value === 'appearance') {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    console.log('页面栈获取的当前页面:', currentPage)
    
    // 尝试从路由路径中解析参数 - 小程序环境手动解析
    if (currentPage && currentPage.route) {
      const routeParts = currentPage.route.split('?')
      if (routeParts.length > 1) {
        const params = parseQueryString(routeParts[1])
        const typeFromUrl = params.type
        if (typeFromUrl) {
          settingType.value = typeFromUrl
          console.log('从 URL 解析设置 settingType:', settingType.value)
        }
      }
    }
  }
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
}

/* 深色模式样式覆盖 */
.settings-page.dark {
  --background-color: #0f172a;
  --surface-color: #1e293b;
  --border-color: #334155;
  --hover-color: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
}

/* 头部 */
.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-3);
  /* 确保触控目标足够大 */
  min-width: 44px;
  min-height: 44px;
}

.back-btn text {
  font-size: 20px;
  color: var(--text-primary);
}

.back-icon {
  width: 24px;
  height: 24px;
}

.title-area {
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.placeholder {
  width: 40px;
}

/* 内容区 */
.content-area {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-card {
  background: var(--surface-color);
  border-radius: 16px;
  padding: 16px;
}

.setting-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 12px;
}

.theme-btn, .pronunciation-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;
}

.theme-btn.active, .pronunciation-btn.active {
  background: var(--primary-color);
  color: #fff;
}

/* 音标大小按钮 */
.phonetic-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: var(--surface-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.phonetic-btn.active {
  background: var(--primary-color);
}

.phonetic-btn.active .phonetic-text,
.phonetic-btn.active .phonetic-label {
  color: #fff;
}

.phonetic-text {
  color: var(--text-primary);
}

.phonetic-text.small {
  font-size: 12px;
}

.phonetic-text.medium {
  font-size: 14px;
}

.phonetic-text.large {
  font-size: 16px;
}

.phonetic-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 预览文本 - 与 Web 端一致 */
.preview-text {
  padding: 12px;
  background: var(--hover-color);
  border-radius: 12px;
  font-size: 16px;
  color: var(--text-primary);
}

/* 选项列表 */
.option-list {
  display: flex;
  flex-direction: column;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-primary);
}

.option-item + .option-item {
  border-top: 1px solid var(--border-color);
}

.option-item.active {
  color: var(--primary-color);
}

.check-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon text {
  color: #fff;
  font-size: 12px;
}

/* 选项组 */
.option-group {
  padding-top: 12px;
}

.option-label {
  display: block;
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: var(--border-color);
  margin: 0 -16px;
}

/* 选择器按钮 */
.picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--hover-color);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text-primary);
}

/* 滑块 */
.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.slider-value {
  color: var(--primary-color);
  font-weight: 600;
}

/* 空状态 */
.empty-text {
  color: var(--text-tertiary);
  text-align: center;
  padding: 24px;
}

/* 口语模式选择 - 与 Web 端一致 */
.speaking-modes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.speaking-mode-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  transition: all 0.2s;
}

.speaking-mode-item.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: #fff;
}

.mode-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.speaking-mode-item.active .mode-radio {
  border-color: #fff;
}

.radio-checked {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
}

.speaking-mode-item.active .radio-checked {
  background: #fff;
}

.mode-content {
  flex: 1;
}

.mode-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.mode-desc {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
}

.speaking-mode-item.active .mode-desc {
  color: rgba(255, 255, 255, 0.8);
}

.mode-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
}
</style>