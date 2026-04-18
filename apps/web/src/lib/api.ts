export interface ContentSection {
  title: string;
  body: string;
}

export interface ContentHero {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface PublicContentPage {
  pageKey: string;
  title: string;
  lead: string;
  hero?: ContentHero;
  sections: ContentSection[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3200";

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
      next: { revalidate: 300 },
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
