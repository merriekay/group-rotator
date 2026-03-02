/**
 * Timer.jsx
 * Circular SVG countdown timer with start/pause/reset controls.
 * Changes color as time runs low: indigo → amber (≤60s) → red (0s).
 * Displays a warning message when one minute remains.
 */

/**
 * formatTime — converts total seconds into a MM:SS string.
 * @param {number} totalSeconds
 * @returns {string} e.g. "04:30"
 */
function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Timer — circular SVG countdown display with control buttons.
 *
 * @param {{
 *   secondsLeft: number,
 *   totalSeconds: number,
 *   running: boolean,
 *   onStart: () => void,
 *   onPause: () => void,
 *   onReset: () => void
 * }} props
 *   secondsLeft  - Current remaining seconds (from useTimer)
 *   totalSeconds - Original duration (used to calculate ring fill)
 *   running      - Whether the timer is currently ticking
 *   onStart      - Callback to start/resume
 *   onPause      - Callback to pause
 *   onReset      - Callback to reset to initial duration
 */
export default function Timer({ secondsLeft, totalSeconds, running, onStart, onPause, onReset }) {
  // SVG ring geometry
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Progress: 1.0 = full ring, 0.0 = empty
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Color thresholds
  const isExpired = secondsLeft <= 0;
  const isWarning = secondsLeft <= 60 && !isExpired;

  const ringColor = isExpired
    ? '#ef4444'   // red-500
    : isWarning
      ? '#f59e0b' // amber-500
      : '#6366f1'; // indigo-500

  const textColor = isExpired
    ? 'text-red-600'
    : isWarning
      ? 'text-amber-600'
      : 'text-indigo-700';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG ring */}
      <div className="relative">
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          className="drop-shadow-sm"
          aria-label={`Timer: ${formatTime(secondsLeft)} remaining`}
        >
          {/* Background track */}
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          {/* Progress arc — rotated so it starts at top (12 o'clock) */}
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.4s ease' }}
          />
        </svg>

        {/* Time label centered inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-mono font-bold tabular-nums ${textColor}`}>
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* One-minute warning message */}
      {isWarning && (
        <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-center">
          ⚠️ One minute remaining!
        </p>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!running ? (
          <button
            onClick={onStart}
            disabled={isExpired}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {secondsLeft === (totalSeconds) ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={onReset}
          className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
