import { defineStore } from 'pinia'
import { ref } from 'vue'

// 重新导出设置 store（从独立文件）
export { useSettingsStore } from './settings'

const BASE_URL = 'http://localhost:8000/api'

// 封装请求方法
async function request(url: string, method: string, data?: any) {
  const token = uni.getStorageSync('token')
  
  const header: any = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      // 自动跟随重定向
      redirect: 'follow',
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 保存 token
          if (res.header?.Authorization) {
            const newToken = res.header.Authorization.split(' ')[1]
            uni.setStorageSync('token', newToken)
          }
          if (res.data?.token) {
            uni.setStorageSync('token', res.data.token)
          }
          resolve(res.data)
        } else {
          reject(res.data || { message: '请求失败' })
        }
      },
      fail: () => {
        reject({ message: '网络错误，请检查网络连接' })
      }
    })
  })
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref<any>(null)
  const token = ref('')
  
  async function doLogin(username: string, password: string) {
    const data = await request('/auth/login', 'POST', { usernameOrEmail: username, password })
    token.value = data.token
    uni.setStorageSync('token', data.token)
    await loadCurrentUser()
    return { success: true }
  }
  
  async function loadCurrentUser() {
    try {
      const user = await request('/auth/me', 'GET')
      currentUser.value = user
      isAuthenticated.value = true
    } catch (e) {
      logout()
    }
  }
  
  function init() {
    const savedToken = uni.getStorageSync('token')
    if (savedToken) {
      token.value = savedToken
      // 异步加载用户信息
      loadCurrentUser()
    }
  }
  
  async function login(username: string, password: string) {
    try {
      await doLogin(username, password)
      return { success: true }
    } catch (e: any) {
      return { success: false, message: e.detail || e.message || '登录失败' }
    }
  }
  
  async function register(username: string, password: string, email?: string) {
    try {
      const data = await request('/auth/register', 'POST', { username, password, email })
      token.value = data.token
      uni.setStorageSync('token', data.token)
      await loadCurrentUser()
      return { success: true }
    } catch (e: any) {
      return { success: false, message: e.detail || e.message || '注册失败' }
    }
  }
  
  function logout() {
    token.value = ''
    currentUser.value = null
    isAuthenticated.value = false
    uni.removeStorageSync('token')
  }
  
  return { 
    isAuthenticated, 
    currentUser, 
    token,
    init, 
    login, 
    register,
    logout, 
    loadCurrentUser 
  }
})

export const useUserStore = defineStore('user', () => {
  const stats = ref({
    streak: 0,
    total_check_in: 0,
    word_count: 0,
    study_time_today: 0,
    study_time_week: 0,
    study_time_month: 0,
    study_time_year: 0,
    study_time_total: 0,
    completed_lessons: 0
  })
  const heatmapData = ref<any>({})
  const recentStudies = ref<any[]>([])
  
  // 计算今天的星期几 (0=周日, 1=周一, ..., 6=周六) -> 转为 (0=周一, ..., 6=周日)
  const today = new Date()
  const todayDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  
  const weeklyActivity = ref<any[]>([
    { checked: false, isToday: todayDayOfWeek === 0 },
    { checked: false, isToday: todayDayOfWeek === 1 },
    { checked: false, isToday: todayDayOfWeek === 2 },
    { checked: false, isToday: todayDayOfWeek === 3 },
    { checked: false, isToday: todayDayOfWeek === 4 },
    { checked: false, isToday: todayDayOfWeek === 5 },
    { checked: false, isToday: todayDayOfWeek === 6 }
  ])
  
  async function fetchStats() {
    try {
      const data = await request('/users/stats', 'GET')
      stats.value = { ...stats.value, ...data }
      if (data.weekly_activity) {
        // 保留 isToday 属性，只更新 checked 状态
        weeklyActivity.value = data.weekly_activity.map((day: any, index: number) => ({
          ...day,
          isToday: weeklyActivity.value[index]?.isToday || false
        }))
      }
    } catch (e) {
      console.error('获取统计数据失败', e)
    }
  }
  
  async function fetchHeatmap(months = 6) {
    try {
      const data = await request(`/users/heatmap?months=${months}`, 'GET')
      heatmapData.value = data
    } catch (e) {
      console.error('获取热力图失败', e)
    }
  }
  
  async function fetchRecentStudies(limit = 10, offset = 0) {
    try {
      const data = await request(`/users/recent-studies?limit=${limit}&offset=${offset}`, 'GET')
      console.log('[stores] fetchRecentStudies 原始数据:', data)
      
      // 兼容 Web 端返回格式：{ records: [...] } 或 { items: [...] } 或直接数组
      const records = data.records || data.items || data || []
      
      // 映射数据格式，与 Web 端 user.js 保持一致
      recentStudies.value = records.map((record: any) => ({
        id: record.lesson_id,
        courseId: record.course_id,
        courseName: record.course_name || '未知课程',
        title: record.lesson_name || 'Lesson',
        time: record.last_studied_at ? new Date(record.last_studied_at).getTime() : Date.now(),
      }))
      
      console.log('[stores] fetchRecentStudies 映射后数据:', recentStudies.value)
    } catch (e) {
      console.error('获取学习记录失败', e)
      recentStudies.value = []
    }
  }
  
  async function checkIn() {
    try {
      await request('/users/check-in', 'POST')
      await fetchStats()
      return { success: true }
    } catch (e) {
      return { success: false, message: '打卡失败' }
    }
  }
  
  return { 
    stats, 
    heatmapData, 
    recentStudies, 
    weeklyActivity, 
    fetchStats, 
    fetchHeatmap, 
    fetchRecentStudies, 
    checkIn 
  }
})

