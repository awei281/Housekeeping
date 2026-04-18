import { ContentPage } from "../../components/content-page";
import { getPageContent } from "../../lib/api";

export default async function AboutPage() {
  const page = await getPageContent("about");
  return <ContentPage page={page} />;
}
