import { apiRequest } from './client';

export interface Profile {
  id: string;
  primaryRole: string;
  experienceLevel: string;
}

export async function getProfile() {
  return apiRequest<Profile | null>('/profile');
}

export async function upsertProfile(payload: {
  primaryRole: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
  techStack?: any;
  targetCompanies?: any;
}) {
  return apiRequest<Profile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

