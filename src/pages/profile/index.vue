<template>
  <view class="profile-page" :style="pageThemeStyle">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="page-title">我的</text>
    </view>

    <view class="content-area">
      <!-- 用户信息卡片 -->
      <view class="user-card fade-in" :class="{ 'logged-in': authStore.isAuthenticated }">
        <view class="user-avatar" @click="goToLogin">
          <text v-if="authStore.isAuthenticated">{{ userInitial }}</text>
          <text v-else>?</text>
          <view
            v-if="authStore.isAuthenticated && userStore.stats.streak >= 7"
            class="avatar-badge"
          >
            <Icon name="fire" size="lg" color="var(--accent-color)" />
          </view>
        </view>
        <view class="user-info">
          <text class="username">
            {{ authStore.isAuthenticated ? authStore.currentUser?.username : "未登录" }}
          </text>
          <text class="streak" v-if="authStore.isAuthenticated">
            <view class="streak-icon">
              <Icon name="fire" size="lg" color="var(--accent-color)" />
            </view>
            连续学习 {{ userStore.stats.streak || 0 }} 天
          </text>
          <text class="login-tip" v-else @click="goToLogin">点击登录，开启学习之旅</text>
        </view>
        <view class="arrow" @click="goToLogin">
          <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
        </view>
      </view>

      <!-- 统计数据 -->
      <!-- <view class="stats-section" v-if="authStore.isAuthenticated">
        <view class="stats-header">
          <text class="stats-title">学习数据</text>
          <text class="stats-subtitle">你的成长足迹</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <view class="stat-icon vocabulary-icon">
              <Icon name="book" size="lg" color="var(--primary-color)" />
            </view>
            <text class="stat-value">{{ userStore.stats.word_count || 0 }}</text>
            <text class="stat-label">累计词汇</text>
          </view>
          <view class="stat-item">
            <view class="stat-icon time-icon">
              <Icon name="search" size="lg" color="var(--text-tertiary)" />
            </view>
            <text class="stat-value">{{ totalStudyTime }}</text>
            <text class="stat-label">学习时长(分)</text>
          </view>
        </view>
      </view> -->

      <!-- 功能菜单 -->
      <view class="menu-section">
        <view class="menu-group">
          <view class="menu-item" @click="goToMyCourses">
            <view class="menu-icon course-icon">
              <Icon name="book" size="lg" color="var(--primary-color)" />
            </view>
            <text class="menu-name">我的课程</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
          <view class="menu-item" @click="goToWrongWords">
            <view class="menu-icon wrong-icon">
              <Icon name="tools-word" size="lg" color="var(--text-secondary)" />
            </view>
            <text class="menu-name">错题本</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
          <view class="menu-item" @click="goToNewWords">
            <view class="menu-icon vocab-icon">
              <Icon name="tools-wrong" size="lg" color="var(--text-secondary)" />
            </view>
            <text class="menu-name">生词本</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
        </view>

        <view class="menu-group-title">
          <text>设置</text>
        </view>

        <view class="menu-group">
          <view class="menu-item" @click="goToSettings('appearance')">
            <view class="menu-icon settings-icon">
              <Icon name="Exterior" size="lg" color="var(--text-secondary)" />
            </view>
            <text class="menu-name">外观设置</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
          <view class="menu-item" @click="goToSettings('answering')">
            <view class="menu-icon settings-icon">
              <Icon name="answer-setting" size="lg" color="var(--text-secondary)" />
            </view>
            <text class="menu-name">答题设置</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
          <view class="menu-item" @click="goToSettings('playback')">
            <view class="menu-icon settings-icon">
              <Icon name="volume" size="lg" color="var(--text-secondary)" />
            </view>
            <text class="menu-name">播放设置</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
          <view class="menu-item" @click="goToSettings('listening')">
            <view class="menu-icon settings-icon">
              <Icon name="listening-setting" size="lg" color="var(--text-secondary)" />
            </view>
            <text class="menu-name">听力设置</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
          <view class="menu-item" @click="goToSettings('speaking')">
            <view class="menu-icon settings-icon">
              <Icon name="product" size="lg" color="var(--text-secondary)" />
            </view>
            <text class="menu-name">口语设置</text>
            <view class="menu-arrow">
              <Icon name="chevron-right" size="lg" color="var(--text-tertiary)" />
            </view>
          </view>
        </view>
      </view>

      <!-- 退出登录/登录按钮 -->
      <view class="action-section">
        <button v-if="authStore.isAuthenticated" class="logout-btn" @click="handleLogout">
          <text>退出登录</text>
        </button>
        <button v-else class="login-btn" @click="goToLogin">
          <text>登录/注册</text>
        </button>
      </view>

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
import { useAuthStore, useUserStore } from "@/stores";

