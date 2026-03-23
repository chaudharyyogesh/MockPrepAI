import { useAuthStore } from '../store/authStore';

const API_BASE = '/api';

function toFriendlyApiErrorMessage(input: {
  status: number;
  path: string;
  bodyText: string;
  bodyJson: any | null;
}): string {
  const { status, path, bodyText, bodyJson } = input;

  const rawMessage =
    (typeof bodyJson?.message === 'string' && bodyJson.message) ||
    (Array.isArray(bodyJson?.message) && bodyJson.message.join(', ')) ||
    (typeof bodyText === 'string' && bodyText.trim()) ||
    '';

  // Auth
  if (status === 401) {
    if (/invalid credentials/i.test(rawMessage) || path.includes('/auth/login')) {
      return 'Email not found or wrong password.';
    }
    return 'You are not authorized. Please log in again.';
  }

  // Validation (NestJS often returns message: string[])
  if (status === 400 && Array.isArray(bodyJson?.message)) {
    return 'Please check the form and try again.';
  }

  if (status >= 500) {
    return 'Something went wrong on our side. Please try again.';
  }

  // Fallback: if backend already returns a clean message, show it.
  if (rawMessage) return rawMessage;

  return `Request failed (${status}).`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    let json: any | null = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    throw new Error(
      toFriendlyApiErrorMessage({
        status: res.status,
        path,
        bodyText: text,
        bodyJson: json,
      }),
    );
  }

  if (res.status === 204) {
    return {} as T;
  }

  return (await res.json()) as T;
}

