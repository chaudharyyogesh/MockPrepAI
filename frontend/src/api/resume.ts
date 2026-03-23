import { useAuthStore } from '../store/authStore';

const API_BASE = '/api';

function toFriendlyUploadError(status: number, bodyText: string) {
  try {
    const json = bodyText ? JSON.parse(bodyText) : null;
    const msg =
      (typeof json?.message === 'string' && json.message) ||
      (Array.isArray(json?.message) && json.message.join(', ')) ||
      bodyText;
    if (status === 413) return 'That file is too large (max 10MB).';
    if (status === 400 && /only pdf/i.test(msg)) return msg;
    return msg || `Upload failed (${status}).`;
  } catch {
    if (status === 413) return 'That file is too large (max 10MB).';
    return bodyText || `Upload failed (${status}).`;
  }
}

export async function uploadResume(file: File) {
  const { accessToken } = useAuthStore.getState();
  const form = new FormData();
  form.append('file', file);

  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(toFriendlyUploadError(res.status, text));
  }

  return (await res.json()) as any;
}

