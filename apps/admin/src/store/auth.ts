import type {
  AdminContentPageSummary,
  AdminEditableContentPage,
  UpdateContentPageDto,
} from "../../../../packages/contracts/src/content";
import type { DashboardSummaryDto } from "../../../../packages/contracts/src/dashboard";
import type {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../../../../packages/contracts/src/employee";
import type {
  AssignOrderEmployeeDto,
  CreateOrderDto,
} from "../../../../packages/contracts/src/order";
import type {
  CreateServiceStandardDto,
  ServiceStandardDto,
  UpdateServiceStandardDto,
} from "../../../../packages/contracts/src/standard";

export interface AuthUser {
  id: number;
  username: string;
  roleCode: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

interface LoginPayload {
  username: string;
  password: string;
}

export interface AdminLead {
  id: number;
  source: string;
  contactName: string;
  phone: string;
  serviceType: string;
  expectedTime: string | null;
  address?: string | null;
  remark?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomer {
  id: number;
  name: string;
  phone: string;
  level: string;
  source?: string | null;
  tags?: string | null;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEmployee {
  id: number;
  name: string;
  phone: string;
  roleType: string;
  skillTags?: string | null;
  certificateNo?: string | null;
  healthCertExpireAt?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: number;
  orderNo: string;
  customerId: number;
  leadId?: number | null;
  customerName?: string;
  serviceType: string;
  serviceItemName: string;
  serviceDate: string;
  amount: number;
  status: string;
  paymentStatus: string;
  assignedEmployeeId?: number | null;
  assignedEmployeeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderDetail extends AdminOrder {
  customerPhone?: string;
  assignedEmployeePhone?: string;
}

const STORAGE_KEY = "housekeeping-admin-auth";
const DEFAULT_API_BASE_URL = "http://localhost:3200";

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function getRequiredSession(): AuthSession {
  const session = getStoredSession();

  if (!session) {
    throw new Error("登录状态已失效，请重新登录");
  }

  return session;
}

async function authorizedJsonRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getRequiredSession();
  const headers = new Headers(init?.headers);

  headers.set("Authorization", `Bearer ${session.accessToken}`);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredSession();
      throw new Error("登录状态已失效，请重新登录");
    }

    throw new Error("请求失败，请稍后重试");
  }

  return (await response.json()) as T;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("登录失败，请检查账号或密码");
  }

  const session = (await response.json()) as AuthSession;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  clearStoredSession();
}

export function fetchLeads() {
  return authorizedJsonRequest<AdminLead[]>("/api/admin/leads");
}

export function fetchDashboardSummary() {
  return authorizedJsonRequest<DashboardSummaryDto>("/api/admin/dashboard/summary");
}

export function convertLeadToCustomer(id: number) {
  return authorizedJsonRequest<AdminCustomer>(`/api/admin/leads/${id}/convert-customer`, {
    method: "POST",
  });
}

export function fetchCustomers() {
  return authorizedJsonRequest<AdminCustomer[]>("/api/admin/customers");
}

export function fetchEmployees() {
  return authorizedJsonRequest<AdminEmployee[]>("/api/admin/employees");
}

export function fetchContentPages() {
  return authorizedJsonRequest<AdminContentPageSummary[]>("/api/admin/content/pages");
}

export function fetchContentPage(pageKey: string) {
  return authorizedJsonRequest<AdminEditableContentPage>(
    `/api/admin/content/pages/${pageKey}`,
  );
}

export function updateContentPage(
  pageKey: string,
  payload: UpdateContentPageDto,
) {
  return authorizedJsonRequest<AdminEditableContentPage>(
    `/api/admin/content/pages/${pageKey}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function fetchServiceStandards() {
  return authorizedJsonRequest<ServiceStandardDto[]>("/api/admin/standards");
}

export function createServiceStandard(payload: CreateServiceStandardDto) {
  return authorizedJsonRequest<ServiceStandardDto>("/api/admin/standards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateServiceStandard(
  id: number,
  payload: UpdateServiceStandardDto,
) {
  return authorizedJsonRequest<ServiceStandardDto>(`/api/admin/standards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createEmployee(payload: CreateEmployeeDto) {
  return authorizedJsonRequest<AdminEmployee>("/api/admin/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEmployee(id: number, payload: UpdateEmployeeDto) {
  return authorizedJsonRequest<AdminEmployee>(`/api/admin/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createOrder(payload: CreateOrderDto) {
  return authorizedJsonRequest<AdminOrder>("/api/admin/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchOrders() {
  return authorizedJsonRequest<AdminOrder[]>("/api/admin/orders");
}

export function fetchOrderDetail(id: number) {
  return authorizedJsonRequest<AdminOrderDetail>(`/api/admin/orders/${id}`);
}

export function assignOrderEmployee(
  id: number,
  payload: AssignOrderEmployeeDto,
) {
  return authorizedJsonRequest<AdminOrder>(`/api/admin/orders/${id}/assign`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
