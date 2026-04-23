<template>
  <div class="h-screen bg-[var(--background-color)] overflow-y-auto pb-20">
    <div class="page-container content-area">
      <!-- 每日打卡部分 -->
      <div
        class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl p-3 transition-all duration-200 hover:border-[var(--primary-color)]"
      >
        <!-- 标题栏 -->
        <div
          class="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center"
            >
              <component :is="FireIcon" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-xl font-bold text-[var(--text-primary)]">每日打卡</h2>
          </div>
        </div>

        <div class="space-y-6">
          <!-- 连胜和累计打卡 -->
          <div class="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <div
              class="bg-[var(--primary-color)] rounded-2xl p-5 text-white transition-all duration-200 hover:bg-[var(--primary-color)]/90"
            >
              <div class="flex items-center gap-2 mb-3">
                <component
                  :is="FireIcon"
                  class="w-6 h-6 text-yellow-300 animate-bounce"
                />
                <div class="text-xs font-bold uppercase tracking-wide opacity-95">
                  连胜
                </div>
              </div>
              <div class="text-4xl font-bold mt-1 flex items-baseline gap-1">
                <span>{{ userStore.streak }}</span>
                <span class="text-sm opacity-80">天</span>
              </div>
              <div class="text-xs opacity-75 mt-2">连续学习，挑战自我</div>
            </div>
            <div
              class="bg-lime-400 rounded-2xl p-5 text-black transition-all duration-200 hover:bg-lime-500"
            >
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center"
                >
                  <component :is="CheckIcon" class="w-4 h-4 text-black" />
                </div>
                <div class="text-xs font-bold uppercase tracking-wide opacity-95">
                  累计打卡
                </div>
              </div>
              <div class="text-4xl font-bold mt-1 flex items-baseline gap-1">
                <span>{{ userStore.totalCheckIn }}</span>
                <span class="text-sm opacity-80">天</span>
              </div>
              <div class="text-xs opacity-75 mt-2">坚持学习，成就未来</div>
            </div>
          </div>

          <!-- 本周打卡记录 -->
          <div
            class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl p-5"
          >
            <div
              class="text-sm font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2"
            >
              <component :is="CalendarIcon" class="w-5 h-5 text-[var(--primary-color)]" />
              <span>本周打卡记录</span>
            </div>
            <div class="flex gap-3">
              <div
                v-for="(day, index) in weekDays"
                :key="index"
                class="flex-1 flex flex-col items-center"
              >
                <div
                  :class="[
                    'w-full h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300',
                    day.checked
                      ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90'
                      : day.isToday
                      ? 'bg-[var(--surface-color)] border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--hover-color)]'
                      : 'bg-[var(--hover-color)] border-[var(--border-color)] text-[var(--text-tertiary)] hover:border-[var(--primary-color)]/50 hover:bg-[var(--surface-color)]',
                  ]"
                >
                  <component v-if="day.checked" :is="CheckIcon" class="w-5 h-5" />
                  <div v-else-if="day.isToday" class="text-sm font-bold">今日</div>
                  <div v-else class="text-sm font-medium"></div>
                </div>
                <div class="text-xs font-medium text-gray-500 mt-2 leading-tight">
                  {{ day.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- 推广横幅 -->
          <!-- <div
            v-if="showPromoBanner"
            class="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-4 flex items-center gap-3 relative transition-all duration-500 border-2 border-yellow-400 hover:border-yellow-600"
          >
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <component :is="GiftIcon" class="w-6 h-6 text-yellow-900" />
            </div>
            <div class="flex-1 text-sm text-yellow-900 font-medium">
              炫耀战绩带邀请码，好友注册付费双方都有奖励哦
            </div>
            <button class="text-yellow-900 text-sm font-semibold hover:underline flex items-center gap-1">
              <span>了解</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button @click="showPromoBanner = false" class="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-all">
              <component :is="CloseIcon" class="w-4 h-4 text-yellow-900" />
            </button>
          </div> -->

          <!-- 继续学习按钮 -->
          <div class="mb-2">
            <button
              v-if="latestProgress && !loadingProgress"
              @click="continueLearning"
              class="w-full bg-[var(--primary-color)] text-white rounded-xl p-5 flex items-center justify-center gap-3 transition-transform duration-200 active:scale-95"
            >
              <div
                class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                <component :is="PlayIcon" class="w-6 h-6" />
              </div>
              <span class="text-lg font-bold">继续学习</span>
              <div class="text-xs bg-white/20 px-3 py-1 rounded-full">上次学习</div>
            </button>
            <button
              v-else-if="!loadingProgress"
              @click="$router.push('/discovery')"
              class="w-full bg-lime-400 text-black rounded-xl p-5 flex items-center justify-center gap-3 transition-transform duration-200 active:scale-95"
            >
              <div
                class="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center"
              >
                <component :is="BookIcon" class="w-6 h-6 text-black" />
              </div>
              <span class="text-lg font-bold">开始学习</span>
            </button>
            <div
              v-else
              class="w-full bg-slate-100 rounded-xl p-5 flex items-center justify-center"
            >
              <div
                class="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
              ></div>
              <span class="ml-3 text-sm text-gray-500">加载中...</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <!-- <div class="flex gap-4">
            <button
              class="flex-1 bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-full p-4 flex items-center justify-center gap-3 hover:border-[var(--primary-color)] transition-all duration-200"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-base font-bold text-gray-900">打卡日历</span>
            </button>
            <button
              class="flex-1 bg-[var(--primary-color)] text-white rounded-full p-4 flex items-center justify-center gap-3 transition-transform duration-200 active:scale-95"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.885 12.938 9 12.482 9 12c0-.482-.115-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span class="text-base font-bold">炫耀战绩</span>
            </button>
          </div> -->
        </div>
      </div>

      <!-- 最近学习 -->
      <div
        class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-200 hover:border-[var(--primary-color)]"
      >
        <div
          class="p-3 border-b border-[var(--border-color)] flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center"
            >
              <component :is="ClockIcon" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-xl font-bold text-[var(--text-primary)]">最近学习</h2>
          </div>
          <button
            @click="$router.push('/discovery')"
            class="text-sm text-[var(--primary-color)] font-bold hover:text-[var(--primary-color)]/90 flex items-center gap-1"
          >
            <span>查看更多</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
        <div class="p-3 space-y-4">
          <div
            v-for="(lesson, index) in recentLessons"
            :key="index"
            @click="goToLesson(lesson)"
            class="flex items-center gap-4 p-4 bg-[var(--surface-color)] rounded-2xl border border-[var(--border-color)] transition-all duration-200 cursor-pointer hover:border-[var(--primary-color)] active:scale-95"
          >
            <div
              class="w-16 h-16 bg-[var(--primary-color)] rounded-2xl flex-shrink-0 overflow-hidden relative"
            >
              <img
                :src="getCourseCover(lesson.courseId, lesson.courseName)"
                :alt="lesson.title"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div
                class="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              >
                <component :is="PlayIcon" class="w-8 h-8 text-white" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div
                class="font-bold text-[var(--text-primary)] truncate flex items-center gap-2"
              >
                <span>{{ lesson.courseName || "课程" }}</span>
                <div
                  class="text-xs bg-lime-400 text-black px-2 py-1 rounded-full font-bold"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div
                class="text-sm text-[var(--text-secondary)] truncate hover:text-[var(--primary-color)] transition-colors duration-300"
              >
                {{ lesson.title }}
              </div>
              <div
                class="text-xs text-[var(--text-tertiary)] mt-2 flex items-center gap-2"
              >
                <component :is="ClockIcon" class="w-4 h-4" />
                <span>{{ formatRelativeTime(lesson.time) }}</span>
              </div>
            </div>
            <div
              class="text-[var(--text-tertiary)] opacity-0 hover:opacity-100 transition-opacity duration-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
          <div v-if="recentLessons.length === 0" class="text-center py-10 px-4">
            <div
              class="w-20 h-20 bg-[var(--hover-color)] rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <component :is="BookIcon" class="w-10 h-10 text-[var(--text-tertiary)]" />
            </div>
            <div class="text-[var(--text-tertiary)] text-base mb-4">暂无最近学习记录</div>
            <button
              @click="$router.push('/discovery')"
              class="text-[var(--primary-color)] font-bold hover:text-[var(--primary-color)]/90 text-sm flex items-center gap-1 mx-auto"
            >
              <span>去课程广场开始学习</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 学习统计部分 -->
      <div
        class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-200 hover:border-[var(--primary-color)]"
      >
        <div
          class="flex items-center justify-between p-3 border-b border-[var(--border-color)]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center"
            >
              <component :is="CalendarIcon" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-xl font-bold text-[var(--text-primary)]">统计</h2>
          </div>
          <div class="flex gap-2 bg-slate-100 rounded-full p-1">
            <button
              v-for="period in timePeriods"
              :key="period.key"
              @click="currentPeriod = period.key"
              :class="[
                'px-4 py-2 rounded-full text-xs font-bold transition-all duration-200',
                currentPeriod === period.key
                  ? 'bg-[var(--primary-color)] text-white transform scale-105'
                  : 'text-gray-700 hover:bg-slate-200',
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <div class="p-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              class="bg-[var(--primary-color)]/5 rounded-2xl p-6 border border-[var(--primary-color)]/10 transition-all duration-200 hover:border-[var(--primary-color)]/30"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="text-sm font-bold text-gray-600">学习时长</div>
                <div
                  class="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div class="text-4xl font-bold text-gray-900 flex items-baseline gap-2">
                <span>{{ formatStudyTime(currentStudyTime) }}</span>
                <div
                  class="text-sm text-indigo-600 font-bold bg-indigo-100 px-3 py-1 rounded-xl"
                >
                  {{
                    currentPeriod === "total"
                      ? "总计"
                      : currentPeriod === "week"
                      ? "本周"
                      : currentPeriod === "month"
                      ? "本月"
                      : "本年"
                  }}
                </div>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                {{
                  currentPeriod === "total"
                    ? "累计学习时长"
                    : `过去${
                        currentPeriod === "week"
                          ? "7天"
                          : currentPeriod === "month"
                          ? "30天"
                          : "12个月"
                      }的学习时长`
                }}
              </div>
            </div>
            <div
              class="bg-lime-50 rounded-2xl p-6 border border-lime-100 transition-all duration-200 hover:border-lime-300"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="text-sm font-bold text-gray-600">完成课程</div>
                <div
                  class="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div class="text-4xl font-bold text-gray-900 flex items-baseline gap-2">
                <span>{{ userStore.completedLessons }}</span>
                <span class="text-sm text-gray-500">节</span>
              </div>
              <div class="text-xs text-gray-500 mt-2">已经完成的课程数量</div>
              <div class="mt-4 w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  class="h-full bg-lime-400 rounded-full transition-all duration-1000"
                  :style="{ width: `${Math.min(userStore.completedLessons * 5, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习工具 -->
      <div
        class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-200 hover:border-indigo-600"
      >
        <div class="p-3 border-b border-[var(--border-color)]">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center"
            >
              <component :is="ToolsIcon" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-xl font-bold text-[var(--text-primary)]">学习工具</h2>
          </div>
        </div>
        <div class="p-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- 错题本 -->
            <div
              class="flex items-center gap-4 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 transition-all duration-200 cursor-pointer hover:border-indigo-300 active:scale-95"
            >
              <div
                class="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
              >
                <component :is="BookOpenIcon" class="w-8 h-8 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="font-bold text-xl text-gray-900 transition-colors duration-200"
                >
                  错题本
                </div>
                <div class="text-sm text-gray-600 mt-2 line-clamp-1">
                  记录学习中遇到的错误
                </div>
                <div class="mt-3 flex items-center gap-1">
                  <div
                    class="text-xs text-[var(--primary-color)] font-bold bg-[var(--primary-color)]/10 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>74题</span>
                    <span class="text-[10px] opacity-80">待复习</span>
                  </div>
                </div>
              </div>
              <div
                class="text-gray-400 opacity-0 hover:opacity-100 transition-opacity duration-200"
              >
                <svg
                  class="w-6 h-6"
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

            <!-- 生词本 -->
            <div
              class="flex items-center gap-4 p-6 bg-lime-50 rounded-2xl border border-lime-100 transition-all duration-200 cursor-pointer hover:border-lime-300 active:scale-95"
            >
              <div
                class="w-14 h-14 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
              >
                <component :is="BookIcon" class="w-8 h-8 text-black" />
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="font-bold text-xl text-gray-900 transition-colors duration-200"
                >
                  生词本
                </div>
                <div class="text-sm text-gray-600 mt-2 line-clamp-1">
                  记录学习中遇到的生词
                </div>
                <div class="mt-3 flex items-center gap-1">
                  <div
                    class="text-xs font-bold text-black bg-lime-200 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>236个</span>
                    <span class="text-[10px] opacity-80">生词</span>
                  </div>
                </div>
              </div>
              <div
                class="text-gray-400 opacity-0 hover:opacity-100 transition-opacity duration-200"
              >
                <svg
                  class="w-6 h-6"
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
          </div>
        </div>
      </div>

      <!-- 学习热力图 -->
      <div
        class="bg-[var(--surface-color)] border-2 border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-200 hover:border-indigo-600"
      >
        <div
          class="flex items-center justify-between p-3 border-b border-[var(--border-color)]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center"
            >
              <component :is="CheckCircleIcon" class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-xl font-bold text-[var(--text-primary)]">学习热力图</h2>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevMonth"
              class="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            >
              <component
                :is="ArrowLeftIcon"
                class="w-5 h-5 text-gray-400 hover:text-indigo-600"
              />
            </button>
            <span class="text-sm font-bold text-gray-700 px-2">{{
              currentMonthLabel
            }}</span>
            <button
              @click="nextMonth"
              class="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            >
              <component
                :is="ArrowRightIcon"
                class="w-5 h-5 text-gray-400 hover:text-indigo-600"
              />
            </button>
          </div>
        </div>
        <div class="px-3 py-4">
          <div class="heatmap-container">
            <div class="grid grid-cols-7 gap-1 mb-1">
              <div
                class="text-[10px] font-bold text-gray-500 text-center leading-tight"
                v-for="day in weekDayLabels"
                :key="day"
              >
                {{ day }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="(day, index) in heatmapDays"
                :key="index"
                :class="[
                  'h-3 rounded-full',
                  day.hasData
                    ? 'bg-indigo-600'
                    : day.isToday
                    ? 'bg-white border-2 border-indigo-600'
                    : 'bg-slate-200',
                ]"
                :title="day.date"
              ></div>
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
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useCourseStore } from "@/stores/course";
import { progressApi } from "@/api/client";
import TabBar from "@/components/TabBar.vue";
import {
  FireIcon,
  CheckIcon,
  CalendarIcon,
  ShareIcon,
  BookIcon,
  BookOpenIcon,
  ToolsIcon,
  GiftIcon,
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@/components/icons/index.js";

const router = useRouter();
const userStore = useUserStore();
const courseStore = useCourseStore();

const showPromoBanner = ref(true);
const currentPeriod = ref("week");
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const latestProgress = ref(null); // 最新学习进度
const loadingProgress = ref(false);

const timePeriods = [
  { key: "total", label: "总计" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "year", label: "今年" },
];

const weekDays = computed(() => {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return userStore.weeklyActivity.map((day, index) => ({
    ...day,
    label: days[index],
  }));
});

const currentStudyTime = computed(() => {
  if (currentPeriod.value === "total") {
    return userStore.studyTime.total || 0;
  }
  return userStore.studyTime[currentPeriod.value] || 0;
});

const recentLessons = computed(() => {
  return userStore.recentLessons;
});

const currentMonthLabel = computed(() => {
  return `${currentYear.value}年${currentMonth.value + 1}月`;
});

const weekDayLabels = ["一", "二", "三", "四", "五", "六", "日"];

const heatmapDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 周一为0

  // 填充月初空白
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ hasData: false, isToday: false, date: "" });
  }

  // 填充当月日期，只显示到今天
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    const dateStr = date.toISOString().split("T")[0];
    
    // 只显示到今天，未来的日期不显示数据
    const isFutureDate = date > today;
    const hasData = !isFutureDate && userStore.learningHeatmap[dateStr] > 0;
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

