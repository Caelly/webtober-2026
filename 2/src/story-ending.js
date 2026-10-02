export function createStoryEnding({ onTick, onClose, onGhost, schedule = setTimeout, cancel = clearTimeout }) {
  let timer = null, version = 0;
  function stop() {
    version++;
    if (timer !== null) cancel(timer);
    timer = null;
  }
  function start(verdict) {
    stop();
    const current = version;
    let remaining = 10;
    onGhost(verdict.correct);
    onTick(remaining);
    function tick() {
      if (current !== version) return;
      timer = null; remaining--; onTick(remaining);
      if (remaining === 0) onClose();
      else timer = schedule(tick, 1000);
    }
    timer = schedule(tick, 1000);
  }
  return { start, stop };
}
