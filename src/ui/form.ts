import type { FieldDef } from '../config';

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fieldsHtml(fields: FieldDef[], values: Record<string, unknown> = {}): string {
  return fields
    .map((f) => {
      const raw = String(values[f.name] ?? '');
      const common = `id="f-${f.name}" name="${f.name}" ${f.required ? 'required' : ''} ${
        f.readOnly ? 'readonly' : ''
      } ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${
        f.autocomplete ? `autocomplete="${f.autocomplete}"` : ''
      }`;

      let control: string;
      if (f.type === 'textarea') {
        control = `<textarea ${common} rows="4">${esc(raw)}</textarea>`;
      } else if (f.type === 'select') {
        const options = (f.options ?? [])
          .map(
            (o) =>
              `<option value="${esc(o.value)}" ${o.value === raw ? 'selected' : ''}>${esc(o.label)}</option>`,
          )
          .join('');
        control = `<select ${common}>${options}</select>`;
      } else if (f.type === 'number') {
        control = `<input type="number" step="0.01" min="0" ${common} value="${esc(raw)}" />`;
      } else {
        control = `<input type="${f.type}" ${common} value="${esc(raw)}" />`;
      }
      return `<label class="field" for="f-${f.name}"><span>${esc(f.label)}${
        f.required ? ' *' : ''
      }</span>${control}</label>`;
    })
    .join('');
}

/** Собирает значения формы (поля readOnly не отправляем). */
export function readForm(form: HTMLFormElement, fields: FieldDef[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const f of fields) {
    if (f.readOnly) continue;
    const el = form.elements.namedItem(f.name) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | null;
    if (el) result[f.name] = f.type === 'password' ? el.value : el.value.trim();
  }
  return result;
}

export function setBusy(button: HTMLButtonElement, busy: boolean, busyText = 'Подождите…'): void {
  if (busy) {
    button.dataset.label = button.textContent ?? '';
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.label ?? button.textContent;
    button.disabled = false;
  }
}

export function showFormError(form: HTMLFormElement, message: string | null): void {
  const box = form.querySelector<HTMLElement>('.form-error');
  if (!box) return;
  box.textContent = message ?? '';
  box.hidden = !message;
}
