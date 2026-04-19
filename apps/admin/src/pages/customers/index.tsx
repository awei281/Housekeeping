import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Space,
  Table,
  Typography,
  type TableProps,
} from "antd";
import { fetchCustomers, type AdminCustomer } from "../../store/auth";

interface CustomersPageProps {
  refreshToken?: number;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

export default function CustomersPage({ refreshToken = 0 }: CustomersPageProps) {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    setLoading(true);
    setError(null);

    try {
      setCustomers(await fetchCustomers());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "客户加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, [refreshToken]);

  const columns: TableProps<AdminCustomer>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 72,
    },
    {
      title: "客户名",
      dataIndex: "name",
    },
    {
      title: "手机号",
      dataIndex: "phone",
    },
    {
      title: "来源",
      dataIndex: "source",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "备注",
      dataIndex: "remark",
      ellipsis: true,
      render: (value?: string | null) => value || "-",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      render: (value: string) => formatDateTime(value),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          客户管理
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
          线索转客户后会出现在这里，先把列表和基本信息看清楚。
        </Typography.Paragraph>
      </div>

      {error ? <Alert message={error} showIcon type="error" /> : null}

      <Card
        extra={
          <Button loading={loading} onClick={() => void loadCustomers()}>
            刷新
          </Button>
        }
      >
        <Table<AdminCustomer>
          columns={columns}
          dataSource={customers}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
        />
      </Card>
    </Space>
  );
}
