// 用户相关类型
export interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  created_at?: string
}

export interface UserStats {
  streak: number
  total_check_in: number
  word_count: number
  study_time_today: number
  study_time_week: number
  study_time_month: number
  study_time_year: number
  study_time_total: number
  completed_lessons: number
}

export interface WeeklyActivity {
  checked: boolean
  isToday: boolean
}

// 课程相关类型
export interface Course {
  id: string
  title: string
  description?: string
  category?: string
  level?: string
  total_lessons: number
  cover_image?: string
  update?: boolean
  tags?: string[]
}

export interface MyCourse {
  course_id: string
  course: Course
  added_at?: string
  tags?: string[]
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  order: number
  duration?: number
}

// 学习相关类型
export interface RecentStudy {
  id: string
  courseId: string
  courseName: string
  title: string
  time: number
}

export interface StudyRecord {
  id: string
  course_id: string
  course_name: string
  lesson_name: string
  last_studied_at: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  data: T
  message?: string
  token?: string
}

export interface LoginResponse {
  token: string
  user?: User
}

// 学习页类型
export interface Sentence {
  id: string
  text: string
  translate?: string
  soundmark?: string
}

export interface LessonData {
  id: string
  title: string
  sentences: Sentence[]
}

// 打卡相关
export interface CheckInResult {
  success: boolean
  message?: string
}

// 热力图数据
export interface HeatmapData {
  [date: string]: {
    count: number
    level: number
  }
}
