<template>
  <div class="min-h-screen bg-[var(--background-color)] pb-20">
    <!-- 顶部导航栏 -->
    <div
      class="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/30"
    >
      <div class="flex items-center gap-4 px-4 py-3">
        <button
          @click="goBack"
          class="p-2 -ml-2 active:bg-[var(--hover-color)] rounded-full transition-colors"
        >
          <svg
            class="w-6 h-6 text-[var(--text-primary)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold flex-1 text-[var(--text-primary)]">
          {{ settingTitle }}
        </h1>
        <div class="w-10"></div>
      </div>
    </div>

    <div class="page-container content-area">
      <!-- 外观设置 -->
      <div v-if="settingType === 'appearance'">
        <!-- 主题设置 -->
        <div
          class="card bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-primary)] mb-4"
        >
          <h3 class="text-base font-semibold mb-4 text-[var(--text-primary)]">
            主题设置
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="
                settingsStore.theme = 'light';
                settingsStore.applyTheme();
              "
              :class="[
                'p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 active:scale-95',
                settingsStore.theme === 'light'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]',
              ]"
            >
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"
                />
              </svg>
              <span class="text-sm">浅色</span>
            </button>
            <button
              @click="
                settingsStore.theme = 'dark';
                settingsStore.applyTheme();
              "
              :class="[
                'p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 active:scale-95',
                settingsStore.theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]',
              ]"
            >
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <span class="text-sm">深色</span>
            </button>
          </div>
        </div>

        <!-- 字体设置 -->
        <div class="card mb-4">
          <h3 class="text-base font-semibold mb-3 text-[var(--text-primary)]">
            字体设置
          </h3>
          <div class="space-y-2">
            <label
              class="flex items-center justify-between p-3 rounded-lg active:bg-[var(--hover-color)] cursor-pointer text-[var(--text-primary)]"
            >
              <span>系统默认字体</span>
              <svg
                v-if="settingsStore.fontFamily === 'system'"
                class="w-6 h-6 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <input
                type="radio"
                v-model="settingsStore.fontFamily"
                value="system"
                class="hidden"
              />
            </label>
            <label
              class="flex items-center justify-between p-3 rounded-lg active:bg-[var(--hover-color)] cursor-pointer text-[var(--text-primary)]"
            >
              <span>Fredoka</span>
              <svg
                v-if="settingsStore.fontFamily === 'fredoka'"
                class="w-6 h-6 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <input
                type="radio"
                v-model="settingsStore.fontFamily"
                value="fredoka"
                class="hidden"
              />
            </label>
          </div>
        </div>

        <!-- 预览文本 -->
        <div class="card mb-4">
          <h3 class="text-base font-semibold mb-3 text-[var(--text-primary)]">
            预览文本
          </h3>
          <div
            class="text-base p-3 bg-[var(--hover-color)] rounded-lg text-[var(--text-primary)]"
            :style="{
              fontFamily:
                settingsStore.fontFamily === 'fredoka'
                  ? 'Fredoka, sans-serif'
                  : 'system-ui, sans-serif',
            }"
          >
            你好,世界! Hello, World!
          </div>
        </div>

        <!-- 音标大小 -->
        <div class="card">
          <h3 class="text-base font-semibold mb-3 text-[var(--text-primary)]">
            音标大小
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="settingsStore.phoneticSize = 'small'"
              :class="[
                'p-4 rounded-lg border-2 transition-colors active:scale-95',
                settingsStore.phoneticSize === 'small'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]',
              ]"
            >
              <div class="text-sm mb-2 font-medium">小</div>
              <div class="text-xs">/'helǝʊ/</div>
            </button>
            <button
              @click="settingsStore.phoneticSize = 'medium'"
              :class="[
                'p-4 rounded-lg border-2 transition-colors active:scale-95',
                settingsStore.phoneticSize === 'medium'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]',
              ]"
            >
              <div class="text-sm mb-2 font-medium">中</div>
              <div class="text-sm">/'helǝʊ/</div>
            </button>
            <button
              @click="settingsStore.phoneticSize = 'large'"
              :class="[
                'p-4 rounded-lg border-2 transition-colors active:scale-95',
                settingsStore.phoneticSize === 'large'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]',
              ]"
            >
              <div class="text-sm mb-2 font-medium">大</div>
              <div class="text-base">/'hɛləʊ/</div>
            </button>
          </div>
        </div>

        <!-- 声音设置 -->
        <div class="card">
          <h3 class="text-base font-semibold mb-3 text-[var(--text-primary)]">声音</h3>
          <div class="space-y-4">
            <label
              class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--hover-color)] active:bg-[var(--hover-color)] transition-colors cursor-pointer"
            >
              <span class="text-base text-[var(--text-primary)]">打字音效</span>
              <input
                type="checkbox"
                v-model="settingsStore.keypressSound"
                class="w-12 h-6 rounded-full bg-[var(--border-color)] appearance-none relative transition-colors checked:bg-indigo-600"
              />
            </label>
            <label
              class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--hover-color)] active:bg-[var(--hover-color)] transition-colors cursor-pointer"
            >
              <span class="text-base text-[var(--text-primary)]">自动播放音频</span>
              <input
                type="checkbox"
                v-model="settingsStore.autoPlayAudio"
                class="w-12 h-6 rounded-full bg-[var(--border-color)] appearance-none relative transition-colors checked:bg-indigo-600"
              />
            </label>
            <div>
              <div class="mb-3 text-sm text-[var(--text-tertiary)]">发音类型</div>
              <div class="grid grid-cols-2 gap-4">
                <button
                  @click="settingsStore.pronunciationType = 1"
                  :class="[
                    'p-4 rounded-lg border-2 transition-colors active:scale-95',
                    settingsStore.pronunciationType === 1
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-[var(--border-color)] text-[var(--text-primary)]',
                  ]"
                >
                  英音
                </button>
                <button
                  @click="settingsStore.pronunciationType = 2"
                  :class="[
                    'p-4 rounded-lg border-2 transition-colors active:scale-95',
                    settingsStore.pronunciationType === 2
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-[var(--border-color)] text-[var(--text-primary)]',
                  ]"
                >
                  美音
                </button>
              </div>
            </div>
          </div>
        </div>


      </div>

      <!-- 答题设置 -->
      <div v-else-if="settingType === 'answering'">
        <div class="card space-y-5">
          <!-- 答题正确后自动下一题 -->
          <label
            class="flex items-center justify-between py-2 text-[var(--text-primary)]"
          >
            <span class="text-base">答题正确后自动下一题</span>
            <input
              type="checkbox"
              v-model="settingsStore.autoNextAfterCorrect"
              class="w-12 h-6 rounded-full bg-[var(--hover-color)] appearance-none relative transition-colors checked:bg-indigo-600"
            />
          </label>

          <div class="h-px bg-[var(--border-color)]"></div>

          <!-- 忽略大小写 -->
          <label
            class="flex items-center justify-between py-2 text-[var(--text-primary)]"
          >
            <span class="text-base">忽略大小写</span>
            <input
              type="checkbox"
              v-model="settingsStore.ignoreCase"
              class="w-12 h-6 rounded-full bg-[var(--hover-color)] appearance-none relative transition-colors checked:bg-indigo-600"
            />
          </label>

          <div class="h-px bg-[var(--border-color)]"></div>

          <!-- 是否需要输入标点符号 -->
          <label
            class="flex items-center justify-between py-2 text-[var(--text-primary)]"
          >
            <span class="text-base">需要输入标点符号</span>
            <input
              type="checkbox"
              v-model="settingsStore.requirePunctuation"
              class="w-12 h-6 rounded-full bg-[var(--hover-color)] appearance-none relative transition-colors checked:bg-indigo-600"
            />
          </label>

          <div class="h-px bg-[var(--border-color)]"></div>

          <!-- 是否需要输入空格 -->
          <label
            class="flex items-center justify-between py-2 text-[var(--text-primary)]"
          >
            <span class="text-base">需要输入空格</span>
            <input
              type="checkbox"
              v-model="settingsStore.requireSpace"
              class="w-12 h-6 rounded-full bg-[var(--hover-color)] appearance-none relative transition-colors checked:bg-indigo-600"
            />
          </label>

          <div class="h-px bg-[var(--border-color)]"></div>

          <!-- 答题输入框样式 -->
          <div>
            <div class="mb-3">
              <span class="text-base text-[var(--text-primary)]">答题输入框样式</span>
            </div>
            <select
              v-model="settingsStore.inputBoxStyle"
              class="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--surface-color)] text-[var(--text-primary)]"
            >
              <option value="word-length">单词长度</option>
              <option value="fixed">固定宽度</option>
              <option value="auto">自动宽度</option>
            </select>
          </div>

          <div class="h-px bg-[var(--border-color)]"></div>

          <!-- 自动显示答案 -->
          <div>
            <div class="mb-3">
              <span class="text-base text-[var(--text-primary)]">自动显示答案</span>
            </div>
            <select
              v-model="settingsStore.autoShowAnswer"
              class="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--surface-color)] text-[var(--text-primary)]"
            >
              <option value="never">从不</option>
              <option value="after-3-errors">错误3次后</option>
              <option value="after-5-errors">错误5次后</option>
            </select>
          </div>

          <div class="h-px bg-[var(--border-color)]"></div>

          <!-- 显示设置 -->
          <div>
            <h3 class="text-base font-semibold mb-3 text-[var(--text-primary)]">显示</h3>
            <div class="space-y-4">
              <label
                class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--hover-color)] active:bg-[var(--hover-color)] transition-colors cursor-pointer"
              >
                <span class="text-base text-[var(--text-primary)]">默认显示中文</span>
                <input
                  type="checkbox"
                  v-model="settingsStore.showChinese"
                  class="w-12 h-6 rounded-full bg-[var(--border-color)] appearance-none relative transition-colors checked:bg-indigo-600"
                />
              </label>
              <label
                class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--hover-color)] active:bg-[var(--hover-color)] transition-colors cursor-pointer"
              >
                <span class="text-base text-[var(--text-primary)]">默认显示英文</span>
                <input
                  type="checkbox"
                  v-model="settingsStore.defaultShowEnglish"
                  class="w-12 h-6 rounded-full bg-[var(--border-color)] appearance-none relative transition-colors checked:bg-indigo-600"
                />
              </label>
              <label
                class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--hover-color)] active:bg-[var(--hover-color)] transition-colors cursor-pointer"
              >
                <span class="text-base text-[var(--text-primary)]">默认显示人名</span>
                <input
                  type="checkbox"
                  v-model="settingsStore.defaultShowName"
                  class="w-12 h-6 rounded-full bg-[var(--border-color)] appearance-none relative transition-colors checked:bg-indigo-600"
                />
              </label>
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-base font-medium text-[var(--text-primary)]">字体大小</span>
                  <span class="text-indigo-600 font-bold">{{ settingsStore.fontSize }}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="24"
                  v-model.number="settingsStore.fontSize"
                  class="w-full h-2 bg-[var(--border-color)] rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 播放设置 -->
      <div v-else-if="settingType === 'playback'">
        <div class="card space-y-5">
          <!-- 倍速 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-base">倍速</span>
              <span class="text-indigo-600 font-semibold text-lg"
                >{{ settingsStore.playbackSpeed }}x</span
              >
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.25"
              v-model.number="settingsStore.playbackSpeed"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>0.5x</span>
              <span>1x</span>
              <span>1.5x</span>
              <span>2x</span>
            </div>
          </div>

          <div class="h-px bg-slate-200"></div>

          <!-- 播放次数 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-base">播放次数</span>
              <span class="text-indigo-600 font-semibold text-lg"
                >{{ settingsStore.playbackCount }}次</span
              >
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              v-model.number="settingsStore.playbackCount"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>1次</span>
              <span>3次</span>
              <span>5次</span>
            </div>
          </div>

          <div class="h-px bg-slate-200"></div>

          <!-- 播放间隔 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-base">播放间隔</span>
              <span class="text-indigo-600 font-semibold text-lg"
                >{{ settingsStore.playbackInterval }}s</span
              >
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              v-model.number="settingsStore.playbackInterval"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>0s</span>
              <span>2.5s</span>
              <span>5s</span>
            </div>
          </div>

          <div class="h-px bg-slate-200"></div>

          <!-- 课程循环播放 -->
          <label class="flex items-center justify-between py-2">
            <span class="text-base">课程循环播放</span>
            <input
              type="checkbox"
              v-model="settingsStore.loopCourse"
              class="w-12 h-6 rounded-full bg-gray-200 appearance-none relative transition-colors checked:bg-indigo-600"
            />
          </label>

          <div class="h-px bg-slate-200"></div>

          <!-- 隐藏答案 -->
          <label class="flex items-center justify-between py-2">
            <span class="text-base">隐藏答案</span>
            <input
              type="checkbox"
              v-model="settingsStore.hideAnswer"
              class="w-12 h-6 rounded-full bg-gray-200 appearance-none relative transition-colors checked:bg-indigo-600"
            />
          </label>

          <div class="h-px bg-slate-200"></div>

          <!-- 自动跳到下一题 -->
          <label class="flex items-center justify-between py-2">
            <span class="text-base">自动跳到下一题</span>
            <input
              type="checkbox"
              v-model="settingsStore.autoSkipNext"
              class="w-12 h-6 rounded-full bg-gray-200 appearance-none relative transition-colors checked:bg-indigo-600"
            />
          </label>
        </div>
      </div>

      <!-- 听力设置 -->
      <div v-else-if="settingType === 'listening'">
        <div class="card">
          <p class="text-gray-500 text-center py-8">暂无设置项</p>
        </div>
      </div>

      <!-- 口语设置 -->
      <div v-else-if="settingType === 'speaking'">
        <div class="card">
          <h3 class="text-base font-semibold mb-4">显示模式</h3>
          <div class="space-y-3">
            <label
              class="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors active:scale-95"
              :class="
                settingsStore.speakingDisplayMode === 'english'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]'
              "
            >
              <input
                type="radio"
                v-model="settingsStore.speakingDisplayMode"
                value="english"
                class="mt-1 w-5 h-5 accent-indigo-600"
              />
              <div class="flex-1">
                <div class="font-semibold mb-1 text-base">显示英文</div>
                <div class="text-sm">看英文原句,练习朗读发音</div>
              </div>
              <svg
                v-if="settingsStore.speakingDisplayMode === 'english'"
                class="w-6 h-6 text-white flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </label>

            <label
              class="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors active:scale-95"
              :class="
                settingsStore.speakingDisplayMode === 'chinese'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]'
              "
            >
              <input
                type="radio"
                v-model="settingsStore.speakingDisplayMode"
                value="chinese"
                class="mt-1 w-5 h-5 accent-indigo-600"
              />
              <div class="flex-1">
                <div class="font-semibold mb-1 text-base">显示中文</div>
                <div class="text-sm">看中文翻译,练习口语翻译</div>
              </div>
              <svg
                v-if="settingsStore.speakingDisplayMode === 'chinese'"
                class="w-6 h-6 text-white flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </label>

            <label
              class="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors active:scale-95"
              :class="
                settingsStore.speakingDisplayMode === 'blind'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-[var(--border-color)] text-[var(--text-primary)]'
              "
            >
              <input
                type="radio"
                v-model="settingsStore.speakingDisplayMode"
                value="blind"
                class="mt-1 w-5 h-5 accent-indigo-600"
              />
              <div class="flex-1">
                <div class="font-semibold mb-1 text-base">盲读模式</div>
                <div class="text-sm">不显示任何提示,挑战记忆</div>
              </div>
              <svg
                v-if="settingsStore.speakingDisplayMode === 'blind'"
                class="w-6 h-6 text-white flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSettingsStore } from "@/stores/settings";

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();

const settingType = computed(() => {
  return route.params.settingType || "appearance";
});

const settingTitle = computed(() => {
  const titles = {
    appearance: "外观设置",
    answering: "答题设置",
    playback: "播放设置",
    listening: "听力设置",
    speaking: "口语设置",
  };
  return titles[settingType.value] || "设置";
});

function goBack() {
  router.back();
}
</script>

<style scoped>
input[type="checkbox"]::before {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

input[type="checkbox"]:checked::before {
  transform: translateX(24px);
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  -webkit-appearance: none;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: none;
}
</style>
