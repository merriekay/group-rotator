/**
 * SetupPanel.jsx
 * Phase 1 UI — collects student roster and session configuration, then kicks off
 * round generation. Validates inputs before calling onGenerate.
 */

import { useState } from "react";
import RosterInput from "./RosterInput.jsx";

const DEFAULT_PROMPT = `1. Introduce yourself (name, major(s)/minor(s), year, etc)
\n2.  Relevant experience, procrastination scale, group work style/preferences,  etc \n
3. An idea you might want to work on
`;

/**
 * SetupPanel — form for configuring a group-rotation session.
 *
 * @param {{ onGenerate: (config: object) => void }} props
 *   onGenerate - called with { students, numGroups, numRounds, timerSeconds, discussionPrompt }
 *                when the user submits valid input
 */
export default function SetupPanel({ onGenerate }) {
  const [students, setStudents] = useState([]);
  const [numGroups, setNumGroups] = useState(8);
  const [numRounds, setNumRounds] = useState(4);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [discussionPrompt, setDiscussionPrompt] = useState(DEFAULT_PROMPT);
  const [error, setError] = useState(null);

  /**
   * validate — checks all inputs and returns an error string, or null if valid.
   * @returns {string|null}
   */
  function validate() {
    if (students.length < 2) {
      return "Please enter at least 2 students.";
    }
    if (numGroups < 1 || numGroups > students.length) {
      return `Number of groups must be between 1 and ${students.length} (number of students).`;
    }
    if (numRounds < 1) {
      return "Number of rounds must be at least 1.";
    }
    if (timerMinutes < 0.5) {
      return "Timer must be at least 0.5 minutes.";
    }
    return null;
  }

  /**
   * handleSubmit — validates and calls onGenerate with the collected config.
   */
  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onGenerate({
      students,
      numGroups: Number(numGroups),
      numRounds: Number(numRounds),
      timerSeconds: Math.round(Number(timerMinutes) * 60),
      discussionPrompt,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Group Rotator</h1>
          <p className="mt-2 text-slate-500 text-sm">
            Speed-dating style group formations that minimize repeated pairings.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-8"
        >
          {/* Roster */}
          <section>
            <RosterInput onRosterChange={setStudents} />
          </section>

          <hr className="border-slate-100" />

          {/* Session config */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
              Session Configuration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Number of Groups */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="numGroups"
                  className="text-sm font-medium text-slate-700"
                >
                  Groups
                </label>
                <input
                  id="numGroups"
                  type="number"
                  min={1}
                  max={students.length || 100}
                  value={numGroups}
                  onChange={(e) => setNumGroups(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-slate-800"
                />
                {students.length > 0 && (
                  <span className="text-xs text-slate-400">
                    ~{Math.ceil(students.length / Math.max(1, numGroups))}{" "}
                    students/group
                  </span>
                )}
              </div>

              {/* Number of Rounds */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="numRounds"
                  className="text-sm font-medium text-slate-700"
                >
                  Rounds
                </label>
                <input
                  id="numRounds"
                  type="number"
                  min={1}
                  value={numRounds}
                  onChange={(e) => setNumRounds(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-slate-800"
                />
              </div>

              {/* Timer Minutes */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="timerMinutes"
                  className="text-sm font-medium text-slate-700"
                >
                  Minutes / Round
                </label>
                <input
                  id="timerMinutes"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-slate-800"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Discussion prompt */}
          <section>
            <label
              htmlFor="prompt"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Discussion Prompt
            </label>
            <textarea
              id="prompt"
              value={discussionPrompt}
              onChange={(e) => setDiscussionPrompt(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-y leading-relaxed"
            />
          </section>

          {/* Error callout */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Generate Groups →
          </button>
        </form>
      </div>
    </div>
  );
}
