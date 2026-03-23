import { apiRequest } from './client';
import { useAuthStore } from '../store/authStore';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export async function register(email: string, name: string, password: string) {
  const data = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });
  useAuthStore.getState().setAuth(
    data.user,
    data.accessToken,
    data.refreshToken,
  );
  return data;
}

export async function login(email: string, password: string) {
  const data = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  useAuthStore.getState().setAuth(
    data.user,
    data.accessToken,
    data.refreshToken,
  );
  return data;
}

export async function logout() {
  // We’re using token persistence in localStorage; explicit logout clears local state.
  useAuthStore.getState().clearAuth();
}

