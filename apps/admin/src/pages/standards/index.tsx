import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from "antd";
import type {
  CreateServiceStandardDto,
  ServiceStandardDto,
  UpdateServiceStandardDto,
} from "../../../../../packages/contracts/src/standard";
import {
  createServiceStandard,
  fetchServiceStandards,
  updateServiceStandard,
} from "../../store/auth";

const categoryOptions = [
  { label: "人员标准", value: "personnel" },
  { label: "服务标准", value: "service" },
  { label: "工具标准", value: "tools" },
  { label: "安全标准", value: "safety" },
  { label: "售后标准", value: "after_sale" },
];

function getCategoryLabel(value: string) {
  return categoryOptions.find((option) => option.value === value)?.label ?? value;
}

export default function StandardsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<CreateServiceStandardDto>();
  const [editForm] = Form.useForm<UpdateServiceStandardDto>();
  const [standards, setStandards] = useState<ServiceStandardDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStandard, setEditingStandard] = useState<ServiceStandardDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStandards() {
    setLoading(true);
    setError(null);

    try {
      setStandards(await fetchServiceStandards());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "服务标准加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStandards();
  }, []);

  async function handleCreate(values: CreateServiceStandardDto) {
    setSubmitting(true);

    try {
      const created = await createServiceStandard({
        ...values,
        title: values.title.trim(),
        content: values.content.trim(),
      });
      messageApi.success(`标准已新增：${created.title}`);
      createForm.resetFields();
      createForm.setFieldsValue({ status: "published", sortOrder: standards.length + 1 });
      await loadStandards();
    } catch (createError) {
      messageApi.error(
        createError instanceof Error ? createError.message : "新增服务标准失败",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(standard: ServiceStandardDto) {
    if (standard.id < 0) {
      return;
    }

    setEditingStandard(standard);
    editForm.setFieldsValue({
      category: standard.category,
      title: standard.title,
      content: standard.content,
      sortOrder: standard.sortOrder,
      status: standard.status,
    });
  }

  async function handleUpdate(values: UpdateServiceStandardDto) {
    if (!editingStandard) {
      return;
    }

    setSaving(true);

    try {
      const updated = await updateServiceStandard(editingStandard.id, {
        ...values,
        title: values.title?.trim(),
        content: values.content?.trim(),
      });
      messageApi.success(`标准已更新：${updated.title}`);
      setEditingStandard(null);
      editForm.resetFields();
      await loadStandards();
    } catch (updateError) {
      messageApi.error(
        updateError instanceof Error ? updateError.message : "更新服务标准失败",
      );
    } finally {
      setSaving(false);
    }
  }

  const columns: TableProps<ServiceStandardDto>["columns"] = [
    {
      title: "分类",
      dataIndex: "category",
      render: (value: string) => getCategoryLabel(value),
      width: 120,
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 160,
    },
    {
      title: "内容",
      dataIndex: "content",
      ellipsis: true,
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      width: 90,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (value: string) => (
        <Tag color={value === "published" ? "green" : "default"}>{value}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button
          disabled={record.id < 0}
          size="small"
          type="link"
          onClick={() => openEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          服务标准管理
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
          标准列表现在支持新增和更新。带负数 ID 的行是官网默认兜底内容，先新增正式记录后再编辑。
        </Typography.Paragraph>
      </div>

      {error ? <Alert message={error} showIcon type="error" /> : null}

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(320px, 0.95fr) minmax(0, 1.35fr)",
          alignItems: "start",
        }}
      >
        <Card title="新增服务标准">
          <Form<CreateServiceStandardDto>
            form={createForm}
            initialValues={{ status: "published", sortOrder: 1 }}
            layout="vertical"
            onFinish={(values) => void handleCreate(values)}
          >
            <Form.Item
              label="标准分类"
              name="category"
              rules={[{ required: true, message: "请选择标准分类" }]}
            >
              <Select options={categoryOptions} />
            </Form.Item>
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: "请输入标题" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="内容"
              name="content"
              rules={[{ required: true, message: "请输入内容" }]}
            >
              <Input.TextArea rows={5} />
            </Form.Item>
            <Form.Item label="排序" name="sortOrder">
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select
                options={[
                  { label: "发布中", value: "published" },
                  { label: "草稿", value: "draft" },
                ]}
              />
            </Form.Item>
            <Button htmlType="submit" loading={submitting} type="primary">
              新增标准
            </Button>
          </Form>
        </Card>

        <Card
          title="标准列表"
          extra={
            <Button loading={loading} onClick={() => void loadStandards()}>
              刷新
            </Button>
          }
        >
          <Table<ServiceStandardDto>
            columns={columns}
            dataSource={standards}
            loading={loading}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Card>
      </div>

      <Modal
        confirmLoading={saving}
        destroyOnClose
        onCancel={() => {
          setEditingStandard(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        open={Boolean(editingStandard)}
        title={editingStandard ? `编辑标准：${editingStandard.title}` : "编辑标准"}
      >
        <Form<UpdateServiceStandardDto>
          form={editForm}
          layout="vertical"
          onFinish={(values) => void handleUpdate(values)}
        >
          <Form.Item
            label="标准分类"
            name="category"
            rules={[{ required: true, message: "请选择标准分类" }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: "请输入内容" }]}
          >
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              options={[
                { label: "发布中", value: "published" },
                { label: "草稿", value: "draft" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