export const useCourseStore = defineStore('course', () => {
  const courses = ref<any[]>([])
  const myCourses = ref<any[]>([])
  const currentCourse = ref<any>(null)
  const lessonData = ref<any>(null)
  
  async function fetchCourses(params?: any) {
    try {
      const data = await request('/courses/', 'GET', params)
      console.log('API 返回课程数据:', data)
      courses.value = data.items || data || []
      console.log('课程列表已存储:', courses.value)
    } catch (e) {
      console.error('获取课程列表失败', e)
    }
  }
  
  async function fetchMyCourses() {
    try {
      const data = await request('/courses/my-courses', 'GET')
      console.log('[stores] fetchMyCourses 原始数据:', data)
      
      // 兼容 Web 端返回格式：直接数组或 { items: [...] }
      const coursesList = Array.isArray(data) ? data : (data.items || data || [])
      
      // 映射数据格式，与 Web 端 course.js 保持一致
      // Web 端格式：{ course_id, course: { id, title, ... }, added_at, tags }
      myCourses.value = coursesList.map((userCourse: any) => {
        const course = userCourse.course || userCourse
        return {
          course_id: userCourse.course_id || course.id,
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            total_lessons: course.total_lessons,
            cover_image: course.cover_image,
          },
          added_at: userCourse.added_at,
          tags: userCourse.tags,
        }
      })
      
      console.log('[stores] fetchMyCourses 映射后数据:', myCourses.value)
    } catch (e) {
      console.error('获取我的课程失败', e)
      myCourses.value = []
    }
  }
  
  async function fetchCourseDetail(courseId: string) {
    try {
      // 并行获取课程详情和课时列表
      const [courseData, lessonsData] = await Promise.all([
        request(`/courses/${courseId}`, 'GET'),
        request(`/courses/${courseId}/lessons`, 'GET')
      ])
      
      // 合并数据，确保课程对象包含 lessons 数组
      currentCourse.value = {
        ...courseData,
        lessons: lessonsData?.items || lessonsData || []
      }
      console.log('获取课程详情成功:', currentCourse.value)
      return currentCourse.value
    } catch (e) {
      console.error('获取课程详情失败', e)
      return null
    }
  }
  
  async function fetchLessonData(courseId: string) {
    try {
      const data = await request(`/courses/${courseId}/lessons`, 'GET')
      lessonData.value = data
      return data
    } catch (e) {
      console.error('获取课时列表失败', e)
      return null
    }
  }
  
  async function fetchLessonDetail(lessonId: string) {
    try {
      const data = await request(`/courses/lessons/${lessonId}`, 'GET')
      return data
    } catch (e) {
      console.error('获取课时详情失败', e)
      return null
    }
  }
  
  // 加入课程到我的课程
  async function addCourse(courseId: string) {
    try {
      console.log('[stores] addCourse 开始，courseId:', courseId)
      
      // 调用后端 API 加入课程
      const data = await request('/courses/my-courses', 'POST', { 
        course_id: courseId,
        tags: null
      })
      
      console.log('[stores] addCourse API 返回:', data)
      
      // 重新加载我的课程列表
      await fetchMyCourses()
      
      return true
    } catch (e) {
      console.error('加入课程失败', e)
      return false
    }
  }
  
  // 从我的课程移除课程
  async function removeCourse(courseId: string) {
    try {
      console.log('[stores] removeCourse 开始，courseId:', courseId)
      
      await request(`/courses/my-courses/${courseId}`, 'DELETE')
      
      // 重新加载我的课程列表
      await fetchMyCourses()
      
      return true
    } catch (e) {
      console.error('移除课程失败', e)
      return false
    }
  }
  
  return { 
    courses, 
    myCourses, 
    currentCourse, 
    lessonData, 
    fetchCourses, 
    fetchMyCourses, 
    fetchCourseDetail, 
    fetchLessonData,
    fetchLessonDetail,
    addCourse,
    removeCourse
  }
})

