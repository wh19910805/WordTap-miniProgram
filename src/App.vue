<template>
  <view class="app" :class="themeClass" :style="themeStyles">
    <router-view />
    <CustomTabbar v-if="isTabBarPage" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, reactive } from 'vue';
import { onShow } from "@dcloudio/uni-app";
import { useAuthStore, useTabStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";
import CustomTabbar from '@/components/tabbar.vue';

// 使用 tab store
const tabStore = useTabStore()
const settingsStore = useSettingsStore()

// 全局主题状态 - 使用provide共享给所有子页面
const themeState = reactive({
  isDark: false,
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  // 所有CSS变量
  '--background-color': '#f8fafc',
  '--surface-color': '#ffffff',
  '--text-primary': '#0f172a',
  '--text-secondary': '#475569',
  '--text-tertiary': '#94a3b8',
  '--border-color': '#e2e8f0',
  '--hover-color': '#f1f5f9',
  '--primary-color': '#6366f1',
  '--primary-light': '#818cf8',
  '--accent-color': '#84cc16',
  '--error-color': '#f43f5e',
  '--success-color': '#10b981',
  '--warning-color': '#f59e0b',
})

// 提供全局主题状态
provide('themeState', themeState)

// 当前是否是tabBar页面
const currentPath = ref('')

// 主题 class
const themeClass = ref('')

// 主题样式 - 直接设置背景色和文字颜色（确保生效）
const themeStyles = computed(() => {
  const isDark = themeClass.value === 'dark'
  if (isDark) {
    return {
      backgroundColor: '#0f172a',
      color: '#f1f5f9',
      '--background-color': '#0f172a',
      '--surface-color': '#1e293b',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#94a3b8',
    }
  }
  return {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    '--background-color': '#f8fafc',
    '--surface-color': '#ffffff',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
  }
})

// 是否显示自定义tabBar
const isTabBarPage = computed(() => tabStore.tabBarPages.includes(currentPath.value))

function checkShowTabBar() {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    currentPath.value = '/' + currentPage.route
    console.log('[App] 当前路径:', currentPath.value)
    // 更新 tab store
    tabStore.updateCurrentIndex()
  }
}

// 监听主题变化
function handleThemeChange(theme: string) {
  console.log('========================================')
  console.log('[App] handleThemeChange被调用，主题:', theme)
  const isDark = theme === 'dark'
  console.log('[App] isDark:', isDark)
  
  // 更新 themeClass
  themeClass.value = isDark ? 'dark' : ''
  console.log('[App] themeClass更新为:', themeClass.value)
  
  // 更新全局主题状态
  themeState.isDark = isDark
  themeState.backgroundColor = isDark ? '#0f172a' : '#f8fafc'
  themeState.color = isDark ? '#f1f5f9' : '#0f172a'
  // 更新所有CSS变量
  themeState['--background-color'] = isDark ? '#0f172a' : '#f8fafc'
  themeState['--surface-color'] = isDark ? '#1e293b' : '#ffffff'
  themeState['--text-primary'] = isDark ? '#f1f5f9' : '#0f172a'
  themeState['--text-secondary'] = isDark ? '#94a3b8' : '#475569'
  themeState['--text-tertiary'] = isDark ? '#64748b' : '#94a3b8'
  themeState['--border-color'] = isDark ? '#334155' : '#e2e8f0'
  themeState['--hover-color'] = isDark ? '#334155' : '#f1f5f9'
  themeState['--primary-color'] = isDark ? '#818cf8' : '#6366f1'
  themeState['--primary-light'] = isDark ? '#a5b4fc' : '#818cf8'
  themeState['--accent-color'] = isDark ? '#a3e635' : '#84cc16'
  themeState['--error-color'] = isDark ? '#fb7185' : '#f43f5e'
  themeState['--success-color'] = isDark ? '#34d399' : '#10b981'
  themeState['--warning-color'] = isDark ? '#fbbf24' : '#f59e0b'
  console.log('[App] 全局主题状态已更新')
  
  // 微信小程序中设置导航栏颜色
  // #ifdef MP-WEixin
  console.log('[App] 微信小程序环境，设置导航栏颜色')
  // 设置导航栏颜色
  if (isDark) {
    uni.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#0f172a'
    })
    uni.setBackgroundColor({
      backgroundColor: '#0f172a'
    })
  } else {
    uni.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    })
    uni.setBackgroundColor({
      backgroundColor: '#f8fafc'
    })
  }
  // #endif
  
  // H5 通过 documentElement class 控制主题
  // #ifdef H5
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }
  // #endif
}

