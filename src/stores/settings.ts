// settings.ts - 与 Web 端完全一致的扁平式设置管理
import { ref, computed } from 'vue'

// 默认设置值
const defaultSettings = {
  theme: 'light',
  fontFamily: 'system',
  phoneticSize: 'medium',
  autoNextAfterCorrect: true,
  ignoreCase: true,
  inputBoxStyle: 'word-length',
  autoShowAnswer: 'never',
  requirePunctuation: true,
  requireSpace: true,
  playbackSpeed: 1.0,
  playbackCount: 1,
  playbackInterval: 0,
  loopCourse: false,
  hideAnswer: false,
  autoSkipNext: false,
  speakingDisplayMode: 'english',
  keypressSound: true,
  autoPlayAudio: true,
  pronunciationType: 1,
  showChinese: true,
  defaultShowEnglish: true,
  defaultShowName: true,
  fontSize: 16,
  mute: false,
  vibration: true
}

// 响应式设置对象
const settings = ref({ ...defaultSettings })
const loading = ref(false)
const error = ref('')
const isInitialized = ref(false)

// 从本地存储加载
function loadFromLocal() {
  try {
    console.log('[Settings] 开始从本地存储加载设置...')
    const saved = uni.getStorageSync('settings')
    console.log('[Settings] 本地存储内容:', saved)
    if (saved && typeof saved === 'object') {
      console.log('[Settings] 合并设置前的默认值:', defaultSettings)
      console.log('[Settings] 合并设置前的saved:', saved)
      settings.value = { ...defaultSettings, ...saved }
      console.log('[Settings] 加载本地设置成功，当前设置:', settings.value)
    } else {
      console.log('[Settings] 本地存储为空或无效，使用默认设置')
      settings.value = { ...defaultSettings }
    }
  } catch (e) {
    console.error('[Settings] 加载失败:', e)
    settings.value = { ...defaultSettings }
  }
}

// 保存到本地存储
function saveToLocal() {
  try {
    uni.setStorageSync('settings', settings.value)
  } catch (e) {
    console.error('[Settings] 保存失败:', e)
  }
}

// 初始化
function init() {
  console.log('[Settings] init()函数被调用')
  loadFromLocal()
  isInitialized.value = true
  console.log('[Settings] 准备调用applyTheme()')
  applyTheme()
  console.log('[Settings] init()完成')
}

// 应用主题 - 整个小程序变色
function applyTheme() {
  console.log('[Settings] applyTheme函数被调用')
  const theme = settings.value.theme
  console.log('[Settings] 当前主题设置:', theme)
  let isDark = false
  
  if (theme === 'dark') {
    isDark = true
    console.log('[Settings] 主题设置为深色模式')
  } else if (theme === 'system') {
    const systemInfo = uni.getSystemInfoSync()
    console.log('[Settings] 系统主题:', systemInfo.theme)
    isDark = systemInfo.theme === 'dark'
    console.log('[Settings] 跟随系统主题，isDark:', isDark)
  } else {
    console.log('[Settings] 主题设置为浅色模式')
  }
  
  console.log('[Settings] 最终isDark:', isDark, '准备应用主题')
  
  // 设置导航栏颜色
  if (isDark) {
    console.log('[Settings] 设置深色导航栏颜色')
    try {
      uni.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#0f172a'
      })
      console.log('[Settings] 导航栏颜色设置成功（深色）')
    } catch (err) {
      console.error('[Settings] 导航栏颜色设置失败（深色）:', err)
    }
    
    // 设置状态栏背景色
    try {
      uni.setBackgroundColor({
        backgroundColor: '#0f172a'
      })
      console.log('[Settings] 状态栏背景色设置成功（深色）')
    } catch (err) {
      console.error('[Settings] 状态栏背景色设置失败（深色）:', err)
    }
  } else {
    console.log('[Settings] 设置浅色导航栏颜色')
    try {
      uni.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
      console.log('[Settings] 导航栏颜色设置成功（浅色）')
    } catch (err) {
      console.error('[Settings] 导航栏颜色设置失败（浅色）:', err)
    }
    
    try {
      uni.setBackgroundColor({
        backgroundColor: '#f8fafc'
      })
      console.log('[Settings] 状态栏背景色设置成功（浅色）')
    } catch (err) {
      console.error('[Settings] 状态栏背景色设置失败（浅色）:', err)
    }
  }
   
  // 通知所有页面主题已变化
  const themeToEmit = isDark ? 'dark' : 'light'
  console.log('[Settings] 发布主题变化事件:', themeToEmit)
  uni.$emit('themeChange', themeToEmit)
  console.log('[Settings] 主题应用完成')
}

// 是否深色模式
const isDark = computed(() => {
  const theme = settings.value.theme
  if (theme === 'dark') {
    return true
  } else if (theme === 'system') {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.theme === 'dark'
  }
  return false
})

// 页面样式
const pageStyle = computed(() => {
  if (isDark.value) {
    return {
      backgroundColor: '#0f172a',
      color: '#f1f5f9'
    }
  }
  return {
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  }
})

// 更新设置
function updateSettings(newSettings: any) {
  console.log('[Settings] updateSettings被调用，新设置:', newSettings)
  console.log('[Settings] 更新前的设置:', settings.value)
  settings.value = { ...settings.value, ...newSettings }
  console.log('[Settings] 更新后的设置:', settings.value)
  console.log('[Settings] 开始保存到本地存储...')
  saveToLocal()
  
  if (newSettings.theme !== undefined) {
    console.log('[Settings] 检测到主题变化，调用applyTheme')
    applyTheme()
  }
}

// 获取单个设置
function getSetting(key) {
  return settings.value[key]
}

// 设置单个设置项
function setSetting(key, value) {
  settings.value[key] = value
  saveToLocal()
  
  if (key === 'theme') {
    applyTheme()
  }
}

// 重置为默认设置
function resetToDefaults() {
  settings.value = { ...defaultSettings }
  saveToLocal()
  applyTheme()
}

// 导出设置 store
export const useSettingsStore = () => {
  if (!isInitialized.value) {
    init()
  }
  
  return {
    // 状态
    settings,
    loading,
    error,
    isDark,
    pageStyle,
    isInitialized,
    
    // 方法
    init,
    applyTheme,
    updateSettings,
    getSetting,
    setSetting,
    resetToDefaults
  }
}

export type SettingsStore = ReturnType<typeof useSettingsStore>
