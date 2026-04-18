import { ContentPage } from "../../components/content-page";
import { getPageContent } from "../../lib/api";

export default async function ContactPage() {
  const page = await getPageContent("contact");
  return <ContentPage page={page} />;
}
