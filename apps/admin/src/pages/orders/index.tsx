import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Typography,
  message,
  type TableProps,
} from "antd";
import type { CreateOrderDto } from "../../../../../packages/contracts/src/order";
import {
  createOrder,
  fetchCustomers,
  fetchOrders,
  type AdminCustomer,
  type AdminOrder,
} from "../../store/auth";
import OrderDetailPage from "./detail";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

function formatAmount(value: number | string) {
  return typeof value === "number" ? value.toFixed(2) : value;
}

function normalizeServiceDate(value: string) {
  return new Date(value).toISOString();
}

export default function OrdersPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<CreateOrderDto>();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailRefreshToken, setDetailRefreshToken] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    setLoadingCustomers(true);

    try {
      setCustomers(await fetchCustomers());
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);
    setError(null);

    try {
      setOrders(await fetchOrders());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "订单加载失败");
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
    void loadOrders();
  }, []);

  async function handleCreate(values: CreateOrderDto) {
    setSubmitting(true);

    try {
      const created = await createOrder({
        ...values,
        serviceDate: normalizeServiceDate(values.serviceDate),
        leadId: values.leadId || undefined,
        assignedEmployeeId: values.assignedEmployeeId || undefined,
      });

      messageApi.success(`订单已创建：${created.orderNo}`);
      form.resetFields();
      setSelectedOrderId(created.id);
      setDetailRefreshToken((value) => value + 1);
      await loadOrders();
    } catch (createError) {
      messageApi.error(
        createError instanceof Error ? createError.message : "创建订单失败",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const columns: TableProps<AdminOrder>["columns"] = [
    {
      title: "订单号",
      dataIndex: "orderNo",
    },
    {
      title: "客户",
      dataIndex: "customerName",
      render: (value?: string) => value || "-",
    },
    {
      title: "服务类型",
      dataIndex: "serviceType",
    },
    {
      title: "服务项目",
      dataIndex: "serviceItemName",
    },
    {
      title: "服务时间",
      dataIndex: "serviceDate",
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "金额",
      dataIndex: "amount",
      render: (value: number | string) => formatAmount(value),
    },
    {
      title: "状态",
      dataIndex: "status",
    },
    {
      title: "服务人员",
      dataIndex: "assignedEmployeeName",
      render: (value?: string) => value || "-",
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          订单管理
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
          先打通创建、列表和详情三件事，保证客户到订单的核心链路可用。
        </Typography.Paragraph>
      </div>

      {error ? <Alert message={error} showIcon type="error" /> : null}

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.9fr)",
          alignItems: "start",
        }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Card title="新建订单">
            <Form<CreateOrderDto>
              form={form}
              initialValues={{
                serviceType: "cleaning",
              }}
              layout="vertical"
              onFinish={(values) => void handleCreate(values)}
            >
              <Form.Item
                label="客户"
                name="customerId"
                rules={[{ required: true, message: "请选择客户" }]}
              >
                <Select
                  loading={loadingCustomers}
                  options={customers.map((customer) => ({
                    label: `${customer.name} (${customer.phone})`,
                    value: customer.id,
                  }))}
                  placeholder="选择客户"
                />
              </Form.Item>
              <Form.Item label="来源线索 ID" name="leadId">
                <InputNumber min={1} precision={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="服务类型"
                name="serviceType"
                rules={[{ required: true, message: "请选择服务类型" }]}
              >
                <Select
                  options={[
                    { label: "保洁服务", value: "cleaning" },
                    { label: "月嫂服务", value: "yuesao" },
                    { label: "家庭照护", value: "care" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="服务项目"
                name="serviceItemName"
                rules={[{ required: true, message: "请输入服务项目" }]}
              >
                <Input placeholder="例如：日常保洁" />
              </Form.Item>
              <Form.Item
                label="服务时间"
                name="serviceDate"
                rules={[{ required: true, message: "请选择服务时间" }]}
              >
                <Input type="datetime-local" />
              </Form.Item>
              <Form.Item
                label="订单金额"
                name="amount"
                rules={[{ required: true, message: "请输入订单金额" }]}
              >
                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
              <Button htmlType="submit" loading={submitting} type="primary">
                创建订单
              </Button>
            </Form>
          </Card>

          <Card
            title="订单列表"
            extra={
              <Button loading={loadingOrders} onClick={() => void loadOrders()}>
                刷新
              </Button>
            }
          >
            <Table<AdminOrder>
              columns={columns}
              dataSource={orders}
              loading={loadingOrders}
              onRow={(record) => ({
                onClick: () => setSelectedOrderId(record.id),
              })}
              pagination={{ pageSize: 10 }}
              rowKey="id"
            />
          </Card>
        </Space>

        <OrderDetailPage
          onOrderUpdated={loadOrders}
          orderId={selectedOrderId}
          refreshToken={detailRefreshToken}
        />
      </div>
    </Space>
  );
}
