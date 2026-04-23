import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { db } from "@/db";
import { userApi } from "@/api/client";

export const useSettingsStore = defineStore("settings", () => {
  // 扁平式设置（兼容现有代码）
  const theme = ref("light");
  const fontFamily = ref("system");
  const phoneticSize = ref("medium");
  const autoNextAfterCorrect = ref(true);
  const ignoreCase = ref(true);
  const inputBoxStyle = ref("word-length");
  const autoShowAnswer = ref("never");
  const requirePunctuation = ref(true);
  const requireSpace = ref(true);
  const playbackSpeed = ref(1.0);
  const playbackCount = ref(1);
  const playbackInterval = ref(0);
  const loopCourse = ref(false);
  const hideAnswer = ref(false);
  const autoSkipNext = ref(false);
  const speakingDisplayMode = ref("english");
  const keypressSound = ref(true);
  const autoPlayAudio = ref(true);
  const pronunciationType = ref(1);
  const showChinese = ref(true);
  const defaultShowEnglish = ref(true);
  const defaultShowName = ref(true);
  const fontSize = ref(16);
  const mute = ref(false);

  // 加载状态
  const loading = ref(false);
  const error = ref(null);

  // 初始化时自动加载本地设置
  (async () => {
    await loadFromLocalDB();
  })();

  // 应用主题（兼容现有代码）
  function applyTheme() {
    document.documentElement.classList.remove("light", "dark");
    if (theme.value === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.add(prefersDark ? "dark" : "light");
    } else {
      document.documentElement.classList.add(theme.value);
    }
  }

  // 从本地数据库加载设置
  async function loadFromLocalDB() {
    try {
      const localSettings = await db.settings.get("main");
      if (localSettings) {
        theme.value = localSettings.theme || "light";
        fontFamily.value = localSettings.fontFamily || "system";
        phoneticSize.value = localSettings.phoneticSize || "medium";
        autoNextAfterCorrect.value = localSettings.autoNextAfterCorrect ?? true;
        ignoreCase.value = localSettings.ignoreCase ?? true;
        inputBoxStyle.value = localSettings.inputBoxStyle || "word-length";
        autoShowAnswer.value = localSettings.autoShowAnswer || "never";
        requirePunctuation.value = localSettings.requirePunctuation ?? true;
        requireSpace.value = localSettings.requireSpace ?? true;
        playbackSpeed.value = localSettings.playbackSpeed || 1.0;
        playbackCount.value = localSettings.playbackCount || 1;
        playbackInterval.value = localSettings.playbackInterval || 0;
        loopCourse.value = localSettings.loopCourse ?? false;
        hideAnswer.value = localSettings.hideAnswer ?? false;
        autoSkipNext.value = localSettings.autoSkipNext ?? false;
        speakingDisplayMode.value =
          localSettings.speakingDisplayMode || "english";
        keypressSound.value = localSettings.keypressSound ?? true;
        autoPlayAudio.value = localSettings.autoPlayAudio ?? true;
        pronunciationType.value = localSettings.pronunciationType || 1;
        showChinese.value = localSettings.showChinese ?? true;
        defaultShowEnglish.value = localSettings.defaultShowEnglish ?? true;
        defaultShowName.value = localSettings.defaultShowName ?? true;
        fontSize.value = localSettings.fontSize || 16;
        mute.value = localSettings.mute ?? false;

        applyTheme();
        return true;
      }
      return false;
    } catch (err) {
      console.error("从本地数据库加载设置失败:", err);
      return false;
    }
  }

  // 保存设置到本地数据库
  async function saveToLocalDB() {
    try {
      await db.settings.put({
        key: "main",
        theme: theme.value,
        fontFamily: fontFamily.value,
        phoneticSize: phoneticSize.value,
        autoNextAfterCorrect: autoNextAfterCorrect.value,
        ignoreCase: ignoreCase.value,
        inputBoxStyle: inputBoxStyle.value,
        autoShowAnswer: autoShowAnswer.value,
        requirePunctuation: requirePunctuation.value,
        requireSpace: requireSpace.value,
        playbackSpeed: playbackSpeed.value,
        playbackCount: playbackCount.value,
        playbackInterval: playbackInterval.value,
        loopCourse: loopCourse.value,
        hideAnswer: hideAnswer.value,
        autoSkipNext: autoSkipNext.value,
        speakingDisplayMode: speakingDisplayMode.value,
        keypressSound: keypressSound.value,
        autoPlayAudio: autoPlayAudio.value,
        pronunciationType: pronunciationType.value,
        showChinese: showChinese.value,
        defaultShowEnglish: defaultShowEnglish.value,
        defaultShowName: defaultShowName.value,
        fontSize: fontSize.value,
        mute: mute.value,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("保存设置到本地数据库失败:", err);
    }
  }

  // 将扁平设置转换为后端期望的嵌套结构
  function flattenToNested() {
    return {
      appearance: {
        theme: theme.value,
        font_size: phoneticSize.value,
        show_progress: true,
        show_score: true,
        compact_mode: false,
      },
      quiz: {
        auto_play: autoPlayAudio.value,
        show_answer: autoShowAnswer.value !== "never",
        quiz_mode: "normal",
        answer_delay: 3000,
        repeat_times: playbackCount.value,
        auto_next: autoNextAfterCorrect.value,
      },
      playback: {
        playback_speed: playbackSpeed.value,
        auto_play: autoPlayAudio.value,
        repeat_mode: loopCourse.value ? "all" : "none",
        show_subtitles: true,
        highlight_text: true,
        line_by_line: true,
      },
      listening: {
        volume: 80,
        background_music: 30,
        speech_recognition: true,
        speech_language: "en-US",
        noise_reduction: true,
      },
      speaking: {
        recording_duration: 5000,
        auto_stop: true,
        feedback_level: "detailed",
        pronunciation_score: true,
        fluency_score: true,
        accuracy_score: true,
        auto_play_recording: true,
        display_mode: speakingDisplayMode.value,
      },
      notifications: {
        email_notifications: true,
        push_notifications: true,
        daily_reminder: true,
        achievement_notifications: true,
        reminder_time: "20:00",
      },
      sync: {
        auto_sync: true,
        sync_frequency: "daily",
        sync_over_wifi: true,
        backup_data: true,
      },
    };
  }

  // 将后端返回的嵌套结构转换为扁平结构
  function nestedToFlatten(nestedSettings) {
    if (!nestedSettings) return;

    if (nestedSettings.appearance) {
      theme.value = nestedSettings.appearance.theme || theme.value;
      phoneticSize.value =
        nestedSettings.appearance.font_size || phoneticSize.value;
    }

    if (nestedSettings.quiz) {
      autoPlayAudio.value =
        nestedSettings.quiz.auto_play ?? autoPlayAudio.value;
      autoShowAnswer.value = nestedSettings.quiz.show_answer
        ? "after-3-errors"
        : autoShowAnswer.value;
      playbackCount.value =
        nestedSettings.quiz.repeat_times || playbackCount.value;
      autoNextAfterCorrect.value =
        nestedSettings.quiz.auto_next ?? autoNextAfterCorrect.value;
    }

    if (nestedSettings.playback) {
      playbackSpeed.value =
        nestedSettings.playback.playback_speed || playbackSpeed.value;
      autoPlayAudio.value =
        nestedSettings.playback.auto_play ?? autoPlayAudio.value;
      loopCourse.value = nestedSettings.playback.repeat_mode === "all";
    }

    if (nestedSettings.speaking) {
      speakingDisplayMode.value =
        nestedSettings.speaking.display_mode || speakingDisplayMode.value;
    }
  }

  // 从后端API加载用户设置
  async function loadSettings() {
    loading.value = true;
    error.value = null;
    try {
      // 先从本地数据库加载设置，保留用户的本地设置
      await loadFromLocalDB();

      const response = await userApi.getSettings();

      if (response) {
        // 只更新后端返回的设置，不覆盖本地已有但后端未返回的设置
        nestedToFlatten(response);
        applyTheme();
        await saveToLocalDB();
      }
    } catch (err) {
      console.error("[settings.js] 从API加载用户设置失败:", err);
      error.value = err.message || "加载设置失败";
      await loadFromLocalDB();
    } finally {
      loading.value = false;
    }
  }

  // 更新用户设置
  async function updateSettings() {
    loading.value = true;
    error.value = null;
    try {
      applyTheme();
      await saveToLocalDB();

      const nestedSettings = flattenToNested();
      const response = await userApi.updateSettings(nestedSettings);

      return response;
    } catch (err) {
      console.error("[settings.js] 更新用户设置失败:", err);
      error.value = err.message || "更新设置失败";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 监听设置变化，自动保存到后端
  let saveTimeout = null;

  // 分别监听每个设置项的变化
  watch(theme, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(fontFamily, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(phoneticSize, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(autoNextAfterCorrect, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(ignoreCase, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(inputBoxStyle, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(autoShowAnswer, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(requirePunctuation, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(requireSpace, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(playbackSpeed, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(playbackCount, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(playbackInterval, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(loopCourse, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(hideAnswer, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(autoSkipNext, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(speakingDisplayMode, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(keypressSound, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(autoPlayAudio, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(pronunciationType, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(showChinese, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(defaultShowEnglish, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(defaultShowName, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(fontSize, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  watch(mute, () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateSettings, 500);
  });

  return {
    // 扁平式设置属性（兼容现有代码）
    theme,
    fontFamily,
    phoneticSize,
    autoNextAfterCorrect,
    ignoreCase,
    inputBoxStyle,
    autoShowAnswer,
    requirePunctuation,
    requireSpace,
    playbackSpeed,
    playbackCount,
    playbackInterval,
    loopCourse,
    hideAnswer,
    autoSkipNext,
    speakingDisplayMode,
    keypressSound,
    autoPlayAudio,
    pronunciationType,
    showChinese,
    defaultShowEnglish,
    defaultShowName,
    fontSize,
    mute,

    // 状态
    loading,
    error,

    // 方法
    applyTheme,
    loadSettings,
    updateSettings,
  };
});
