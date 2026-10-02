import './style.css';
import { days } from '../days.js';
import { themeIllustration } from './themes.js';

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const lock = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4" y="7" width="8" height="6" rx="1.5" stroke="currentColor"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor"/></svg>';

const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
const currentDate = Object.fromEntries(today.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
const leadingBlanks = (new Date(2026, 9, 1).getDay() + 6) % 7;
const cells = Array.from({ length: leadingBlanks }, () => '<li class="cal-cell is-empty" aria-hidden="true"></li>');

for (const day of days) {
  const number = String(day.number).padStart(2, '0');
  const isToday = currentDate.year === 2026 && currentDate.month === 10 && currentDate.day === day.number;
  const preview = day.unlocked
    ? `<div class="cal-frame">${isToday ? '<span class="today-badge">Aujourd’hui</span>' : ''}<iframe src="/${day.number}/?apercu=1" title="Aperçu du jour ${number} : ${day.theme}" tabindex="-1" aria-hidden="true" loading="eager"></iframe></div>`
    : `<div class="cal-sketch">${themeIllustration(day.number)}</div>`;
  const content = `${preview}<div class="cal-meta"><span class="cal-num">${day.number}</span><span class="cal-theme" id="theme-${number}">${day.theme}</span>${day.unlocked ? `<span class="card-arrow">${arrow}</span>` : `<span class="locked-label">${lock}<span class="sr-only">À venir</span></span>`}</div>${day.description ? `<span class="cal-description">${day.description}</span>` : ''}`;
  cells.push(`<li class="cal-cell">${day.unlocked
    ? `<a class="cal-day is-available${isToday ? ' is-today' : ''}" href="/${day.number}" ${isToday ? 'aria-current="date"' : ''} aria-label="${day.number === 1 ? '1er' : day.number} octobre, jour ${number} : ${day.theme}. ${day.description}. Ouvrir l’expérience">${content}</a>`
    : `<article class="cal-day is-locked${isToday ? ' is-today' : ''}" aria-labelledby="theme-${number}">${content}</article>`}</li>`);
}

const trailingBlanks = (7 - (cells.length % 7)) % 7;
for (let index = 0; index < trailingBlanks; index += 1) cells.push('<li class="cal-cell is-empty" aria-hidden="true"></li>');

document.querySelector('#calendar-grid').innerHTML = cells.join('');

const frames = document.querySelectorAll('.cal-frame');
const fitFrame = (frame) => {
  const scale = frame.clientWidth / 1280;
  if (scale > 0) frame.style.setProperty('--preview-scale', String(scale));
};
const frameObserver = new ResizeObserver((entries) => {
  for (const entry of entries) fitFrame(entry.target);
});
frames.forEach((frame) => {
  frameObserver.observe(frame);
  frame.querySelector('iframe').addEventListener('load', () => frame.classList.add('is-ready'));
});

const count = days.filter((day) => day.unlocked).length;
document.querySelector('#available-count').textContent = String(count).padStart(2, '0');
document.querySelector('#progress-caption').textContent = count === 1 ? 'Une première idée à découvrir.' : `${count} expériences à découvrir.`;
document.querySelector('#progress-dots').innerHTML = days.map((day) => `<i class="${day.unlocked ? 'is-filled' : ''}"></i>`).join('');
