/**
 * Access-токен хранится только в памяти (безопаснее).
 * Refresh-токен лежит в HttpOnly-cookie — JS его не видит, им занимается браузер.
 * В localStorage лежит лишь флаг «сессия была», чтобы после перезагрузки страницы
 * попробовать получить новый access через /api/token/refresh/.
 */
const FLAG = 'band_has_session';

let accessToken: string | null = null;
const listeners = new Set<() => void>();

function readFlag(): boolean {
  try {
    return localStorage.getItem(FLAG) === '1';
  } catch {
    return false;
  }
}

function writeFlag(on: boolean): void {
  try {
    if (on) localStorage.setItem(FLAG, '1');
    else localStorage.removeItem(FLAG);
  } catch {
    /* localStorage недоступен */
  }
}

function emit(): void {
  listeners.forEach((fn) => fn());
}

export const tokens = {
  get access(): string | null {
    return accessToken;
  },
  set(access: string): void {
    accessToken = access;
    writeFlag(true);
    emit();
  },
  clear(): void {
    accessToken = null;
    writeFlag(false);
    emit();
  },
  isLoggedIn(): boolean {
    return accessToken !== null;
  },
  /** Была ли сессия до перезагрузки страницы */
  hasSessionHint(): boolean {
    return readFlag();
  },
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/** Сколько миллисекунд осталось до истечения JWT (null — если не удалось прочитать). */
export function msUntilExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 - Date.now() : null;
  } catch {
    return null;
  }
}