// 立即设置主题变化监听（在setup中立即执行）
uni.$on('themeChange', handleThemeChange)

onMounted(() => {
  console.log('[App] App.vue组件挂载')
  checkShowTabBar()
  
  // settings store 初始化（事件监听已在setup中立即执行）
  console.log('[App] 初始化settings store')
  settingsStore.init()
  console.log('[App] settings store初始化完成')
  
  const authStore = useAuthStore()
  console.log('[App] 初始化auth store')
  authStore.init()
  console.log('[App] auth store初始化完成')
  
  console.log('[App] App.vue初始化完成')
});

onUnmounted(() => {
  uni.$off('themeChange', handleThemeChange)
});

onShow(() => {
  checkShowTabBar()
});
</script>

<style>
/* 引入字体图标样式 */
@import '@/static/style/iconfont.css';

/* 全局字体图标设置 */
.iconfont {
  font-family: "iconfont" !important;
  display: inline-block;
  line-height: 1;
  color: inherit;
}

/* WordTap 微信小程序全局样式 - Gen Z Flat Design */

/* ========== 全局页面背景色（通过类名切换） ========== */
page {
  background-color: var(--background-color, #f8fafc);
  color: var(--text-primary, #0f172a);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ========== CSS 变量定义 ========== */
/* CSS变量定义在page上 */
page {
  /* 主色调 - 鲜艳靛蓝 (Web端一致) */
  --primary-color: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --primary-bg: #eef2ff;
  
  /* 强调色 - 活力青柠绿 (Web端一致) */
  --accent-color: #84cc16;
  --accent-light: #a3e635;
  --accent-dark: #65a30d;
  --accent-bg: #f7fee7;
  
  /* 背景和表面颜色 (Web端一致) */
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  
  /* 边框和悬停色 (Web端一致) */
  --border-color: #e2e8f0;
  --border-light: #f1f5f9;
  --hover-color: #f1f5f9;
  
  /* 状态色 - 高饱和度 (Web端一致) */
  --error-color: #f43f5e;
  --error-bg: #fef2f2;
  --success-color: #10b981;
  --success-bg: #f0fdf4;
  --warning-color: #f59e0b;
  --warning-bg: #fffbeb;
  
  /* 文字颜色 - 清晰对比 (Web端一致) */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --text-disabled: #cbd5e1;
  
  /* Gen Z 辅助色 (Web端一致) */
  --genz-pink: #ec4899;
  --genz-cyan: #06b6d4;
  --genz-purple: #8b5cf6;
  --genz-orange: #f97316;
  
  /* 阴影系统 - 柔和阴影 (Gen Z Flat Design) */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);
  
  /* 圆角系统 - 统一圆角 16px (Web端一致) */
  --radius-xs: 8px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 22px;
  --radius-2xl: 28px;
  --radius-full: 9999px;
  
  /* 间距系统 - 4pt 基准 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  
  /* 触控反馈 */
  --tap-highlight: rgba(99, 102, 241, 0.1);
  --tap-active: rgba(99, 102, 241, 0.15);
  
  /* 层级系统 */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal: 400;
  --z-toast: 500;
  
  /* 基础设置 */
  width: 100%;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ========== 全局重置 ========== */
view, text, button, input, textarea, scroll-view {
  box-sizing: border-box;
}

/* 按钮基础样式 - 去掉默认样式 */
button {
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  font-size: inherit;
  line-height: inherit;
}

button::after {
  border: none;
}

/* ========== 全局动画 ========== */

/* 按下反馈 - 缩放效果 */
.press-effect {
  transition: transform 0.1s ease-out, opacity 0.1s ease-out;
}

.press-effect:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* 卡片悬停效果（桌面端用） */
@media (hover: hover) {
  .card-hover:hover {
    transform: translateY(-2px);
    border-color: var(--primary-color);  /* 与 Web 端一致 */
  }
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页面切换动画 */
.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 弹性动画 */
.bounce-in {
  animation: bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 上滑动画 */
.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 呼吸动画 - 用于重要按钮 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

/* 骨架屏加载动画 */
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, var(--border-light) 25%, var(--border-color) 50%, var(--border-light) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-md);
}

/* 交互动效类 - 更细腻的点击反馈 */
.press-scale {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.press-scale:active {
  transform: scale(0.96);
  opacity: 0.85;
}

/* 按钮悬停效果（桌面端用） */
@media (hover: hover) {
  .btn-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

/* 卡片悬停效果（桌面端用） */
@media (hover: hover) {
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

/* ========== 通用组件样式 ========== */

/* 通用卡片 - 使用柔和阴影 */
.card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card-elevated {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-4);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

/* 色块卡片 - 用于统计卡片 */
.block-card {
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.block-card-primary {
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  color: #ffffff;
}

.block-card-accent {
  background: linear-gradient(135deg, var(--accent-light), var(--accent-color));
  color: #ffffff;
}

.block-card-subtle {
  background: var(--primary-bg);
}

/* 触控区域 */
.touch-area {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--tap-highlight);
  transition: background 0.15s ease;
}

.touch-area:active {
  background: rgba(0, 0, 0, 0.08);
}

/* 标签/徽章 */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.badge-primary {
  background: var(--primary-bg);
  color: var(--primary-color);
}

.badge-accent {
  background: var(--accent-bg);
  color: var(--accent-dark);
}

.badge-neutral {
  background: var(--border-light);
  color: var(--text-secondary);
}

/* 确保 app 容器正确 */
.app {
  width: 100%;
  min-height: 100vh;
}

/* ========== 全局样式优化 ========== */
/* 平滑过渡效果 */
page {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 按钮点击反馈优化 */
button, .btn, [role="button"] {
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
}

button:active, .btn:active {
  transform: scale(0.97);
}

/* 输入框聚焦效果 */
input, textarea {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* 列表项平滑过渡 */
view[class*="item"], view[class*="card"], view[class*="section"] {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* ========== 深色模式变量 ========== */
page.dark {
  /* 背景和表面颜色 - 深色 */
  --background-color: #0f172a;
  --surface-color: #1e293b;
  
  /* 边框和悬停色 - 深色 */
  --border-color: #334155;
  --border-light: #1e293b;
  --hover-color: #334155;
  
  /* 文字颜色 - 深色模式 */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-disabled: #475569;
  
  /* 主色调背景 - 深色适配 */
  --primary-color: #818cf8;  /* 深色模式使用更亮的主色 */
  --primary-light: #a5b4fc;  /* 深色模式使用更亮的主色变体 */
  --primary-bg: rgba(99, 102, 241, 0.2);
  --accent-color: #a3e635;  /* 深色模式使用更亮的青柠绿 */
  --accent-light: #d9f99d;  /* 深色模式使用更亮的强调色变体 */
  --accent-bg: rgba(163, 230, 53, 0.2);
  
  /* 状态色背景 - 深色适配 */
  --error-bg: rgba(244, 63, 94, 0.15);
  --success-bg: rgba(16, 185, 129, 0.15);
  --warning-bg: rgba(245, 158, 11, 0.15);
  
  /* 阴影 - 深色模式调整 */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
  
  /* 触控反馈 - 深色适配 */
  --tap-highlight: rgba(99, 102, 241, 0.3);
  --tap-active: rgba(99, 102, 241, 0.4);
}

/* ========== app.dark 深色模式变量 ========== */
/* 用于微信小程序，因为 themeClass 添加到 .app 容器上 */
.app.dark {
  /* 背景和表面颜色 - 深色 */
  --background-color: #0f172a;
  --surface-color: #1e293b;
  
  /* 边框和悬停色 - 深色 */
  --border-color: #334155;
  --border-light: #1e293b;
  --hover-color: #334155;
  
  /* 文字颜色 - 深色模式 */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-disabled: #475569;
  
  /* 主色调背景 - 深色适配 */
  --primary-color: #818cf8;  /* 深色模式使用更亮的主色 */
  --primary-light: #a5b4fc;  /* 深色模式使用更亮的主色变体 */
  --primary-bg: rgba(99, 102, 241, 0.2);
  --accent-color: #a3e635;  /* 深色模式使用更亮的青柠绿 */
  --accent-light: #d9f99d;  /* 深色模式使用更亮的强调色变体 */
  --accent-bg: rgba(163, 230, 53, 0.2);
  
  /* 状态色背景 - 深色适配 */
  --error-bg: rgba(244, 63, 94, 0.15);
  --success-bg: rgba(16, 185, 129, 0.15);
  --warning-bg: rgba(245, 158, 11, 0.15);
  
  /* 阴影 - 深色模式调整 */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
  
  /* 触控反馈 - 深色适配 */
  --tap-highlight: rgba(99, 102, 241, 0.3);
  --tap-active: rgba(99, 102, 241, 0.4);
}

/* ========== 安全区域 ========== */
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
