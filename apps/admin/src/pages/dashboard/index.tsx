import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import type { DashboardSummaryDto } from "../../../../../packages/contracts/src/dashboard";
import { fetchDashboardSummary } from "../../store/auth";

const EMPTY_SUMMARY: DashboardSummaryDto = {
  todayLeads: 0,
  pendingLeads: 0,
  activeOrders: 0,
  completedOrders: 0,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryDto>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    setLoading(true);
    setError(null);

    try {
      setSummary(await fetchDashboardSummary());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "工作台数据加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  const cards = [
    { key: "todayLeads", title: "今日线索", value: summary.todayLeads },
    { key: "pendingLeads", title: "待跟进", value: summary.pendingLeads },
    { key: "activeOrders", title: "进行中订单", value: summary.activeOrders },
    { key: "completedOrders", title: "已完成订单", value: summary.completedOrders },
  ] as const;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            运营工作台
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
            先把当日线索、待跟进线索和订单状态看板做起来，便于值班顾问快速判断当天压力。
          </Typography.Paragraph>
        </div>

        <Button loading={loading} onClick={() => void loadSummary()}>
          刷新数据
        </Button>
      </div>

      {error ? <Alert message={error} showIcon type="error" /> : null}

      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col key={card.key} lg={6} md={12} sm={12} xs={24}>
            <Card bordered={false}>
              <Statistic loading={loading} title={card.title} value={card.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          统计口径说明：
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 4 }} type="secondary">
          今日线索：当天新进入系统的官网或手工线索。
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 4 }} type="secondary">
          待跟进：状态仍为新建、跟进中、已报价的线索。
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 4 }} type="secondary">
          进行中订单：待确认、待派单、已派单、服务中、售后中的订单。
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
          已完成订单：状态为已完成的订单。
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}
