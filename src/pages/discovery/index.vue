<template>
  <view class="discovery-page" :style="pageThemeStyle">
    <!-- 顶部 Tab 切换 - 添加足够空间避免与右上角按钮重叠 -->
    <view class="tabs-header" :style="{ paddingTop: statusBarHeight + 12 + 'px' }">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <text>{{ tab.label }}</text>
        <view class="tab-indicator"></view>
      </view>
    </view>
    
    <view class="content-area">
      <!-- 我的课程 -->
      <view v-if="activeTab === 'my'" class="courses-section">
        <view v-if="myCourses.length === 0" class="empty-state">
          <text class="empty-text">还没有加入任何课程</text>
          <text class="link" @click="activeTab = 'market'">去课程广场看看 →</text>
        </view>
        
        <view v-else class="courses-grid fade-in">
      <view 
        v-for="course in myCourses" 
        :key="course.id"
        class="course-card"
        @click="goToChapters(course.id, course)"
      >
        <view class="course-cover" :style="{ background: getCoverColor(course.id, course.name) }">
          <text>{{ course.name?.charAt(0) || '课' }}</text>
        </view>
        <view class="course-info">
          <text class="course-name">{{ course.name }}</text>
          <view class="course-meta">
            <text class="category">{{ course.category || '官方' }}</text>
            <text class="progress">{{ getCompletedCount(course.id) }}/{{ course.total_lessons }}课时</text>
          </view>
        </view>
      </view>
        </view>
      </view>
      
      <!-- 课程广场 -->
      <view v-else class="courses-section">
        <!-- 分类筛选 -->
        <view class="category-filter">
          <scroll-view scroll-x class="category-scroll">
            <view class="category-list">
              <view 
                class="category-item"
                :class="{ active: selectedCategory === null }"
                @click="selectedCategory = null"
              >
                <text>全部</text>
              </view>
              <view 
                v-for="category in categories" 
                :key="category"
                class="category-item"
                :class="{ active: selectedCategory === category }"
                @click="selectedCategory = selectedCategory === category ? null : category"
              >
                <text>{{ category }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 课程列表 -->
        <view class="courses-grid fade-in">
          <view 
            v-for="course in filteredCourses" 
            :key="course.id"
            class="course-card"
            @click="goToDetail(course.id)"
          >
            <view class="course-cover" :style="{ background: getCoverColor(course.id, course.name) }">
              <text>{{ course.name?.charAt(0) || '课' }}</text>
              <view v-if="isFreeCourse(course)" class="free-tag">
                <text>免费</text>
              </view>
            </view>
            <view class="course-info">
              <text class="course-name">{{ course.name }}</text>
              <view class="course-meta">
                <text class="category">{{ course.category || '官方' }}</text>
                <text class="learners">{{ formatNumber(getLearnerCount(course.id)) }}人学</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="bottom-placeholder"></view>
    </view>
    
    <!-- 自定义TabBar -->
    <CustomTabbar />
  </view>
</template>

<script setup lang="ts">
import CustomTabbar from '@/components/tabbar.vue'
import { ref, computed, onMounted, inject, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore, useCourseStore } from '@/stores'

const authStore = useAuthStore()
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
const activeTab = ref('my')
const selectedCategory = ref<string | null>(null)

const tabs = [
  { key: 'my', label: '我的课程' },
  { key: 'market', label: '课程广场' }
]

const myCourses = computed(() => {
  // 我的课程数据结构: { course_id, course: { id, title, ... } }
  return (courseStore.myCourses || []).map(item => ({
    ...item,
    ...item.course,
    id: item.course_id || item.course?.id,
    name: item.course?.title || item.title,
    title: item.course?.title || item.title,
    category: item.course?.category || item.category,
    total_lessons: item.course?.total_lessons || item.total_lessons,
  }))
})

const allCourses = computed(() => {
  // 课程广场数据结构: { id, title, ... }
  return (courseStore.courses || []).map(item => ({
    ...item,
    id: item.id,
    name: item.title,
    title: item.title,
  }))
})

const categories = computed(() => {
  const categorySet = new Set<string>()
  allCourses.value.forEach(course => {
    if (course.category) {
      categorySet.add(course.category)
    }
  })
  return Array.from(categorySet).sort()
})

const filteredCourses = computed(() => {
  let courses = allCourses.value
  if (selectedCategory.value) {
    courses = courses.filter(c => c.category === selectedCategory.value)
  }
  return courses
})

function getCoverColor(courseId: string, courseName: string) {
  const colors = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444']
  const hashStr = (courseId || '') + (courseName || '')
  let hash = 0
  for (let i = 0; i < hashStr.length; i++) {
    hash = ((hash << 5) - hash) + hashStr.charCodeAt(i)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getCompletedCount(courseId: string) {
  return Math.floor(Math.random() * 20)
}

function getLearnerCount(courseId: string) {
  return Math.floor(Math.random() * 200000) + 1000
}

function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

function isFreeCourse(course: any) {
  return course.tags?.some((tag: string) => tag.includes('免费'))
}

function goToDetail(courseId: string) {
  console.log('跳转到课程详情:', courseId)
  uni.navigateTo({
    url: `/pages/course-detail/index?id=${courseId}`
  })
}

function goToChapters(courseId: string, course?: any) {
  console.log('点击课程卡片:', course)
  console.log('课程ID:', courseId, '类型:', typeof courseId)
  if (!courseId) {
    uni.showToast({ title: '课程ID为空', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/chapter-list/index?courseId=${courseId}`
  })
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  // 胶囊按钮信息包含顶部状态栏高度
  const capsuleHeight = 32 // 微信标准胶囊按钮高度
  const menuButtonHeight = systemInfo.safeArea?.top || systemInfo.statusBarHeight || 20
  
  // 设置足够的顶部空间：状态栏 + 胶囊按钮高度
  statusBarHeight.value = menuButtonHeight + capsuleHeight + 10
  
  // 先获取课程广场数据（不需要登录）
  console.log('开始获取课程数据...')
  await courseStore.fetchCourses()
  console.log('课程列表:', courseStore.courses)
  console.log('课程数量:', courseStore.courses?.length)
  if (courseStore.courses && courseStore.courses.length > 0) {
    console.log('第一门课程数据:', JSON.stringify(courseStore.courses[0], null, 2))
  }
  
  // 只有登录后才获取我的课程（需要认证）
  if (authStore.isAuthenticated) {
    await courseStore.fetchMyCourses()
    console.log('我的课程:', courseStore.myCourses)
    console.log('我的课程数量:', courseStore.myCourses?.length)
    if (courseStore.myCourses && courseStore.myCourses.length > 0) {
      console.log('第一门我的课程数据:', JSON.stringify(courseStore.myCourses[0], null, 2))
    }
  }
})

// 每次进入页面时刷新数据（包括登录后返回）
onShow(async () => {
  // 如果已登录，刷新我的课程
  if (authStore.isAuthenticated) {
    await courseStore.fetchMyCourses()
    console.log('[onShow] 我的课程已刷新:', courseStore.myCourses?.length)
  }
})
</script>

<style scoped>
.discovery-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

/* Tab 切换 */
.tabs-header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  display: flex;
  background: var(--surface-color);
  z-index: var(--z-sticky);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: var(--space-4);
  position: relative;
}

.tab-item text {
  font-size: 15px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.tab-item.active text {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-indicator {
  display: none;
}

.content-area {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding: var(--space-3);
  padding-bottom: 100px;
}

/* 分类筛选 */
.category-filter {
  margin-bottom: var(--space-3);
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: flex;
  gap: var(--space-2);
}

.category-item {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background: var(--background-color);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.category-item.active {
  background: var(--primary-color);
  color: #fff;
}

/* 课程网格 */
.courses-section {
  padding: 0;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.course-card {
  background: var(--surface-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.course-card:active {
  transform: scale(0.98);
}

.course-cover {
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.course-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
}

.course-cover text {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

/* 免费标签 */
.free-tag {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  background: var(--accent-color);  /* 使用CSS变量 */
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
}

.free-tag text {
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

/* NEW 标签 */
.new-tag {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: var(--genz-pink);  /* 使用CSS变量 */
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
}

.new-tag text {
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.course-info {
  padding: var(--space-4);
}

.course-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 分类标签 */
.category {
  font-size: 11px;
  color: var(--primary-color);
  background: var(--primary-bg);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.progress, .learners {
  font-size: 12px;
  color: var(--text-tertiary);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
}

.empty-text {
  display: block;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  font-size: 14px;
}

.link {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 14px;
}

.bottom-placeholder {
  height: 20px;
}
</style>
