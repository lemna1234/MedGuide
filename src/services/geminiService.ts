/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { hospitalDepartments, commonServiceLocations } from "../data/hospitalData";
import { searchMedicalKnowledge } from "../data/medicalKnowledge";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * 意图识别结果
 */
interface IntentResult {
  intent: 'DEPARTMENT_GUIDE' | 'ROUTE_GUIDE' | 'MEDICAL_QA' | 'CHITCHAT';
  entities: string[];
}

/**
 * 核心 AI 导诊服务
 */
export class HospitalAgentService {
  private static model = "gemini-3-flash-preview";

  /**
   * 识别用户意图
   */
  private static async identifyIntent(query: string): Promise<IntentResult> {
    const prompt = `你是一个专业的医院导诊台AI。请分析用户的输入，判断其意图和关键实体。
输入: "${query}"

意图分类:
1. DEPARTMENT_GUIDE: 患者描述症状，想知道该去哪个科室。
2. ROUTE_GUIDE: 询问某个地方（如缴费、抽血、厕所、科室名）怎么走。
3. MEDICAL_QA: 纯粹的医疗科普问题，如某种食物能吃吗，某种病怎么治。
4. CHITCHAT: 闲聊或问候。

请以 JSON 格式返回: { "intent": "分类名", "entities": ["关键实体1", "实体2"] }`;

    try {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              entities: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["intent", "entities"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result as IntentResult;
    } catch (e) {
      console.error("Intent Error:", e);
      return { intent: 'CHITCHAT', entities: [] };
    }
  }

  /**
   * 处理导诊/导航/问答
   */
  public static async processMessage(query: string, history: ChatMessage[] = []): Promise<string> {
    const { intent, entities } = await this.identifyIntent(query);

    let context = "";

    if (intent === 'DEPARTMENT_GUIDE') {
      // 提供科室数据作为上下文
      context = `医院科室信息: ${JSON.stringify(hospitalDepartments)}`;
    } else if (intent === 'ROUTE_GUIDE') {
      // 提供地点数据作为上下文
      context = `医院设施位置: ${JSON.stringify(commonServiceLocations)}. 
      科室位置: ${JSON.stringify(hospitalDepartments.map(d => ({ name: d.name, floor: d.floor, building: d.building })))}`;
    } else if (intent === 'MEDICAL_QA') {
      // 模拟 RAG: 从华佗 QA 数据集中检索相关片段
      const relevantQA = await searchMedicalKnowledge(query);
      if (relevantQA.length > 0) {
        context = `相关医疗知识参考: ${relevantQA.map(r => `问: ${r.question} 答: ${r.answer}`).join('\n')}`;
      } else {
        context = "没有找到确切的背景知识。请基于你的专业医学知识，并明确告知仅供参考。";
      }
    }

    const systemPrompt = `你是一个专业的医院导诊机器人"医路通"。你的职责是帮助患者。
1. **导诊**: 根据患者症状建议科室。即使建议了科室，也要提醒患者去分诊台二次确认。
2. **导航**: 根据医院布局说明具体路线（楼层、建筑）。
3. **百科**: 回答医疗科普问题。回答需严谨，末尾必须包含"以上建议仅供科普参考，不作为临床诊断依据，请及时就医"的免责声明。
4. **语言**: 使用礼貌、专业的中文。

当前背景上下文:
${context}

用户当前输入: "${query}"`;

    try {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] }
        ]
      });

      return response.text || "抱歉，我现在遇到一点小故障。";
    } catch (e) {
      console.error("Process Message Error:", e);
      return "抱歉，服务器暂时无法响应您的咨询。";
    }
  }
}
