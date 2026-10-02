import { days } from '../days.js';

export function navigation(currentDay) {
  return `<nav class="header-nav" aria-label="Navigation principale">
    <button class="concept-link" id="open-concept">Le concept <span>↗</span></button>
    <span class="header-divider"></span>
    <details class="day-picker" id="day-picker">
      <summary class="challenge-badge"><span class="status-dot"></span> Webtober <svg class="picker-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></summary>
      <div class="day-menu"><a class="gallery-menu-link" href="/">Tous les thèmes <span aria-hidden="true">↗</span></a><span class="day-menu-heading">OCTOBRE 2026 · 31 THÈMES</span>
        <ol class="day-list">${days.map(day => `<li>${day.unlocked
          ? `<a href="/${day.number}"${day.number === currentDay ? ' aria-current="page"' : ''}><span class="day-number">${String(day.number).padStart(2, '0')}</span><span>${day.theme}</span><span class="day-mark" aria-hidden="true">↗</span></a>`
          : `<button disabled aria-label="Jour ${day.number} : ${day.theme}, verrouillé"><span class="day-number">${String(day.number).padStart(2, '0')}</span><span>${day.theme}</span><svg class="day-lock" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4" y="7" width="8" height="6" rx="1.5" stroke="currentColor"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor"/></svg></button>`}</li>`).join('')}</ol>
      </div>
    </details>
  </nav>`;
}

export function bindNavigation() {
  const picker = document.querySelector('#day-picker');
  document.addEventListener('click', event => { if (!picker.contains(event.target)) picker.open = false; });
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.stopPropagation(); picker.open = false; picker.querySelector('summary').focus(); }
  });
}
