import Link from "next/link";
import { ContentHero } from "../../lib/api";

export function Hero({ hero }: { hero: ContentHero }) {
  return (
    <section className="hero">
      <div className="hero__copy">
        <span className="hero__eyebrow">Housekeeping MVP</span>
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>
        <div className="hero__actions">
          <Link className="button-primary" href={hero.ctaHref}>
            {hero.ctaLabel}
          </Link>
          <Link className="button-secondary" href="/services">
            浏览服务项目
          </Link>
        </div>
      </div>

      <aside className="hero__panel">
        <div className="hero__metric">
          <strong>线索统一收口</strong>
          <p>官网咨询和预约入口会收敛到同一条后台跟进链路。</p>
        </div>
        <div className="hero__metric">
          <strong>流程透明</strong>
          <p>把服务项目、标准和联系方式先讲清楚，减少前期沟通摩擦。</p>
        </div>
        <div className="hero__metric">
          <strong>为后续 CMS 预留位</strong>
          <p>当前页面内容先通过公共 API 读取，下一阶段再接内容管理后台。</p>
        </div>
      </aside>
    </section>
  );
}
