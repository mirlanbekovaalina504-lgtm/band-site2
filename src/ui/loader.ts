/** Глобальный индикатор загрузки: полоска сверху + плашка «Загрузка…». */
let pending = 0;
let showTimer: number | undefined;

function apply(active: boolean): void {
  document.getElementById('loader-bar')?.classList.toggle('active', active);
  document.getElementById('loader-pill')?.classList.toggle('active', active);
}

export const loader = {
  start(): void {
    pending++;
    if (pending === 1) {
      // небольшая задержка, чтобы плашка не мигала на быстрых запросах
      showTimer = window.setTimeout(() => apply(true), 150);
    }
  },
  stop(): void {
    pending = Math.max(0, pending - 1);
    if (pending === 0) {
      window.clearTimeout(showTimer);
      apply(false);
    }
  },
};
