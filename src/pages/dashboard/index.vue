<template>
  <view class="dashboard-page" :style="pageThemeStyle">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="logo-area">
          <view class="logo-icon">
            <image src="/static/images/logo.png" mode="aspectFit"></image>
          </view>
          <text class="app-title">WordTap</text>
        </view>
      </view>
    </view>

    <view class="content-area">
      <!-- 每日打卡部分 -->
      <view class="section-card">
        <!-- 标题栏 -->
        <view class="section-header">
          <view class="section-title-row">
            <view class="section-icon primary">
              <Icon name="calendar" size="lg" />
            </view>
            <text class="section-title">每日打卡</text>
          </view>
        </view>

        <!-- 连胜和累计打卡 -->
        <view class="stats-row">
          <view class="stat-card streak">
            <view class="stat-icon fire">
              <Icon name="fire" size="lg" color="var(--warning-color)" />
            </view>
            <view class="stat-content">
              <text class="stat-value">{{ userStore.stats.streak || 0 }}</text>
              <text class="stat-label">天连胜</text>
            </view>
            <text class="stat-desc">连续学习，挑战自我</text>
          </view>
          <view class="stat-card total">
            <view class="stat-icon">
              <Icon name="check" size="lg" color="var(--text-primary)" />
            </view>
            <view class="stat-content">
              <text class="stat-value">{{ userStore.stats.total_check_in || 0 }}</text>
              <text class="stat-label">天累计</text>
            </view>
            <text class="stat-desc">坚持学习，成就未来</text>
          </view>
        </view>

        <!-- 本周打卡记录 -->
        <view class="week-section">
          <text class="week-title">本周打卡记录</text>
          <view class="week-days">
            <view
              v-for="(day, index) in weekDays"
              :key="index"
              class="day-item"
              :class="{
                checked: day.checked,
                today: day.isToday,
              }"
            >
              <!-- 勾选图标 -->
              <view v-if="day.checked" class="day-checked">
                <Icon name="check" size="lg" color="#fff" />
              </view>
              <!-- 今日标签 -->
              <view v-else-if="day.isToday" class="day-today">今日</view>
              <!-- 空白 -->
              <view v-else class="day-empty"></view>
            </view>
          </view>
          <view class="week-labels">
            <text v-for="(day, index) in weekDays" :key="index" class="day-label">{{
              day.label
            }}</text>
          </view>
        </view>

        <!-- 打卡按钮 -->
        <view
          v-if="authStore.isAuthenticated"
          class="checkin-btn"
          :class="{ checked: hasCheckedIn }"
          @click="handleCheckIn"
        >
          <Icon name="check" size="lg" color="var(--accent-color)" />
          <Icon name="search" size="lg" color="var(--text-tertiary)" />
          <text>{{ hasCheckedIn ? "已打卡" : "立即打卡" }}</text>
        </view>
        <view v-else class="checkin-btn login" @click="goToLogin">
          <Icon name="info" size="lg" color="var(--text-secondary)" />
          <text>登录后开始打卡</text>
        </view>
      </view>

      <!-- 继续学习 -->
      <view
        v-if="authStore.isAuthenticated && latestProgress"
        class="section-card continue-card"
        @click="continueLearning"
      >
        <view class="continue-play">
          <Icon name="play" size="lg" color="var(--primary-color)" />
        </view>
        <view class="continue-info">
          <text class="continue-title">继续学习</text>
          <text class="continue-course">{{ latestProgress.course_name }}</text>
        </view>
        <view class="continue-badge">上次学习</view>
      </view>

      <!-- 最近学习 -->
      <view class="section-card">
        <view class="section-header">
          <view class="section-title-row">
            <view class="section-icon primary">
              <Icon name="book" size="lg" color="var(--primary-color)" />
            </view>
            <text class="section-title">最近学习</text>
          </view>
          <view class="more-btn" @click="goToDiscovery">
            <text>查看更多</text>
            <Icon name="right-arrow" size="lg" color="var(--primary-color)" />
          </view>
        </view>

        <view v-if="recentLessons.length > 0" class="lesson-list">
          <view
            v-for="(lesson, index) in recentLessons.slice(0, 3)"
            :key="index"
            class="lesson-item"
            @click="goToLesson(lesson)"
          >
            <view
              class="lesson-cover"
              :style="{ background: getCoverColor(lesson.courseId) }"
            >
              <text>{{ lesson.courseName?.charAt(0) || "课" }}</text>
              <view class="lesson-index">{{ index + 1 }}</view>
            </view>
            <view class="lesson-info">
              <text class="course-name">{{ lesson.courseName }}</text>
              <text class="lesson-title">{{ lesson.title }}</text>
              <text class="lesson-time">{{ formatRelativeTime(lesson.time) }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <view class="empty-icon">
            <Icon name="home-info-fill" size="lg" color="var(--primary-color)" />
          </view>
          <text class="empty-text">暂无最近学习记录</text>
          <text class="link" @click="goToDiscovery">去课程广场开始学习</text>
        </view>
      </view>

      <!-- 学习统计 -->
      <view class="section-card">
        <view class="section-header">
          <view class="section-title-row">
            <view class="section-icon primary">
              <Icon name="book" size="lg" color="var(--primary-color)" />
            </view>
            <text class="section-title">学习统计</text>
          </view>
          <!-- 时间段切换 -->
          <view class="period-switch">
            <view
              v-for="period in timePeriods"
              :key="period.key"
              class="period-btn"
              :class="{ active: currentPeriod === period.key }"
              @click="currentPeriod = period.key"
            >
              <text>{{ period.label }}</text>
            </view>
          </view>
        </view>

        <view class="stats-grid">
          <view class="stat-item-card primary">
            <view class="stat-item-header">
              <text class="stat-item-label">学习时长</text>
              <view class="stat-item-icon primary">
                <Icon name="count-course" size="lg" color="var(--primary-color)" />
              </view>
            </view>
            <view class="stat-item-value">
              <text class="big-value">{{ formatStudyTime(currentStudyTime) }}</text>
              <view class="period-tag">
                <text>{{ getPeriodLabel(currentPeriod) }}</text>
              </view>
            </view>
            <text class="stat-item-desc">
              {{
                currentPeriod === "total"
                  ? "累计学习时长"
                  : `过去${getPeriodDays(currentPeriod)}的学习时长`
              }}
            </text>
          </view>

          <view class="stat-item-card accent">
            <view class="stat-item-header">
              <text class="stat-item-label">完成课程</text>
              <view class="stat-item-icon accent">
                <Icon name="count-course" size="lg" color="var(--accent-color)" />
              </view>
            </view>
            <view class="stat-item-value">
              <text class="big-value">{{ userStore.stats.completed_lessons || 0 }}</text>
              <text class="unit">节</text>
            </view>
            <text class="stat-item-desc">已经完成的课程数量</text>
            <view class="progress-bar">
              <view
                class="progress-fill"
                :style="{
                  width:
                    Math.min((userStore.stats.completed_lessons || 0) * 5, 100) + '%',
                }"
              ></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 学习工具 -->
      <view class="section-card">
        <view class="section-header">
          <view class="section-title-row">
            <view class="section-icon indigo">
              <Icon name="tools" size="lg" color="var(--primary-color)" />
            </view>
            <text class="section-title">学习工具</text>
          </view>
        </view>

        <view class="tools-grid">
          <view class="tool-item" @click="goToWrongWords">
            <view class="tool-icon primary">
              <Icon name="tools-wrong" size="lg" color="var(--primary-color)" />
            </view>
            <view class="tool-info">
              <text class="tool-name">错题本</text>
              <text class="tool-desc">记录学习中的错误</text>
              <view class="tool-badge primary">
                <text>{{ wrongWordCount }}题待复习</text>
              </view>
            </view>
          </view>
          <view class="tool-item" @click="goToNewWords">
            <view class="tool-icon accent">
              <Icon name="tools-word" size="lg" color="var(--primary-color)" />
            </view>
            <view class="tool-info">
              <text class="tool-name">生词本</text>
              <text class="tool-desc">记录学习中的生词</text>
              <view class="tool-badge accent">
                <text>{{ newWordCount }}个生词</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 学习热力图 -->
      <view class="section-card">
        <!-- 已登录显示热力图 -->
        <template v-if="authStore.isAuthenticated">
          <view class="section-header">
            <view class="section-title-row">
              <view class="section-icon indigo">
                <Icon name="hot" size="lg" color="var(--primary-color)" />
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              </view>
              <text class="section-title">学习热力图</text>
            </view>
            <view class="month-nav">
              <view class="nav-btn" @click="prevMonth">
                <Icon name="left" size="lg" color="var(--primary-color)" />
              </view>
              <text class="month-label">{{ currentMonthLabel }}</text>
              <view class="nav-btn" @click="nextMonth">
                <Icon name="right" size="lg" color="var(--primary-color)" />
              </view>
            </view>
          </view>

          <view class="heatmap">
            <view class="weekday-labels">
              <text
                v-for="day in ['一', '二', '三', '四', '五', '六', '日']"
                :key="day"
                >{{ day }}</text
              >
            </view>
            <view class="heatmap-grid">
              <view
                v-for="(day, index) in heatmapDays"
                :key="index"
                class="heatmap-cell"
                :class="getHeatmapClass(day)"
              ></view>
            </view>
          </view>
        </template>
        <!-- 未登录显示提示 -->
        <view v-else class="login-prompt">
          <text>登录后查看学习热力图</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </view>

    <!-- 自定义TabBar -->
    <CustomTabbar />
  </view>
