<template>
  <view class="custom-tabbar">
    <view 
      v-for="(tab, index) in tabs" 
      :key="index"
      class="tabbar-item"
      :class="{ active: currentIndex === index }"
      @click="switchTab(tab, index)"
    >
      <!-- PNG图标 -->
      <image 
        class="tabbar-icon"
        :src="getIconUrl(tab.icon, currentIndex === index)"
        mode="aspectFit"
      />
      
      <!-- 文字 -->
      <text class="tabbar-text">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTabStore } from '@/stores'

// TabBar图标路径
const ICON_BASE = '/static/tabbar/'

interface TabItem {
  pagePath: string
  label: string
  icon: string
}

const tabs: TabItem[] = [
  { pagePath: '/pages/dashboard/index', label: '首页', icon: 'home' },
  { pagePath: '/pages/discovery/index', label: '发现', icon: 'discover' },
  { pagePath: '/pages/profile/index', label: '我的', icon: 'me' }
]

const tabStore = useTabStore()

// 从 store 获取当前索引
const currentIndex = computed(() => tabStore.currentIndex)

// 获取图标URL
function getIconUrl(icon: string, isActive: boolean): string {
  const suffix = isActive ? 'light' : 'default'
  return `${ICON_BASE}${icon}-${suffix}.png`
}

onMounted(() => {
  // 初始化时更新索引
  tabStore.updateCurrentIndex()
})

function switchTab(tab: TabItem, index: number) {
  console.log('[TabBar] 点击 tab:', tab.label, '当前索引:', currentIndex.value, '目标索引:', index)
  
  // 使用 store 的 switchTab 方法
  tabStore.switchTab(index)
}
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: var(--surface-color);
  border-top: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: var(--z-fixed);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  padding: 8px 0;
}

.tabbar-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-top: 4px;
  transition: color 0.2s ease;
}

.tabbar-item.active .tabbar-text {
  color: var(--primary-color);
}

.tabbar-icon {
  width: 26px;
  height: 26px;
  margin-bottom: 2px;
  transition: transform 0.2s ease;
}

.tabbar-item.active .tabbar-icon {
  transform: scale(1.15);
}
</style>
