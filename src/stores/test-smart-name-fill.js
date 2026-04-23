import { defineStore } from "pinia";
import { ref } from "vue";

// 测试智能人名填充功能
export const testSmartNameFill = () => {
  // 模拟settingsStore
  const settingsStore = {
    defaultShowName: true,
  };

  // 测试用例：各种格式的人名
  const testSentences = [
    "Mr. Smith is a teacher.",
    "Mrs. Brown's cat is cute.",
    "Miss Sophie loves reading.",
    "Ms. Johnson works here.",
    "Dr. Wang is a scientist.",
    "Prof. Lee teaches physics.",
    "LOUISE: Hello, how are you?",
    "Anna:What's your name?",
    "JACK: I'm fine, thanks.",
    "Tom likes playing football.",
    "Monday is the first day of the week.", // 非人名：星期
    "January is cold.", // 非人名：月份
    "The cat is black.", // 非人名：定冠词
    "A dog barks.", // 非人名：不定冠词
    "An apple a day keeps the doctor away.", // 非人名：不定冠词
    "Mr.Smith is from UK.", // 称呼+名字（无空格）
    "Mrs.Brown's house is big.", // 称呼+名字+所有格（无空格）
  ];

  // 模拟lessonData
  const lessonData = {
    sentences: testSentences.map((text) => ({
      text,
      words: text.split(" "),
    })),
  };

  // 智能人名匹配函数（直接从learning.js复制）
  const testAutoFillNames = (lessonData) => {


    // 遍历所有句子，自动填充句首的人名
    lessonData.sentences.forEach((sentence, sentenceIndex) => {
      const sentenceText = sentence.text.trim();
      if (!sentenceText) return;

      let filledText = "";
      let charIndex = 0;
      let matchFound = false;

      // 智能人名匹配：不依赖预设列表，基于规则识别
      // 组合正则：匹配多种格式的人名
      const nameRegex =
        /^((Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Prof\.)\s?([A-Z][a-zA-Z]+)(?:'s)?)|([A-Z][a-zA-Z]+):/i;
      const match = sentenceText.match(nameRegex);

      if (match) {
        matchFound = true;
        const matchedText = match[0];
        filledText = matchedText;
        charIndex = matchedText.length;
      }

      // 如果没有匹配到，尝试匹配更简单的格式：大写单词开头（可能是人名）
      if (!matchFound) {
        const simpleNameRegex = /^([A-Z][a-zA-Z]+)/;
        const simpleMatch = sentenceText.match(simpleNameRegex);

        if (simpleMatch) {
          // 检查是否是常见的非人名大写单词（如星期、月份等）
          const commonNonNames = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
            "The",
            "A",
            "An",
          ];

          const matchedWord = simpleMatch[0];
          // 排除常见非人名单词，且长度至少为2个字符
          if (
            !commonNonNames.includes(matchedWord) &&
            matchedWord.length >= 2
          ) {
            matchFound = true;
            filledText = matchedWord;
            charIndex = matchedWord.length;
          }
        }
      }

      // 输出测试结果
      if (matchFound) {

      } else {

      }
    });


  };

  // 执行测试
  testAutoFillNames(lessonData);
};

// 运行测试
testSmartNameFill();
