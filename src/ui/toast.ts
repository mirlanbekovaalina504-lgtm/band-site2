export function toast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  const box = document.getElementById('toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  box.appendChild(el);
  window.setTimeout(() => el.remove(), 4000);
}
