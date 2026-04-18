import { ContentPage } from "../../components/content-page";
import { getPageContent } from "../../lib/api";

export default async function StandardsPage() {
  const page = await getPageContent("standards");
  return <ContentPage page={page} />;
}
