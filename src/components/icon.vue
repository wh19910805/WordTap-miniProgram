<template>
  <!-- PNG图标组件 - 无背景色，无圆环 -->
  <image 
    v-if="hasIcon"
    class="icon-png"
    :src="iconUrl"
    :style="iconStyle"
    mode="aspectFit"
    :aria-label="name"
  />
  <!-- 如果没有对应图标，显示空白 -->
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'small' | 'medium' | 'large'
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  size: 'md',
  color: ''
})

// PNG图标基础路径
const ICON_BASE = '/static/images/'

// 尺寸映射（统一到 px 值，与 Web 端保持一致）
const sizeMap: Record<string, number> = {
  'sm': 16,
  'small': 16,
  'md': 20,
  'medium': 20,
  'lg': 24,
  'large': 24,
  'xl': 32,
}

// PNG图标映射 - 所有可用图标
const pngIconMap: Record<string, string> = {
  // 设置相关图标
  'Exterior': 'Exterior.png',
  'answer-setting': 'answer-setting.png',
  'listening-setting': 'listening-setting.png',
  'product': 'product.png',
  'volume': 'volume.png',
  
  // 首页相关
  'fire': 'fire.png',
  'hot': 'hot.png',
  'count': 'count-course.png',
  'count-course': 'count-course.png',
  'check-in': 'home-Check-in.png',
  'home-Check-in': 'home-Check-in.png',
  'near': 'home-near.png',
  'home-near': 'home-near.png',
  'tools': 'tools.png',
  'tools-word': 'tools-word.png',
  'tools-wrong': 'tools-wrong.png',
  'info-fill': 'home-info-fill.png',
  'home-info-fill': 'home-info-fill.png',
  'home-count-time': 'home-count-time.png',
  
  // 学习页面相关
  'next': 'learn-video-on.png',
  'learn-video-on': 'learn-video-on.png',
  'submit': 'submit.png',
  'play': 'play.png',
  'refresh': 'refresh.png',
  'skip': 'skip.png',
  'skip-forward': 'skip.png',
  
  // 通用箭头
  'arrow-left': 'arrow-left.png',
  'left': 'left.png',
  'left-btn': 'left.png',
  'right': 'right.png',
  'right-arrow': 'right-arrow.png',
  'chevron-right': 'right-arrow.png',
  
  // 通用图标
  'book': 'book.png',
  'check': 'check.png',
  'calendar': 'calendar.png',
  'info': 'home-info-fill.png',
  'logo': 'logo.png',
  'favicon': 'favicon.png',
}

// 判断是否有图标
const hasIcon = computed(() => {
  return !!pngIconMap[props.name]
})

// 图标URL
const iconUrl = computed(() => {
  const pngFile = pngIconMap[props.name]
  if (pngFile) {
    return `${ICON_BASE}${pngFile}`
  }
  return ''
})

// 图标样式 - 确保无背景色
const iconStyle = computed(() => {
  const size = sizeMap[props.size] || sizeMap['md']
  return {
    width: `${size}px`,
    height: `${size}px`,
  }
})
</script>

<style scoped>
.icon-png {
  /* 确保无背景色 */
  background: transparent !important;
  /* 确保图标清晰 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
