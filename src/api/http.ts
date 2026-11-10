import { API_BASE, ENDPOINTS } from '../config';
import { msUntilExpiry, tokens } from '../storage';
import { loader } from '../ui/loader';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Нужен ли заголовок Authorization: Bearer <access> */
  auth?: boolean;
}

let onSessionExpired: () => void = () => {};
export function setSessionExpiredHandler(fn: () => void): void {
  onSessionExpired = fn;
}

/** Разворачивает ошибки DRF ({detail}, {поле: [..]}, вложенные объекты) в читаемый текст. */
function flatten(value: unknown, prefix = ''): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') return [prefix ? `${prefix}: ${value}` : value];
  if (Array.isArray(value)) return value.flatMap((v) => flatten(v, prefix));
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      flatten(v, k === 'non_field_errors' || k === 'detail' ? '' : k),
    );
  }
  return [String(value)];
}

function errorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim() && !data.trim().startsWith('<')) return data;
  const parts = typeof data === 'object' ? flatten(data) : [];
  if (parts.length) return parts.join('\n');
  if (status === 0) return 'Нет связи с сервером. Проверьте интернет.';
  if (status >= 500) return 'Ошибка на сервере. Попробуйте позже.';
  return `Ошибка запроса (${status})`;
}

async function send(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  try {
    return await fetch(API_BASE + path, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      // refresh-токен лежит в HttpOnly cookie — без этого браузер её не отправит и не сохранит
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, errorMessage(null, 0));
  }
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) throw new ApiError(res.status, errorMessage(data, res.status), data);
  return data as T;
}

/**
 * POST /api/token/refresh/ — тело не нужно, сервер сам читает refresh из cookie
 * и возвращает {access}. Параллельные вызовы используют один и тот же запрос.
 */
let refreshing: Promise<boolean> | null = null;

export function refreshTokens(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await send(ENDPOINTS.refresh, { method: 'POST' });
      if (!res.ok) return false;
      const data = (await res.json()) as { access?: string };
      if (!data.access) return false;
      tokens.set(data.access);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

function expire(): never {
  tokens.clear();
  onSessionExpired();
  throw new ApiError(401, 'Сессия истекла. Войдите снова.');
}

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  loader.start();
  try {
    // Заранее обновляем access, если его нет или он вот-вот истечёт
    if (opts.auth) {
      const left = msUntilExpiry(tokens.access);
      if (left === null || left < 10_000) {
        if (!(await refreshTokens())) expire();
      }
    }

    let res = await send(path, opts);

    // Access протух → обновляем и повторяем запрос один раз
    if (res.status === 401 && opts.auth) {
      if (!(await refreshTokens())) expire();
      res = await send(path, opts);
      if (res.status === 401) expire();
    }
    return await parse<T>(res);
  } finally {
    loader.stop();
  }
}
