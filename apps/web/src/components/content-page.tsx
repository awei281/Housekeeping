import { PublicContentPage } from "../lib/api";

export function ContentPage({ page }: { page: PublicContentPage }) {
  return (
    <article className="content-card">
      <div className="page-heading">
        <h1>{page.title}</h1>
        <p>{page.lead}</p>
      </div>

      <div className="sections-grid">
        {page.sections.map((section) => (
          <section className="section-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
