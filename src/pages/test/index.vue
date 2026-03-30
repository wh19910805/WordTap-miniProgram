<template>
  <view class="test-page">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <text>‹</text>
        </view>
        <view class="title">测试页面</view>
      </view>
    </view>
    
    <scroll-view class="content-area" scroll-y>
      <view class="section">
        <text class="section-title">课程列表</text>
        <view v-for="course in courses" :key="course.id" class="course-item" @click="goToChapterList(course.id)">
          <text>{{ course.title }}</text>
        </view>
      </view>
      
      <view class="section">
        <text class="section-title">测试课时</text>
        <view class="lesson-item" @click="goToLearning('course_20260119101943_bdbbfdc4', 'lesson_20260119101943_b7cf53ae')">
          <text>Lesson 1: Excuse me!</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCourseStore } from '@/stores'

const courseStore = useCourseStore()
const statusBarHeight = ref(20)
const courses = ref<any[]>([])

function goBack() {
  uni.navigateBack()
}

function goToChapterList(courseId: string) {
  uni.navigateTo({
    url: `/pages/chapter-list/index?id=${courseId}`
  })
}

function goToLearning(courseId: string, lessonId: string) {
  uni.navigateTo({
    url: `/pages/learning/index?courseId=${courseId}&lessonId=${lessonId}`
  })
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  // 加载课程列表
  await courseStore.fetchCourses()
  courses.value = courseStore.courses.slice(0, 5) // 显示前5个课程
})
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: var(--background-color);
}

.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--surface-color);
  border-bottom: 2px solid var(--border-color);
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--hover-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.back-btn text {
  font-size: 20px;
  color: var(--text-primary);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.content-area {
  flex: 1;
  padding: 16px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: block;
}

.course-item, .lesson-item {
  padding: 12px 16px;
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 8px;
  cursor: pointer;
}

.course-item text, .lesson-item text {
  font-size: 14px;
  color: var(--text-primary);
}
</style>