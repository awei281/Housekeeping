import { ContentPage } from "../../components/content-page";
import { getPageContent } from "../../lib/api";

export default async function ServicesPage() {
  const page = await getPageContent("services");
  return <ContentPage page={page} />;
}
