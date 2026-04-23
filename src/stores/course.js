import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "@/db";
import { courseApi, lessonApi, progressApi } from "@/api/client";

export const useCourseStore = defineStore("course", () => {
  const courses = ref([]);
  const myCourses = ref([]);
  const currentCourse = ref(null);
  const currentLesson = ref(null);
  const lessonData = ref(null); // 当前课时的详细数据
  const coursesLoaded = ref(false); // 课程是否已经加载的标志位

  // 加载所有课程列表
  async function loadCourses() {
    // 如果课程已经加载过，不再重复加载
    if (coursesLoaded.value) {

      return;
    }
    try {
      // 1. 优先使用后端API获取最新课程数据
      try {
        const response = await courseApi.getCourses({ limit: 1000 });
        const apiCourses = response;

        // 转换课程数据格式，保持与原有格式兼容
        const formattedCourses = apiCourses.map((course) => {
          // 根据课程类型设置url和其他必要字段
          let url = "";
          let type = course.category;
          let code = course.id.split("_").pop() || "default"; // 使用课程ID的最后一部分作为默认code

          if (course.category === "article" || course.category === "classic") {
            url = `${code}.json`;
            type = "article";
          } else if (course.category === "vocabulary") {
            url = `${code}.json`;
            type = "word";
          } else if (course.category === "scenario") {
            url = `xingrong-courses/data/courses/${code}`;
            type = "xingrong";
          } else {
            // 对于其他未识别的课程类型，使用默认的URL格式
            url = `${code}.json`;
            type = "article"; // 默认类型
            console.warn(
              `未识别的课程类型: ${course.category}，使用默认格式处理`,
            );
          }

          return {
            id: course.id,
            name: course.title,
            title: course.title,
            description: course.description,
            type: type,
            category: course.category,
            level: course.level,
            code: code,
            url: url,
            tags: [], // 后端没有提供tags字段，使用空数组
            image: course.cover_image || "", // 使用cover_image代替image
            previewImage: course.cover_image || "", // 添加previewImage字段，与image字段相同
            duration: 0, // 后端没有提供duration字段，使用默认值
            lessonCount: course.total_lessons, // 使用total_lessons代替lesson_count
          };
        });

        // 更新课程列表
        courses.value = formattedCourses;
        // 设置课程加载完成标志
        coursesLoaded.value = true;

        // 2. 将API获取的课程数据缓存到IndexedDB中
        // 创建一个临时表用于存储缓存的课程
        await db.transaction("rw", db.courseCache, async () => {
          // 清空旧缓存
          await db.courseCache.clear();
          // 添加新缓存
          await Promise.all(
            formattedCourses.map((course) => {
              return db.courseCache.add({
                ...course,
                cachedAt: new Date().toISOString(),
                id: course.id, // 使用课程ID作为缓存键
              });
            }),
          );
        });
      } catch (apiError) {
        // 3. API失败时，尝试从IndexedDB缓存加载
        const cachedCourses = await db.courseCache.toArray();

        if (cachedCourses.length > 0) {
          courses.value = cachedCourses;
          // 设置课程加载完成标志
          coursesLoaded.value = true;
        } else {
          // 4. 缓存也失败时，使用静态文件作为最后降级方案
          // 同时加载 article、word 和 xingrong 类型的课程
          const [articleResponse, wordResponse, xingrongResponse] =
            await Promise.all([
              fetch("/list/article.json").catch(() => null),
              fetch("/list/word.json").catch(() => null),
              fetch("/list/xingrong.json").catch(() => null),
            ]);

          const articleData = articleResponse
            ? await articleResponse.json()
            : [];
          const wordData = wordResponse ? await wordResponse.json() : [];
          const xingrongData = xingrongResponse
            ? await xingrongResponse.json()
            : [];

          // 为 article 类型添加 type 字段
          const articleCourses = articleData.map((c) => ({
            ...c,
            type: "article",
          }));
          // 为 word 类型添加 type 字段
          const wordCourses = wordData.map((c) => ({ ...c, type: "word" }));
          // xingrong 类型已经有 type 字段，直接使用
          const xingrongCourses = xingrongData.map((c) => ({
            ...c,
            type: c.type || "xingrong",
          }));

          // 合并所有课程
          courses.value = [
            ...articleCourses,
            ...wordCourses,
            ...xingrongCourses,
          ];
          // 设置课程加载完成标志
          coursesLoaded.value = true;
        }
      }

      // 加载已加入的课程（使用后端API）
      try {
        const myCoursesData = await courseApi.getMyCourses();
        myCourses.value = myCoursesData.map((userCourse) => {
          // 直接使用后端返回的课程数据，确保结构一致
          return {
            id: userCourse.course.id,
            name: userCourse.course.title,
            title: userCourse.course.title,
            description: userCourse.course.description,
            type:
              userCourse.course.category === "classic"
                ? "article"
                : userCourse.course.category,
            category: userCourse.course.category,
            level: userCourse.course.level,
            code: userCourse.course.id.split("_").pop() || "default",
            url: `${userCourse.course.id.split("_").pop() || "default"}.json`,
            tags: userCourse.tags ? JSON.parse(userCourse.tags) : [],
            image: userCourse.course.cover_image || "",
            duration: 0,
            lessonCount: userCourse.course.total_lessons,
            addedAt: userCourse.added_at,
          };
        });
      } catch (error) {
        console.error("加载我的课程失败:", error);
        // 出错时使用空数组
        myCourses.value = [];
      }
    } catch (error) {
      console.error("[course.js] 加载课程列表失败:", error);
      console.error("[course.js] 错误详情:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
  }

  // 加入课程
  async function addCourse(courseId) {
    try {
      // 如果课程列表未加载，先加载
      if (courses.value.length === 0) {
        await loadCourses();
      }

      const course = courses.value.find((c) => c.id === courseId);
      if (!course) {
        console.error("找不到课程:", courseId);
        return false;
      }

      // 检查是否已存在
      const exists = myCourses.value.some((c) => c.id === courseId);
      if (exists) {
        return true;
      }

      // 使用后端API添加课程到我的课程
      await courseApi.addToMyCourses(courseId);

      // 重新加载课程列表，更新myCourses
      coursesLoaded.value = false; // 重置加载标志，确保重新加载数据
      await loadCourses();
      return true;
    } catch (error) {
      console.error("加入课程失败:", error);
      return false;
    }
  }

  // 移除课程
  async function removeCourse(courseId) {
    if (!courseId) {
      console.error("课程ID不能为空");
      return false;
    }
    try {
      // 使用后端API从我的课程中移除课程
      await courseApi.removeFromMyCourses(courseId);

      // 重新加载课程列表
      coursesLoaded.value = false; // 重置加载标志，确保重新加载数据
      await loadCourses();
      return true;
    } catch (error) {
      console.error("移除课程失败:", error);
      return false;
    }
  }

  // 加载课程课时列表（不加载详细内容，仅用于列表展示）
  async function loadCourseLessonsList(courseId) {
    try {
      // 如果课程列表未加载，先加载
      if (courses.value.length === 0) {
        await loadCourses();
      }

      const course = courses.value.find((c) => c.id === courseId);
      if (!course) {
        console.error("找不到课程:", courseId);
        return null;
      }

      const courseType = course.type || "article";
      let lessons = [];

      if (courseType === "xingrong") {
        // xingrong 类型：生成55个课时列表，不加载详细内容
        lessons = Array.from({ length: 55 }, (_, i) => {
          const lessonNum = (i + 1).toString().padStart(2, "0");
          return {
            id: `xingrong-lesson-${lessonNum}`,
            title: `第 ${i + 1} 课`,
            lessonNum: i + 1,
          };
        });
      } else {
        // 优先使用后端API获取课时列表
        try {
          const lessonsData = await courseApi.getCourseLessons(courseId);
          lessons = lessonsData.map((lesson) => ({
            id: lesson.id,
            title: lesson.title || `Lesson ${lesson.lesson_number}`,
          }));
        } catch (apiError) {
          // API调用失败，尝试使用静态文件加载（保持向后兼容）
          try {
            let basePath = "/dicts/en/article";
            if (courseType === "word") {
              basePath = "/dicts/en/word";
            }

            if (!course.url) {
              console.error(`课程ID ${courseId} 的URL为空，无法加载课时列表`);
              lessons = [];
              return;
            }

            const response = await fetch(`${basePath}/${course.url}`);

            if (
              !response.ok ||
              !response.headers
                .get("content-type")
                ?.includes("application/json")
            ) {
              lessons = [];
              return;
            }

            const data = await response.json();

            if (courseType === "word") {
              lessons = data.map((word, index) => ({
                id: `word-${word.id || index}`,
                title: word.word,
              }));
            } else {
              lessons = data.map((lesson) => ({
                id: lesson.id,
                title:
                  lesson.title || lesson.name || `Lesson ${lesson.order || 0}`,
              }));
            }
          } catch (fileError) {
            console.error(`加载课程课时列表失败: ${fileError.message}`);
            lessons = [];
          }
        }
      }

      // 加载学习进度
      const progress = await db.lessons
        .where("courseId")
        .equals(courseId)
        .toArray();

      const lessonsWithProgress = lessons.map((lesson, index) => {
        const prog = progress.find((p) => p.id === lesson.id);
        return {
          ...lesson,
          order: index + 1,
          completed: !!prog?.completedAt,
          bestTime: prog?.bestTime || null,
          attemptCount: prog?.attemptCount || 0,
          lastStudyTime: prog?.lastStudyTime || null,
        };
      });

      currentCourse.value = {
        ...course,
        lessons: lessonsWithProgress,
        // 确保返回的课程对象包含 previewImage 字段
        previewImage: course.previewImage || course.image || "",
      };

      return currentCourse.value;
    } catch (error) {
      console.error("加载课程课时列表失败:", error);
      return null;
    }
  }

  // 加载课程详情（保留原函数，用于需要完整数据的场景）
  async function loadCourseDetail(courseId) {
    try {
      // 如果课程列表未加载，先加载
      if (courses.value.length === 0) {
        await loadCourses();
      }

      const course = courses.value.find((c) => c.id === courseId);
      if (!course) {
        console.error("找不到课程:", courseId);
        return null;
      }

      const courseType = course.type || "article";
      let basePath = "/dicts/en/article";
      if (courseType === "word") {
        basePath = "/dicts/en/word";
      } else if (courseType === "xingrong") {
        basePath = "/dicts/en";
      }

      // 检查course.url是否为空
      if (!course.url) {
        console.error(`课程ID ${courseId} 的URL为空，无法加载课程详情`);
        return null;
      }

      let lessons = [];
      if (courseType === "xingrong") {
        // xingrong 类型：加载所有55个课时文件
        // 使用分批加载，避免并发请求过多导致连接关闭
        const batchSize = 5; // 每批加载5个文件，减少并发压力
        const lessonResults = [];

        // 真正分批执行，而不是先创建所有 Promise
        for (let batchStart = 1; batchStart <= 55; batchStart += batchSize) {
          const batchEnd = Math.min(batchStart + batchSize - 1, 55);
          const batchPromises = [];

          for (let i = batchStart; i <= batchEnd; i++) {
            const lessonNum = i.toString().padStart(2, "0");
            const lessonUrl = `${basePath}/${course.url}/${lessonNum}.json`;

            // 创建加载函数并立即执行（在当前批次内）
            const loadLesson = async () => {
              try {
                const res = await fetch(lessonUrl);
                if (!res.ok) {
                  console.warn(
                    `课时 ${lessonNum} 文件不存在或加载失败 (${res.status})`,
                  );
                  return null;
                }
                const data = await res.json();
                return {
                  id: `xingrong-lesson-${lessonNum}`,
                  title: `第 ${i} 课`,
                  text: data.map((item) => item.english).join("\n"),
                  textTranslate: data.map((item) => item.chinese).join("\n"),
                  nameList: [],
                  lessonNum: i,
                };
              } catch (error) {
                console.error(`加载课时 ${lessonNum} 失败:`, error);
                return null;
              }
            };

            batchPromises.push(loadLesson());
          }

          // 等待当前批次完成
          try {
            const batchResults = await Promise.all(batchPromises);
            lessonResults.push(...batchResults);

            // 批次之间稍作延迟，避免服务器压力过大
            if (batchEnd < 55) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(
              `加载第 ${batchStart}-${batchEnd} 批课时失败:`,
              error,
            );
          }
        }

        lessons = lessonResults.filter((lesson) => lesson !== null);

        // 如果加载的课时数量少于预期，输出警告
        if (lessons.length < 55) {
          console.warn(
            `星荣课程加载不完整：预期55个课时，实际加载${lessons.length}个`,
          );
        }
      } else {
        // 加载课程数据
        try {
          const response = await fetch(`${basePath}/${course.url}`);

          // 检查响应是否为JSON格式
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.warn(
              `课程文件不存在或格式错误，将显示空课时列表: ${basePath}/${course.url}`,
            );
            // 文件不存在或非JSON响应，返回空课时列表
            lessons = [];
          } else if (!response.ok) {
            console.error(
              `课程文件加载失败: ${basePath}/${course.url} (状态码: ${response.status})`,
            );
            // 文件加载失败，返回空课时列表
            lessons = [];
          } else {
            const data = await response.json();

            if (courseType === "word") {
              // word 类型：将单词数组转换为课时数组
              // 每个单词作为一个课时，使用第一个例句作为文本
              lessons = data.map((word, index) => {
                const firstSentence =
                  word.sentences && word.sentences.length > 0
                    ? word.sentences[0]
                    : { c: word.word, cn: word.trans?.[0]?.cn || "" };
                return {
                  id: `word-${word.id || index}`,
                  title: word.word,
                  text: firstSentence.c || word.word,
                  textTranslate: firstSentence.cn || word.trans?.[0]?.cn || "",
                  nameList: [], // word 类型暂时没有人名列表
                };
              });
            } else {
              // article 类型：直接使用数据
              lessons = data;
            }
          }
        } catch (fileError) {
          console.error(`加载课程文件失败: ${fileError.message}`);
          // 文件加载失败时，至少返回空的课时列表，避免后续错误
          lessons = [];
        }
      }

      // 加载学习进度
      const progress = await db.lessons
        .where("courseId")
        .equals(courseId)
        .toArray();

      const lessonsWithProgress = lessons.map((lesson, index) => {
        const prog = progress.find((p) => p.id === lesson.id);
        return {
          ...lesson,
          order: index + 1,
          completed: !!prog?.completedAt,
          bestTime: prog?.bestTime || null,
          attemptCount: prog?.attemptCount || 0,
          lastStudyTime: prog?.lastStudyTime || null,
        };
      });

      currentCourse.value = {
        ...course,
        lessons: lessonsWithProgress,
        // 确保返回的课程对象包含 previewImage 字段
        previewImage: course.previewImage || course.image || "",
      };

      return currentCourse.value;
    } catch (error) {
      console.error("加载课程详情失败:", error);
      return null;
    }
  }

  // 加载课时数据
  async function loadLessonData(courseId, lessonId) {
    try {
      const course = courses.value.find((c) => c.id === courseId);
      if (!course) return null;

      const courseType = course.type || "article";
      let lesson = null;
      let lessonProgress = null;

      // 只使用后端API获取课时详情，不再使用本地文件
      try {
        // 并行获取课时详情和学习进度
        const [lessonDetail, progressData] = await Promise.all([
          lessonApi.getLessonDetail(lessonId),
          progressApi.getCourseProgress(courseId).catch((error) => {

            return [];
          }),
        ]);

        // 查找当前课时的进度
        lessonProgress = progressData.find((p) => p.lesson_id === lessonId);



        // 处理lessonDetail对象，确保它包含正确的数据结构
        if (!lessonDetail) {
          console.error("课时详情数据为空:", lessonDetail);
          lesson = createBaseLessonObject(
            lessonId,
            "课时详情获取失败",
            courseId,
            lessonProgress,
          );
        } else {
          // 检查lessonDetail.content是否存在
          if (!lessonDetail.content) {
            console.error("课时详情content字段不存在:", lessonDetail);
            lesson = createBaseLessonObject(
              lessonId,
              lessonDetail.title || "未命名课时",
              courseId,
              lessonProgress,
            );
          } else {
            // 检查不同的数据结构
            let sentences = [];
            let text = "";
            let translate = "";
            let title = lessonDetail.title || "未命名课时";
            let nameList = [];

            // 处理不同类型的content数据结构
            if (typeof lessonDetail.content === "string") {
              // 如果content是字符串，直接作为text

              text = lessonDetail.content;
              sentences = splitIntoSentences(text, translate);
            } else if (Array.isArray(lessonDetail.content.lines)) {
              // 后端返回的标准数据结构：content包含lines数组

              text = lessonDetail.content.lines.join("\n");
              // 检查是否有中文翻译字段
              if (lessonDetail.content.lineTranslates) {
                translate = lessonDetail.content.lineTranslates.join("\n");
              } else if (lessonDetail.content.translate) {
                translate = lessonDetail.content.translate;
              } else if (lessonDetail.content.textTranslate) {
                translate = lessonDetail.content.textTranslate;
              } else {
                // 如果没有中文翻译字段，使用空字符串
                translate = "";
              }
              sentences = splitIntoSentences(text, translate);
            } else if (Array.isArray(lessonDetail.content.sentences)) {
              // content包含sentences数组

              sentences = lessonDetail.content.sentences.map(
                (sentence, index) => ({
                  id: `sentence-${index}`,
                  text: sentence.text || sentence.english || "",
                  translate: sentence.translate || sentence.chinese || "",
                  soundmark: sentence.soundmark || "",
                  words: (sentence.text || sentence.english || "")
                    .split(/\s+/)
                    .filter((w) => w),
                  audioSrc: sentence.audioSrc || null,
                  audioTime: sentence.audioTime || null,
                  lineIndex: index,
                }),
              );
              text = sentences.map((s) => s.text).join("\n");
              translate = sentences.map((s) => s.translate).join("\n");
            } else if (Array.isArray(lessonDetail.content.words)) {
              // content包含words数组

              sentences = lessonDetail.content.words.map((word, index) => ({
                id: `sentence-${index}`,
                text: word.text || word.word || "",
                translate: word.translate || word.chinese || "",
                soundmark: word.soundmark || "",
                words: (word.text || word.word || "")
                  .split(/\s+/)
                  .filter((w) => w),
                audioSrc: null,
                audioTime: null,
                lineIndex: index,
              }));
              text = sentences.map((s) => s.text).join("\n");
              translate = sentences.map((s) => s.translate).join("\n");
            } else if (typeof lessonDetail.content.text === "string") {
              // content包含text字段

              text = lessonDetail.content.text || "";
              translate = lessonDetail.content.textTranslate || "";
              sentences = splitIntoSentences(
                text,
                translate,
                lessonDetail.content.lrcPosition || [],
                lessonDetail.content.audioSrc || null,
              );
              nameList = lessonDetail.content.nameList || [];
            } else if (Array.isArray(lessonDetail.content)) {
              // content本身是数组

              sentences = lessonDetail.content.map((item, index) => ({
                id: `sentence-${index}`,
                text:
                  item.text ||
                  item.english ||
                  item.word ||
                  JSON.stringify(item),
                translate: item.translate || item.chinese || "",
                soundmark: item.soundmark || "",
                words: (item.text || item.english || item.word || "")
                  .split(/\s+/)
                  .filter((w) => w),
                audioSrc: item.audioSrc || null,
                audioTime: item.audioTime || null,
                lineIndex: index,
              }));
              text = sentences.map((s) => s.text).join("\n");
              translate = sentences.map((s) => s.translate).join("\n");
            } else {
              // 处理未知的数据结构
              console.warn(
                `检测到未知数据结构，将创建基本内容`,
                lessonDetail.content,
              );
              let contentText = "";
              if (lessonDetail.content) {
                try {
                  contentText = JSON.stringify(lessonDetail.content);
                } catch (e) {
                  contentText = String(lessonDetail.content);
                }
              }
              sentences = [
                {
                  id: "sentence-0",
                  text: contentText,
                  translate: "",
                  words: contentText.split(/\s+/).filter((w) => w),
                  audioSrc: null,
                  audioTime: null,
                  lineIndex: 0,
                },
              ];
              text = sentences[0].text;
              translate = "";
            }

            // 确保sentences数组不为空
            if (sentences.length === 0) {
              sentences = [
                {
                  id: "sentence-0",
                  text: "暂无内容",
                  translate: "",
                  words: ["暂无内容"],
                  audioSrc: null,
                  audioTime: null,
                  lineIndex: 0,
                },
              ];
              text = sentences[0].text;
              translate = "";
            }

            // 创建lesson对象
            lesson = {
              id: lessonDetail.id || lessonId,
              title: title,
              text: text,
              textTranslate: translate,
              sentences: sentences,
              nameList: nameList,
              progress: {
                current_line: lessonProgress?.current_line || 0,
              },
            };
          }
        }


      } catch (apiError) {
        console.error(`从后端API获取课时详情失败: ${apiError.message}`);
        // API调用失败，创建一个基本的lesson对象
        lesson = createBaseLessonObject(
          lessonId,
          "API请求失败",
          courseId,
          lessonProgress,
        );
      }

      // 确保lesson对象存在
      if (!lesson) {
        console.error("课时数据处理失败，创建默认课时对象");
        lesson = createBaseLessonObject(
          lessonId,
          "数据处理失败",
          courseId,
          lessonProgress,
        );
      }

      currentLesson.value = {
        ...lesson,
        courseId,
      };

      lessonData.value = currentLesson.value;
      return currentLesson.value;
    } catch (error) {
      console.error("加载课时数据失败:", error);
      // 返回一个基本的lesson对象，避免返回null
      return createBaseLessonObject(lessonId, "加载失败", error.courseId, null);
    }
  }

  // 创建基本的lesson对象
  function createBaseLessonObject(lessonId, title, courseId, lessonProgress) {
    return {
      id: lessonId,
      title: title,
      text: "",
      textTranslate: "",
      sentences: [
        {
          id: "sentence-0",
          text: "暂无内容",
          translate: "",
          words: ["暂无内容"],
          audioSrc: null,
          audioTime: null,
          lineIndex: 0,
        },
      ],
      nameList: [],
      courseId,
      progress: {
        current_line: lessonProgress?.current_line || 0,
      },
    };
  }

  // 将文本分割成句子
  function splitIntoSentences(
    text,
    translate,
    lrcPosition = [],
    audioSrc = null,
  ) {
    if (!text) return [];

    // 按换行符分割，过滤空行
    const textLines = text.split("\n").filter((line) => line.trim());
    const translateLines = translate
      ? translate.split("\n").filter((line) => line.trim())
      : [];

    return textLines.map((line, index) => {
      const cleanText = line.trim();
      // 获取该行对应的音频时间位置（如果有）
      const audioTime =
        lrcPosition && lrcPosition[index] ? lrcPosition[index] : null;

      return {
        id: `sentence-${index}`,
        text: cleanText,
        translate: translateLines[index]?.trim() || "",
        words: cleanText.split(/\s+/).filter((w) => w),
        audioSrc: audioSrc, // 整个课时的音频
        audioTime: audioTime, // 该行的音频时间 [start, end]
        lineIndex: index, // 行索引
      };
    });
  }

  // 更新课时进度
  async function updateLessonProgress(
    lessonId,
    courseId,
    bestTime,
    completed,
    currentLine = 0,
    studyTime = 0,
  ) {
    try {
      // 1. 更新本地数据库
      const existing = await db.lessons.get(lessonId);
      const now = new Date().toISOString();

      if (existing) {
        const wasCompleted = !!existing.completedAt;
        await db.lessons.update(lessonId, {
          bestTime:
            bestTime && (!existing.bestTime || bestTime < existing.bestTime)
              ? bestTime
              : existing.bestTime,
          attemptCount: (existing.attemptCount || 0) + 1,
          completedAt: completed ? now : existing.completedAt,
          lastStudyTime: now,
        });

        // 如果从未完成变为完成，更新完成课程数
        if (completed && !wasCompleted) {
          const { useUserStore } = await import("./user");
          const userStore = useUserStore();
          const completedLessons = (userStore.completedLessons || 0) + 1;
          userStore.completedLessons = completedLessons;

          // 只存储可序列化的原始值
          await db.userStats.put({
            id: "main",
            completedLessons: completedLessons,
            streak: userStore.streak || 0,
            totalCheckIn: userStore.totalCheckIn || 0,
            wordCount: userStore.wordCount || 0,
            studyTime: userStore.studyTime
              ? { ...userStore.studyTime }
              : { today: 0, week: 0, month: 0, year: 0, total: 0 },
            lastStudyDate: userStore.lastStudyDate || null,
          });
        }
      } else {
        await db.lessons.add({
          id: lessonId,
          courseId,
          completedAt: completed ? now : null,
          bestTime,
          attemptCount: 1,
          lastStudyTime: now,
        });

        // 如果完成，更新完成课程数
        if (completed) {
          const { useUserStore } = await import("./user");
          const userStore = useUserStore();
          const completedLessons = (userStore.completedLessons || 0) + 1;
          userStore.completedLessons = completedLessons;

          // 只存储可序列化的原始值
          await db.userStats.put({
            id: "main",
            completedLessons: completedLessons,
            streak: userStore.streak || 0,
            totalCheckIn: userStore.totalCheckIn || 0,
            wordCount: userStore.wordCount || 0,
            studyTime: userStore.studyTime
              ? { ...userStore.studyTime }
              : { today: 0, week: 0, month: 0, year: 0, total: 0 },
            lastStudyDate: userStore.lastStudyDate || null,
          });
        }
      }

      // 2. 更新后端API
      try {
        await progressApi.updateProgress({
          course_id: courseId,
          lesson_id: lessonId,
          // 无论是否完成，提交后都将current_line重置为0，这样重新进入课时时从第一行开始
          current_line: 0,
          study_time: studyTime,
          is_completed: completed,
        });

      } catch (apiError) {
        console.error("更新学习进度到后端失败:", apiError);
      }
    } catch (error) {
      console.error("更新课时进度失败:", error);
    }
  }

  // 获取上次学习的课程和课时
  async function getLastStudy() {
    try {
      // 获取所有课时，过滤有 lastStudyTime 的记录，按时间倒序排列，取第一个
      const allLessons = await db.lessons.toArray();
      const lastLesson = allLessons
        .filter((lesson) => lesson.lastStudyTime != null)
        .sort((a, b) => (b.lastStudyTime || 0) - (a.lastStudyTime || 0))[0];

      if (!lastLesson) return null;

      const course = await db.courses.get(lastLesson.courseId);
      if (!course) return null;

      return {
        courseId: lastLesson.courseId,
        lessonId: lastLesson.id,
        courseName: course.name,
      };
    } catch (error) {
      console.error("获取上次学习记录失败:", error);
      return null;
    }
  }

  return {
    courses,
    myCourses,
    currentCourse,
    currentLesson,
    lessonData,
    loadCourses,
    addCourse,
    removeCourse,
    loadCourseLessonsList,
    loadCourseDetail,
    loadLessonData,
    updateLessonProgress,
    getLastStudy,
  };
});
