import { tokens } from '../storage';

const MEMBERS = [
  { name: 'Алекс', role: 'Вокал, гитара' },
  { name: 'Мира', role: 'Клавишные' },
  { name: 'Дан', role: 'Бас-гитара' },
  { name: 'Лея', role: 'Барабаны' },
];

export function renderHome(app: HTMLElement): void {
  const loggedIn = tokens.isLoggedIn();
  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Инди-электроника · Бишкек</p>
      <h1>Neon Echo</h1>
      <p class="lead">Мы играем музыку, в которой неон встречается с эхом. Хочешь играть с нами? Зарегистрируйся как участник группы.</p>
      <div class="actions">
        ${
          loggedIn
            ? '<a class="btn" href="#/profile">Мой профиль</a>'
            : '<a class="btn" href="#/register">Стать участником</a><a class="btn ghost" href="#/login">Войти</a>'
        }
      </div>
    </section>

    <section>
      <h2>Состав</h2>
      <div class="grid">
        ${MEMBERS.map(
          (m) => `<article class="card"><div class="avatar">${m.name[0]}</div><h3>${m.name}</h3><p>${m.role}</p></article>`,
        ).join('')}
      </div>
    </section>
  `;
}
