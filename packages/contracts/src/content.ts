export interface ContentHero {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface ContentSection {
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

export interface AdminContentPageSummary {
  pageKey: string;
  title: string;
  lead: string;
  status: string;
  updatedAt?: string | null;
}

export interface AdminEditableContentPage extends PublicContentPage {
  status: string;
}

export interface UpdateContentPageDto {
  title: string;
  lead: string;
  hero?: ContentHero;
  sections: ContentSection[];
  status?: string;
}