function formatStudyTime(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
}

function formatRelativeTime(timeStr) {
  if (!timeStr) return "";
  const time = new Date(timeStr);
  const now = new Date();
  const diff = now - time;
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
      </defs>

      <!-- 背景 -->
      <rect width="400" height="300" fill="url(#bgGrad)"/>

      <!-- 装饰圆环 -->
      <circle cx="320" cy="60" r="40" fill="url(#circleGrad)" opacity="0.5"/>
      <circle cx="60" cy="240" r="50" fill="url(#circleGrad)" opacity="0.3"/>
      <circle cx="200" cy="150" r="120" fill="url(#circleGrad)" opacity="0.2"/>

      <!-- 图标容器 -->
      <g transform="translate(200, 110)">
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
      </defs>

      <!-- 背景 -->
      <rect width="400" height="300" fill="url(#bgGrad)"/>

      <!-- 装饰圆环 -->
      <circle cx="320" cy="60" r="40" fill="url(#circleGrad)" opacity="0.5"/>
      <circle cx="60" cy="240" r="50" fill="url(#circleGrad)" opacity="0.3"/>
      <circle cx="200" cy="150" r="120" fill="url(#circleGrad)" opacity="0.2"/>

      <!-- 图标容器 -->
      <g transform="translate(200, 110)">
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

// 获取最新学习进度
async function loadLatestProgress() {
  try {
    loadingProgress.value = true;
    const progress = await progressApi.getLatestProgress();
    latestProgress.value = progress;

  } catch (error) {
    // 如果是404错误（没有找到学习进度），这是正常情况（用户可能还没有开始学习）
    if (error.detail === "没有找到学习进度") {

      latestProgress.value = null;
    } else if (error.detail === "无效的认证凭据") {

      latestProgress.value = null;
    } else {
      console.warn("获取最新学习进度失败:", error);
      latestProgress.value = null;
    }
  } finally {
    loadingProgress.value = false;
  }
}

// 继续学习
function continueLearning() {
  if (latestProgress.value) {
    // 确保latestProgress.value包含course_id和lesson_id属性
    if (latestProgress.value.course_id && latestProgress.value.lesson_id) {
      router.push({
        name: "Learning",
        params: {
          courseId: latestProgress.value.course_id,
          lessonId: latestProgress.value.lesson_id,
        },
      });
    } else {
      console.error("最新学习进度数据不完整，缺少course_id或lesson_id属性");
      console.error("最新学习进度数据:", latestProgress.value);
    }
  }
}

function goToLesson(lesson) {
  router.push({
    name: "Learning",
    params: {
      courseId: lesson.courseId,
      lessonId: lesson.id,
    },
  });
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

  try {

    await userStore.loadUserData();



    await loadLatestProgress();

  } catch (error) {
    console.error("[Dashboard] 初始化失败:", error);
    console.error("[Dashboard] 错误堆栈:", error.stack);
  }
});
</script>

<style scoped>
.heatmap-container {
  max-width: 100%;
  overflow-x: auto;
}
</style>
