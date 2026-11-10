import { login } from '../api/auth';
import { setBusy, showFormError } from '../ui/form';
import { toast } from '../ui/toast';

export function renderLogin(app: HTMLElement): void {
  app.innerHTML = `
    <section class="panel">
      <h1>Вход</h1>
      <form id="login-form" novalidate>
        <div class="form-error" role="alert" hidden></div>
        <label class="field"><span>Логин</span>
          <input name="username" type="text" autocomplete="username" required />
        </label>
        <label class="field"><span>Пароль</span>
          <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <button class="btn" type="submit">Войти</button>
      </form>
      <p class="hint">Нет аккаунта? <a href="#/register">Зарегистрироваться</a></p>
    </section>
  `;

  const form = app.querySelector<HTMLFormElement>('#login-form')!;
  const button = form.querySelector<HTMLButtonElement>('button')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (form.elements.namedItem('username') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    if (!username || !password) {
      showFormError(form, 'Заполните все поля.');
      return;
    }
    showFormError(form, null);
    setBusy(button, true, 'Входим…');
    try {
      await login(username, password);
      toast('Вы вошли в систему', 'success');
      location.hash = '#/profile';
    } catch (err) {
      showFormError(form, (err as Error).message);
    } finally {
      setBusy(button, false);
    }
  });
}
