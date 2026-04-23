// 导入依赖
import { defineStore } from "pinia"; // Pinia状态管理
import { ref, computed, nextTick, watch } from "vue"; // Vue组合式API
import { Howl } from "howler"; // 音频播放库
import { useCourseStore } from "./course"; // 课程相关状态
import { useUserStore } from "./user"; // 用户相关状态
import { useSettingsStore } from "./settings"; // 设置相关状态
import { getPronunciationUrl } from "@/composables/pronunciation"; // 获取发音URL
import { updateSource, play, stop, getIsPlaying } from "@/composables/audio"; // 音频控制

// 学习状态存储
export const useLearningStore = defineStore("learning", () => {
  // 状态变量
  const currentSentenceIndex = ref(0); // 当前句子索引
  const inputText = ref(""); // 当前输入文本
  const currentCharIndex = ref(0); // 当前字符索引
  const isCorrect = ref(true); // 输入是否正确
  const startTime = ref(null); // 开始时间
  const elapsedTime = ref(0); // 已用时间（秒）
  const timerInterval = ref(null); // 计时器间隔ID
  const currentAudio = ref(null); // 当前音频实例
  const isPlaying = ref(false); // 是否正在播放音频
  const showEnglish = ref(true); // 是否显示英文
  const showChinese = ref(true); // 是否显示中文
  const mode = ref("follow"); // 学习模式：follow(跟读), recall(回忆), dictation(听写)
  const sentenceProgress = ref({}); // 句子进度记录
  const isLessonCompleted = ref(false); // 课程是否完成
  const validationErrors = ref([]); // 验证错误
  const hintedWords = ref({}); // 提示过的单词
  const keySoundInstances = ref([]); // 键盘音效实例数组
  const currentKeySoundIndex = ref(0); // 当前键盘音效索引
  const autoSaveInterval = ref(null); // 自动保存间隔ID

  // 其他状态存储引用
  const courseStore = useCourseStore(); // 课程状态
  const userStore = useUserStore(); // 用户状态
  const settingsStore = useSettingsStore(); // 设置状态

  // 计算属性
  // 获取当前句子
  const currentSentence = computed(() => {
    if (!courseStore.lessonData?.sentences) return null;
    return courseStore.lessonData.sentences[currentSentenceIndex.value];
  });

  // 获取总句子数
  const totalSentences = computed(() => {
    return courseStore.lessonData?.sentences?.length || 0;
  });

  // 获取剩余单词数
  const remainingWords = computed(() => {
    if (!courseStore.lessonData?.sentences) return 0;
    let count = 0;
    for (
      let i = currentSentenceIndex.value;
      i < courseStore.lessonData.sentences.length;
      i++
    ) {
      count += courseStore.lessonData.sentences[i].words.length;
    }
    return count;
  });

  // 获取总单词数
  const totalWords = computed(() => {
    if (!courseStore.lessonData?.sentences) return 0;
    let count = 0;
    courseStore.lessonData.sentences.forEach((s) => {
      count += s.words.length;
    });
    return count;
  });

  // 功能函数
  // 自动填充人名
  function autoFillNames(lessonData) {


    // 如果默认不显示人名或没有句子数据，直接返回
    if (!settingsStore.defaultShowName || !lessonData?.sentences) {
      return;
    }

    // 遍历所有句子
    lessonData.sentences.forEach((sentence, sentenceIndex) => {
      const sentenceText = sentence.text.trim();
      if (!sentenceText) return;

      let filledText = "";
      let charIndex = 0;
      let matchFound = false;

      // 匹配人名的正则表达式：匹配尊称+姓名（如Mr. Smith）或直接人名+冒号（如John:）
      const nameRegex =
        /^((Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Prof\.)\s?([A-Z][a-zA-Z]+)(?:'s)?)|([A-Z][a-zA-Z]+):/i;
      const match = sentenceText.match(nameRegex);

      if (match) {
        matchFound = true;
        const matchedText = match[0];
        filledText = matchedText;
        charIndex = matchedText.length;

        // 如果是人名+冒号格式，处理后续空格
        if (match[4]) {
          while (charIndex < sentenceText.length) {
            const nextChar = sentenceText[charIndex];
            if (isSpace(nextChar)) {
              filledText += nextChar;
              charIndex++;
            } else {
              break;
            }
          }
        }
      }

      // 如果匹配到人名，更新进度
      if (matchFound) {


        // 初始化句子进度
        if (!sentenceProgress.value[sentenceIndex]) {
          sentenceProgress.value[sentenceIndex] = {
            completed: false,
            charIndex: 0,
            inputText: "",
            // 保存用户的实际输入，用于显示错误
            userInput: "",
            // 保存自动填充的长度，用于UI显示
            autoFilledLength: 0,
          };
        }
        // 更新进度
        sentenceProgress.value[sentenceIndex].inputText = filledText;
        sentenceProgress.value[sentenceIndex].userInput = filledText;
        sentenceProgress.value[sentenceIndex].charIndex = charIndex;
        sentenceProgress.value[sentenceIndex].autoFilledLength = charIndex;

        // 如果是当前句子，更新当前输入状态
        if (sentenceIndex === currentSentenceIndex.value) {
          inputText.value = filledText;
          currentCharIndex.value = charIndex;

        }
      }
    });
  }

  // 监听默认显示人名设置的变化
  watch(
    () => settingsStore.defaultShowName,
    (newVal) => {
      if (courseStore.lessonData) {
        // 重置所有未完成句子的进度
        if (courseStore.lessonData.sentences) {
          courseStore.lessonData.sentences.forEach((_, index) => {
            const progress = sentenceProgress.value[index];
            if (progress && !progress.completed) {
              sentenceProgress.value[index] = {
                completed: false,
                charIndex: 0,
                inputText: "",
                // 保存用户的实际输入，用于显示错误
                userInput: "",
                // 保存自动填充的长度，用于UI显示
                autoFilledLength: 0,
              };
            }
          });
        }

        // 如果新设置为显示人名，重新填充人名
        if (newVal) {
          autoFillNames(courseStore.lessonData);
        }

        // 更新当前输入状态
        const progress = sentenceProgress.value[currentSentenceIndex.value];
        if (progress) {
          inputText.value = progress.inputText;
          currentCharIndex.value = progress.charIndex;
        }
      }
    },
  );

  // 初始化学习状态
  function initLearning(lessonData) {
    let startIndex = 0;

    // 如果有保存的进度，使用保存的进度
    if (lessonData?.progress?.current_line !== undefined) {
      startIndex = lessonData.progress.current_line;
      // 确保起始索引不超过句子总数
      if (lessonData.sentences && startIndex >= lessonData.sentences.length) {
        startIndex = lessonData.sentences.length - 1;
      }

    }

    // 初始化学习状态
    currentSentenceIndex.value = startIndex;
    inputText.value = "";
    currentCharIndex.value = 0;
    isCorrect.value = true;
    startTime.value = Date.now();
    elapsedTime.value = 0;
    // 应用默认显示设置
    showEnglish.value = settingsStore.defaultShowEnglish;
    showChinese.value = settingsStore.showChinese;
    mode.value = "follow";
    sentenceProgress.value = {};
    isLessonCompleted.value = false;
    validationErrors.value = [];
    hintedWords.value = {};

    // 初始化句子进度
    if (lessonData?.sentences) {
      lessonData.sentences.forEach((sentence, index) => {
        const isCompleted = index < startIndex;
        const sentenceText = isCompleted ? sentence.text : "";
        sentenceProgress.value[index] = {
          completed: isCompleted,
          charIndex: isCompleted ? sentence.text.length : 0,
          inputText: sentenceText,
          // 保存用户的实际输入，用于显示错误
          userInput: sentenceText,
          // 保存自动填充的长度，用于UI显示
          autoFilledLength: 0,
        };
      });
    }

    // 自动填充人名
    autoFillNames(lessonData);

    // 更新当前输入状态
    if (sentenceProgress.value[startIndex]) {
      inputText.value = sentenceProgress.value[startIndex].inputText;
      currentCharIndex.value = sentenceProgress.value[startIndex].charIndex;
    }

    // 滚动到当前句子
    nextTick(() => {
      scrollToCurrentSentence();
    });

    // 初始化键盘音效
    initKeySounds();

    // 启动计时器和自动保存
    startTimer();
    startAutoSave();

    // 如果设置了自动播放音频，延迟播放当前行音频
    if (settingsStore.autoPlayAudio) {
      setTimeout(() => {
        playCurrentLineAudio();
      }, 500);
    }
  }

  // 启动计时器
  function startTimer() {
    // 清除现有计时器
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }
    // 每秒更新一次已用时间
    timerInterval.value = setInterval(() => {
      if (startTime.value) {
        elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
      }
    }, 1000);
  }

  // 启动自动保存
  function startAutoSave() {
    // 清除现有自动保存
    if (autoSaveInterval.value) {
      clearInterval(autoSaveInterval.value);
    }
    // 每30秒自动保存一次进度
    autoSaveInterval.value = setInterval(() => {
      if (
        courseStore.currentLesson?.id &&
        courseStore.currentLesson?.courseId
      ) {

        // 获取当前句子的索引和字符索引
        const currentIndex = currentSentenceIndex.value;
        const currentProgress = sentenceProgress.value[currentIndex];
        const currentCharIdx =
          currentProgress?.charIndex || currentCharIndex.value;

        courseStore.updateLessonProgress(
          courseStore.currentLesson.id,
          courseStore.currentLesson.courseId,
          elapsedTime.value,
          false,
          currentIndex,
          currentCharIdx,
        );
      }
    }, 30000);
  }

  // 停止计时器
  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }

  // 停止自动保存
  function stopAutoSave() {
    if (autoSaveInterval.value) {
      clearInterval(autoSaveInterval.value);
      autoSaveInterval.value = null;
    }
  }

  // 播放音频
  async function playAudio(text) {
    // 如果静音或没有文本，直接返回
    if (settingsStore.mute) return;
    if (!text) return;

    // 修复常见的缩写错误
    let processedText = text;
    // 将 "Whats" 修复为 "What's"
    processedText = processedText.replace(/\bWhats\b/g, "What's");
    // 将 "name s" 修复为 "name's"
    processedText = processedText.replace(/name\s+s/g, "name's");
    // 将 "dont" 修复为 "don't"
    processedText = processedText.replace(/\bdont\b/g, "don't");
    // 将 "cant" 修复为 "can't"
    processedText = processedText.replace(/\bcant\b/g, "can't");
    // 将 "wont" 修复为 "won't"
    processedText = processedText.replace(/\bwont\b/g, "won't");

    // 停止当前播放的音频
    stop();

    // 获取发音URL并更新音频源（直接使用完整文本，支持单词、句子、段落、文章）
    const pronunciationUrl = getPronunciationUrl(processedText);

    updateSource(pronunciationUrl);

    isPlaying.value = true;

    try {
      // 播放音频
      await play();

    } catch (error) {
      console.error("播放音频失败:", error, "URL:", pronunciationUrl);
    } finally {
      // 更新播放状态
      isPlaying.value = getIsPlaying();
    }
  }

  // 停止音频播放
  function stopAudio() {
    stop();
    isPlaying.value = false;
  }

  // 播放当前行音频
  async function playCurrentLineAudio() {
    // 如果静音，直接返回
    if (settingsStore.mute) return;

    // 获取当前句子
    const sentence =
      courseStore.lessonData?.sentences[currentSentenceIndex.value];
    if (!sentence) return;

    let sentenceText = sentence.text;
    if (!sentenceText) return;

    // 处理自动填充人名的情况：去掉人名前缀，只播放句子内容
    // 匹配格式：
    // 1. 尊称+名字+冒号，如 "MR. BLAKE:"
    // 2. 名字+冒号，如 "ROBERT:"
    // 3. 尊称+名字+空格，如 "MR. BLAKE "
    // 4. 支持冒号后无空格的情况，如 "MR. BLAKE:Good"
    // 5. 支持中文全角冒号，如 "TEACHER：Whose"
    // 6. 支持多词头衔，如 "CUSTOMS OFFICER:"
    let cleanedText = sentenceText;
    // 匹配并移除名字前缀，支持ASCII冒号(:)和中文全角冒号(：)
    // 支持多词头衔（如 "CUSTOMS OFFICER"）和带尊称的头衔
    cleanedText = cleanedText.replace(/^(?:[A-Z][a-zA-Z]*\.?\s*)+[:：]/i, "");
    // 移除可能的前导空格
    cleanedText = cleanedText.trim();
    sentenceText = cleanedText;

    // 修复常见的缩写错误
    // 将 "Whats" 修复为 "What's"
    sentenceText = sentenceText.replace(/\bWhats\b/g, "What's");
    // 将 "name s" 修复为 "name's"
    sentenceText = sentenceText.replace(/name\s+s/g, "name's");
    // 将 "dont" 修复为 "don't"
    sentenceText = sentenceText.replace(/\bdont\b/g, "don't");
    // 将 "cant" 修复为 "can't"
    sentenceText = sentenceText.replace(/\bcant\b/g, "can't");
    // 将 "wont" 修复为 "won't"
    sentenceText = sentenceText.replace(/\bwont\b/g, "won't");

    await playAudio(sentenceText);
  }

  // 辅助函数：检查是否为标点符号
  function isPunctuation(char) {
    if (!char) return false;
    const punctuation = /[.,!?;:'"()\[\]{} \-—–…。，！？；：""''（）【】《》]/g;
    return punctuation.test(char);
  }

  // 辅助函数：检查是否为空格
  function isSpace(char) {
    if (!char) return false;
    // 检查是否为普通空格或非断行空格
    return char === " " || char.charCodeAt(0) === 160;
  }

  // 辅助函数：检查是否为字母
  function isLetter(char) {
    if (!char) return false;
    return /[a-zA-Z]/.test(char);
  }

  // 辅助函数：检查是否为单词的首字母
  function isFirstWordFirstLetter(sentenceText, charIndex, inputTextSoFar) {
    if (!sentenceText || charIndex < 0 || charIndex >= sentenceText.length) {
      return false;
    }

    const currentChar = sentenceText[charIndex];
    if (!isLetter(currentChar)) {
      return false;
    }

    // 检查之前的输入是否包含字母
    if (inputTextSoFar && inputTextSoFar.length > 0) {
      for (let i = 0; i < inputTextSoFar.length; i++) {
        if (isLetter(inputTextSoFar[i])) {
          return false;
        }
      }
    }

    return true;
  }

  // 处理用户输入
  function handleInput(char) {
    if (!currentSentence.value) return false;

    let expectedChar = currentSentence.value.text[currentCharIndex.value];

    // 如果已经输入到句子末尾，忽略这次输入，等待 nextSentence 执行
    if (expectedChar === undefined) {
      return false;
    }

    // 检查输入是否正确，应用忽略大小写设置
    const normalizedInput = settingsStore.ignoreCase
      ? char.toLowerCase()
      : char;
    const normalizedExpected = settingsStore.ignoreCase
      ? expectedChar.toLowerCase()
      : expectedChar;
    const isMatch = normalizedInput === normalizedExpected;
    isCorrect.value = isMatch;

    // 更新当前句子的进度
    if (!sentenceProgress.value[currentSentenceIndex.value]) {
      sentenceProgress.value[currentSentenceIndex.value] = {
        completed: false,
        charIndex: 0,
        inputText: "",
        // 保存用户的实际输入，用于显示错误
        userInput: "",
        // 保存自动填充的长度，用于UI显示
        autoFilledLength: 0,
      };
    }

    // 获取当前句子的进度
    const currentProgress = sentenceProgress.value[currentSentenceIndex.value];

    // 只将字符追加到当前句子的输入中，而不是全局inputText
    currentProgress.userInput += char;

    // 更新全局inputText，用于输入框显示
    inputText.value = currentProgress.userInput;

    // 无论输入是否正确，都更新当前字符索引，允许用户继续输入
    currentCharIndex.value++;
    currentProgress.charIndex = currentCharIndex.value;

    // 如果输入正确，更新inputText为正确字符，否则保留错误字符
    if (isMatch) {
      currentProgress.inputText += char;
    } else {
      currentProgress.inputText += char;
    }

    // 播放键盘音效
    if (settingsStore.keypressSound && !settingsStore.mute) {
      playKeySound();
    }

    // 输入错误时触发震动效果
    if (!isMatch) {
      triggerShake();
    }

    // 如果当前句子完成，跳转到下一句
    if (currentCharIndex.value >= currentSentence.value.text.length) {
      currentProgress.completed = true;
      currentProgress.charIndex = currentSentence.value.text.length;
      setTimeout(() => {
        nextSentence();
      }, 300);
    }

    return true;
  }

  // 处理退格键
  function handleBackspace() {
    if (!currentSentence.value) return;

    // 获取当前句子的进度
    const currentProgress = sentenceProgress.value[currentSentenceIndex.value];

    // 如果当前句子还有字符可以删除
    if (
      currentProgress &&
      currentProgress.inputText.length > 0 &&
      currentCharIndex.value > 0
    ) {
      // 删除当前句子输入的最后一个字符
      currentProgress.inputText = currentProgress.inputText.slice(0, -1);
      currentProgress.userInput = currentProgress.userInput.slice(0, -1);

      // 更新全局inputText，用于输入框显示
      inputText.value = currentProgress.inputText;

      // 更新当前字符索引
      currentCharIndex.value--;
      currentProgress.charIndex = currentCharIndex.value;

      // 如果当前句子已经完成，将其标记为未完成
      if (currentProgress.completed) {
        currentProgress.completed = false;
      }

      // 重新检查当前输入是否正确
      if (currentCharIndex.value > 0) {
        const expectedChar =
          currentSentence.value.text[currentCharIndex.value - 1];
        const inputChar = currentProgress.inputText[currentCharIndex.value - 1];
        if (expectedChar && inputChar) {
          const normalizedInput = inputChar.toLowerCase();
          const normalizedExpected = expectedChar.toLowerCase();
          isCorrect.value = normalizedInput === normalizedExpected;
        }
      } else {
        isCorrect.value = true;
      }
    }
    // 如果当前句子没有字符可以删除，退回到上一个句子
    else if (currentSentenceIndex.value > 0) {
      // 保存当前句子的进度
      if (currentProgress) {
        currentProgress.charIndex = currentCharIndex.value;
        currentProgress.completed = false;
      }

      // 退回到上一个句子
      currentSentenceIndex.value--;

      // 恢复上一个句子的进度
      const prevSentence =
        courseStore.lessonData?.sentences[currentSentenceIndex.value];
      if (prevSentence) {
        currentSentence.value = prevSentence;

        // 获取上一个句子的进度
        const prevProgress = sentenceProgress.value[currentSentenceIndex.value];
        if (prevProgress && prevProgress.inputText) {
          // 更新全局inputText，用于输入框显示
          inputText.value = prevProgress.inputText;
          currentCharIndex.value = prevProgress.charIndex;
          // 将上一个句子标记为未完成
          prevProgress.completed = false;
        } else {
          // 如果上一个句子没有进度，初始化
          inputText.value = "";
          currentCharIndex.value = 0;
          // 初始化上一个句子的进度
          sentenceProgress.value[currentSentenceIndex.value] = {
            completed: false,
            charIndex: 0,
            inputText: "",
            userInput: "",
          };
        }

        // 滚动到上一个句子
        setTimeout(() => {
          scrollToCurrentSentence();
        }, 100);
      }
    }
  }

  // 初始化键盘音效
  function initKeySounds() {
    // 如果已经初始化过，直接返回
    if (keySoundInstances.value.length > 0) return;

    const sounds = [
      "/sound/key-sounds/机械键盘1.mp3",
      "/sound/key-sounds/机械键盘2.mp3",
    ];

    // 为每种音效创建3个实例，用于循环播放
    sounds.forEach((soundSrc) => {
      for (let i = 0; i < 3; i++) {
        const sound = new Howl({
          src: [soundSrc],
          volume: 0.3,
          html5: true,
          preload: true,
        });
        keySoundInstances.value.push(sound);
      }
    });
  }

  // 播放键盘音效
  function playKeySound() {
    if (settingsStore.mute) return;

    // 如果未初始化，先初始化
    if (keySoundInstances.value.length === 0) {
      initKeySounds();
    }

    if (keySoundInstances.value.length > 0) {
      // 循环使用不同的音效实例
      const sound = keySoundInstances.value[currentKeySoundIndex.value];
      currentKeySoundIndex.value =
        (currentKeySoundIndex.value + 1) % keySoundInstances.value.length;

      // 如果音效正在播放，先停止
      if (sound.playing()) {
        sound.stop();
      }
      sound.play();
    }
  }

  let shakeContainerElement = null;

  // 触发震动效果
  function triggerShake() {
    // 获取震动容器元素
    if (!shakeContainerElement) {
      shakeContainerElement = document.querySelector(".learning-container");
    }
    // 添加震动动画
    if (shakeContainerElement) {
      shakeContainerElement.classList.add("shake");
      setTimeout(() => {
        shakeContainerElement.classList.remove("shake");
      }, 300);
    }

    // 触发设备震动（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  // 下一句
  function nextSentence() {
    if (currentSentenceIndex.value < totalSentences.value - 1) {
      // 标记当前句为已完成
      const currentProgress =
        sentenceProgress.value[currentSentenceIndex.value];
      if (currentProgress) {
        currentProgress.completed = true;
      }

      // 移动到下一句
      currentSentenceIndex.value++;

      // 初始化下一句进度
      if (!sentenceProgress.value[currentSentenceIndex.value]) {
        sentenceProgress.value[currentSentenceIndex.value] = {
          completed: false,
          charIndex: 0,
          inputText: "",
          userInput: "",
        };
      }

      // 恢复下一句的输入状态
      const progress = sentenceProgress.value[currentSentenceIndex.value];
      if (progress.inputText && progress.charIndex > 0) {
        inputText.value = progress.inputText;
        currentCharIndex.value = progress.charIndex;
      } else {
        inputText.value = "";
        currentCharIndex.value = 0;
      }

      isCorrect.value = true;

      // 滚动到当前句
      setTimeout(() => {
        scrollToCurrentSentence();
      }, 100);

      // 自动播放音频
      if (settingsStore.autoPlayAudio) {
        setTimeout(() => {
          playCurrentLineAudio();
        }, 300);
      }
    } else {
      // 已到最后一句，标记课程完成
      const currentProgress =
        sentenceProgress.value[currentSentenceIndex.value];
      if (currentProgress) {
        currentProgress.completed = true;
        // 确保最后一句的输入被正确保存
        currentProgress.inputText = inputText.value;
        currentProgress.userInput = inputText.value;
      }
      isLessonCompleted.value = true;
      stopTimer();
    }
  }

  // 跳过当前句
  function skipSentence() {
    nextSentence();
  }

  // 滚动到当前句
  function scrollToCurrentSentence() {
    const sentenceEl = document.querySelector(
      `[data-sentence-index="${currentSentenceIndex.value}"]`,
    );
    if (sentenceEl) {
      // 获取内容容器
      const contentEl = document.querySelector(".flex-1.overflow-y-auto");
      if (!contentEl) return;

      // 获取容器和句子的位置信息
      const containerRect = contentEl.getBoundingClientRect();
      const sentenceRect = sentenceEl.getBoundingClientRect();

      // 重置所有句子的样式
      const allSentences = document.querySelectorAll("[data-sentence-index]");
      allSentences.forEach((sentence) => {
        sentence.style.paddingBottom = "";
      });

      // 计算滚动偏移量：简化滚动逻辑，确保输入完成一行后向上滑动更多
      // 基础滚动高度为70px，输入完成一行后增加20px，总共90px
      let baseOffset = 70;

      // 当进入新句子时，增加20px的额外滚动高度
      if (currentSentenceIndex.value > 0) {
        baseOffset = 90; // 70px基础高度 + 20px额外高度
      }

      // 直接滚动到句子位置上方，确保下一行有足够的可见空间
      let scrollTop = sentenceEl.offsetTop - baseOffset;

      // 确保滚动位置不小于0
      scrollTop = Math.max(scrollTop, 0);

      // 滚动内容容器，而不是窗口
      contentEl.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });

      // 为所有行添加足够的底部内边距，确保有足够的滚动空间
      contentEl.style.paddingBottom = "320px";
    }
  }

  // 验证所有句子并收集错词
  function validateAllSentences() {
    validationErrors.value = []; // 清空之前的错误信息，不显示新的错误信息
    const wrongWords = [];

    if (!courseStore.lessonData?.sentences) {
      return { hasError: false, wrongWords: [] };
    }

    let hasError = false;
    // 遍历所有句子进行验证
    courseStore.lessonData.sentences.forEach((sentence, index) => {
      const progress = sentenceProgress.value[index];
      // 检查是否完成
      if (!progress || !progress.completed) {
        // 不再添加错误信息到validationErrors，只标记hasError
        hasError = true;
        return;
      }

      const expectedText = sentence.text;
      const actualText = progress.inputText || "";
      const expectedWords = expectedText
        .split(/\s+/)
        .filter((word) => word.length > 0);
      const actualWords = actualText
        .split(/\s+/)
        .filter((word) => word.length > 0);

      // 检查输入长度
      if (actualText.length < expectedText.length) {
        // 不再添加错误信息到validationErrors，只标记hasError
        hasError = true;
        return;
      }

      // 检查每个单词，只比较用户实际输入的单词
      for (
        let i = 0;
        i < Math.min(expectedWords.length, actualWords.length);
        i++
      ) {
        const expectedWord = expectedWords[i]
          .toLowerCase()
          .replace(/[^a-zA-Z]/g, "");
        const actualWord =
          actualWords[i]?.toLowerCase().replace(/[^a-zA-Z]/g, "") || "";
        const userAnswer = actualWords[i] || "";

        if (expectedWord && actualWord !== expectedWord && userAnswer) {
          // 只收集用户实际输入了的错误单词，避免user_answer为空
          wrongWords.push({
            word: expectedWord,
            userAnswer: userAnswer,
            correctAnswer: expectedWords[i],
            sentenceIndex: index,
            sentence: sentence.text,
          });

          // 不再添加错误信息到validationErrors，只标记hasError
          hasError = true;
        }
      }

      // 检查是否有遗漏的单词（用户没有输入的单词）
      if (actualWords.length < expectedWords.length) {
        // 有遗漏的单词，标记为错误
        hasError = true;
      }
    });

    return { hasError, wrongWords };
  }

  // 提交课程
  async function submitLesson() {
    try {
      // 验证所有句子并收集错词
      const { hasError, wrongWords } = validateAllSentences();

      stopAudio();

      // 计算学习时间
      const totalTime = Math.floor((Date.now() - startTime.value) / 1000);
      const minutes = Math.floor(totalTime / 60);

      // 获取当前句子的索引和字符索引
      const currentIndex = currentSentenceIndex.value;
      const currentProgress = sentenceProgress.value[currentIndex];
      const currentCharIdx =
        currentProgress?.charIndex || currentCharIndex.value;

      // 更新课程进度
      await courseStore.updateLessonProgress(
        courseStore.currentLesson.id,
        courseStore.currentLesson.courseId,
        totalTime,
        !hasError,
        currentIndex,
        currentCharIdx,
      );

      // 更新用户数据
      await userStore.updateStreak();
      await userStore.addWordCount(totalWords.value);
      await userStore.addStudyTime(minutes, "today");

      // 如果有错误，将错词添加到错题本
      if (wrongWords.length > 0) {
        await addWrongWordsToWordBook(wrongWords);
      }
    } catch (error) {
      console.error("提交课程时发生错误:", error);
      // 不抛出错误，确保函数总是返回true
    }

    return true;
  }

  // 将错词添加到错题本
  async function addWrongWordsToWordBook(wrongWords) {
    try {
      // 导入API客户端，避免循环依赖
      const { addWrongWord } = await import("@/api/client");

      const { courseId } = courseStore.currentLesson;
      const lessonId = courseStore.currentLesson.id;

      // 去重，避免重复添加同一个单词
      const uniqueWrongWords = [];
      const wordSet = new Set();

      for (const wrongWord of wrongWords) {
        if (!wordSet.has(wrongWord.word)) {
          wordSet.add(wrongWord.word);
          uniqueWrongWords.push(wrongWord);
        }
      }

      // 批量添加错词
      for (const wrongWord of uniqueWrongWords) {
        await addWrongWord({
          word: wrongWord.word,
          question_type: "learning",
          course_id: courseId,
          lesson_id: lessonId,
          user_answer: wrongWord.userAnswer,
          correct_answer: wrongWord.correctAnswer,
          explanation: `学习内容: ${wrongWord.sentence}`,
        });
      }


    } catch (error) {
      console.error("添加错词到错题本失败:", error);
    }
  }

  // 完成课程
  async function completeLesson() {
    return await submitLesson();
  }

  // 切换显示英文 - 与settingsStore同步
  function toggleEnglish() {
    showEnglish.value = !showEnglish.value;
    // 同步到settingsStore，确保下次学习时使用最新设置
    settingsStore.defaultShowEnglish = showEnglish.value;
  }

  // 切换显示中文 - 与settingsStore同步
  function toggleChinese() {
    showChinese.value = !showChinese.value;
    // 同步到settingsStore，确保下次学习时使用最新设置
    settingsStore.showChinese = showChinese.value;
  }

  // 切换学习模式
  function toggleMode() {
    if (mode.value === "follow") {
      // 从跟读模式切换到回忆模式（隐藏英文）
      mode.value = "recall";
      showEnglish.value = false;
    } else if (mode.value === "recall") {
      // 从回忆模式切换到听写模式（隐藏中文）
      mode.value = "dictation";
      showChinese.value = false;
    } else {
      // 从听写模式切换回跟读模式（显示英文和中文）
      mode.value = "follow";
      showEnglish.value = true;
      showChinese.value = true;
    }
  }

  // 重置学习状态
  function reset() {
    stopTimer();
    stopAutoSave();
    stopAudio();
    currentSentenceIndex.value = 0;
    inputText.value = "";
    currentCharIndex.value = 0;
    isCorrect.value = true;
    elapsedTime.value = 0;
    sentenceProgress.value = {};
    isLessonCompleted.value = false;
    validationErrors.value = [];
    hintedWords.value = {};
  }

  // 添加提示单词
  function addHintedWord(sentenceIndex, wordStart, wordEnd) {
    // 初始化句子的提示单词数组
    if (!hintedWords.value[sentenceIndex]) {
      hintedWords.value[sentenceIndex] = [];
    }

    // 检查是否已经提示过这个单词，避免重复提示
    const isAlreadyHinted = hintedWords.value[sentenceIndex].some(
      (hint) => hint.wordStart === wordStart && hint.wordEnd === wordEnd,
    );

    if (!isAlreadyHinted) {
      // 使用展开运算符创建新数组，确保 Vue 能够检测到变化
      const updatedHints = [
        ...hintedWords.value[sentenceIndex],
        { wordStart, wordEnd },
      ];

      // 替换整个数组，确保 Vue 能够检测到变化
      hintedWords.value[sentenceIndex] = updatedHints;
    }
  }

  // 检查字符是否被提示
  function isCharHinted(sentenceIndex, charIndex) {
    const hints = hintedWords.value[sentenceIndex];
    if (!hints || hints.length === 0) return false;
    // 检查字符是否在提示范围内
    return hints.some(
      (hint) => charIndex >= hint.wordStart && charIndex < hint.wordEnd,
    );
  }

  // 获取句子字符索引
  function getSentenceCharIndex(sentenceIndex) {
    if (sentenceIndex === currentSentenceIndex.value) {
      // 当前句子返回当前字符索引
      return currentCharIndex.value;
    }
    if (sentenceProgress.value[sentenceIndex]?.completed) {
      // 已完成句子返回句子长度
      return (
        courseStore.lessonData?.sentences[sentenceIndex]?.text?.length || 0
      );
    }
    if (sentenceIndex > currentSentenceIndex.value) {
      // 未开始句子返回0
      return 0;
    }
    return 0;
  }

  // 获取当前单词
  function getCurrentWord() {
    if (!currentSentence.value) return null;

    const text = currentSentence.value.text;
    const charIndex = currentCharIndex.value;

    let start, end;

    if (charIndex >= text.length) {
      // 如果已到句子末尾，返回最后一个单词
      // 从末尾向前查找最后一个单词的起始位置
      end = text.length;
      start = end - 1;
      while (start >= 0) {
        const prevChar = text[start];
        if (isSpace(prevChar)) {
          start++;
          break;
        }
        start--;
      }
      if (start < 0) start = 0;
    } else {
      // 向前查找单词起始位置
      start = charIndex;
      while (start > 0) {
        const prevChar = text[start - 1];
        if (isSpace(prevChar)) {
          break;
        }
        start--;
      }

      // 向后查找单词结束位置
      end = charIndex;
      while (end < text.length) {
        const nextChar = text[end];
        if (isSpace(nextChar)) {
          break;
        }
        end++;
      }
    }

    // 提取单词并去除前后非单词字符
    const word = text.substring(start, end).trim();
    if (!word) return null;

    return word.replace(/^[^\w]+|[^\w]+$/g, "") || word;
  }

  return {
    currentSentenceIndex,
    inputText,
    currentCharIndex,
    isCorrect,
    elapsedTime,
    isPlaying,
    showEnglish,
    showChinese,
    mode,
    sentenceProgress,
    isLessonCompleted,
    validationErrors,
    hintedWords,
    currentSentence,
    totalSentences,
    remainingWords,
    totalWords,
    initLearning,
    handleInput,
    handleBackspace,
    addHintedWord,
    isCharHinted,
    nextSentence,
    skipSentence,
    playAudio,
    playCurrentLineAudio,
    stopAudio,
    toggleEnglish,
    toggleChinese,
    toggleMode,
    reset,
    completeLesson,
    validateAllSentences,
    submitLesson,
    getSentenceCharIndex,
    getCurrentWord,
    scrollToCurrentSentence,
  };
});
