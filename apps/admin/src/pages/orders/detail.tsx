import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  assignOrderEmployee,
  fetchEmployees,
  fetchOrderDetail,
  type AdminEmployee,
  type AdminOrderDetail,
} from "../../store/auth";

interface OrderDetailPageProps {
  orderId: number | null;
  onOrderUpdated?: () => void | Promise<void>;
  refreshToken?: number;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

function formatAmount(value: number | string) {
  return typeof value === "number" ? value.toFixed(2) : value;
}

export default function OrderDetailPage({
  orderId,
  onOrderUpdated,
  refreshToken = 0,
}: OrderDetailPageProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrderDetail() {
      if (!orderId) {
        setOrder(null);
        setEmployees([]);
        setSelectedEmployeeId(undefined);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [nextOrder, nextEmployees] = await Promise.all([
          fetchOrderDetail(orderId),
          fetchEmployees(),
        ]);
        setOrder(nextOrder);
        setEmployees(nextEmployees);
        setSelectedEmployeeId(nextOrder.assignedEmployeeId ?? undefined);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "订单详情加载失败");
      } finally {
        setLoading(false);
      }
    }

    void loadOrderDetail();
  }, [orderId, refreshToken]);

  async function handleAssign() {
    if (!order) {
      return;
    }

    if (!selectedEmployeeId) {
      messageApi.warning("请先选择服务人员");
      return;
    }

    setAssigning(true);

    try {
      await assignOrderEmployee(order.id, { employeeId: selectedEmployeeId });
      const updatedOrder = await fetchOrderDetail(order.id);
      setOrder(updatedOrder);
      setSelectedEmployeeId(updatedOrder.assignedEmployeeId ?? undefined);
      messageApi.success("订单已完成派单");
      await onOrderUpdated?.();
    } catch (assignError) {
      messageApi.error(
        assignError instanceof Error ? assignError.message : "派单失败",
      );
    } finally {
      setAssigning(false);
    }
  }

  return (
    <Card title="订单详情">
      {contextHolder}
      {!orderId ? (
        <Empty description="请选择左侧订单查看详情" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : null}
      {error ? <Alert message={error} showIcon style={{ marginBottom: 16 }} type="error" /> : null}
      {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : null}
      {order && !loading ? (
        <>
          <Typography.Title level={4}>{order.orderNo}</Typography.Title>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="客户">{order.customerName || "-"}</Descriptions.Item>
            <Descriptions.Item label="手机号">{order.customerPhone || "-"}</Descriptions.Item>
            <Descriptions.Item label="服务类型">{order.serviceType}</Descriptions.Item>
            <Descriptions.Item label="服务项目">{order.serviceItemName}</Descriptions.Item>
            <Descriptions.Item label="服务时间">
              {formatDateTime(order.serviceDate)}
            </Descriptions.Item>
            <Descriptions.Item label="金额">{formatAmount(order.amount)}</Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color="blue">{order.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="付款状态">
              <Tag>{order.paymentStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="服务人员">
              {order.assignedEmployeeName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="服务人员手机号">
              {order.assignedEmployeePhone || "-"}
            </Descriptions.Item>
          </Descriptions>
          <Card size="small" style={{ marginTop: 16 }} title="派单操作">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Select
                allowClear
                loading={loading}
                onChange={(value) => setSelectedEmployeeId(value)}
                options={employees.map((employee) => ({
                  label: `${employee.name} · ${employee.roleType} · ${employee.status}`,
                  value: employee.id,
                }))}
                placeholder="选择服务人员"
                value={selectedEmployeeId}
              />
              <Button
                loading={assigning}
                onClick={() => void handleAssign()}
                type="primary"
              >
                确认派单
              </Button>
              {employees.length === 0 ? (
                <Typography.Text type="secondary">
                  暂无员工档案，请先到员工管理新增员工。
                </Typography.Text>
              ) : null}
            </Space>
          </Card>
        </>
      ) : null}
    </Card>
  );
}
