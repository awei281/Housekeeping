import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from "antd";
import {
  convertLeadToCustomer,
  fetchLeads,
  type AdminLead,
} from "../../store/auth";

interface LeadsPageProps {
  onCustomerCreated?: (customerId: number) => void;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("zh-CN");
}

export default function LeadsPage({ onCustomerCreated }: LeadsPageProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [convertingId, setConvertingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadLeads() {
    setLoading(true);
    setError(null);

    try {
      setLeads(await fetchLeads());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "线索加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  async function handleConvert(id: number) {
    setConvertingId(id);

    try {
      const customer = await convertLeadToCustomer(id);
      messageApi.success(`线索已转客户，客户 ID：${customer.id}`);
      await loadLeads();
      onCustomerCreated?.(customer.id);
    } catch (convertError) {
      messageApi.error(
        convertError instanceof Error ? convertError.message : "转客户失败",
      );
    } finally {
      setConvertingId(null);
    }
  }

  const columns: TableProps<AdminLead>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 72,
    },
    {
      title: "联系人",
      dataIndex: "contactName",
    },
    {
      title: "手机号",
      dataIndex: "phone",
    },
    {
      title: "服务类型",
      dataIndex: "serviceType",
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: string) => <Tag color={status === "new" ? "blue" : "gold"}>{status}</Tag>,
    },
    {
      title: "预约时间",
      dataIndex: "expectedTime",
      render: (value: string | null) => formatDateTime(value),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Button
          loading={convertingId === record.id}
          onClick={() => void handleConvert(record.id)}
          size="small"
          type="primary"
        >
          转客户
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          线索管理
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
          官网预约和人工咨询先统一沉淀到这里，当前页面聚焦列表和转客户动作。
        </Typography.Paragraph>
      </div>

      {error ? <Alert message={error} showIcon type="error" /> : null}

      <Card
        extra={
          <Button loading={loading} onClick={() => void loadLeads()}>
            刷新
          </Button>
        }
      >
        <Table<AdminLead>
          columns={columns}
          dataSource={leads}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
        />
      </Card>
    </Space>
  );
}
