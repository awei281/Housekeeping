import type {
  PublicContentPage,
} from "../../../../packages/contracts/src/content";
import type { ServiceStandardDto } from "../../../../packages/contracts/src/standard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3200";
const FALLBACK_SERVICE_STANDARDS: ServiceStandardDto[] = [
  {
    id: 1,
    category: "personnel",
    title: "人员标准",
    content: "实名认证、培训合格、健康证明齐全，服务纪律清晰可查。",
    sortOrder: 1,
    status: "published",
  },
  {
    id: 2,
    category: "service",
    title: "服务标准",
    content: "按服务清单执行，不漏项，不乱收费，关键节点有记录。",
    sortOrder: 2,
    status: "published",
  },
  {
    id: 3,
    category: "tools",
    title: "工具标准",
    content: "工具分类使用，重点区域分色分区，避免交叉污染。",
    sortOrder: 3,
    status: "published",
  },
  {
    id: 4,
    category: "safety",
    title: "安全标准",
    content: "入户安全、物品保护、隐私保护都要在服务前后确认。",
    sortOrder: 4,
    status: "published",
  },
  {
    id: 5,
    category: "after_sale",
    title: "售后标准",
    content: "投诉和问题处理有时限，服务结束后保留回访机制。",
    sortOrder: 5,
    status: "published",
  },
];

const FALLBACK_PAGES: Record<string, PublicContentPage> = {
  home: {
    pageKey: "home",
    title: "官网内容加载中",
    lead: "如果 API 暂时未启动，先用这个占位页面保证站点壳子能渲染。",
    hero: {
      title: "专业家政服务，让家庭更省心",
      subtitle: "内容接口未连通时，首页仍会保留一个可见的展示骨架。",
      ctaLabel: "立即预约",
      ctaHref: "/contact",
    },
    sections: [],
  },
  about: {
    pageKey: "about",
    title: "公司介绍",
    lead: "内容接口暂未连通。",
    sections: [],
  },
  services: {
    pageKey: "services",
    title: "服务项目",
    lead: "内容接口暂未连通。",
    sections: [],
  },
  standards: {
    pageKey: "standards",
    title: "服务标准",
    lead: "内容接口暂未连通。",
    sections: [],
  },
  contact: {
    pageKey: "contact",
    title: "联系我们",
    lead: "内容接口暂未连通。",
    sections: [],
  },
};

export async function getPageContent(pageKey: string): Promise<PublicContentPage> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/pages/${pageKey}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load page "${pageKey}"`);
    }

    return (await response.json()) as PublicContentPage;
  } catch {
    return (
      FALLBACK_PAGES[pageKey] || {
        pageKey,
        title: "页面暂未准备好",
        lead: "当前页面内容稍后补充。",
        sections: [],
      }
    );
  }
}

export async function getServiceStandards(): Promise<ServiceStandardDto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/service-standards`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load service standards");
    }

    return (await response.json()) as ServiceStandardDto[];
  } catch {
    return FALLBACK_SERVICE_STANDARDS;
  }
}
