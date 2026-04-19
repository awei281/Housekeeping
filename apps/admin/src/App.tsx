import { useState } from "react";
import { Button, Layout, Menu, Space, Typography } from "antd";
import DashboardPage from "./pages/dashboard";
import ContentPagesPage from "./pages/content/pages";
import CustomersPage from "./pages/customers";
import EmployeesPage from "./pages/employees";
import { LoginPage } from "./pages/login";
import LeadsPage from "./pages/leads";
import OrdersPage from "./pages/orders";
import StandardsPage from "./pages/standards";
import { getStoredSession, logout, type AuthSession } from "./store/auth";

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [activePage, setActivePage] = useState<
    | "dashboard"
    | "leads"
    | "customers"
    | "orders"
    | "employees"
    | "content"
    | "standards"
  >(
    "dashboard",
  );
  const [customersRefreshToken, setCustomersRefreshToken] = useState(0);

  if (!session) {
    return <LoginPage onLoginSuccess={setSession} />;
  }

  function handleLogout() {
    logout();
    setSession(null);
    setActivePage("dashboard");
  }

  function handleCustomerCreated() {
    setCustomersRefreshToken((value) => value + 1);
    setActivePage("customers");
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider theme="light" width={220}>
        <div style={{ padding: 20 }}>
          <Typography.Title level={4} style={{ marginBottom: 4 }}>
            Housekeeping
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
            MVP 后台
          </Typography.Paragraph>
        </div>
        <Menu
          items={[
            { key: "dashboard", label: "工作台" },
            { key: "leads", label: "线索管理" },
            { key: "customers", label: "客户管理" },
            { key: "orders", label: "订单管理" },
            { key: "employees", label: "员工管理" },
            { key: "content", label: "内容管理" },
            { key: "standards", label: "服务标准" },
          ]}
          onClick={({ key }) =>
            setActivePage(
              key as
                | "dashboard"
                | "leads"
                | "customers"
                | "orders"
                | "employees"
                | "content"
                | "standards",
            )
          }
          selectedKeys={[activePage]}
        />
      </Layout.Sider>

      <Layout>
        <Layout.Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            paddingInline: 24,
          }}
        >
          <div>
            <Typography.Text strong>{session.user.username}</Typography.Text>
            <Typography.Text style={{ marginLeft: 8 }} type="secondary">
              {session.user.roleCode}
            </Typography.Text>
          </div>
          <Button onClick={handleLogout}>退出登录</Button>
        </Layout.Header>

        <Layout.Content style={{ padding: 24 }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {activePage === "dashboard" ? <DashboardPage /> : null}
            {activePage === "leads" ? (
              <LeadsPage onCustomerCreated={handleCustomerCreated} />
            ) : null}
            {activePage === "customers" ? (
              <CustomersPage refreshToken={customersRefreshToken} />
            ) : null}
            {activePage === "orders" ? <OrdersPage /> : null}
            {activePage === "employees" ? <EmployeesPage /> : null}
            {activePage === "content" ? <ContentPagesPage /> : null}
            {activePage === "standards" ? <StandardsPage /> : null}
          </Space>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
