/**
 * audio.js
 * Web Audio API beep utilities for timer alerts.
 * All functions fail silently if the Web Audio API is unavailable or suspended.
 */

/**
 * getAudioContext — lazily creates and returns a shared AudioContext.
 * Returns null if the API is not available in this browser.
 * @returns {AudioContext|null}
 */
let _ctx = null;
function getAudioContext() {
  if (_ctx) return _ctx;
  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    return _ctx;
  } catch {
    return null;
  }
}

/**
 * playBeep — plays a single sine-wave beep at the given frequency and duration.
 * Fails silently if AudioContext is unavailable or in a suspended state.
 *
 * @param {number} frequency - Tone frequency in Hz (default 880)
 * @param {number} duration  - Duration in seconds (default 0.15)
 * @param {number} gain      - Volume 0–1 (default 0.3)
 */
function playBeep(frequency = 880, duration = 0.15, gain = 0.3) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if it was suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    // Fade out near end to avoid click artifacts
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Fail silently — audio is non-critical
  }
}

/**
 * playOneMinuteWarning — single beep to alert that 60 seconds remain.
 * Uses a lower-pitched, slightly longer tone to distinguish from the end signal.
 */
export function playOneMinuteWarning() {
  playBeep(660, 0.25, 0.3);
}

/**
 * playTripleBeep — three rapid beeps to signal time is up.
 * Each beep is separated by a short gap.
 */
export function playTripleBeep() {
  playBeep(880, 0.12, 0.35);
  setTimeout(() => playBeep(880, 0.12, 0.35), 180);
  setTimeout(() => playBeep(1100, 0.2, 0.35), 360);
}
