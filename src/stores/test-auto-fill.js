// 测试智能人名填充逻辑
const testSentences = [
  "LOUISE:What colour's your new dress?",
  "ANNA:It's green.",
  "ANNA:Come upstairs and see it.",
  "LOUISE:Thank you.",
  "Mrs. Smith's kitchen is small.",
  "Mr. Blake:Hello, how are you?",
  "Miss Sophie:Nice to meet you.",
  "Dr. Wang:This is a test.",
  "Prof. Brown:Please sit down.",
  "Tom:Where are you going?",
  "Jerry:To the park.",
  "Monday is a busy day.",
  "January is cold.",
  "The weather is nice today."
];

// 智能人名填充函数
function testAutoFill(sentence) {
  // 组合正则：匹配多种人名格式
  const nameRegex = /^((Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Prof\.)\s?([A-Z][a-zA-Z]+)(?:'s)?)|([A-Z][a-zA-Z]+):/i;
  const match = sentence.match(nameRegex);
  
  if (match) {
    const matchedText = match[0];
    
    // 检查是否是常见的非人名大写单词
    const commonNonNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
                           'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                           'September', 'October', 'November', 'December', 'The', 'A', 'An'];
    
    if (!commonNonNames.includes(matchedText.replace(':', ''))) {
      return matchedText;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// 运行测试
testSentences.forEach(sentence => {
  testAutoFill(sentence);
});