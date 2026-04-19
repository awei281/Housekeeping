import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
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
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../../../../../packages/contracts/src/employee";
import {
  createEmployee,
  fetchEmployees,
  updateEmployee,
  type AdminEmployee,
} from "../../store/auth";

const employeeStatusOptions = [
  { label: "可接单", value: "available" },
  { label: "忙碌中", value: "busy" },
  { label: "休假中", value: "leave" },
  { label: "培训中", value: "training" },
  { label: "已离职", value: "inactive" },
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("zh-CN") : "-";
}

function trimOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeNullableText(value?: string | null) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeCreatePayload(values: CreateEmployeeDto): CreateEmployeeDto {
  return {
    name: values.name.trim(),
    phone: values.phone.trim(),
    roleType: values.roleType.trim(),
    ...(trimOptional(values.skillTags)
      ? { skillTags: trimOptional(values.skillTags) }
      : {}),
    ...(trimOptional(values.certificateNo)
      ? { certificateNo: trimOptional(values.certificateNo) }
      : {}),
    ...(values.healthCertExpireAt
      ? { healthCertExpireAt: values.healthCertExpireAt }
      : {}),
    ...(values.status ? { status: values.status } : {}),
  };
}

function normalizeUpdatePayload(values: UpdateEmployeeDto): UpdateEmployeeDto {
  return {
    name: values.name?.trim(),
    phone: values.phone?.trim(),
    roleType: values.roleType?.trim(),
    ...(values.skillTags !== undefined
      ? { skillTags: normalizeNullableText(values.skillTags) }
      : {}),
    ...(values.certificateNo !== undefined
      ? { certificateNo: normalizeNullableText(values.certificateNo) }
      : {}),
    ...(values.healthCertExpireAt !== undefined
      ? { healthCertExpireAt: values.healthCertExpireAt || null }
      : {}),
    ...(values.status !== undefined ? { status: values.status } : {}),
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "available":
      return "green";
    case "busy":
      return "orange";
    case "leave":
      return "gold";
    case "training":
      return "blue";
    case "inactive":
      return "default";
    default:
      return "default";
  }
}

export default function EmployeesPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<CreateEmployeeDto>();
  const [editForm] = Form.useForm<UpdateEmployeeDto>();
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AdminEmployee | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadEmployees() {
    setLoading(true);
    setError(null);

    try {
      setEmployees(await fetchEmployees());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "员工加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
  }, []);

  async function handleCreate(values: CreateEmployeeDto) {
    setSubmitting(true);

    try {
      const created = await createEmployee(normalizeCreatePayload(values));
      messageApi.success(`员工已新增：${created.name}`);
      createForm.resetFields();
      createForm.setFieldValue("status", "available");
      await loadEmployees();
    } catch (createError) {
      messageApi.error(
        createError instanceof Error ? createError.message : "新增员工失败",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(employee: AdminEmployee) {
    setEditingEmployee(employee);
    editForm.setFieldsValue({
      name: employee.name,
      phone: employee.phone,
      roleType: employee.roleType,
      skillTags: employee.skillTags ?? undefined,
      certificateNo: employee.certificateNo ?? undefined,
      healthCertExpireAt: employee.healthCertExpireAt
        ? employee.healthCertExpireAt.slice(0, 10)
        : undefined,
      status: employee.status,
    });
  }

  async function handleUpdate(values: UpdateEmployeeDto) {
    if (!editingEmployee) {
      return;
    }

    setSaving(true);

    try {
      const updated = await updateEmployee(
        editingEmployee.id,
        normalizeUpdatePayload(values),
      );
      messageApi.success(`员工已更新：${updated.name}`);
      setEditingEmployee(null);
      editForm.resetFields();
      await loadEmployees();
    } catch (updateError) {
      messageApi.error(
        updateError instanceof Error ? updateError.message : "更新员工失败",
      );
    } finally {
      setSaving(false);
    }
  }

  const columns: TableProps<AdminEmployee>["columns"] = [
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "手机号",
      dataIndex: "phone",
    },
    {
      title: "岗位",
      dataIndex: "roleType",
    },
    {
      title: "技能",
      dataIndex: "skillTags",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "证书编号",
      dataIndex: "certificateNo",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "健康证到期",
      dataIndex: "healthCertExpireAt",
      render: (value?: string | null) => formatDate(value),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (value: string) => (
        <Tag color={getStatusColor(value)}>
          {employeeStatusOptions.find((item) => item.value === value)?.label ?? value}
        </Tag>
      ),
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
        <Button size="small" type="link" onClick={() => openEdit(record)}>
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
          员工管理
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
          当前只做基础档案和接单状态，保证订单能完成派单闭环。
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
        <Card title="新增员工">
          <Form<CreateEmployeeDto>
            form={createForm}
            initialValues={{ status: "available" }}
            layout="vertical"
            onFinish={(values) => void handleCreate(values)}
          >
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: "请输入姓名" }]}
            >
              <Input placeholder="例如：李师傅" />
            </Form.Item>
            <Form.Item
              label="手机号"
              name="phone"
              rules={[{ required: true, message: "请输入手机号" }]}
            >
              <Input placeholder="例如：13500000000" />
            </Form.Item>
            <Form.Item
              label="岗位类型"
              name="roleType"
              rules={[{ required: true, message: "请输入岗位类型" }]}
            >
              <Input placeholder="例如：cleaner / nanny / caregiver" />
            </Form.Item>
            <Form.Item label="服务技能" name="skillTags">
              <Input placeholder="例如：cleaning,babycare" />
            </Form.Item>
            <Form.Item label="证书编号" name="certificateNo">
              <Input placeholder="例如：CERT-001" />
            </Form.Item>
            <Form.Item label="健康证到期日" name="healthCertExpireAt">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="员工状态" name="status">
              <Select options={employeeStatusOptions} />
            </Form.Item>
            <Button htmlType="submit" loading={submitting} type="primary">
              新增员工
            </Button>
          </Form>
        </Card>

        <Card
          title="员工列表"
          extra={
            <Button loading={loading} onClick={() => void loadEmployees()}>
              刷新
            </Button>
          }
        >
          <Table<AdminEmployee>
            columns={columns}
            dataSource={employees}
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
          setEditingEmployee(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        open={Boolean(editingEmployee)}
        title={editingEmployee ? `编辑员工：${editingEmployee.name}` : "编辑员工"}
      >
        <Form<UpdateEmployeeDto>
          form={editForm}
          layout="vertical"
          onFinish={(values) => void handleUpdate(values)}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ required: true, message: "请输入手机号" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="岗位类型"
            name="roleType"
            rules={[{ required: true, message: "请输入岗位类型" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="服务技能" name="skillTags">
            <Input />
          </Form.Item>
          <Form.Item label="证书编号" name="certificateNo">
            <Input />
          </Form.Item>
          <Form.Item label="健康证到期日" name="healthCertExpireAt">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="员工状态" name="status">
            <Select options={employeeStatusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
