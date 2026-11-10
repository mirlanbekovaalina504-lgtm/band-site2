# Neon Echo — сайт музыкальной группы (ДЗ 9, JWT)

Регистрация, вход, выход и профиль участника на **TypeScript** (Vite, без фреймворков).
Бэкенд: https://inai-col3.fishrungames.com/api/docs/

## Как устроен JWT

- `POST /api/login/` (`username`, `password`) → `{access, user}`; **refresh-токен сервер кладёт в HttpOnly cookie**;
- access хранится только в памяти и отправляется как `Authorization: Bearer <access>`;
- если access истёк (или вот-вот истечёт, или получен 401) — вызывается `POST /api/token/refresh/` (без тела, refresh берётся из cookie) и запрос повторяется;
- после перезагрузки страницы access восстанавливается тем же refresh-запросом;
- если refresh не сработал — выход и переход на страницу входа;
- `POST /api/logout/` удаляет cookie;
- плашка «Загрузка…» и полоска сверху показываются при любом запросе.

Все запросы идут с `credentials: 'include'`, иначе браузер не передаёт cookie.

Эндпоинты и поля форм — в `src/config.ts`.

## Запуск локально

```bash
npm install
npm run dev
```

## Деплой на GitHub Pages

1. Создайте репозиторий и загрузите проект (ветка `main`).
2. `Settings → Pages → Build and deployment → Source: GitHub Actions`.
3. После push в `main` workflow `.github/workflows/deploy.yml` соберёт и опубликует сайт.

Сайт использует hash-роутинг (`#/login`), поэтому на GitHub Pages работает без доп. настроек.
