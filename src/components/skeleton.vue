<template>
  <view class="skeleton-wrapper">
    <!-- 文字骨架 -->
    <view v-if="type === 'text'" class="skeleton skeleton-text" :style="skeletonStyle"></view>
    
    <!-- 标题骨架 -->
    <view v-else-if="type === 'title'" class="skeleton skeleton-title" :style="skeletonStyle"></view>
    
    <!-- 卡片骨架 -->
    <view v-else-if="type === 'card'" class="skeleton skeleton-card" :style="skeletonStyle">
      <view class="skeleton-card-header"></view>
      <view class="skeleton-card-body">
        <view class="skeleton-line" v-for="i in 3" :key="i"></view>
      </view>
    </view>
    
    <!-- 头像骨架 -->
    <view v-else-if="type === 'avatar'" class="skeleton skeleton-avatar" :style="skeletonStyle"></view>
    
    <!-- 图片骨架 -->
    <view v-else-if="type === 'image'" class="skeleton skeleton-image" :style="skeletonStyle"></view>
    
    <!-- 默认骨架 -->
    <view v-else class="skeleton skeleton-default" :style="skeletonStyle"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'title' | 'card' | 'avatar' | 'image' | 'default'
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  width: '100%',
  height: '20px',
  borderRadius: 'var(--radius-md)'
})

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  if (props.borderRadius) {
    style.borderRadius = typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
  }
  
  return style
})
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
}

.skeleton {
  background: linear-gradient(90deg, var(--border-light) 25%, var(--border-color) 50%, var(--border-light) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-md);
}

.skeleton-text {
  height: 16px;
  margin-bottom: var(--space-2);
}

.skeleton-title {
  height: 24px;
  margin-bottom: var(--space-3);
}

.skeleton-card {
  padding: var(--space-4);
  height: 120px;
}

.skeleton-card-header {
  height: 24px;
  margin-bottom: var(--space-3);
  background: linear-gradient(90deg, var(--border-light) 25%, var(--border-color) 50%, var(--border-light) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton-card-body {
  flex: 1;
}

.skeleton-line {
  height: 12px;
  margin-bottom: var(--space-2);
  background: linear-gradient(90deg, var(--border-light) 25%, var(--border-color) 50%, var(--border-light) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton-line:last-child {
  width: 60%;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.skeleton-image {
  height: 200px;
  border-radius: var(--radius-lg);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>