</template>

<script setup lang="ts">
import Icon from "@/components/icon.vue";
import CustomTabbar from "@/components/tabbar.vue";
import { ref, computed, onMounted, inject, reactive } from "vue";
import { useAuthStore, useUserStore, useCourseStore } from "@/stores";

const authStore = useAuthStore();
const userStore = useUserStore();
const courseStore = useCourseStore();

// 获取全局主题状态
const themeState = inject('themeState', reactive({ isDark: false, backgroundColor: '#f8fafc', color: '#0f172a' }))

// 页面主题样式 - 应用所有CSS变量
const pageThemeStyle = computed(() => ({
  backgroundColor: themeState.backgroundColor,
  color: themeState.color,
  '--background-color': themeState['--background-color'],
  '--surface-color': themeState['--surface-color'],
  '--text-primary': themeState['--text-primary'],
  '--text-secondary': themeState['--text-secondary'],
  '--text-tertiary': themeState['--text-tertiary'],
  '--border-color': themeState['--border-color'],
  '--hover-color': themeState['--hover-color'],
  '--primary-color': themeState['--primary-color'],
  '--primary-light': themeState['--primary-light'],
  '--accent-color': themeState['--accent-color'],
  '--error-color': themeState['--error-color'],
  '--success-color': themeState['--success-color'],
  '--warning-color': themeState['--warning-color'],
}))

