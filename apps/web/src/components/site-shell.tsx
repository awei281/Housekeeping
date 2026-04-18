import Link from "next/link";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/about", label: "公司介绍" },
  { href: "/services", label: "服务项目" },
  { href: "/standards", label: "服务标准" },
  { href: "/contact", label: "联系我们" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-brand" href="/">
            <span className="site-brand__mark">H</span>
            <span>Housekeeping</span>
          </Link>
          <nav className="site-nav" aria-label="官网导航">
            {NAV_ITEMS.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <strong>Housekeeping MVP</strong>
            <p>官网展示、内容读取与预约入口会按任务顺序逐步打通。</p>
          </div>
          <div>
            <strong>联系顾问</strong>
            <p>工作日 09:00-18:00，服务咨询与预约跟进。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
