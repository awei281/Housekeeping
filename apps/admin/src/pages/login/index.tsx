import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
  message,
} from "antd";
import {
  clearStoredSession,
  getStoredSession,
  login,
  type AuthSession,
} from "../../store/auth";

interface LoginFormValues {
  username: string;
  password: string;
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background:
    "linear-gradient(135deg, rgba(244, 247, 250, 1) 0%, rgba(227, 237, 246, 1) 100%)",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  boxShadow: "0 18px 48px rgba(34, 60, 80, 0.16)",
  borderRadius: 20,
};

export function LoginPage() {
  const [api, contextHolder] = message.useMessage();
  const [session, setSession] = useState<AuthSession | null>(getStoredSession());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const nextSession = await login(values);
      setSession(nextSession);
      api.success("登录成功");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "登录失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    setError(null);
  };

  return (
    <div style={pageStyle}>
      {contextHolder}
      <Card bordered={false} style={cardStyle}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={2} style={{ marginBottom: 8 }}>
              登录后台
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Housekeeping MVP 管理入口
            </Typography.Paragraph>
          </div>

          {session ? (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Alert
                type="success"
                message={`已登录为 ${session.user.username}`}
                description={`角色：${session.user.roleCode}`}
                showIcon
              />
              <Button onClick={handleLogout}>退出登录</Button>
            </Space>
          ) : (
            <>
              {error ? <Alert type="error" message={error} showIcon /> : null}
              <Form<LoginFormValues>
                layout="vertical"
                initialValues={{
                  username: "admin",
                  password: "admin123",
                }}
                onFinish={handleSubmit}
              >
                <Form.Item
                  label="账号"
                  name="username"
                  rules={[{ required: true, message: "请输入账号" }]}
                >
                  <Input autoComplete="username" />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[{ required: true, message: "请输入密码" }]}
                >
                  <Input.Password autoComplete="current-password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting} block>
                  登录后台
                </Button>
              </Form>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
