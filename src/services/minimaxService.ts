/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import OpenAI from "openai";
import { hospitalDepartments, commonServiceLocations } from "../data/hospitalData";
import { searchMedicalKnowledge } from "../data/medicalKnowledge";

// 使用 OpenRouter 代理访问 MiniMax
const client = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": "https://ai.studio", // OpenRouter 要求的可选 Header
    "X-Title": "MedGuide",
  }
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface IntentResult {
  intent: 'DEPARTMENT_GUIDE' | 'ROUTE_GUIDE' | 'MEDICAL_QA' | 'CHITCHAT';
  entities: string[];
}

export class HospitalAgentService {
  // 模型标识：MiniMax-Text-01 (M2.5) 在 OpenRouter 上的 ID
  private static model = "minimax/minimax-01"; 

  private static async identifyIntent(query: string): Promise<IntentResult> {
    const prompt = `你是一个专业的医院导诊台AI。请分析用户的输入，判断其意图和关键实体。
输入: "${query}"

意图分类:
1. DEPARTMENT_GUIDE: 患者描述症状，想知道该去哪个科室。
2. ROUTE_GUIDE: 询问某个地方（如缴费、抽血、厕所、科室名）怎么走。
3. MEDICAL_QA: 纯粹的医疗科普问题，如某种食物能吃吗，某种病怎么治。
4. CHITCHAT: 闲聊或问候。

请以 JSON 格式返回，不要包含 Markdown 代码块，只需返回 JSON 对象。格式: { "intent": "分类名", "entities": ["关键实体1", "实体2"] }`;

    try {
      const response = await client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        // 部分模型不支持 response_format: json_object，改为在 prompt 中强调
      });

      const content = response.choices[0].message.content || '{}';
      // 兼容可能出现的 markdown 代码块
      const cleanJson = content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson) as IntentResult;
    } catch (e) {
      console.error("Intent Identification Error:", e);
      return { intent: 'CHITCHAT', entities: [] };
    }
  }

  public static async processMessage(query: string, history: ChatMessage[] = []): Promise<string> {
    const { intent, entities } = await this.identifyIntent(query);

    let context = "";

    if (intent === 'DEPARTMENT_GUIDE') {
      context = `医院科室信息: ${JSON.stringify(hospitalDepartments)}`;
    } else if (intent === 'ROUTE_GUIDE') {
      context = `医院设施位置: ${JSON.stringify(commonServiceLocations)}. 
      科室位置: ${JSON.stringify(hospitalDepartments.map(d => ({ name: d.name, floor: d.floor, building: d.building })))}`;
    } else if (intent === 'MEDICAL_QA') {
      const relevantQA = await searchMedicalKnowledge(query);
      if (relevantQA.length > 0) {
        context = `相关医疗知识参考: ${relevantQA.map(r => `问: ${r.question} 答: ${r.answer}`).join('\n')}`;
      } else {
        context = "没有找到确切的背景知识。请基于你的专业医学知识回复。";
      }
    }

    const systemPrompt = `你是一个专业的医院导诊机器人"医路通"。你的职责是帮助患者。
1. **导诊**: 根据患者症状建议科室。即使建议了科室，也要提醒患者去分诊台二次确认。
2. **导航**: 根据医院布局说明具体路线（楼层、建筑）。
3. **百科**: 回答医疗科普问题。回答需严谨，末尾必须包含"以上建议仅供科普参考，不作为临床诊断依据，请及时就医"的免责声明。
4. **语言**: 使用礼貌、专业的中文。

当前背景上下文:
${context}`;

    try {
      const response = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user", content: query }
        ]
      });

      return response.choices[0].message.content || "抱歉，回复生成失败。";
    } catch (e) {
      console.error("Chat Process Error:", e);
      return "抱歉，连接服务器失败。请检查 API Key 配置。";
    }
  }
}
