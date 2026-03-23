import { apiRequest } from './client';
import { useAuthStore } from '../store/authStore';

type MeResponse = {
  id: string;
  email: string;
  role: string;
  name?: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function refreshSession() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error('No refresh token');

  return apiRequest<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function checkSession() {
  const store = useAuthStore.getState();

  // Nothing persisted → no session to check.
  if (!store.accessToken && !store.refreshToken) {
    useAuthStore.getState().setUser(null);
    return;
  }

  useAuthStore.getState().setCheckingSession(true);
  try {
    // If access token is expired, /user/me will 401; we then try refresh.
    try {
      const me = await apiRequest<MeResponse>('/user/me');
      useAuthStore.getState().setUser({
        id: me.id,
        email: me.email,
        role: me.role,
        name: store.user?.name,
      });
      return;
    } catch {
      // fallthrough to refresh
    }

    const tokens = await refreshSession();
    // Save refreshed tokens; user will be re-set after /me.
    useAuthStore.getState().setAuth(
      store.user || { id: 'unknown', email: 'unknown', role: 'candidate' },
      tokens.accessToken,
      tokens.refreshToken,
    );

    const me = await apiRequest<MeResponse>('/user/me');
    useAuthStore.getState().setUser({
      id: me.id,
      email: me.email,
      role: me.role,
      name: store.user?.name,
    });
  } finally {
    useAuthStore.getState().setCheckingSession(false);
  }
}

