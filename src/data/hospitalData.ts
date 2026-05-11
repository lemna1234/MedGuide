/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Department {
  id: string;
  name: string;
  alias: string[];
  floor: string;
  building: string;
  description: string;
  symptoms: string[];
}

export interface ServiceLocation {
  id: string;
  name: string;
  floor: string;
  building: string;
  directions: string;
}

export const hospitalDepartments: Department[] = [
  {
    id: "int-med",
    name: "内科",
    alias: ["内科部", "呼吸科", "消化科"],
    floor: "3F",
    building: "门诊楼",
    description: "诊治内脏器官疾病的科室。",
    symptoms: ["感冒", "发烧", "肚子疼", "咳嗽", "胸痛", "血压高"]
  },
  {
    id: "ext-med",
    name: "外科",
    alias: ["外科部", "普通外科"],
    floor: "4F",
    building: "门诊楼",
    description: "主要通过手术或手法治疗疾病的科室。",
    symptoms: ["外伤", "骨折", "肿块", "伤口感染", "皮肤溃疡"]
  },
  {
    id: "ped-med",
    name: "儿科",
    alias: ["小儿科", "儿童诊室"],
    floor: "2F",
    building: "门诊楼",
    description: "专门为14岁以下儿童提供医疗服务的科室。",
    symptoms: ["小儿发烧", "儿童过敏", "小儿腹泻", "接种疫苗"]
  },
  {
    id: "der-med",
    name: "皮肤科",
    alias: ["皮服性病科", "皮肤科室"],
    floor: "5F",
    building: "综合楼",
    description: "诊治皮肤及其附属器官疾病的科室。",
    symptoms: ["起红疹", "皮肤痒", "湿疹", "痘痘", "脱发"]
  },
  {
    id: "oph-med",
    name: "眼科",
    alias: ["视力科", "眼镜科"],
    floor: "4F",
    building: "综合楼",
    description: "专门治疗眼睛和视力问题的科室。",
    symptoms: ["眼睛看不清", "眼睛疼", "眼睛红肿", "近视"]
  }
];

export const commonServiceLocations: ServiceLocation[] = [
  {
    id: "payment",
    name: "缴费处",
    floor: "1F",
    building: "门诊大厅",
    directions: "进入门诊大厅后直行50米，位于扶梯左侧。"
  },
  {
    id: "blood-test",
    name: "验血处/检验科",
    floor: "2F",
    building: "门诊楼",
    directions: "从大厅乘坐2号直梯上2楼，出梯口右转到底即是。"
  },
  {
    id: "pharmacy",
    name: "药房",
    floor: "1F",
    building: "门诊楼",
    directions: "位于门诊收费处对面，紧邻出入口。"
  },
  {
    id: "registration",
    name: "挂号处",
    floor: "1F",
    building: "门诊大厅",
    directions: "大门右手边，自助挂号机旁。"
  }
];
