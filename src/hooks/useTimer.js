/**
 * useTimer.js
 * Custom React hook for a countdown timer with audio alerts.
 * Fires a single beep at 60 seconds remaining and a triple beep when it reaches 0.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { playOneMinuteWarning, playTripleBeep } from '../utils/audio.js';

/**
 * useTimer — countdown timer hook.
 *
 * @param {number} initialSeconds - Starting duration in seconds
 * @returns {{
 *   secondsLeft: number,
 *   running: boolean,
 *   start: () => void,
 *   pause: () => void,
 *   reset: (newDuration?: number) => void
 * }}
 */
export function useTimer(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  // Refs to track state inside the interval without stale closures
  const secondsRef = useRef(secondsLeft);
  const runningRef = useRef(running);
  const intervalRef = useRef(null);

  // Track whether the 60s warning has already fired for this run
  const warnedRef = useRef(false);
  // Track whether the end beep has already fired
  const endedRef = useRef(false);

  // Sync refs whenever state changes
  useEffect(() => {
    secondsRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // Main tick effect — starts/stops interval based on `running`
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          const next = prev - 1;

          // Fire 60-second warning (only once per run)
          if (next === 60 && !warnedRef.current) {
            warnedRef.current = true;
            playOneMinuteWarning();
          }

          // Fire end beep at 0 (only once)
          if (next <= 0 && !endedRef.current) {
            endedRef.current = true;
            playTripleBeep();
            // Stop the timer
            setRunning(false);
            return 0;
          }

          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    // Clean up interval on unmount or when running changes
    return () => clearInterval(intervalRef.current);
  }, [running]);

  /**
   * start — begins or resumes the countdown.
   */
  const start = useCallback(() => {
    if (secondsRef.current > 0) {
      setRunning(true);
    }
  }, []);

  /**
   * pause — pauses the countdown without resetting position.
   */
  const pause = useCallback(() => {
    setRunning(false);
  }, []);

  /**
   * reset — stops the timer and resets to a new or original duration.
   * Also resets the audio warning flags so they'll fire again on the next run.
   * @param {number} [newDuration] - Optional new duration; defaults to initialSeconds
   */
  const reset = useCallback((newDuration) => {
    setRunning(false);
    clearInterval(intervalRef.current);
    const dur = newDuration !== undefined ? newDuration : initialSeconds;
    setSecondsLeft(dur);
    secondsRef.current = dur;
    warnedRef.current = false;
    endedRef.current = false;
  }, [initialSeconds]);

  return { secondsLeft, running, start, pause, reset };
}
