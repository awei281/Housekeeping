import { Injectable, NotFoundException } from "@nestjs/common";

interface ContentHero {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

interface ContentSection {
  title: string;
  body: string;
}

export interface PublicContentPage {
  pageKey: string;
  title: string;
  lead: string;
  hero?: ContentHero;
  sections: ContentSection[];
}

const PUBLIC_PAGES: Record<string, PublicContentPage> = {
  home: {
    pageKey: "home",
    title: "让家庭运转更轻松",
    lead: "月嫂、保洁、标准化服务流程，一站式预约与顾问跟进。",
    hero: {
      title: "专业家政服务，让家庭更省心",
      subtitle:
        "从咨询、匹配到上门服务，全链路透明，让家庭服务不再靠碰运气。",
      ctaLabel: "立即预约",
      ctaHref: "/contact",
    },
    sections: [
      {
        title: "标准化服务流程",
        body: "需求确认、人员匹配、服务执行、售后回访四步闭环，减少沟通损耗。",
      },
      {
        title: "覆盖核心服务场景",
        body: "围绕月嫂、保洁、家庭照护等高频需求，先把首期 MVP 能落地的服务讲清楚。",
      },
      {
        title: "后台线索统一沉淀",
        body: "官网提交的咨询和预约会进入后台线索池，方便后续跟进和转订单。",
      },
    ],
  },
  about: {
    pageKey: "about",
    title: "公司介绍",
    lead: "先把可信度讲清楚，比堆功能更重要。",
    sections: [
      {
        title: "服务目标",
        body: "用可复用的服务标准和后台流程，帮助家政团队稳定获客、接单和交付。",
      },
      {
        title: "首期聚焦",
        body: "官网展示、在线留资、后台跟进和订单流转，是当前阶段最优先的业务闭环。",
      },
    ],
  },
  services: {
    pageKey: "services",
    title: "服务项目",
    lead: "把用户最关心的服务范围、交付方式和预约入口放在同一页。",
    sections: [
      {
        title: "月嫂服务",
        body: "覆盖产后照护、新生儿照护、作息协助等场景，强调流程透明与阶段陪伴。",
      },
      {
        title: "保洁服务",
        body: "围绕日常保洁、深度清洁和重点区域整理，先把服务边界说明白。",
      },
      {
        title: "家庭顾问支持",
        body: "用户提交需求后由顾问跟进，减少信息丢失和口径不一致的问题。",
      },
    ],
  },
  standards: {
    pageKey: "standards",
    title: "服务标准",
    lead: "标准不是文案装饰，它决定了服务能不能复制。",
    sections: [
      {
        title: "人员标准",
        body: "关注岗位要求、基础培训、证照与服务纪律，让匹配结果更可解释。",
      },
      {
        title: "执行标准",
        body: "把预约确认、上门、交接、反馈的过程拆清楚，后面才好接 CMS 和后台管理。",
      },
      {
        title: "售后标准",
        body: "服务结束后保留回访和问题记录入口，为后续售后流程预留空间。",
      },
    ],
  },
  contact: {
    pageKey: "contact",
    title: "联系我们",
    lead: "页面先承担留资入口和基础联系方式，预约表单在下一任务打通。",
    sections: [
      {
        title: "顾问咨询",
        body: "工作日 09:00-18:00 提供预约咨询与服务说明。",
      },
      {
        title: "预约准备",
        body: "建议提前准备服务类型、期望时间和联系号码，方便后续顾问快速跟进。",
      },
    ],
  },
};

@Injectable()
export class ContentService {
  findPageByKey(pageKey: string) {
    const page = PUBLIC_PAGES[pageKey];

    if (!page) {
      throw new NotFoundException(`Page "${pageKey}" not found`);
    }

    return page;
  }
}
