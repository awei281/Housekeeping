import "./globals.css";
import { SiteShell } from "../components/site-shell";

export const metadata = {
  title: "Housekeeping",
  description: "Housekeeping MVP public website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
