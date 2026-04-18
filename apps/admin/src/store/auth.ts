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
