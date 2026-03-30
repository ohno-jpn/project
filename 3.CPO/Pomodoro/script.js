'use strict';

// ── Config ────────────────────────────────────────────────
const MODES = {
  pomodoro: 25 * 60,
  short:     5 * 60,
  long:     15 * 60,
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 96; // ≈ 603.19

// ── State ─────────────────────────────────────────────────
let currentMode     = 'pomodoro';
let totalSeconds    = MODES.pomodoro;
let remainingSeconds = totalSeconds;
let timerId         = null;
let sessionCount    = 1;   // 1–4

// ── DOM refs ──────────────────────────────────────────────
const timeEl    = document.getElementById('time');
const ringEl    = document.getElementById('ring');
const startBtn  = document.getElementById('startBtn');
const stopBtn   = document.getElementById('stopBtn');
const resetBtn  = document.getElementById('resetBtn');
const container = document.querySelector('.container');
const tabs      = document.querySelectorAll('.tab');
const dots      = document.querySelectorAll('.dot');

// ── Helpers ───────────────────────────────────────────────
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateRing() {
  const ratio    = remainingSeconds / totalSeconds;
  const offset   = RING_CIRCUMFERENCE * (1 - ratio);
  ringEl.style.strokeDashoffset = offset;
}

function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i < sessionCount);
  });
}

function setMode(mode) {
  if (timerId) stop();
  currentMode      = mode;
  totalSeconds     = MODES[mode];
  remainingSeconds = totalSeconds;

  tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));

  // Ring colour per mode
  const colours = {
    pomodoro: { stroke: '#00f5ff', shadow: 'rgba(0,245,255,.5)' },
    short:    { stroke: '#39ff14', shadow: 'rgba(57,255,20,.5)' },
    long:     { stroke: '#bf00ff', shadow: 'rgba(191,0,255,.5)' },
  };
  const c = colours[mode];
  ringEl.style.stroke  = c.stroke;
  ringEl.style.filter  = `drop-shadow(0 0 6px ${c.stroke}) drop-shadow(0 0 12px ${c.shadow})`;

  render();
}

function render() {
  timeEl.textContent = formatTime(remainingSeconds);
  updateRing();
  updateDots();
}

// ── Core actions ──────────────────────────────────────────
function start() {
  if (timerId) return;
  container.classList.add('running');

  timerId = setInterval(() => {
    remainingSeconds--;
    render();

    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      container.classList.remove('running');
      onTimerEnd();
    }
  }, 1000);
}

function stop() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
  container.classList.remove('running');
}

function reset() {
  stop();
  remainingSeconds = totalSeconds;
  render();
}

function onTimerEnd() {
  // Advance session count (cycles 1 → 4 → 1)
  if (currentMode === 'pomodoro') {
    sessionCount = sessionCount < 4 ? sessionCount + 1 : 1;
    updateDots();
  }

  // Beep notification
  beep();

  // Flash title
  let flashCount = 0;
  const flashId = setInterval(() => {
    document.title = flashCount % 2 === 0 ? '⏰ Time is up!' : 'POMODORO';
    if (++flashCount >= 6) { clearInterval(flashId); document.title = 'POMODORO'; }
  }, 500);
}

// ── Simple Web Audio beep ─────────────────────────────────
function beep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type      = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  } catch (_) { /* no audio context */ }
}

// ── Event listeners ───────────────────────────────────────
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click',  stop);
resetBtn.addEventListener('click', reset);

tabs.forEach(tab => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

// ── Init ──────────────────────────────────────────────────
ringEl.style.strokeDasharray = RING_CIRCUMFERENCE;
render();
