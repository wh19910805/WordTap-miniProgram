<template>
  <div class="min-h-screen bg-[var(--background-color)] pb-24">
    <div class="sticky top-0 z-10 bg-[var(--surface-color)] border-b border-[var(--border-color)] shadow-sm">
      <div class="flex items-center gap-3 p-4">
        <button
          @click="goBack"
          class="p-2.5 -ml-2 hover:bg-[var(--hover-color)] rounded-full transition-all duration-300 hover:scale-105"
        >
          <svg class="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex-1 pr-4">
          <h1 class="text-lg font-bold text-[var(--text-primary)] truncate">
            {{ course?.name || '课时列表' }}
          </h1>
          <div class="text-xs text-[var(--text-tertiary)] mt-0.5">
            {{ course?.lessons?.length || 0 }} 个课时
          </div>
        </div>
      </div>
    </div>

    <div v-if="course" class="page-container" ref="lessonsContainer" style="max-height: calc(100vh - 100px); overflow-y: auto; overflow-x: hidden;">
      <div class="content-area space-y-3">
        <div
          v-for="(lesson, index) in course.lessons"
          :key="lesson.id"
          :ref="el => { if (lesson.id) lessonRefs[lesson.id] = el }"
          @click="goToLearning(lesson.id)"
          class="card-interactive bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)]"
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div
                :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300',
                  lesson.completed
                    ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-md'
                    : 'bg-[var(--hover-color)] text-[var(--text-tertiary)]',
                ]"
              >
                <span v-if="lesson.completed">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span v-else>{{ lesson.order }}</span>
              </div>
            </div>
            <div class="flex-1 min-w-0 py-1">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-xs text-[var(--text-tertiary)] bg-[var(--hover-color)] px-2 py-0.5 rounded-full">Lesson {{ lesson.order }}</span>
                <span v-if="lesson.completed" class="text-xs bg-lime-400 text-black px-2 py-0.5 rounded-full font-medium">已完成</span>
              </div>
              <div class="font-semibold text-base mb-1.5">{{ lesson.title }}</div>
              <div class="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                <span v-if="lesson.lastStudyTime" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatRelativeTime(lesson.lastStudyTime) }}
                </span>
                <span v-else class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  未开始
                </span>
                <span v-if="lesson.bestTime" class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  最佳: {{ formatTime(lesson.bestTime) }}
                </span>
              </div>
            </div>
            <div class="flex-shrink-0 flex items-center">
              <svg
                class="w-6 h-6 text-[var(--text-tertiary)] transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-screen">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div class="text-gray-400">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { db } from '@/db'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const course = ref(null)
const lessonsContainer = ref(null)
const lessonRefs = ref({})
const lastStudiedLessonId = ref(null)

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatRelativeTime(timeStr) {
  const time = new Date(timeStr)
  const now = new Date()
  const diff = now - time
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}个月前`
}

function goToLearning(lessonId) {
  // 保存当前学习的课时ID，用于返回时定位
  sessionStorage.setItem(`lastLesson_${route.params.id}`, lessonId)
  
  router.push({
    name: 'Learning',
    params: {
      courseId: route.params.id,
      lessonId
    }
  })
}

function goBack() {
  // 返回到发现页面的"我的课程"标签
  // 使用 query 参数来指定默认标签
  router.push({ 
    name: 'Discovery',
    query: { tab: 'my' }
  })
}

// 自动滚动到上次学习的课时
async function scrollToLastLesson() {

  
  if (!course.value || !course.value.lessons || course.value.lessons.length === 0) {

    return
  }
  
  let lessonIdToScroll = null
  
  // 1. 首先从sessionStorage获取上次学习的课时ID
  const sessionKey = `lastLesson_${route.params.id}`
  const sessionLessonId = sessionStorage.getItem(sessionKey)

  
  if (sessionLessonId) {
    lessonIdToScroll = sessionLessonId
  } else {
    // 2. 如果sessionStorage中没有，从本地数据库获取最近学习的课时
    try {
      const allLessons = await db.lessons.where("courseId").equals(route.params.id).toArray()

      
      if (allLessons.length > 0) {
        // 按最后学习时间排序，获取最近学习的课时
        const sortedLessons = allLessons.sort((a, b) => {
          const dateA = a.lastStudyTime ? new Date(a.lastStudyTime).getTime() : 0
          const dateB = b.lastStudyTime ? new Date(b.lastStudyTime).getTime() : 0
          return dateB - dateA
        })
        lessonIdToScroll = sortedLessons[0]?.id

      }
    } catch (error) {
      console.error("获取最近学习课时失败:", error)
    }
  }
  
  // 3. 如果找到了要滚动的课时，执行滚动
  if (lessonIdToScroll) {

    
    // 等待DOM更新完成，使用更长的延迟确保DOM完全渲染
    const scrollAttempts = 5;
    let currentAttempt = 0;
    
    const scrollInterval = setInterval(() => {
      currentAttempt++;

      
      // 尝试获取课时元素
      const lessonElement = lessonRefs.value[lessonIdToScroll];

      
      if (lessonElement) {
        // 计算滚动位置，使课时在可视区域居中
        const containerRect = lessonsContainer.value.getBoundingClientRect();
        const lessonRect = lessonElement.getBoundingClientRect();
        const scrollTop = lessonElement.offsetTop - containerRect.height / 2 + lessonRect.height / 2;
        

        
        // 执行滚动，使用auto行为直接定位，没有滚动动画
        lessonsContainer.value.scrollTo({
          top: scrollTop,
          behavior: "auto"
        });
        
        // 清除定时器
        clearInterval(scrollInterval);

      } else if (currentAttempt >= scrollAttempts) {
        // 尝试次数用尽，清除定时器
        clearInterval(scrollInterval);

        
        // 尝试另一种滚动方式：找到课时索引，然后滚动
        const lessonIndex = course.value.lessons.findIndex(lesson => lesson.id === lessonIdToScroll);
        if (lessonIndex !== -1) {

          // 计算大概的滚动位置
          const estimatedScrollTop = lessonIndex * 100; // 假设每个课时大概100px高
          lessonsContainer.value.scrollTo({
            top: estimatedScrollTop,
            behavior: "auto"
          });
        }
      }
    }, 200);
  }
}

// 监听课程数据变化，当课程数据加载完成后自动滚动
watch(course, async (newCourse) => {
  if (newCourse && newCourse.lessons && newCourse.lessons.length > 0) {

    await scrollToLastLesson()
  }
}, { deep: true });

onMounted(async () => {

  // 使用 loadCourseLessonsList 只加载课时列表，不加载详细内容
  course.value = await courseStore.loadCourseLessonsList(route.params.id)
  
  // 当课程加载完成后，自动滚动到上次学习的课时
  if (course.value) {

    await scrollToLastLesson()
  }
})
</script>

