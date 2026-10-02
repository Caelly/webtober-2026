export function verdictFor(story, choice) {
  return { correct: choice === story.isTrue, isTrue: story.isTrue,
    person: story.isTrue ? story.person : null,
    explanation: story.explanation, sources: story.isTrue ? story.sources : [] };
}

export function createQuiz(panel, next) {
  const waiting = panel.querySelector('.quiz-waiting');
  const choices = panel.querySelector('.quiz-choices');
  const result = panel.querySelector('.quiz-result');
  const heading = panel.querySelector('#verdict-heading');
  const identity = panel.querySelector('.verdict-identity');
  const sources = panel.querySelector('.verdict-sources');
  const nextButton = panel.closest('.parchment').querySelector('#next-story');
  const buttons = [...choices.querySelectorAll('button')];
  let story, complete = false, answered = false;
  const line = (tag, text, className) => {
    const element = document.createElement(tag); element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function start(nextStory) {
    story = nextStory; complete = answered = false;
    waiting.hidden = false; choices.hidden = result.hidden = true;
    identity.replaceChildren(); sources.replaceChildren();
    nextButton.parentElement.hidden = true;
    panel.closest('.parchment').classList.remove('is-answered');
    buttons.forEach(button => { button.disabled = false; button.removeAttribute('aria-pressed'); });
  }
  function finish() {
    complete = true; waiting.hidden = true;
    if (!answered) choices.hidden = false;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    if (!complete || answered) return;
    answered = true;
    const verdict = verdictFor(story, button.dataset.choice === 'true');
    heading.textContent = verdict.correct ? 'Bien vu.' : 'Surprenant, non ?';
    panel.querySelector('.verdict-label').textContent = verdict.isTrue ? 'Cette histoire est vraie.' : 'Cette histoire est inventée.';
    panel.querySelector('.verdict-explanation').textContent = verdict.explanation;
    if (verdict.person) {
      identity.append(line('h3', verdict.person.name));
      const dates = line('dl', '', 'verdict-dates');
      const birth = line('div', '', 'date-card'), death = line('div', '', 'date-card');
      birth.append(line('dt', 'Naissance'), line('dd', verdict.person.birth));
      death.append(line('dt', 'Décès'), line('dd', verdict.person.death));
      if (verdict.person.birthNote) birth.append(line('dd', verdict.person.birthNote, 'birth-note'));
      dates.append(birth, death);
      identity.append(dates);
      verdict.sources.forEach(source => {
        const link = line('a', `${source.label} ↗`); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; sources.append(link);
      });
    }
    buttons.forEach(candidate => { candidate.disabled = true; candidate.setAttribute('aria-pressed', String(candidate === button)); });
    choices.hidden = true; result.hidden = false;
    nextButton.parentElement.hidden = false;
    panel.closest('.parchment').classList.add('is-answered');
    const body = panel.closest('.parchment').querySelector('.story-body');
    body.scrollTop = body.scrollHeight;
    heading.focus({preventScroll:true});
  }));
  nextButton.addEventListener('click', () => { if (answered) next(); });
  return { start, finish };
}
