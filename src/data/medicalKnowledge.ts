/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HuatuoEntry {
  questions: string[];
  answers: string[];
}

let cachedData: HuatuoEntry[] | null = null;

/**
 * 华佗百科 (huatuo_encyclopedia_qa) 数据集对接
 * 更改为异步加载模式，避免 Vite 在构建时因文件过大导致 "Invalid string length" 错误。
 * 建议将 datasets.json 放置在 public/ 目录下。
 */
export const preloadMedicalKnowledge = async (): Promise<void> => {
  if (cachedData) return;
  try {
    // 尝试从静态目录获取
    const response = await fetch('/datasets.json');
    if (!response.ok) throw new Error('Data not found');
    cachedData = await response.json();
  } catch (e) {
    console.error("加载医疗数据库失败，请确保 datasets.json 已放置在 public/ 目录中:", e);
    cachedData = [];
  }
};

/**
 * 简单的检索服务（非向量数据库 RAG）
 */
export const searchMedicalKnowledge = async (query: string): Promise<{ question: string; answer: string }[]> => {
  if (!cachedData) {
    await preloadMedicalKnowledge();
  }
  
  const data = cachedData || [];
  const normalizedQuery = query.toLowerCase();
  const keywords = normalizedQuery.split(/[\s,，。？?！!]+/).filter(k => k.length > 1);

  const results: { question: string; answer: string; score: number }[] = [];

  data.forEach(entry => {
    let maxMatchScore = 0;
    let bestQuestion = entry.questions[0];

    entry.questions.forEach(q => {
      const qLower = q.toLowerCase();
      let currentScore = 0;

      if (normalizedQuery.includes(qLower) || qLower.includes(normalizedQuery)) {
        currentScore += 10;
      }

      keywords.forEach(word => {
        if (qLower.includes(word)) {
          currentScore += 2;
        }
      });

      if (currentScore > maxMatchScore) {
        maxMatchScore = currentScore;
        bestQuestion = q;
      }
    });

    if (maxMatchScore > 0) {
      results.push({
        question: bestQuestion,
        answer: entry.answers[0],
        score: maxMatchScore
      });
    }
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ question, answer }) => ({ question, answer }));
};
