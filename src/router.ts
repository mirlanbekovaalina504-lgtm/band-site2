import { tokens } from './storage';
import { renderHome } from './pages/home';
import { renderLogin } from './pages/login';
import { renderProfile } from './pages/profile';
import { renderRegister } from './pages/register';

interface Route {
  render: (app: HTMLElement) => void | Promise<void>;
  /** 'auth' — только для вошедших, 'guest' — только для гостей */
  access?: 'auth' | 'guest';
}

const routes: Record<string, Route> = {
  '/': { render: renderHome },
  '/login': { render: renderLogin, access: 'guest' },
  '/register': { render: renderRegister, access: 'guest' },
  '/profile': { render: renderProfile, access: 'auth' },
};

export function startRouter(app: HTMLElement): void {
  const handle = (): void => {
    const path = location.hash.replace(/^#/, '') || '/';
    const route = routes[path] ?? routes['/'];

    if (route.access === 'auth' && !tokens.isLoggedIn()) {
      location.hash = '#/login';
      return;
    }
    if (route.access === 'guest' && tokens.isLoggedIn()) {
      location.hash = '#/profile';
      return;
    }
    window.scrollTo(0, 0);
    void route.render(app);
  };

  window.addEventListener('hashchange', handle);
  handle();
}
