import './styles.css';
import { restoreSession } from './api/auth';
import { setSessionExpiredHandler } from './api/http';
import { startRouter } from './router';
import { tokens } from './storage';
import { toast } from './ui/toast';

const nav = document.getElementById('nav')!;
const app = document.getElementById('app')!;

function renderNav(): void {
  nav.innerHTML = tokens.isLoggedIn()
    ? '<a href="#/">Главная</a><a href="#/profile">Профиль</a>'
    : '<a href="#/">Главная</a><a href="#/login">Войти</a><a class="btn small" href="#/register">Регистрация</a>';
}

setSessionExpiredHandler(() => {
  toast('Сессия истекла. Войдите снова.', 'error');
  location.hash = '#/login';
});

tokens.subscribe(renderNav);

async function boot(): Promise<void> {
  // access живёт в памяти, поэтому после перезагрузки получаем новый по refresh-cookie
  await restoreSession();
  renderNav();
  startRouter(app);
}

void boot();