const statusBarHeight = ref(20);
const hasCheckedIn = ref(false);
const wrongWordCount = ref(74);
const newWordCount = ref(236);

const latestProgress = ref<any>(null);
const recentLessons = ref<any[]>([]);

// 时间段切换
const currentPeriod = ref("week");
const timePeriods = [
  { key: "total", label: "总计" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "year", label: "今年" },
];

// 周数据
const weekDays = computed(() => {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return userStore.weeklyActivity.map((day: any, index: number) => ({
    ...day,
    label: days[index],
  }));
});

// 当前学习时长
const currentStudyTime = computed(() => {
  if (currentPeriod.value === "total") {
    return userStore.stats.study_time_total || 0;
  }
  const key = `study_time_${currentPeriod.value}`;
  return userStore.stats[key] || 0;
});

function getPeriodLabel(period: string) {
  const map: Record<string, string> = {
    total: "总计",
    week: "本周",
    month: "本月",
    year: "本年",
  };
  return map[period] || "本周";
}

function getPeriodDays(period: string) {
  const map: Record<string, string> = {
    total: "总计",
    week: "7天",
    month: "30天",
    year: "12个月",
  };
  return map[period] || "7天";
}

// 热力图数据
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const currentMonthLabel = computed(() => {
  return `${currentYear.value}年${currentMonth.value + 1}月`;
});

const heatmapDays = computed(() => {
  const days: any[] = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  // 填充月初空白
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ hasData: false, isToday: false, date: "" });
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    const dateStr = date.toISOString().split("T")[0];
    const isFutureDate = date > today;
    const hasData = !isFutureDate && userStore.heatmapData[dateStr] > 0;
    const isToday = dateStr === todayStr;

    days.push({
      hasData,
      isToday,
      date: dateStr,
      day,
    });
  }

  return days;
});

function getHeatmapClass(day: any) {
  if (day.hasData) return "has-data";
  if (day.isToday) return "today";
  return "empty";
}

function getCoverColor(courseId: string) {
  const colors = ["#6366f1", "#06b6d4", "#14b8a6", "#f59e0b", "#ec4899"];
  const index = courseId?.charCodeAt(0) % colors.length || 0;
  return colors[index];
}

