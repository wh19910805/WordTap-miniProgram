<template>
  <div class="min-h-screen bg-[var(--background-color)] pb-20">
    <!-- 顶部 Tab 切换 -->
    <div
      class="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/30"
    >
      <div class="flex">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
              : 'border-transparent text-[var(--text-tertiary)]',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 我的课程 -->
    <div v-if="activeTab === 'my'" class="pb-20">
      <div class="page-container content-area">
        <div v-if="courseStore.myCourses.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">还没有加入任何课程</div>
          <button @click="activeTab = 'market'" class="text-[var(--primary-color)] font-medium">
            去课程广场看看 →
          </button>
        </div>

        <!-- 课程网格 -->
        <div v-else class="pt-6 pb-4">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="course in courseStore.myCourses"
              :key="course.id"
              :data-course-name="course.name"
              class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 relative group hover:border-[var(--primary-color)] active:scale-95"
            >
              <!-- 移除按钮 -->
              <button
                @click.stop="handleRemoveCourse(course.id, course.name)"
                class="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-red-500 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                title="移除课程"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <!-- 课程卡片（可点击进入） -->
              <div @click="goToChapters(course.id)" class="cursor-pointer">
                <!-- 课程封面 -->
                <div class="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl">
                  <img
                    :src="getCourseCover(course.id, course.name)"
                    :alt="course.name"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    @error="handleImageError"
                  />
                  <!-- 学习进度标签 -->
                  <div class="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                    <div class="text-white text-xs mb-1 font-medium">
                      已学 {{ getCompletedCount(course.id) }}/{{ course.length }} 课时
                    </div>
                    <div class="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-[var(--primary-color)] transition-all duration-1000"
                        :style="{
                          width: `${
                            (getCompletedCount(course.id) / course.length) * 100
                          }%`,
                        }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 课程信息 -->
                <div class="p-3">
                  <h3
                    class="font-semibold text-base mb-1 line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors duration-300"
                  >
                    {{ course.name }}
                  </h3>
                  <div
                    class="flex items-center justify-between text-xs text-gray-500 mt-2"
                  >
                    <span
                      class="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-2 py-0.5 rounded-lg"
                      >{{ course.category || "官方" }}</span
                    >
                    <div class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fill-rule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span>{{ getCompletedCount(course.id) }}/{{ course.length }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 课程广场 -->
    <div v-else class="pb-20">
      <!-- 分类筛选 -->
      <div
        class="sticky top-[57px] z-10 bg-[var(--surface-color)] border-b border-[var(--border-color)] px-4 py-3"
      >
        <div class="content-area flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            @click="selectedCategory = null"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors hover:bg-[var(--hover-color)]',
              selectedCategory === null
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--hover-color)] text-[var(--text-primary)]',
            ]"
          >
            全部
          </button>
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = selectedCategory === category ? null : category"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors hover:bg-[var(--hover-color)]',
              selectedCategory === category
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--hover-color)] text-[var(--text-primary)]',
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <!-- 课程网格 -->
      <div class="page-container content-area">
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            :data-course-name="course.name"
            @click="goToDetail(course.id)"
            class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer group hover:border-[var(--primary-color)] active:scale-95"
          >
            <!-- 课程封面 -->
            <div class="relative w-full aspect-[4/3] overflow-hidden rounded-t-3xl">
              <img
                :src="getCourseCover(course.id, course.name)"
                :alt="course.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                @error="handleImageError"
              />
              <!-- 标签覆盖层 -->
              <div class="absolute top-2 left-2 flex gap-1 flex-wrap">
                <span
                  v-if="isFreeCourse(course)"
                  class="px-2.5 py-0.75 bg-lime-400 text-white text-xs font-medium rounded-full"
                >
                  免费
                </span>
                <span
                  v-if="course.update"
                  class="px-2.5 py-0.75 bg-pink-500 text-white text-xs font-medium rounded-full"
                >
                  new
                </span>
              </div>
              <!-- 悬停播放按钮 -->
              <div
                class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              >
                <div
                  class="w-12 h-12 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300"
                >
                  <svg
                    class="w-6 h-6 text-[var(--primary-color)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- 课程信息 -->
            <div class="p-3">
              <h3
                class="font-semibold text-base mb-1 line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors duration-300"
              >
                {{ course.name }}
              </h3>
              <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span class="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-2 py-0.5 rounded-full">{{
                  course.category || "官方"
                }}</span>
                <div class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  <span>{{ formatNumber(getLearnerCount(course.id)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Bar -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCourseStore } from "@/stores/course";
import { courseApi } from "@/api/client";
import TabBar from "@/components/TabBar.vue";
import { confirm, alert } from "@/composables/useModal";

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();

const activeTab = ref(route.query.tab === "market" ? "market" : "my");
const selectedCategory = ref(null);

const tabs = [
  { key: "my", label: "我的课程" },
  { key: "market", label: "课程广场" },
];

// 获取所有分类
const categories = computed(() => {
  const categorySet = new Set();
  const allCourses = Array.isArray(courseStore.courses) ? courseStore.courses : [];
  allCourses.forEach((course) => {
    if (course.category) {
      categorySet.add(course.category);
    }
  });
  return Array.from(categorySet).sort();
});

// 根据选中的分类筛选课程
const filteredCourses = computed(() => {
  let courses = Array.isArray(courseStore.courses) ? courseStore.courses : [];
  if (selectedCategory.value) {
    courses = courses.filter((c) => c.category === selectedCategory.value);
  }
  return courses;
});

function getCompletedCount(courseId) {
  // 这里应该从数据库查询，暂时返回模拟数据
  return Math.floor(Math.random() * 20);
}

function getCourseStatus(courseId) {
  const myCourse = courseStore.myCourses.find((c) => c.id === courseId);
  if (!myCourse) return null;
  const completed = getCompletedCount(courseId);
  return completed === myCourse.length ? "completed" : "progressing";
}

function getWordCount(course) {
  // 估算单词数
  return course.length * 50;
}

function getLearnerCount(courseId) {
  // 模拟学习人数
  return Math.floor(Math.random() * 200000) + 1000;
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万";
  }
  return num.toLocaleString();
}

function isFreeCourse(course) {
  // 判断是否为免费课程：检查 tags 中是否包含"免费"，或者没有 cover 图片
  return (
    course.tags?.some((tag) => tag.includes("免费") || tag.includes("Free")) || false
  );
}

// 课程图标映射表
const courseIconMap = {
  "新概念": "BookOpen",
  "NCE": "BookOpen",
  "英语": "Globe",
  "English": "Globe",
  "单词": "Lightbulb",
  "词汇": "Lightbulb",
  "口语": "Chat",
  "听力": "Volume",
  "语法": "Pencil",
  "写作": "Edit",
  "阅读": "Eye",
  "考试": "Academic",
  "雅思": "Academic",
  "托福": "Academic",
  "商务": "Briefcase",
  "职场": "Briefcase",
  "旅游": "Map",
  "日常": "Home",
};

// 获取课程图标
function getCourseIcon(courseName) {
  for (const [key, icon] of Object.entries(courseIconMap)) {
    if (courseName && courseName.includes(key)) {
      return icon;
    }
  }
  return "Book";
}

// 获取美观的课程封面SVG
function getCourseCover(courseId, courseName) {
  // 新概念英语课程使用特定封面
  if (courseName && (courseName.includes("新概念英语") || courseName.includes("NCE"))) {
    if (courseName.includes("1") || courseId?.includes("1"))
      return "/imgs/covers/nce-1.png";
    if (courseName.includes("2") || courseId?.includes("2"))
      return "/imgs/covers/nce-2.png";
    if (courseName.includes("3") || courseId?.includes("3"))
      return "/imgs/covers/nce-3.png";
    if (courseName.includes("4") || courseId?.includes("4"))
      return "/imgs/covers/nce-4.png";
    return "/imgs/covers/nce-1.png";
  }

  // 为其他课程生成美观的SVG封面
  const icon = getCourseIcon(courseName || "课程");
  const initial = (courseName || "课程").charAt(0).toUpperCase();

  // 渐变配色方案
  const gradients = [
    { from: "#4f46e5", to: "#7c3aed", name: "indigo" },
    { from: "#06b6d4", to: "#3b82f6", name: "cyan" },
    { from: "#14b8a6", to: "#10b981", name: "teal" },
    { from: "#f59e0b", to: "#ef4444", name: "warm" },
    { from: "#ec4899", to: "#8b5cf6", name: "pink" },
    { from: "#84cc16", to: "#22c55e", name: "lime" },
  ];

  // 使用课程ID和名称生成更随机的颜色索引，确保每个课程都有不同颜色
  const hashStr = (courseId || "") + (courseName || "");
  let hash = 0;
  for (let i = 0; i < hashStr.length; i++) {
    const char = hashStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const gradientIndex = Math.abs(hash) % gradients.length;
  const gradient = gradients[gradientIndex];

  // 图标SVG路径
  const iconPaths = {
    BookOpen: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    Book: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    Globe: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
    Lightbulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    Chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    Volume: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
    Pencil: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
    Edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    Eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    Academic: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    Briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    Map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7",
    Home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  };

  const iconPath = iconPaths[icon] || iconPaths.Book;

  // 生成美观的SVG
  const svg = `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0.1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${gradient.from}" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- 背景 -->
      <rect width="400" height="300" fill="url(#bgGrad)"/>

      <!-- 装饰圆环 -->
      <circle cx="320" cy="60" r="40" fill="url(#circleGrad)" opacity="0.5"/>
      <circle cx="60" cy="240" r="50" fill="url(#circleGrad)" opacity="0.3"/>
      <circle cx="200" cy="150" r="120" fill="url(#circleGrad)" opacity="0.2"/>

      <!-- 图标容器 -->
      <g transform="translate(200, 110)" filter="url(#shadow)">
        <circle cx="0" cy="0" r="50" fill="white" fill-opacity="0.95"/>
        <svg x="-25" y="-25" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="${gradient.from}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="${iconPath}"/>
        </svg>
      </g>

      <!-- 课程名称 -->
      <text x="200" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="white" text-anchor="middle" letter-spacing="0.5">
        ${courseName && courseName.length > 12 ? courseName.substring(0, 12) + "..." : courseName || "课程"}
      </text>

      <!-- 装饰线 -->
      <line x1="150" y1="220" x2="250" y2="220" stroke="white" stroke-width="2" stroke-opacity="0.5" stroke-linecap="round"/>
    </svg>
  `;

  // 使用 encodeURIComponent 处理中文，避免 btoa 编码错误
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function handleImageError(event) {
  // 获取课程名称（从父元素或其他属性中获取）
  let courseName = "未知课程";
  const courseCard = event.target.closest("[data-course-name]");
  if (courseCard) {
    courseName = courseCard.dataset.courseName;
  }

  // 获取课程ID
  const courseId = courseCard?.dataset.courseId || "default";

  // 使用相同的逻辑生成美观的封面
  const icon = getCourseIcon(courseName);

  // 渐变配色方案
  const gradients = [
    { from: "#4f46e5", to: "#7c3aed", name: "indigo" },
    { from: "#06b6d4", to: "#3b82f6", name: "cyan" },
    { from: "#14b8a6", to: "#10b981", name: "teal" },
    { from: "#f59e0b", to: "#ef4444", name: "warm" },
    { from: "#ec4899", to: "#8b5cf6", name: "pink" },
    { from: "#84cc16", to: "#22c55e", name: "lime" },
  ];
  const gradient = gradients[courseId.charCodeAt(0) % gradients.length] || gradients[0];

  // 图标SVG路径
  const iconPaths = {
    BookOpen: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    Book: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    Globe: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
    Lightbulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    Chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    Volume: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
    Pencil: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
    Edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    Eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    Academic: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    Briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    Map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7",
    Home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  };

  const iconPath = iconPaths[icon] || iconPaths.Book;

  // 生成美观的SVG
  const svg = `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0.1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${gradient.from}" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- 背景 -->
      <rect width="400" height="300" fill="url(#bgGrad)"/>

      <!-- 装饰圆环 -->
      <circle cx="320" cy="60" r="40" fill="url(#circleGrad)" opacity="0.5"/>
      <circle cx="60" cy="240" r="50" fill="url(#circleGrad)" opacity="0.3"/>
      <circle cx="200" cy="150" r="120" fill="url(#circleGrad)" opacity="0.2"/>

      <!-- 图标容器 -->
      <g transform="translate(200, 110)" filter="url(#shadow)">
        <circle cx="0" cy="0" r="50" fill="white" fill-opacity="0.95"/>
        <svg x="-25" y="-25" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="${gradient.from}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="${iconPath}"/>
        </svg>
      </g>

      <!-- 课程名称 -->
      <text x="200" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="white" text-anchor="middle" letter-spacing="0.5">
        ${courseName.length > 12 ? courseName.substring(0, 12) + "..." : courseName}
      </text>

      <!-- 装饰线 -->
      <line x1="150" y1="220" x2="250" y2="220" stroke="white" stroke-width="2" stroke-opacity="0.5" stroke-linecap="round"/>
    </svg>
  `;

  event.target.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function goToDetail(courseId) {
  // 传递当前tab参数，确保返回时能回到正确的标签页
  router.push({
    name: "CourseDetail",
    params: { id: courseId },
    query: { tab: activeTab.value },
  });
}

function goToChapters(courseId) {
  router.push({ name: "ChapterList", params: { id: courseId } });
}

async function handleRemoveCourse(courseId, courseName) {
  // 调试：检查函数是否存在
  if (typeof courseStore.removeCourse !== "function") {
    console.error("removeCourse 函数不存在，可用方法:", Object.keys(courseStore));
    await alert("移除功能暂时不可用，请刷新页面重试");
    return;
  }

  const confirmed = await confirm(
    `确定要移除课程"${courseName}"吗？\n\n移除后，该课程的学习进度将被清除。`
  );
  if (confirmed) {
    const success = await courseStore.removeCourse(courseId);
    if (success) {
      // 显示成功提示
      await alert("课程已移除");
    } else {
      await alert("移除课程失败，请重试");
    }
  }
}

onMounted(async () => {

  try {
    await courseStore.loadCourses();

  } catch (error) {
    console.error("[Discovery] 加载课程失败:", error);
  }
});
</script>
