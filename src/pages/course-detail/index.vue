<template>
  <view class="course-detail-page" :style="pageThemeStyle">
    <!-- 返回按钮 -->
    <view class="back-btn" :style="{ paddingTop: statusBarHeight + 'px' }" @click="goBack">
      <Icon name="arrow-left" size="medium" color="var(--primary-color)" />
    </view>

    <scroll-view v-if="course" class="content-area fade-in" scroll-y>
      <!-- Hero Section - 课程封面 -->
      <view class="hero-section" :style="{ background: courseCover }">
        <view class="hero-overlay"></view>
        <view class="hero-content">
          <text class="hero-title">{{ course.title || course.name }}</text>
          <text class="hero-description">{{ course.description }}</text>
        </view>
      </view>

      <!-- 课程信息卡片 -->
      <view class="info-section">
        <view class="info-card">
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">总课时</text>
              <text class="info-value">{{ course.total_lessons || course.lessonCount || 0 }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">总词汇量</text>
              <text class="info-value">{{ estimatedWords }}</text>
            </view>
          </view>
        </view>

        <!-- 学习人数 -->
        <view class="social-proof">
          <view class="social-item">
            <text class="learner-count">{{ formatNumber(learnerCount) }} 人在学</text>
          </view>
        </view>

        <!-- 加入/开始学习按钮 -->
        <button 
          class="action-btn"
          :class="{ 'added': isAdded }"
          @click="handleAddCourse"
        >
          {{ isAdded ? '开始学习' : '加入我的课程' }}
        </button>
      </view>
    </scroll-view>

    <!-- Loading -->
    <view v-else class="loading-state">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, reactive } from 'vue'
import Icon from '@/components/icon.vue'
import { useCourseStore, useAuthStore } from '@/stores'

const courseStore = useCourseStore()
const authStore = useAuthStore()

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
const course = ref<any>(null)
const learnerCount = ref(1203)

// 获取课程ID
const getCourseId = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  return options.id || options.courseId || ''
}

// 检查是否已加入课程
const isAdded = computed(() => {
  const courseId = getCourseId()
  return courseStore.myCourses.some((c: any) => 
    c.id === courseId || c.course_id === courseId
  )
})

// 估算词汇量
const estimatedWords = computed(() => {
  const totalLessons = course.value?.total_lessons || course.value?.lessonCount || 0
  return totalLessons * 50
})

// 课程封面
const courseCover = computed(() => {
  if (!course.value) return ''
  return getCourseCover(course.value.id, course.value.title || course.value.name)
})

// 获取课程封面颜色
function getCourseCover(courseId: string, courseName: string) {
  // 渐变配色方案
  const gradients = [
    { from: '#4f46e5', to: '#7c3aed', name: 'indigo' },
    { from: '#06b6d4', to: '#3b82f6', name: 'cyan' },
    { from: '#14b8a6', to: '#10b981', name: 'teal' },
    { from: '#f59e0b', to: '#ef4444', name: 'warm' },
    { from: '#ec4899', to: '#8b5cf6', name: 'pink' },
    { from: '#84cc16', to: '#22c55e', name: 'lime' },
  ]

  // 使用课程ID和名称生成更随机的颜色索引
  const hashStr = (courseId || '') + (courseName || '')
  let hash = 0
  for (let i = 0; i < hashStr.length; i++) {
    const char = hashStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const gradientIndex = Math.abs(hash) % gradients.length
  const gradient = gradients[gradientIndex]

  // 返回渐变色
  return `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`
}

// 课程图标映射表
const courseIconMap = {
  '新概念': 'BookOpen',
  'NCE': 'BookOpen',
  '英语': 'Globe',
  'English': 'Globe',
  '单词': 'Lightbulb',
  '词汇': 'Lightbulb',
  '口语': 'Chat',
  '听力': 'Volume',
  '语法': 'Pencil',
  '写作': 'Edit',
  '阅读': 'Eye',
  '考试': 'Academic',
  '雅思': 'Academic',
  '托福': 'Academic',
  '商务': 'Briefcase',
  '职场': 'Briefcase',
  '旅游': 'Map',
  '日常': 'Home',
}

// 获取课程图标
function getCourseIcon(courseName: string) {
  for (const [key, icon] of Object.entries(courseIconMap)) {
    if (courseName && courseName.includes(key)) {
      return icon
    }
  }
  return 'Book'
}



// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 格式化数字
function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 加载课程详情
async function loadCourse() {
  const courseId = getCourseId()
  if (!courseId) {
    uni.showToast({ title: '课程ID无效', icon: 'none' })
    return
  }

  try {
    // 先从课程列表中获取基本信息
    const courseFromList = courseStore.courses.find((c: any) => c.id === courseId)
    if (courseFromList) {
      course.value = courseFromList
    }

    // 加载详细信息
    const detail = await courseStore.fetchCourseDetail(courseId)
    if (detail) {
      course.value = detail
    }
  } catch (error) {
    console.error('加载课程详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 处理加入课程
async function handleAddCourse() {
  const courseId = getCourseId()
  
  if (isAdded.value) {
    // 已加入，跳转到课时列表
    uni.navigateTo({
      url: `/pages/chapter-list/index?courseId=${courseId}`
    })
  } else {
    // 加入课程
    try {
      uni.showLoading({ title: '加入中...' })
      
      const success = await courseStore.addCourse(courseId)
      
      uni.hideLoading()
      
      if (success) {
        uni.showToast({ title: '已加入我的课程', icon: 'success' })
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/chapter-list/index?courseId=${courseId}`
          })
        }, 1000)
      } else {
        uni.showToast({ title: '加入失败，请重试', icon: 'none' })
      }
    } catch (error: any) {
      uni.hideLoading()
      console.error('加入课程失败:', error)
      uni.showToast({ title: error.message || '加入失败', icon: 'none' })
    }
  }
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  await loadCourse()
})
</script>

<style scoped>
.course-detail-page {
  min-height: 100vh;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
}

.back-btn {
  position: absolute;
  top: 0;
  left: 16px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}

.content-area {
  flex: 1;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: var(--primary-color);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  color: #fff;
}

.hero-title {
  display: block;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.hero-description {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Info Section */
.info-section {
  padding: 16px;
}

.info-card {
  background: var(--surface-color);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.info-item {
  text-align: center;
  background: var(--background-color);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.info-label {
  display: block;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-1);
}

.info-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
}

.social-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.social-proof-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary); /* 高亮背景上使用深色文字 */
}

.action-btn {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #4f46e5;  /* 与 Web 端一致 - indigo-600 */
  border: none;
  transition: all 0.2s;
}

.action-btn.added {
  background: #84cc16;  /* 与 Web 端一致 - lime-500 */
}

.action-btn:active {
  transform: scale(0.98);
}

/* Loading */
.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}
</style>