const authStore = useAuthStore();
const userStore = useUserStore();

// 获取全局主题状态
const themeState = inject('themeState', reactive({ isDark: false, backgroundColor: '#f8fafc', color: '#0f172a' }))

// 页面主题样式
const pageThemeStyle = computed(() => ({
  backgroundColor: themeState.backgroundColor,
  color: themeState.color,
  '--background-color': themeState['--background-color'],
  '--surface-color': themeState['--surface-color'],
  '--text-primary': themeState['--text-primary'],
  '--text-secondary': themeState['--text-secondary'],
  '--border-color': themeState['--border-color'],
  '--hover-color': themeState['--hover-color'],
  '--primary-color': themeState['--primary-color'],
}))

const statusBarHeight = ref(20);

const userInitial = computed(() => {
  return authStore.currentUser?.username?.charAt(0).toUpperCase() || "?";
});

const totalStudyTime = computed(() => {
  const stats = userStore.stats;
  return (
    (stats.study_time_today || 0) +
    (stats.study_time_week || 0) +
    (stats.study_time_month || 0) +
    (stats.study_time_year || 0)
  );
});

function goToLogin() {
  if (!authStore.isAuthenticated) {
    uni.navigateTo({ url: "/pages/login/index" });
  }
}

function goToMyCourses() {
  uni.switchTab({ url: "/pages/discovery/index" });
}

function goToWrongWords() {
  uni.showToast({ title: "功能开发中", icon: "none" });
}

function goToNewWords() {
  uni.showToast({ title: "功能开发中", icon: "none" });
}

function goToSettings(type: string = "appearance") {
  uni.navigateTo({ url: `/pages/settings/index?type=${type}` });
}

function handleLogout() {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
        uni.showToast({ title: "已退出登录", icon: "success" });
      }
    },
  });
}

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;

  if (authStore.isAuthenticated) {
    await userStore.fetchStats();
  }
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--surface-color);
  padding: var(--space-4);
  z-index: var(--z-sticky);
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.content-area {
  flex: 1;
  width: 100%;
  padding: var(--space-3);
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 用户信息卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: var(--surface-color);
  padding: var(--space-5);
  margin-bottom: var(--space-3);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.user-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%; /* 与 Web 端一致 - 圆形 */
  background: #6366f1; /* 与 Web 端一致 - indigo-600 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar text {
  color: #fff;
  font-size: 26px;
  font-weight: 700;
}

.avatar-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: var(--accent-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.avatar-badge svg {
  width: 14px;
  height: 14px;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.streak {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 13px;
  color: var(--accent-dark);
  margin-top: var(--space-1);
}

.streak-icon {
  width: 14px;
  height: 14px;
  color: var(--accent-color);
}

.streak-icon svg {
  width: 100%;
  height: 100%;
}

.login-tip {
  display: block;
  font-size: 14px;
  color: var(--primary-color);
  margin-top: var(--space-1);
}

.arrow {
  width: 24px;
  height: 24px;
  color: var(--text-tertiary);
}

.arrow svg {
  width: 100%;
  height: 100%;
}

/* 统计数据 */
.stats-section {
  margin-bottom: var(--space-3);
}

.stats-header {
  margin-bottom: var(--space-3);
}

.stats-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.stats-subtitle {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  background: var(--surface-color);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-4);
  background: var(--background-color);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2);
}

.stat-icon svg {
  width: 22px;
  height: 22px;
}

.vocabulary-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: #fff;
}

.time-icon {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
  color: #fff;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

/* 功能菜单 */
.menu-section {
  background: var(--surface-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.menu-group {
  overflow: hidden;
}

.menu-group-title {
  padding: var(--space-3) var(--space-4) var(--space-2);
  background: var(--background-color);
}

.menu-group-title text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.2s ease;
}

.menu-item:active {
  background-color: var(--hover-color);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 36px;
  height: 36px;
  background: transparent;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-3);
  color: var(--primary-color);
}

.menu-icon svg {
  width: 36px;
  height: 36px;
}

.menu-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.menu-arrow {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
}

.menu-arrow svg {
  width: 100%;
  height: 100%;
}

/* 按钮 */
.action-section {
  margin-top: var(--space-6);
}

.logout-btn,
.login-btn {
  width: 100%;
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn text {
  color: var(--error-color);
  font-size: 15px;
  font-weight: 600;
}

.login-btn text {
  color: var(--primary-color);
  font-size: 15px;
  font-weight: 600;
}

.bottom-placeholder {
  height: 20px;
}
</style>