function formatStudyTime(minutes: number) {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
}

function formatRelativeTime(timeStr: string) {
  if (!timeStr) return "";
  const time = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  return `${Math.floor(days / 7)} 周前`;
}

async function handleCheckIn() {
  if (hasCheckedIn.value) return;
  const result = await userStore.checkIn();
  if (result.success) {
    hasCheckedIn.value = true;
    uni.showToast({ title: "打卡成功", icon: "success" });
  }
}

function goToLogin() {
  uni.navigateTo({ url: "/pages/login/index" });
}

function continueLearning() {
  if (latestProgress.value) {
    uni.navigateTo({
      url: `/pages/learning/index?courseId=${latestProgress.value.course_id}&lessonId=${latestProgress.value.lesson_id}`,
    });
  }
}

function goToLesson(lesson: any) {
  uni.navigateTo({
    url: `/pages/learning/index?courseId=${lesson.courseId}&lessonId=${lesson.id}`,
  });
}

function goToDiscovery() {
  uni.switchTab({ url: "/pages/discovery/index" });
}

function goToWrongWords() {
  uni.showToast({ title: "功能开发中", icon: "none" });
}

function goToNewWords() {
  uni.showToast({ title: "功能开发中", icon: "none" });
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;

  if (authStore.isAuthenticated) {
    await Promise.all([
      userStore.fetchStats(),
      userStore.fetchHeatmap(),
      userStore.fetchRecentStudies(),
    ]);

    recentLessons.value = userStore.recentStudies.slice(0, 3);
    wrongWordCount.value = 74;
    newWordCount.value = 236;
  }
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

/* 头部 */
.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--surface-color);
  padding: 16px;
  z-index: var(--z-sticky);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon image {
  width: 28px;
  height: 28px;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.content-area {
  flex: 1;
  width: 100%;
  padding: var(--space-3);
  padding-bottom: 100px;
  box-sizing: border-box;
}

/* 通用卡片 */
.section-card {
  background: var(--surface-color);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 圆形，与 Web 端一致 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon svg {
  width: 32px;
  height: 32px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.more-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.more-btn:active {
  opacity: 0.7;
}

.more-btn svg {
  width: 16px;
  height: 16px;
}

/* 打卡卡片 */
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.stat-card {
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  color: #fff;
  transition: transform 0.2s ease;
  border: none;
}

.stat-card:active {
  transform: scale(0.97);
}

.stat-card.streak {
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); /* Gen Z渐变效果 */
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); /* 添加阴影增强层次感 */
}

.stat-card.total {
  background: linear-gradient(135deg, var(--accent-light), var(--accent-color)); /* Gen Z渐变效果 */
  box-shadow: 0 4px 12px rgba(132, 204, 22, 0.3); /* 添加阴影增强层次感 */
}

.stat-icon {
  width: 28px;
  height: 28px;
  margin-bottom: var(--space-2);
}

.stat-icon svg {
  width: 100%;
  height: 100%;
}

/* 小火苗弹跳动画 - 与 Web 端一致 */
.stat-icon.fire {
  animation: fireBounce 1s infinite;
}

@keyframes fireBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.stat-content {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 15px;
  font-weight: 500;
  opacity: 0.95;
  margin-left: 4px;
}

.stat-desc {
  font-size: 12px;
  opacity: 0.7;
  margin-top: var(--space-1);
}

/* 本周打卡 */
.week-section {
  margin-bottom: var(--space-4);
}

.week-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.week-days {
  display: flex;
  gap: var(--space-2);
}

.day-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--hover-color);
  border-radius: var(--radius-xl);
  height: 48px;
}

.day-item.checked {
  background: var(--primary-color);
  color: #fff;
}

.day-item.today {
  background: var(--surface-color);
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.day-checked {
  color: #fff;
}

.day-checked svg {
  width: 20px;
  height: 20px;
}

.day-item.checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.day-item.today {
  background: var(--surface-color);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.day-checked {
  width: 20px;
  height: 20px;
  color: #fff;
}

.day-checked svg {
  width: 100%;
  height: 100%;
}

.day-today {
  font-size: 10px;
  font-weight: 600;
  color: var(--primary-color);
}

.day-empty {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-color);
}

.day-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.week-labels {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.week-labels .day-label {
  flex: 1;
  text-align: center;
}

.day-item.checked .day-label {
  color: #fff;
}

/* 打卡按钮 */
.checkin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); /* Gen Z渐变效果 */
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); /* 添加阴影 */
}

