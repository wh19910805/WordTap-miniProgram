// 测试人名自动填充逻辑


// 模拟数据
const lessonData = {
  nameList: ['Mr. Blake', 'Miss Sophie', 'Mrs. Dupont'],
  sentences: [
    { text: 'MR. BLAKE: Good morning.' },
    { text: 'MISS SOPHIE: Good morning, Mr. Blake.' },
    { text: 'Good morning, Mrs. Dupont.' }
  ]
};

// 测试正则匹配
function testRegex() {

  const nameList = lessonData.nameList;
  
  lessonData.sentences.forEach((sentence, index) => {
    const sentenceText = sentence.text.trim();

    
    for (const name of nameList) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^${escapedName}`, "i");
      const match = sentenceText.match(regex);
      

      
      if (match) {

        break;
      }
    }
  });
}

testRegex();