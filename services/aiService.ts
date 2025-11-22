import { GoogleGenAI } from "@google/genai";
import { Course, Record, Student } from "../types";

const getAIClient = () => {
  // In a real deployed app, this would be proxied or user-provided if strictly client-side.
  // Per instructions, using process.env.API_KEY
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeEducationData = async (
  students: Student[],
  courses: Course[],
  records: Record[]
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "API Key 未配置。请使用有效的 Google Gemini API Key 部署。";

  // Prepare data summary for the prompt
  const summary = students.map(s => {
    const sCourses = courses.filter(c => c.studentId === s.id);
    const sRecords = records.filter(r => r.studentId === s.id);
    
    return `
      学生: ${s.name} (年龄: ${s.age})
      课程:
      ${sCourses.map(c => `- ${c.name} (机构: ${c.institution}). 类型: ${c.paymentType}. 剩余: ${c.balanceClasses} 课时 / 余额 ${c.balanceMoney}元. 单价: ${c.costPerClass}元/节`).join('\n')}
      
      最近记录 (最近5条):
      ${sRecords.slice(0, 5).map(r => `- ${r.date}: ${r.type} (变动: ${r.classCount} 课时, 金额: ${r.amount}元)`).join('\n')}
    `;
  }).join('\n\n');

  const prompt = `
    你是一位专业的教育顾问和家庭理财规划师。
    请分析以下家庭课外兴趣班的数据。
    
    数据:
    ${summary}

    请提供一份 Markdown 格式的分析报告，包含以下内容（请用中文回答）：
    1. **支出分析**: 他们的教育投入是否合理？是否存在潜在的浪费（例如未使用的预付费余额）？
    2. **进度评估**: 根据最近的活动频率，孩子的上课出勤是否规律？
    3. **优化建议**: 给家长提供 1 条具体的建议，以优化预算或孩子的学习安排。
    
    语气要鼓励、专业且简洁。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "未生成分析结果。";
  } catch (error) {
    console.error("AI Error:", error);
    return "抱歉，暂时无法生成分析报告。请检查网络连接或 API Key 设置。";
  }
};