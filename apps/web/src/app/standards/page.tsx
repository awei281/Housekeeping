import { getPageContent, getServiceStandards } from "../../lib/api";

export default async function StandardsPage() {
  const [page, standards] = await Promise.all([
    getPageContent("standards"),
    getServiceStandards(),
  ]);

  return (
    <article className="content-card">
      <div className="page-heading">
        <h1>{page.title}</h1>
        <p>{page.lead}</p>
      </div>

      <div className="sections-grid" style={{ marginBottom: 24 }}>
        {page.sections.map((section) => (
          <section className="section-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>

      <div className="page-heading" style={{ marginBottom: 16 }}>
        <h2>标准清单</h2>
        <p>下面这些卡片由后台维护，更新后刷新页面即可看到最新内容。</p>
      </div>

      <div className="sections-grid">
        {standards.map((standard) => (
          <section className="section-card" key={`${standard.category}-${standard.id}`}>
            <span className="section-eyebrow">{standard.category}</span>
            <h2>{standard.title}</h2>
            <p>{standard.content}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
