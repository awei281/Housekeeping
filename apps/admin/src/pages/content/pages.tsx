import { useEffect, useState } from "react";
import { Alert, Button, Card, Space, Table, Typography, type TableProps } from "antd";
import type { AdminContentPageSummary } from "../../../../../packages/contracts/src/content";
import { fetchContentPages } from "../../store/auth";
import PageEditor from "./page-editor";

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN") : "-";
}

export default function ContentPagesPage() {
  const [pages, setPages] = useState<AdminContentPageSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPageKey, setSelectedPageKey] = useState<string | null>("home");

  async function loadPages() {
    setLoading(true);
    setError(null);

    try {
      const nextPages = await fetchContentPages();
      setPages(nextPages);

      if (!selectedPageKey && nextPages.length > 0) {
        setSelectedPageKey(nextPages[0].pageKey);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "内容页面加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPages();
  }, []);

  const columns: TableProps<AdminContentPageSummary>["columns"] = [
    {
      title: "页面",
      dataIndex: "pageKey",
      width: 120,
    },
    {
      title: "标题",
      dataIndex: "title",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
    },
    {
      title: "最近更新时间",
      dataIndex: "updatedAt",
      render: (value?: string | null) => formatDateTime(value),
      width: 180,
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          内容管理
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
          先把官网 5 个页面的文本维护能力做通，后面再考虑更复杂的可视化装修。
        </Typography.Paragraph>
      </div>

      {error ? <Alert message={error} showIcon type="error" /> : null}

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(320px, 0.9fr) minmax(0, 1.3fr)",
          alignItems: "start",
        }}
      >
        <Card
          title="页面列表"
          extra={
            <Button loading={loading} onClick={() => void loadPages()}>
              刷新
            </Button>
          }
        >
          <Table<AdminContentPageSummary>
            columns={columns}
            dataSource={pages}
            loading={loading}
            onRow={(record) => ({
              onClick: () => setSelectedPageKey(record.pageKey),
            })}
            pagination={false}
            rowKey="pageKey"
          />
        </Card>

        <PageEditor onSaved={loadPages} pageKey={selectedPageKey} />
      </div>
    </Space>
  );
}