// TabBar 状态管理
export const useTabStore = defineStore('tab', () => {
  const currentIndex = ref(0)
  const tabBarPages = ['/pages/dashboard/index', '/pages/discovery/index', '/pages/profile/index']
  
  function updateCurrentIndex() {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const currentPath = '/' + currentPage.route
      console.log('[TabStore] 当前页面路径:', currentPath)
      const index = tabBarPages.indexOf(currentPath)
      if (index >= 0) {
        currentIndex.value = index
        console.log('[TabStore] 更新索引为:', index)
      }
    }
  }
  
  function setCurrentIndex(index: number) {
    currentIndex.value = index
  }
  
  function switchTab(index: number) {
    const targetPath = tabBarPages[index]
    console.log('[TabStore] 切换到 tab:', index, '路径:', targetPath)
    currentIndex.value = index
    
    uni.switchTab({
      url: targetPath,
      success: () => {
        console.log('[TabStore] 切换成功')
      },
      fail: (err) => {
        console.error('[TabStore] 切换失败:', err)
      }
    })
  }
  
  return { 
    currentIndex, 
    tabBarPages,
    updateCurrentIndex, 
    setCurrentIndex,
    switchTab 
  }
})

export const useLearningStore = defineStore('learning', () => {
  const currentSentenceIndex = ref(0)
  const sentenceProgress = ref<any>({})
  const totalSentences = ref(0)
  const hintedChars = ref<any>({}) // 存储已提示的字符索引
  
  function initLearning() {
    currentSentenceIndex.value = 0
    sentenceProgress.value = {}
    hintedChars.value = {}
  }
  
  function reset() {
    initLearning()
  }
  
  function updateSentenceProgress(sentenceIndex: number, userInput: string, charIndex: number) {
    if (!sentenceProgress.value[sentenceIndex]) {
      sentenceProgress.value[sentenceIndex] = {
        userInput: '',
        charIndex: -1,
        completed: false
      }
    }
    
    sentenceProgress.value[sentenceIndex].userInput = userInput
    sentenceProgress.value[sentenceIndex].charIndex = charIndex
  }
  
  function markSentenceComplete(sentenceIndex: number, fullText?: string) {
    if (!sentenceProgress.value[sentenceIndex]) {
      sentenceProgress.value[sentenceIndex] = {
        userInput: '',
        charIndex: -1,
        completed: false
      }
    }
    sentenceProgress.value[sentenceIndex].completed = true
    // 如果提供了完整文本，使用它
    if (fullText) {
      sentenceProgress.value[sentenceIndex].userInput = fullText
      sentenceProgress.value[sentenceIndex].charIndex = fullText.length
    }
  }
  
  function isCharHinted(sentenceIndex: number, charIndex: number): boolean {
    return hintedChars.value[sentenceIndex]?.[charIndex] || false
  }
  
  function handleBackspace() {
    const currentProgress = sentenceProgress.value[currentSentenceIndex.value]
    
    // 如果当前句子还有字符可以删除
    if (currentProgress && currentProgress.userInput && currentProgress.userInput.length > 0 && currentProgress.charIndex >= 0) {
      // 删除最后一个字符
      const newInput = currentProgress.userInput.slice(0, -1)
      const newCharIndex = currentProgress.charIndex - 1
      updateSentenceProgress(currentSentenceIndex.value, newInput, newCharIndex)
      
      // 如果当前句子已经完成，将其标记为未完成
      if (currentProgress.completed) {
        currentProgress.completed = false
      }
    }
    // 如果当前句子没有字符可以删除，退回到上一个句子
    else if (currentSentenceIndex.value > 0) {
      // 保存当前句子的进度
      if (currentProgress) {
        currentProgress.charIndex = currentProgress.charIndex
        currentProgress.completed = false
      }
      
      // 退回到上一个句子
      currentSentenceIndex.value--
      
      // 恢复上一个句子的进度
      const prevProgress = sentenceProgress.value[currentSentenceIndex.value]
      if (prevProgress && prevProgress.userInput) {
        // 将上一个句子标记为未完成
        prevProgress.completed = false
      } else {
        // 如果上一个句子没有进度，初始化
        sentenceProgress.value[currentSentenceIndex.value] = {
          completed: false,
          charIndex: -1,
          userInput: '',
        }
      }
    }
  }
  
  return { 
    currentSentenceIndex, 
    sentenceProgress, 
    totalSentences, 
    hintedChars,
    initLearning, 
    reset,
    updateSentenceProgress,
    markSentenceComplete,
    isCharHinted,
    handleBackspace
  }
})
