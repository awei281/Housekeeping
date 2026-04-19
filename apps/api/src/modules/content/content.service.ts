import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  AdminEditableContentPage,
  AdminContentPageSummary,
  ContentHero,
  ContentSection,
  PublicContentPage,
} from "../../../../../packages/contracts/src/content";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateContentPageDto } from "./dto/update-content-page.dto";

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
    lead: "页面现在承担留资入口和基础联系方式，顾问会根据预约信息尽快回电。",
    sections: [
      {
        title: "顾问咨询",
        body: "工作日 09:00-18:00 提供预约咨询与服务说明。",
      },
      {
        title: "预约准备",
        body: "建议提前准备服务类型、期望时间和联系号码，方便后续顾问快速跟进。",
      },
      {
        title: "提交后流程",
        body: "表单提交后会进入后台线索池，顾问确认需求后再进入后续报价和派单流程。",
      },
    ],
  },
};

const PAGE_ORDER = ["home", "about", "services", "standards", "contact"];

function clonePage(page: PublicContentPage): PublicContentPage {
  return JSON.parse(JSON.stringify(page)) as PublicContentPage;
}

function parseContentJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadPageBlocks(pageId: number) {
    return this.prisma.contentBlock.findMany({
      where: {
        pageId,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  }

  private buildPageFromSource(
    pageKey: string,
    dbPage?: {
      title: string;
      lead: string;
      status: string;
      updatedAt: Date;
    } | null,
    blocks?: Array<{
      blockType: string;
      contentJson: string;
    }>,
  ): AdminEditableContentPage {
    const fallbackPage = PUBLIC_PAGES[pageKey];

    if (!dbPage && !fallbackPage) {
      throw new NotFoundException(`Page "${pageKey}" not found`);
    }

    const heroBlock = blocks?.find((block) => block.blockType === "hero");
    const sectionBlocks =
      blocks
        ?.filter((block) => block.blockType === "section")
        .map((block) => parseContentJson<ContentSection>(block.contentJson))
        .filter((section): section is ContentSection => Boolean(section)) ?? [];

    return {
      pageKey,
      title: dbPage?.title ?? fallbackPage.title,
      lead: dbPage?.lead ?? fallbackPage.lead,
      hero:
        parseContentJson<ContentHero>(heroBlock?.contentJson ?? "") ??
        fallbackPage.hero,
      sections: sectionBlocks.length > 0 ? sectionBlocks : fallbackPage.sections,
      status: dbPage?.status ?? "published",
    };
  }

  async findPageByKey(pageKey: string) {
    const page = await this.prisma.contentPage.findUnique({
      where: {
        pageKey,
      },
    });
    const blocks = page ? await this.loadPageBlocks(page.id) : [];

    if (!page && !PUBLIC_PAGES[pageKey]) {
      throw new NotFoundException(`Page "${pageKey}" not found`);
    }

    const result = this.buildPageFromSource(pageKey, page, blocks);

    return {
      pageKey: result.pageKey,
      title: result.title,
      lead: result.lead,
      hero: result.hero,
      sections: result.sections,
    };
  }

  async findAllPagesForAdmin(): Promise<AdminContentPageSummary[]> {
    const pages = await this.prisma.contentPage.findMany({
      orderBy: {
        pageKey: "asc",
      },
    });
    const pageMap = new Map(pages.map((page) => [page.pageKey, page]));
    const pageKeys = [
      ...PAGE_ORDER,
      ...pages.map((page) => page.pageKey).filter((pageKey) => !PAGE_ORDER.includes(pageKey)),
    ];

    return pageKeys.map((pageKey) => {
      const fallbackPage = PUBLIC_PAGES[pageKey];
      const page = pageMap.get(pageKey);

      if (!page && !fallbackPage) {
        return {
          pageKey,
          title: pageKey,
          lead: "",
          status: "draft",
          updatedAt: null,
        };
      }

      return {
        pageKey,
        title: page?.title ?? fallbackPage.title,
        lead: page?.lead ?? fallbackPage.lead,
        status: page?.status ?? "published",
        updatedAt: page?.updatedAt?.toISOString() ?? null,
      };
    });
  }

  async findPageForAdmin(pageKey: string) {
    const page = await this.prisma.contentPage.findUnique({
      where: {
        pageKey,
      },
    });
    const blocks = page ? await this.loadPageBlocks(page.id) : [];

    return this.buildPageFromSource(pageKey, page, blocks);
  }

  async updatePage(pageKey: string, dto: UpdateContentPageDto) {
    const page = await this.prisma.contentPage.upsert({
      where: {
        pageKey,
      },
      create: {
        pageKey,
        title: dto.title,
        lead: dto.lead,
        status: dto.status ?? "published",
      },
      update: {
        title: dto.title,
        lead: dto.lead,
        status: dto.status ?? "published",
      },
    });

    await this.prisma.contentBlock.deleteMany({
      where: {
        pageId: page.id,
      },
    });

    const blocks = [
      ...(dto.hero
        ? [
            {
              pageId: page.id,
              blockKey: "hero",
              blockType: "hero",
              contentJson: JSON.stringify(dto.hero),
              sortOrder: 0,
            },
          ]
        : []),
      ...dto.sections.map((section, index) => ({
        pageId: page.id,
        blockKey: `section-${index + 1}`,
        blockType: "section",
        contentJson: JSON.stringify(section),
        sortOrder: index + 1,
      })),
    ];

    if (blocks.length > 0) {
      await this.prisma.contentBlock.createMany({
        data: blocks,
      });
    }

    return this.findPageForAdmin(pageKey);
  }
}
