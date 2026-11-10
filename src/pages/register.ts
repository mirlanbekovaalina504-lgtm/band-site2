import { getSpecializations, register } from '../api/auth';
import { REGISTER_FIELDS, type FieldDef } from '../config';
import { fieldsHtml, readForm, setBusy, showFormError } from '../ui/form';
import { toast } from '../ui/toast';

export async function renderRegister(app: HTMLElement): Promise<void> {
  app.innerHTML = '<section class="panel"><p class="hint">Загрузка формы…</p></section>';

  const specs = await getSpecializations();
  const fields: FieldDef[] = REGISTER_FIELDS.map((f) =>
    f.name === 'specialization' ? { ...f, options: specs } : f,
  );

  app.innerHTML = `
    <section class="panel">
      <h1>Регистрация участника</h1>
      <form id="register-form" novalidate>
        <div class="form-error" role="alert" hidden></div>
        ${fieldsHtml(fields)}
        <label class="field"><span>Повторите пароль *</span>
          <input name="password_repeat" type="password" autocomplete="new-password" required />
        </label>
        <button class="btn" type="submit">Зарегистрироваться</button>
      </form>
      <p class="hint">Уже есть аккаунт? <a href="#/login">Войти</a></p>
    </section>
  `;

  const form = app.querySelector<HTMLFormElement>('#register-form')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const values = readForm(form, fields);
    const repeat = (form.elements.namedItem('password_repeat') as HTMLInputElement).value;

    const missing = fields.filter((f) => f.required && !values[f.name]);
    if (missing.length) {
      showFormError(form, `Заполните: ${missing.map((f) => f.label).join(', ')}.`);
      return;
    }
    if (values.password !== repeat) {
      showFormError(form, 'Пароли не совпадают.');
      return;
    }

    // пустые необязательные поля (гонорар, о себе) не отправляем
    for (const key of Object.keys(values)) if (values[key] === '') delete values[key];

    showFormError(form, null);
    setBusy(button, true, 'Регистрируем…');
    try {
      await register(values);
      toast('Добро пожаловать в группу!', 'success');
      location.hash = '#/profile';
    } catch (err) {
      showFormError(form, (err as Error).message);
    } finally {
      setBusy(button, false);
    }
  });
}
