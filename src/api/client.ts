// API 客户端 - 连接本地后端
const BASE_URL = 'http://localhost:8000'

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
      fail: (err) => {
        reject({ message: '网络错误，请检查网络连接' })
      }
    })
  })
}

// 认证 API
export const authApi = {
  login: (data: any) => request('/auth/login', 'POST', data),
  register: (data: any) => request('/auth/register', 'POST', data),
  getCurrentUser: () => request('/auth/me', 'GET')
}

// 用户 API
export const userApi = {
  getStats: () => request('/users/stats', 'GET'),
  checkIn: () => request('/users/check-in', 'POST'),
  getHeatmap: (months = 6) => request(`/users/heatmap?months=${months}`, 'GET'),
  getRecentStudies: (limit = 10, offset = 0) => 
    request(`/users/recent-studies?limit=${limit}&offset=${offset}`, 'GET')
}

// 课程 API
export const courseApi = {
  getCourses: (params?: any) => request('/courses', 'GET', params),
  getCourseDetail: (courseId: string) => request(`/courses/${courseId}`, 'GET'),
  getCourseLessons: (courseId: string) => request(`/courses/${courseId}/lessons`, 'GET'),
  getMyCourses: () => request('/courses/my-courses', 'GET'),
  addToMyCourses: (courseId: string, tags?: any) => 
    request('/courses/my-courses', 'POST', { course_id: courseId, tags }),
  removeFromMyCourses: (courseId: string) => 
    request(`/courses/my-courses/${courseId}`, 'DELETE')
}

// 进度 API
export const progressApi = {
  updateProgress: (data: any) => request('/courses/progress', 'POST', data),
  getLatestProgress: () => request('/courses/progress/latest', 'GET'),
  getCourseProgress: (courseId: string) => 
    request(`/courses/progress/course/${courseId}`, 'GET')
}

export default {
  authApi,
  userApi,
  courseApi,
  progressApi
}
