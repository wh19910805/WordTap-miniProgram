// useTheme.ts - 主题 composable
import { ref } from 'vue'

// 深色主题的 CSS 变量值
const darkVars = {
  '--bg-primary': '#0f172a',
  '--bg-surface': '#1e293b',
  '--text-primary': '#f8fafc',
  '--text-secondary': '#cbd5e1',
  '--text-tertiary': '#64748b',
  '--border': '#334155',
  '--hover': '#334155',
  '--primary': '#818cf8',
  '--primary-light': '#a5b4fc',
  '--primary-dark': '#6366f1',
  '--accent': '#a3e635',
  '--accent-light': '#bef264',
  '--accent-dark': '#84cc16',
  '--error': '#fb7185',
  '--success': '#34d399',
  '--warning': '#fbbf24',
  '--shadow-md': 'none',
}

// 浅色主题的 CSS 变量值
const lightVars = {
  '--bg-primary': '#f8fafc',
  '--bg-surface': '#ffffff',
  '--text-primary': '#0f172a',
  '--text-secondary': '#475569',
  '--text-tertiary': '#94a3b8',
  '--border': '#e2e8f0',
  '--hover': '#f1f5f9',
  '--primary': '#6366f1',
  '--primary-light': '#818cf8',
  '--primary-dark': '#4f46e5',
  '--accent': '#84cc16',
  '--accent-light': '#a3e635',
  '--accent-dark': '#65a30d',
  '--error': '#f43f5e',
  '--success': '#10b981',
  '--warning': '#f59e0b',
  '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

export function useTheme() {
  const isDark = ref(false)
  const themeVars = ref<Record<string, string>>({ ...lightVars })
  
  // 读取主题设置并应用
  function applyThemeFromStorage() {
    try {
      const stored = uni.getStorageSync('settings')
      let dark = false
      
      if (stored && typeof stored === 'object') {
        const theme = stored.theme || 'light'
        if (theme === 'dark') {
          dark = true
        } else if (theme === 'system') {
          const systemInfo = uni.getSystemInfoSync()
          dark = systemInfo.theme === 'dark'
        }
      }
      
      isDark.value = dark
      themeVars.value = dark ? { ...darkVars } : { ...lightVars }
      
      // 设置导航栏颜色
      if (dark) {
        uni.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#1e293b'
        })
        uni.setBackgroundColor({
          backgroundColor: '#0f172a',
          backgroundColorTop: '#0f172a',
          backgroundColorBottom: '#0f172a'
        })
      } else {
        uni.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#ffffff'
        })
        uni.setBackgroundColor({
          backgroundColor: '#f8fafc',
          backgroundColorTop: '#f8fafc',
          backgroundColorBottom: '#f8fafc'
        })
      }
      
      // 设置底部 tabbar 颜色
      uni.setTabBarStyle({
        backgroundColor: dark ? '#1e293b' : '#ffffff',
        borderStyle: 'white'
      }).catch(() => {})
    } catch (e) {
      console.error('读取主题设置失败:', e)
    }
  }
  
  // 初始化时应用主题
  applyThemeFromStorage()
  
  return {
    isDark,
    themeVars,
    applyThemeFromStorage
  }
}
