import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "@/db";
import { userApi } from "@/api/client";

export const useUserStore = defineStore("user", () => {
  const streak = ref(0); // 连胜天数
  const totalCheckIn = ref(0); // 累计打卡天数
  const wordCount = ref(0);
  const studyTime = ref({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    total: 0,
  });
  const lastStudyDate = ref(null);
  const weeklyActivity = ref([]); // 本周打卡记录
  const completedLessons = ref(0); // 完成课程数
  const recentLessons = ref([]); // 最近学习
  const learningHeatmap = ref({}); // 学习热力图数据

  // 从后端API加载用户数据
  async function loadUserData() {

    try {

      const stats = await userApi.getStats();

      if (stats) {
        streak.value = stats.streak || 0;
        totalCheckIn.value = stats.total_check_in || 0;
        wordCount.value = stats.word_count || 0;
        studyTime.value = {
          today: stats.study_time_today || 0,
          week: stats.study_time_week || 0,
          month: stats.study_time_month || 0,
          year: stats.study_time_year || 0,
          total: stats.study_time_total || 0,
        };
        lastStudyDate.value = stats.last_study_date || null;
        completedLessons.value = stats.completed_lessons || 0;


        // 同时保存到本地数据库作为备份
        await db.userStats.put({
          id: "main",
          streak: stats.streak || 0,
          totalCheckIn: stats.total_check_in || 0,
          wordCount: stats.word_count || 0,
          studyTime: {
            today: stats.study_time_today || 0,
            week: stats.study_time_week || 0,
            month: stats.study_time_month || 0,
            year: stats.study_time_year || 0,
            total: stats.study_time_total || 0,
          },
          lastStudyDate: stats.last_study_date || null,
          completedLessons: stats.completed_lessons || 0,
        });
      } else {

      }


      await updateWeeklyActivity();



      await loadRecentLessons();



      await loadLearningHeatmap();



    } catch (error) {
      console.error("[user.js] 加载用户数据失败:", error);
      console.error("[user.js] 错误详情:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // 失败时从本地数据库加载备份数据
      try {
        const stats = await db.userStats.get("main");
        if (stats) {
          streak.value = stats.streak || 0;
          totalCheckIn.value = stats.totalCheckIn || 0;
          wordCount.value = stats.wordCount || 0;
          studyTime.value = stats.studyTime || {
            today: 0,
            week: 0,
            month: 0,
            year: 0,
            total: 0,
          };
          lastStudyDate.value = stats.lastStudyDate || null;
          completedLessons.value = stats.completedLessons || 0;
        }
      } catch (dbError) {
        console.error("[user.js] 从本地数据库加载备份数据也失败:", dbError);
      }
    }
  }

  // 更新连续打卡天数
  async function updateStreak() {
    const today = new Date().toDateString();
    // 确保 lastStudyDate 是字符串格式
    const lastDate = lastStudyDate.value
      ? typeof lastStudyDate.value === "string"
        ? lastStudyDate.value
        : new Date(lastStudyDate.value).toDateString()
      : null;

    if (lastDate === today) {
      // 今天已经学习过，不更新
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastDate === yesterdayStr) {
      // 连续学习
      streak.value += 1;
    } else if (lastDate !== today) {
      // 中断了，重置为1
      streak.value = 1;
    }

    lastStudyDate.value = today;

    // 更新累计打卡
    if (streak.value > 0) {
      totalCheckIn.value = (totalCheckIn.value || 0) + 1;
    }

    // 确保所有值都是可序列化的原始值
    const statsToSave = {
      id: "main",
      streak: Number(streak.value) || 0,
      totalCheckIn: Number(totalCheckIn.value) || 0,
      wordCount: Number(wordCount.value) || 0,
      studyTime: studyTime.value
        ? JSON.parse(JSON.stringify(studyTime.value))
        : { today: 0, week: 0, month: 0, year: 0, total: 0 },
      lastStudyDate: String(today || ""),
      completedLessons: Number(completedLessons.value) || 0,
    };

    await db.userStats.put(statsToSave);
  }

  // 增加词汇量
  async function addWordCount(count = 1) {
    wordCount.value += count;
    // 确保所有值都是可序列化的原始值
    const statsToSave = {
      id: "main",
      streak: Number(streak.value) || 0,
      totalCheckIn: Number(totalCheckIn.value) || 0,
      wordCount: Number(wordCount.value) || 0,
      studyTime: studyTime.value
        ? JSON.parse(JSON.stringify(studyTime.value))
        : { today: 0, week: 0, month: 0, year: 0, total: 0 },
      lastStudyDate: lastStudyDate.value ? String(lastStudyDate.value) : null,
      completedLessons: Number(completedLessons.value) || 0,
    };
    await db.userStats.put(statsToSave);
  }

  // 增加学习时长（分钟）
  async function addStudyTime(minutes, period = "today") {
    studyTime.value[period] = (studyTime.value[period] || 0) + minutes;
    // 同时更新总计
    studyTime.value.total = (studyTime.value.total || 0) + minutes;
    // 确保所有值都是可序列化的原始值
    const statsToSave = {
      id: "main",
      streak: Number(streak.value) || 0,
      totalCheckIn: Number(totalCheckIn.value) || 0,
      wordCount: Number(wordCount.value) || 0,
      studyTime: studyTime.value
        ? JSON.parse(JSON.stringify(studyTime.value))
        : { today: 0, week: 0, month: 0, year: 0, total: 0 },
      lastStudyDate: lastStudyDate.value ? String(lastStudyDate.value) : null,
      completedLessons: Number(completedLessons.value) || 0,
    };
    await db.userStats.put(statsToSave);
  }

  // 更新周活动数据（本周打卡记录）
  async function updateWeeklyActivity() {
    const activities = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=周日, 1=周一...

    // 获取本周的周一到周日
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    // 获取所有学习记录的日期
    let studyDates = new Set();

    try {
      // 从后端获取最近的学习记录
      const response = await userApi.getRecentStudies(30); // 获取30天内的记录
      if (response && response.records) {
        // 提取所有学习日期
        response.records.forEach((record) => {
          if (record.last_studied_at) {
            const studyDate = new Date(record.last_studied_at).toDateString();
            studyDates.add(studyDate);
          }
        });
      }
    } catch (error) {
      console.error("获取最近学习记录失败:", error);
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toDateString();

      // 检查当天是否有学习记录
      const hasStudy = studyDates.has(dateStr);

      activities.push({
        date: dateStr,
        dayOfWeek: i, // 0=周一, 6=周日
        checked: hasStudy || false,
        isToday: dateStr === today.toDateString(),
      });
    }

    weeklyActivity.value = activities;
  }

  // 从后端API加载最近学习记录
  async function loadRecentLessons() {
    try {

      const response = await userApi.getRecentStudies(3);


      if (response && response.records) {
        recentLessons.value = response.records.map((record) => ({
          id: record.lesson_id, // 使用lesson_id作为id，这样goToLesson函数可以直接使用lesson.id作为lessonId
          courseId: record.course_id,
          courseName: record.course_name || "未知课程",
          title: record.lesson_name || `Lesson`,
          time: new Date(record.last_studied_at).getTime(),
          order: 0,
        }));
      } else {
        recentLessons.value = [];
      }
    } catch (error) {
      console.error("从API加载最近学习失败:", error);
      try {
        // API失败时从本地数据库加载

        const allLessons = await db.lessons.toArray();
        const sortedLessons = allLessons
          .filter((lesson) => lesson.lastStudyTime != null)
          .sort((a, b) => (b.lastStudyTime || 0) - (a.lastStudyTime || 0))
          .slice(0, 3);

        recentLessons.value = sortedLessons.map((lesson) => ({
          id: lesson.id,
          courseId: lesson.courseId,
          courseName: lesson.courseName || "未知课程",
          title: lesson.title || `Lesson ${lesson.order || ""}`,
          time: lesson.lastStudyTime,
          order: lesson.order,
        }));
      } catch (dbError) {
        console.error("从本地数据库加载最近学习也失败:", dbError);
        recentLessons.value = [];
      }
    }
  }

  // 从后端API加载学习热力图
  async function loadLearningHeatmap() {
    try {

      const response = await userApi.getHeatmap(6); // 获取最近6个月的数据


      if (response && response.data) {
        const heatmap = {};
        response.data.forEach((item) => {
          heatmap[item.date] = item.count;
        });
        learningHeatmap.value = heatmap;
      } else {
        learningHeatmap.value = {};
      }
    } catch (error) {
      console.error("从API加载学习热力图失败:", error);
      try {
        // API失败时从本地数据库加载

        const allLessons = await db.lessons.toArray();
        const heatmap = {};

        allLessons.forEach((lesson) => {
          if (lesson.lastStudyTime) {
            const date = new Date(lesson.lastStudyTime);
            const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
            heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
          }
        });

        learningHeatmap.value = heatmap;
      } catch (dbError) {
        console.error("从本地数据库加载学习热力图也失败:", dbError);
        learningHeatmap.value = {};
      }
    }
  }

  // 每日打卡
  async function checkIn() {
    try {

      const response = await userApi.checkIn();


      if (response && response.success) {
        // 更新本地状态
        streak.value = response.streak || 0;
        totalCheckIn.value = response.total_check_in || 0;

        // 同时更新本地数据库
        await db.userStats.put({
          id: "main",
          streak: response.streak || 0,
          totalCheckIn: response.total_check_in || 0,
          wordCount: wordCount.value,
          studyTime: studyTime.value,
          lastStudyDate: lastStudyDate.value,
          completedLessons: completedLessons.value,
        });

        // 更新周活动
        await updateWeeklyActivity();

        return response;
      }
    } catch (error) {
      console.error("打卡API调用失败:", error);
      throw error;
    }
  }

  return {
    streak,
    totalCheckIn,
    wordCount,
    studyTime,
    lastStudyDate,
    weeklyActivity,
    completedLessons,
    recentLessons,
    learningHeatmap,
    loadUserData,
    updateStreak,
    addWordCount,
    addStudyTime,
    updateWeeklyActivity,
    loadRecentLessons,
    loadLearningHeatmap,
    checkIn,
  };
});
