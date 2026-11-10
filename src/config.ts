/**
 * Настройки бэкенда (по Swagger https://inai-col3.fishrungames.com/api/docs/)
 */

export const API_BASE = 'https://inai-col3.fishrungames.com';

export const ENDPOINTS = {
  register: '/api/register/',
  login: '/api/login/',
  refresh: '/api/token/refresh/',
  logout: '/api/logout/',
  profile: '/api/profile/',
  specializations: '/api/specializations/',
} as const;

export interface Option {
  value: string;
  label: string;
}

/** Запасной список специализаций (основной берётся из GET /api/specializations/) */
export const DEFAULT_SPECIALIZATIONS: Option[] = [
  { value: 'vocals', label: 'Вокал' },
  { value: 'guitar', label: 'Гитара' },
  { value: 'bass', label: 'Бас-гитара' },
  { value: 'drums', label: 'Ударные' },
  { value: 'keys', label: 'Клавишные' },
  { value: 'other', label: 'Другое' },
];

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'textarea' | 'select';
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  autocomplete?: string;
  options?: Option[];
}

/** Регистрация: username + password + поля профиля */
export const REGISTER_FIELDS: FieldDef[] = [
  { name: 'username', label: 'Логин', type: 'text', required: true, autocomplete: 'username' },
  { name: 'password', label: 'Пароль', type: 'password', required: true, autocomplete: 'new-password' },
  { name: 'first_name', label: 'Имя', type: 'text', required: true, autocomplete: 'given-name' },
  { name: 'specialization', label: 'Специализация', type: 'select', required: true },
  { name: 'fee', label: 'Гонорар', type: 'number', placeholder: '0.00' },
  { name: 'bio', label: 'О себе', type: 'textarea' },
];

/** Профиль: просмотр и редактирование (PATCH /api/profile/) */
export const PROFILE_FIELDS: FieldDef[] = [
  { name: 'username', label: 'Логин', type: 'text', readOnly: true },
  { name: 'first_name', label: 'Имя', type: 'text', required: true },
  { name: 'specialization', label: 'Специализация', type: 'select', required: true },
  { name: 'fee', label: 'Гонорар', type: 'number', placeholder: '0.00' },
  { name: 'bio', label: 'О себе', type: 'textarea' },
];
