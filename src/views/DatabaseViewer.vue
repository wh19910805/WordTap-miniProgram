<template>
  <div class="min-h-screen bg-[var(--background-color)] pb-20">
    <div class="page-container content-area">
      <!-- 标题 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)]">
        <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">本地数据库管理</h1>
        <p class="text-sm text-[var(--text-tertiary)]">
          数据库名称: <span class="font-mono">WordTapDB</span> | 
          版本: <span class="font-mono">{{ dbVersion }}</span>
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)]">
        <div class="flex gap-2 flex-wrap">
          <button
            @click="refreshData"
            class="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 active:scale-95 transition-all duration-200"
          >
            刷新数据
          </button>
          <button
            @click="exportData"
            class="px-4 py-2 bg-lime-400 text-white rounded-full hover:bg-lime-500 active:scale-95 transition-all duration-200"
          >
            导出数据
          </button>
          <button
            @click="clearAllData"
            class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-all duration-200"
          >
            清空所有数据
          </button>
        </div>
      </div>

      <!-- 用户表 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">用户表 (users)</h2>
          <span class="text-sm text-[var(--text-tertiary)]">{{ users.length }} 条记录</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--border-color)]">
                <th class="text-left p-2 text-[var(--text-tertiary)]">ID</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">用户名</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">邮箱</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">创建时间</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">最后登录</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="border-b border-[var(--border-color)]"
              >
                <td class="p-2 font-mono text-xs">{{ user.id }}</td>
                <td class="p-2">{{ user.username }}</td>
                <td class="p-2">{{ user.email }}</td>
                <td class="p-2 text-xs text-[var(--text-tertiary)]">{{ formatDate(user.createdAt) }}</td>
                <td class="p-2 text-xs text-[var(--text-tertiary)]">{{ formatDate(user.lastLoginAt) }}</td>
                <td class="p-2">
                  <button
                    @click="deleteUser(user.id)"
                    class="text-red-500 hover:text-red-700 text-xs"
                  >
                    删除
                  </button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="p-4 text-center text-[var(--text-tertiary)]">
                  暂无用户数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 用户统计表 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">用户统计 (userStats)</h2>
          <span class="text-sm text-[var(--text-tertiary)]">{{ userStats.length }} 条记录</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--border-color)]">
                <th class="text-left p-2 text-[var(--text-tertiary)]">ID</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">连胜</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">累计打卡</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">词汇量</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">学习时长</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">完成课程</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="stat in userStats"
                :key="stat.id"
                class="border-b border-[var(--border-color)]"
              >
                <td class="p-2 font-mono text-xs">{{ stat.id }}</td>
                <td class="p-2">{{ stat.streak || 0 }}</td>
                <td class="p-2">{{ stat.totalCheckIn || 0 }}</td>
                <td class="p-2">{{ stat.wordCount || 0 }}</td>
                <td class="p-2">{{ JSON.stringify(stat.studyTime) }}</td>
                <td class="p-2">{{ stat.completedLessons || 0 }}</td>
              </tr>
              <tr v-if="userStats.length === 0">
                <td colspan="6" class="p-4 text-center text-[var(--text-tertiary)]">
                  暂无统计数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 课程表 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">我的课程 (courses)</h2>
          <span class="text-sm text-[var(--text-tertiary)]">{{ courses.length }} 条记录</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--border-color)]">
                <th class="text-left p-2 text-[var(--text-tertiary)]">ID</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">名称</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">分类</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">添加时间</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="course in courses"
                :key="course.id"
                class="border-b border-[var(--border-color)]"
              >
                <td class="p-2 font-mono text-xs">{{ course.id }}</td>
                <td class="p-2">{{ course.name }}</td>
                <td class="p-2">{{ course.category }}</td>
                <td class="p-2 text-xs text-[var(--text-tertiary)]">{{ formatDate(course.addedAt) }}</td>
              </tr>
              <tr v-if="courses.length === 0">
                <td colspan="4" class="p-4 text-center text-[var(--text-tertiary)]">
                  暂无课程数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 课时表 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">课时记录 (lessons)</h2>
          <span class="text-sm text-[var(--text-tertiary)]">{{ lessons.length }} 条记录</span>
        </div>
        <div class="overflow-x-auto max-h-96 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-[var(--surface-color)]">
              <tr class="border-b border-[var(--border-color)]">
                <th class="text-left p-2 text-[var(--text-tertiary)]">ID</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">课程ID</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">标题</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">完成时间</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">最佳时长</th>
                <th class="text-left p-2 text-[var(--text-tertiary)]">尝试次数</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="lesson in lessons"
                :key="lesson.id"
                class="border-b border-[var(--border-color)]"
              >
                <td class="p-2 font-mono text-xs">{{ lesson.id }}</td>
                <td class="p-2 font-mono text-xs">{{ lesson.courseId }}</td>
                <td class="p-2">{{ lesson.title || '-' }}</td>
                <td class="p-2 text-xs text-[var(--text-tertiary)]">{{ formatDate(lesson.completedAt) }}</td>
                <td class="p-2">{{ lesson.bestTime ? `${Math.floor(lesson.bestTime / 60)}:${(lesson.bestTime % 60).toString().padStart(2, '0')}` : '-' }}</td>
                <td class="p-2">{{ lesson.attemptCount || 0 }}</td>
              </tr>
              <tr v-if="lessons.length === 0">
                <td colspan="6" class="p-4 text-center text-[var(--text-tertiary)]">
                  暂无课时数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/db'

const dbVersion = ref(0)
const users = ref([])
const userStats = ref([])
const courses = ref([])
const lessons = ref([])

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

async function refreshData() {
  try {
    dbVersion.value = db.verno
    
    // 加载所有表的数据
    users.value = await db.users.toArray()
    userStats.value = await db.userStats.toArray()
    courses.value = await db.courses.toArray()
    lessons.value = await db.lessons.toArray()
    

  } catch (error) {
    console.error('刷新数据失败:', error)
    alert('刷新数据失败: ' + error.message)
  }
}

async function deleteUser(userId) {
  if (!confirm('确定要删除这个用户吗？')) {
    return
  }
  
  try {
    await db.users.delete(userId)
    await refreshData()
    alert('用户已删除')
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('删除用户失败: ' + error.message)
  }
}

async function exportData() {
  try {
    const data = {
      users: await db.users.toArray(),
      userStats: await db.userStats.toArray(),
      courses: await db.courses.toArray(),
      lessons: await db.lessons.toArray(),
      userProgress: await db.userProgress.toArray(),
      settings: await db.settings.toArray(),
      exportTime: new Date().toISOString()
    }
    
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wordtap-db-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    alert('数据已导出')
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('导出数据失败: ' + error.message)
  }
}

async function clearAllData() {
  if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    return
  }
  
  if (!confirm('再次确认：真的要清空所有数据吗？')) {
    return
  }
  
  try {
    await db.users.clear()
    await db.userStats.clear()
    await db.courses.clear()
    await db.lessons.clear()
    await db.userProgress.clear()
    await db.settings.clear()
    
    await refreshData()
    alert('所有数据已清空')
  } catch (error) {
    console.error('清空数据失败:', error)
    alert('清空数据失败: ' + error.message)
  }
}

onMounted(() => {
  refreshData()
})
</script>

