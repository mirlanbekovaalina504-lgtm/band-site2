import { getProfile, getSpecializations, logout, updateProfile, type User } from '../api/auth';
import { PROFILE_FIELDS, type FieldDef } from '../config';
import { esc, fieldsHtml, readForm, setBusy, showFormError } from '../ui/form';
import { toast } from '../ui/toast';

export async function renderProfile(app: HTMLElement): Promise<void> {
  app.innerHTML = '<section class="panel"><p class="hint">Загружаем профиль…</p></section>';

  let user: User;
  let specs;
  try {
    [user, specs] = await Promise.all([getProfile(), getSpecializations()]);
  } catch (err) {
    // при истёкшей сессии сработает глобальный обработчик и перекинет на вход
    app.innerHTML = `<section class="panel"><h1>Профиль</h1><div class="form-error">${esc(
      (err as Error).message,
    )}</div><button class="btn" id="retry">Повторить</button></section>`;
    app.querySelector('#retry')?.addEventListener('click', () => void renderProfile(app));
    return;
  }

  const fields: FieldDef[] = PROFILE_FIELDS.map((f) =>
    f.name === 'specialization' ? { ...f, options: specs } : f,
  );
  const p = user.profile;
  const name = p.first_name || user.username;
  const values = { username: user.username, ...p };

  app.innerHTML = `
    <section class="panel">
      <div class="profile-head">
        <div class="avatar big">${esc(name[0]?.toUpperCase() ?? '?')}</div>
        <div>
          <h1>${esc(name)}</h1>
          <p class="hint">${esc(p.specialization_display ?? p.specialization)}${
            p.fee ? ` · гонорар ${esc(p.fee)}` : ''
          }</p>
        </div>
      </div>
      <form id="profile-form" novalidate>
        <div class="form-error" role="alert" hidden></div>
        ${fieldsHtml(fields, values)}
        <div class="actions">
          <button class="btn" type="submit">Сохранить</button>
          <button class="btn ghost" type="button" id="logout-btn">Выйти</button>
        </div>
      </form>
    </section>
  `;

  const form = app.querySelector<HTMLFormElement>('#profile-form')!;
  const saveBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const logoutBtn = form.querySelector<HTMLButtonElement>('#logout-btn')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = readForm(form, fields);
    const missing = fields.filter((f) => f.required && !f.readOnly && !data[f.name]);
    if (missing.length) {
      showFormError(form, `Заполните: ${missing.map((f) => f.label).join(', ')}.`);
      return;
    }
    if (data.fee === '') delete data.fee;

    showFormError(form, null);
    setBusy(saveBtn, true, 'Сохраняем…');
    try {
      await updateProfile(data);
      toast('Профиль сохранён', 'success');
      await renderProfile(app);
    } catch (err) {
      showFormError(form, (err as Error).message);
    } finally {
      setBusy(saveBtn, false);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    setBusy(logoutBtn, true, 'Выходим…');
    await logout();
    toast('Вы вышли из системы', 'info');
    location.hash = '#/';
  });
}
