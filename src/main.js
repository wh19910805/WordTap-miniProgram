// 最开始的日志，确认文件是否被加载


import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/auth'



const app = createApp(App)
const pinia = createPinia()



app.use(pinia)
app.use(router)



// 检查 DOM 元素
const appElement = document.getElementById('app')
if (!appElement) {
  console.error('[main.js] 错误: 找不到 #app 元素')
} else {

}

// 直接挂载应用，不等待认证初始化
// 认证初始化在路由守卫中处理
try {
  app.mount('#app')

} catch (error) {
  console.error('[main.js] 应用挂载失败:', error)
}

// 异步初始化认证状态（不阻塞应用挂载）
const authStore = useAuthStore()
authStore.init().then(() => {

}).catch((error) => {
  console.error('[main.js] 认证初始化失败:', error)
})

