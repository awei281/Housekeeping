import { ContentPage } from "../../components/content-page";
import { AppointmentForm } from "../../components/forms/appointment-form";
import { getPageContent } from "../../lib/api";

export default async function ContactPage() {
  const page = await getPageContent("contact");

  return (
    <div className="contact-layout">
      <ContentPage page={page} />
      <AppointmentForm />
    </div>
  );
}