.checkin-btn.checked {
  background: var(--primary-color); /* 与 Web 端一致，保持主色调 */
}

.checkin-btn.login {
  background: linear-gradient(135deg, var(--accent-light), var(--accent-color));
  color: #fff;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* 继续学习 */
.continue-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  color: #fff;
  cursor: pointer;
}

.continue-play {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.continue-play svg {
  width: 20px;
  height: 20px;
}

.continue-info {
  flex: 1;
}

.continue-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.continue-course {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.continue-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
}

/* 最近学习 */
.lesson-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--background-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.lesson-cover {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.lesson-cover text {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

.lesson-index {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--accent-color);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.lesson-info {
  flex: 1;
  min-width: 0;
}

.course-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.lesson-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-time {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--space-6) var(--space-4);
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: var(--background-color);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-3);
  color: var(--text-tertiary);
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-text {
  color: var(--text-tertiary);
  font-size: 14px;
  margin-bottom: var(--space-2);
}

.link {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 14px;
}

/* 时间段切换 */
.period-switch {
  display: flex;
  background: var(--background-color);
  border-radius: var(--radius-full);
  padding: 3px;
}

.period-btn {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.period-btn.active {
  background: var(--surface-color);
  color: var(--primary-color);
  border: 2px solid var(--primary-color); /* 与 Web 端一致 */
}

/* 统计网格 - 垂直堆叠布局 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

.stat-item-card {
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.stat-item-card.primary {
  background: var(--primary-bg);
}

.stat-item-card.accent {
  background: var(--accent-bg);
}

.stat-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.stat-item-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.stat-item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-item-icon svg {
  width: 18px;
  height: 18px;
}

.stat-item-icon.primary {
  /* background removed - PNG icons have no background */
}

.stat-item-icon.accent {
  /* background removed - PNG icons have no background */
}

.stat-item-value {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.big-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-item-card.accent .big-value {
  color: var(--accent-dark);
}

.unit {
  font-size: 14px;
  color: var(--text-tertiary);
}

.period-tag {
  background: rgba(99, 102, 241, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.period-tag text {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-item-desc {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-full);
  margin-top: var(--space-3);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-color);
  border-radius: var(--radius-full);
}

/* 工具网格 - 垂直堆叠布局 */
.tools-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

.tool-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

.tool-item:first-child {
  background: var(--primary-bg);
}

.tool-item:last-child {
  background: var(--accent-bg);
}

.tool-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-icon svg {
  width: 48px;
  height: 48px;
}

.tool-icon.primary {
  /* background removed - PNG icons have no background */
}

.tool-icon.accent {
  /* background removed - PNG icons have no background */
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.tool-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.tool-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.tool-badge text {
  font-size: 11px;
  font-weight: 600;
}

.tool-badge.primary {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
}

.tool-badge.accent {
  background: rgba(132, 204, 22, 0.2);
  color: var(--accent-dark);
}

/* 热力图 */
.month-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-btn {
  width: 28px;
  height: 28px;
  background: var(--background-color);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.nav-btn svg {
  width: 16px;
  height: 16px;
}

.month-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 70px;
  text-align: center;
}

.heatmap {
  padding-top: var(--space-2);
}

.weekday-labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: var(--space-2);
}

.weekday-labels text {
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.heatmap-cell {
  height: 12px; /* 与 Web 端一致 - h-3 */
  border-radius: 2px; /* 小方块 */
  background: var(--border-color); /* 默认灰色 */
}

.heatmap-cell.has-data {
  background: var(--primary-color); /* 有数据时高亮 */
}

.heatmap-cell.today {
  background: var(--surface-color); /* 今日背景色 */
  border: 2px solid var(--primary-color); /* 今日边框 */
}

.heatmap-cell.empty {
  background: var(--border-color);
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--background-color);
}

.heatmap-cell.has-data {
  background: var(--primary-light);
}

.heatmap-cell.today {
  background: var(--surface-color);
  border: 2px solid var(--primary-color); /* 与 Web 端一致 */
}

.heatmap-cell.empty {
  background: var(--border-light);
}

/* 登录提示 */
.login-prompt {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--text-tertiary);
  font-size: 14px;
}

.bottom-placeholder {
  height: 20px;
}
</style>
