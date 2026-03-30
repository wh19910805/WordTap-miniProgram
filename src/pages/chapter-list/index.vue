<template>
  <view class="chapter-list-page" :style="pageThemeStyle">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <Icon name="arrow-left" size="medium" color="var(--text-primary)" />
        </view>
        <view class="title-area">
          <text class="course-name">{{ course?.name || '课时列表' }}</text>
          <text class="lesson-count">{{ lessons.length }} 个课时</text>
        </view>
      </view>
    </view>

    <!-- 课时列表 -->
    <scroll-view class="content-area" scroll-y>
      <view v-if="lessons.length > 0" class="lessons-list">
        <view
          v-for="(lesson, index) in lessons"
          :key="lesson.id"
          class="lesson-item"
          @click="goToLearning(lesson.id)"
        >
          <view class="lesson-status">
            <view 
              :class="['status-icon', lesson.completed ? 'completed' : '']"
            >
              <Icon v-if="lesson.completed" name="check" size="small" :color="lesson.completed ? '#000' : 'var(--text-tertiary)'" />
              <text v-else class="lesson-number">{{ index + 1 }}</text>
            </view>
          </view>
          <view class="lesson-info">
            <view class="lesson-title-row">
              <text class="lesson-label">Lesson {{ lesson.order || index + 1 }}</text>
              <text v-if="lesson.completed" class="completed-badge">已完成</text>
            </view>
            <text class="lesson-name">{{ lesson.title || lesson.name || `课时 ${index + 1}` }}</text>
            <view class="lesson-meta">
              <text class="last-study">
                {{ lesson.lastStudyTime ? formatRelativeTime(lesson.lastStudyTime) : '未开始' }}
              </text>
              <text v-if="lesson.bestTime" class="best-time">
                最佳: {{ formatTime(lesson.bestTime) }}
              </text>
            </view>
          </view>
          <view class="arrow">
            <Icon name="chevron-right" size="medium" color="var(--text-tertiary)" />
          </view>
        </view>
      </view>
      
      <view v-else-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>
      
      <view v-else class="empty-state">
        <Icon name="book" size="large" color="var(--text-tertiary)" />
        <text class="empty-text">暂无课时数据</text>
        <text class="link" @click="goBack">返回课程列表</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject, reactive } from 'vue'
import Icon from '@/components/icon.vue'
import { useCourseStore } from '@/stores'

const courseStore = useCourseStore()

// 获取全局主题状态
const themeState = inject('themeState', reactive({ isDark: false, backgroundColor: '#f8fafc', color: '#0f172a' }))

// 页面主题样式
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

const statusBarHeight = ref(20)
const courseId = ref('')
const course = ref<any>(null)
const lessons = ref<any[]>([])
const loading = ref(true)

function formatTime(seconds: number) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatRelativeTime(timeStr: string) {
  if (!timeStr) return ''
  const time = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return `${Math.floor(days / 7)} 周前`
}

function goToLearning(lessonId: string) {
  uni.navigateTo({
    url: `/pages/learning/index?courseId=${courseId.value}&lessonId=${lessonId}`
  })
}

function goBack() {
  uni.navigateBack()
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  // 通过 route 获取课程ID（UniApp 推荐方式）
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  console.log('页面参数:', options)
  
  courseId.value = options.id || options.courseId || options.course_id || ''
  
  console.log('获取到的课程ID:', courseId.value)
  
  if (courseId.value) {
    loading.value = true
    try {
      // 获取课程详情和课时列表
      course.value = await courseStore.fetchCourseDetail(courseId.value)
      const lessonData = await courseStore.fetchLessonData(courseId.value)
      
      if (lessonData?.items) {
        lessons.value = lessonData.items
      } else if (lessonData?.lessons) {
        lessons.value = lessonData.lessons
      } else if (Array.isArray(lessonData)) {
        lessons.value = lessonData
      } else if (course.value?.lessons) {
        lessons.value = course.value.lessons
      }
      
      console.log('课时列表:', lessons.value)
    } catch (e) {
      console.error('获取课时列表失败:', e)
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.chapter-list-page {
  min-height: 100vh;
  width: 100%;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
}

/* 头部导航 */
.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--surface-color);
  z-index: 10;
  border-bottom: 2px solid var(--border-color);  /* 与 Web 端一致 */
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
  background: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-3);
}

.title-area {
  flex: 1;
  min-width: 0;
}

.course-name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-count {
  display: block;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* 内容区域 */
.content-area {
  flex: 1;
  width: 100%;
  padding: var(--space-4);
  box-sizing: border-box;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: var(--surface-color);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.lesson-item:active {
  background: var(--hover-color);
}

.lesson-status {
  flex-shrink: 0;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);  /* 与 Web 端一致 - rounded-2xl */
  background: var(--hover-color);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.status-icon.completed {
  background: linear-gradient(135deg, var(--accent-color), #22c55e);  /* 使用CSS变量 */
  color: var(--text-primary); /* 高亮背景上使用深色文字 */
}

.lesson-number {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-tertiary);
}

.lesson-info {
  flex: 1;
  min-width: 0;
}

.lesson-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.lesson-label {
  font-size: 11px;
  color: var(--text-tertiary);
  background: var(--background-color);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}

.completed-badge {
  font-size: 10px;
  color: var(--text-primary); /* 高亮背景上使用深色文字 */
  background: var(--accent-color);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.lesson-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.last-study, .best-time {
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow text {
  font-size: 20px;
  color: var(--text-tertiary);
  font-weight: 600;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-text {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.link {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 14px;
}
</style>