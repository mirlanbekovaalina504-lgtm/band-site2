import { DEFAULT_SPECIALIZATIONS, ENDPOINTS, type Option } from '../config';
import { tokens } from '../storage';
import { refreshTokens, request } from './http';

export interface ProfileData {
  first_name: string;
  specialization: string;
  specialization_display?: string;
  bio: string;
  fee: string | null;
}

export interface User {
  id: number;
  username: string;
  profile: ProfileData;
}

interface LoginResponse {
  access: string;
  user: User;
}

/** POST /api/login/ — {username, password} → {access, user}; refresh сервер кладёт в cookie. */
export async function login(username: string, password: string): Promise<User> {
  const data = await request<LoginResponse>(ENDPOINTS.login, {
    method: 'POST',
    body: { username, password },
  });
  if (!data.access) throw new Error('Сервер не вернул токен доступа.');
  tokens.set(data.access);
  return data.user;
}

/** POST /api/register/ — создаёт пользователя (токенов не возвращает), поэтому сразу входим. */
export async function register(values: Record<string, string>): Promise<void> {
  await request(ENDPOINTS.register, { method: 'POST', body: values });
  await login(values.username, values.password);
}

/** POST /api/logout/ — сервер удаляет cookie с refresh. Локально выходим в любом случае. */
export async function logout(): Promise<void> {
  try {
    if (tokens.isLoggedIn()) await request(ENDPOINTS.logout, { method: 'POST', auth: true });
  } catch {
    /* сервер не ответил — всё равно выходим локально */
  } finally {
    tokens.clear();
  }
}

export function getProfile(): Promise<User> {
  return request<User>(ENDPOINTS.profile, { auth: true });
}

/** PATCH /api/profile/ — {first_name, specialization, bio, fee} */
export function updateProfile(values: Record<string, string>): Promise<User> {
  return request<User>(ENDPOINTS.profile, { method: 'PATCH', body: values, auth: true });
}

export async function getSpecializations(): Promise<Option[]> {
  try {
    const list = await request<Option[]>(ENDPOINTS.specializations);
    return Array.isArray(list) && list.length ? list : DEFAULT_SPECIALIZATIONS;
  } catch {
    return DEFAULT_SPECIALIZATIONS;
  }
}

/** При загрузке страницы: если раньше входили — пробуем получить новый access по cookie. */
export async function restoreSession(): Promise<void> {
  if (!tokens.hasSessionHint()) return;
  if (!(await refreshTokens())) tokens.clear();
}
