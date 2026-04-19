import { ContentPage } from "../components/content-page";
import { Hero } from "../components/home/hero";
import { getPageContent } from "../lib/api";

export default async function HomePage() {
  const page = await getPageContent("home");

  return (
    <>
      {page.hero ? <Hero hero={page.hero} /> : null}
      <ContentPage page={page} />
    </>
  );
}
