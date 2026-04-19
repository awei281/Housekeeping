import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Space,
  Typography,
  message,
} from "antd";
import type { UpdateContentPageDto } from "../../../../../packages/contracts/src/content";
import { fetchContentPage, updateContentPage } from "../../store/auth";

interface PageEditorProps {
  onSaved?: () => void | Promise<void>;
  pageKey: string | null;
}

function normalizeSections(
  sections: UpdateContentPageDto["sections"] | undefined,
) {
  return (sections ?? []).filter(
    (section) => section.title.trim() || section.body.trim(),
  );
}

export default function PageEditor({ pageKey, onSaved }: PageEditorProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<UpdateContentPageDto>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      if (!pageKey) {
        form.resetFields();
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const page = await fetchContentPage(pageKey);
        form.setFieldsValue({
          title: page.title,
          lead: page.lead,
          hero: page.hero,
          sections: page.sections,
          status: page.status,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "页面详情加载失败");
      } finally {
        setLoading(false);
      }
    }

    void loadPage();
  }, [form, pageKey]);

  async function handleSave(values: UpdateContentPageDto) {
    if (!pageKey) {
      return;
    }

    setSaving(true);

    try {
      await updateContentPage(pageKey, {
        ...values,
        title: values.title.trim(),
        lead: values.lead.trim(),
        sections: normalizeSections(values.sections),
      });
      messageApi.success("页面内容已保存");
      await onSaved?.();
    } catch (saveError) {
      messageApi.error(saveError instanceof Error ? saveError.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!pageKey) {
    return (
      <Card title="页面编辑器">
        <Empty description="请选择左侧页面开始编辑" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <Card
      extra={
        <Button loading={saving || loading} onClick={() => form.submit()} type="primary">
          保存页面
        </Button>
      }
      loading={loading}
      title={`页面编辑：${pageKey}`}
    >
      {contextHolder}
      {error ? <Alert message={error} showIcon style={{ marginBottom: 16 }} type="error" /> : null}
      <Form<UpdateContentPageDto>
        form={form}
        initialValues={{
          status: "published",
          sections: [],
        }}
        layout="vertical"
        onFinish={(values) => void handleSave(values)}
      >
        <Form.Item
          label="页面标题"
          name="title"
          rules={[{ required: true, message: "请输入页面标题" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="页面导语"
          name="lead"
          rules={[{ required: true, message: "请输入页面导语" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Card size="small" style={{ marginBottom: 16 }} title="Hero 区域">
          <Form.Item label="主标题" name={["hero", "title"]}>
            <Input />
          </Form.Item>
          <Form.Item label="副标题" name={["hero", "subtitle"]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="按钮文案" name={["hero", "ctaLabel"]}>
            <Input />
          </Form.Item>
          <Form.Item label="按钮链接" name={["hero", "ctaHref"]}>
            <Input />
          </Form.Item>
        </Card>

        <Card
          size="small"
          title="页面模块"
          extra={
            <Button
              onClick={() => {
                const current = form.getFieldValue("sections") || [];
                form.setFieldValue("sections", [
                  ...current,
                  { title: "", body: "" },
                ]);
              }}
            >
              新增模块
            </Button>
          }
        >
          <Form.List name="sections">
            {(fields, { remove }) => (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {fields.length === 0 ? (
                  <Typography.Text type="secondary">
                    当前没有模块内容，可以手动新增。
                  </Typography.Text>
                ) : null}
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    title={`模块 ${index + 1}`}
                    extra={
                      <Button danger size="small" type="link" onClick={() => remove(field.name)}>
                        删除
                      </Button>
                    }
                  >
                    <Form.Item
                      label="模块标题"
                      name={[field.name, "title"]}
                      rules={[{ required: true, message: "请输入模块标题" }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="模块内容"
                      name={[field.name, "body"]}
                      rules={[{ required: true, message: "请输入模块内容" }]}
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </Card>
                ))}
              </Space>
            )}
          </Form.List>
        </Card>
      </Form>
    </Card>
  );
}
