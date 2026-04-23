<template>
  <div class="h-screen bg-[var(--background-color)] overflow-y-auto pb-20">
    <div class="page-container content-area">
      <!-- 用户信息卡片 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)] p-4">
        <div class="flex items-center gap-3 active:scale-95 transition-transform" @click="goToProfileDetail">
          <div
            class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0"
          >
            <svg
              v-if="!authStore.isAuthenticated"
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span v-else class="font-bold">{{ userInitial }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-lg text-[var(--text-primary)]">
              {{ authStore.isAuthenticated ? authStore.currentUser?.username || "用户" : "游客" }}
            </div>
            <div class="text-sm text-[var(--text-tertiary)] mt-1">
              {{ authStore.isAuthenticated ? `@${authStore.currentUser?.username || "user"}` : "@guest" }}
            </div>
            <div class="text-sm text-[var(--text-tertiary)] mt-1">
              学习天数: {{ userStore.streak }} 天
            </div>
          </div>
          <svg
            class="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div
            class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-3xl p-4 transition-all duration-200 text-[var(--text-primary)]"
          >
            <div class="text-sm text-[var(--text-tertiary)] mb-1">累计词汇</div>
            <div class="text-2xl font-bold">{{ userStore.wordCount }}</div>
          </div>
          <div
            class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-3xl p-4 transition-all duration-200 text-[var(--text-primary)]"
          >
            <div class="text-sm text-[var(--text-tertiary)] mb-1">学习时长</div>
            <div class="text-2xl font-bold">{{ totalStudyTime }}</div>
            <div class="text-xs text-[var(--text-tertiary)]">分钟</div>
          </div>
        </div>
      </div>

      <!-- 设置列表 -->
      <div class="card bg-[var(--surface-color)] border-[var(--border-color)] p-0">
        <button
          v-for="setting in settingsList"
          :key="setting.key"
          @click="goToSettings(setting.key)"
          class="w-full p-4 flex items-center justify-between border-b border-[var(--border-color)] last:border-b-0 active:bg-[var(--hover-color)] active:scale-95 transition-all text-[var(--text-primary)]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-[var(--hover-color)] flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="setting.key === 'appearance'"
                  d="M12 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3z"
                />
                <path
                  v-else-if="setting.key === 'answering'"
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-7h-2v-2h2v2zm-2-4h2v2h-2V8zm4 4h2v2h-2v-2zm2-4h-2v2h2V8z"
                />
                <path
                  v-else-if="setting.key === 'playback'"
                  d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                />
                <path
                  v-else-if="setting.key === 'listening'"
                  d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                />
                <path
                  v-else-if="setting.key === 'speaking'"
                  d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
                />
              </svg>
            </div>
            <span class="text-base font-medium">{{ setting.label }}</span>
          </div>
          <svg
            class="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- 退出登录 -->
      <div class="mt-6">
        <button
          v-if="authStore.isAuthenticated"
          @click="handleLogout"
          class="w-full btn-primary active:scale-95 transition-transform"
        >
          退出登录
        </button>
        <button v-else @click="goToLogin" class="w-full btn-primary active:scale-95 transition-transform">登录/注册</button>
      </div>
    </div>
  </div>

  <!-- Tab Bar -->
  <TabBar />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useAuthStore } from "@/stores/auth";
import TabBar from "@/components/TabBar.vue";

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();

const userInitial = computed(() => {
  if (authStore.isAuthenticated && authStore.currentUser) {
    return authStore.currentUser.username.charAt(0).toUpperCase();
  }
  return "U";
});

const totalStudyTime = computed(() => {
  const time = userStore.studyTime;
  return (time.today || 0) + (time.week || 0) + (time.month || 0) + (time.year || 0);
});

// 设置分类列表
const settingsList = [
  {
    key: "appearance",
    label: "外观设置",
  },
  {
    key: "answering",
    label: "答题设置",
  },
  {
    key: "playback",
    label: "播放设置",
  },
  {
    key: "listening",
    label: "听力设置",
  },
  {
    key: "speaking",
    label: "口语设置",
  },
];

function goToSettings(settingType) {
  router.push(`/settings/${settingType}`);
}

function goToProfileDetail() {
  // 可以跳转到详细的个人资料页面
  // router.push('/profile/detail')
}

async function handleLogout() {
  if (confirm("确定要退出登录吗？")) {
    await authStore.logout();
    router.push("/login");
  }
}

function goToLogin() {
  router.push("/login");
}

onMounted(async () => {
  await userStore.loadUserData();
  await authStore.init();
});
</script>
