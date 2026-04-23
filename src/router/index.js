import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由懒加载 - 动态导入
const Dashboard = () => import('@/views/Dashboard.vue')
const Discovery = () => import('@/views/Discovery.vue')
const CourseDetail = () => import('@/views/CourseDetail.vue')
const ChapterList = () => import('@/views/ChapterList.vue')
const Learning = () => import('@/views/Learning.vue')
const Profile = () => import('@/views/Profile.vue')
const Settings = () => import('@/views/Settings.vue')
const Login = () => import('@/views/Login.vue')
const DatabaseViewer = () => import('@/views/DatabaseViewer.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { showTabBar: true, requiresAuth: false } // 暂时不需要登录
  },
  {
    path: '/discovery',
    name: 'Discovery',
    component: Discovery,
    meta: { showTabBar: true, requiresAuth: false }
  },
  {
    path: '/course/:id',
    name: 'CourseDetail',
    component: CourseDetail,
    meta: { requiresAuth: false }
  },
  {
    path: '/course/:id/chapters',
    name: 'ChapterList',
    component: ChapterList,
    meta: { requiresAuth: false }
  },
  {
    path: '/course/:courseId/lesson/:lessonId',
    name: 'Learning',
    component: Learning,
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { showTabBar: true, requiresAuth: false }
  },
  {
    path: '/settings/:settingType',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: false }
  },
  {
    path: '/database',
    name: 'DatabaseViewer',
    component: DatabaseViewer,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫（可选，如果需要强制登录）
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore()
    
    // 初始化认证状态
    if (!authStore.isAuthenticated) {
      await authStore.init()
    }
    
    // 如果路由需要登录但用户未登录，可以重定向到登录页
    // 目前设置为不需要登录，所以直接通过
    // if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    //   next({ name: 'Login', query: { redirect: to.fullPath } })
    // } else {
    //   next()
    // }
    
    next()
  } catch (error) {
    next(error)
  }
})

router.afterEach(() => {
  // afterEach hook - 可用于埋点统计等
})

export default router

