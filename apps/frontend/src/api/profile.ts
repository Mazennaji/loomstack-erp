import { api } from '../lib/api';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  tenantId: string;
  createdAt: string;
}

export async function getProfile(): Promise<Profile> {
  const res = await api.get('/users/me');
  return res.data;
}

export async function updateProfile(data: {
  name?: string;
  email?: string;
  avatarUrl?: string;
}): Promise<Profile> {
  const res = await api.patch('/users/me', data);
  return res.data;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await api.post('/users/me/password', data);
  return res.data;
}

export async function uploadAvatar(file: File): Promise<{ id: string; avatarUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}