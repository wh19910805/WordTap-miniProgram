import Dexie from 'dexie'

export const db = new Dexie('WordTapDB')

// 定义数据库结构
// 注意：tags 存储为 JSON 字符串，不作为索引
db.version(1).stores({
  courses: 'id, name, category, addedAt', // tags 存储为 JSON 字符串
  lessons: 'id, courseId, title, order, completedAt, bestTime, attemptCount',
  userProgress: 'id++, courseId, lessonId, sentenceIndex, inputText, isCorrect, timestamp',
  userStats: 'id, streak, wordCount, studyTime, lastStudyDate',
  settings: 'key, value'
})

// 升级到版本2，添加用户表
db.version(2).stores({
  courses: 'id, name, category, addedAt',
  lessons: 'id, courseId, title, order, completedAt, bestTime, attemptCount',
  userProgress: 'id++, courseId, lessonId, sentenceIndex, inputText, isCorrect, timestamp',
  userStats: 'id, streak, wordCount, studyTime, lastStudyDate',
  settings: 'key, value',
  users: 'id, username, email, password, createdAt, lastLoginAt'
}).upgrade(tx => {
  // 升级逻辑：如果需要迁移数据

})

// 升级到版本3，添加 lastStudyTime 索引
db.version(3).stores({
  courses: 'id, name, category, addedAt',
  lessons: 'id, courseId, title, order, completedAt, bestTime, attemptCount, lastStudyTime',
  userProgress: 'id++, courseId, lessonId, sentenceIndex, inputText, isCorrect, timestamp',
  userStats: 'id, streak, wordCount, studyTime, lastStudyDate',
  settings: 'key, value',
  users: 'id, username, email, password, createdAt, lastLoginAt'
}).upgrade(tx => {
  // 升级逻辑：如果需要迁移数据

})

// 升级到版本4，添加课程缓存表
db.version(4).stores({
  courses: 'id, name, category, addedAt',
  lessons: 'id, courseId, title, order, completedAt, bestTime, attemptCount, lastStudyTime',
  userProgress: 'id++, courseId, lessonId, sentenceIndex, inputText, isCorrect, timestamp',
  userStats: 'id, streak, wordCount, studyTime, lastStudyDate',
  settings: 'key, value',
  users: 'id, username, email, password, createdAt, lastLoginAt',
  courseCache: 'id, cachedAt, type, category'  // 使用课程ID作为主键
}).upgrade(tx => {
  // 升级逻辑：如果需要迁移数据

})

// 打开数据库，确保初始化
db.open().then(() => {

}).catch(err => {
  console.error('数据库打开失败:', err)
  // 如果是版本错误，尝试删除数据库重新创建
  if (err.name === 'VersionError') {

    Dexie.delete('WordTapDB').then(() => {

      window.location.reload()
    })
  }
})

export default db

