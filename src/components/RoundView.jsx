/**
 * RoundView.jsx
 * Phase 2 UI — displays the current round's group assignments alongside a timer
 * and discussion prompt sidebar. Handles round advancement and session completion.
 */

import GroupCards from './GroupCards.jsx';
import Timer from './Timer.jsx';
import DiscussionPrompt from './DiscussionPrompt.jsx';
import { useTimer } from '../hooks/useTimer.js';
import { useEffect } from 'react';

/**
 * RoundPips — visual round-progress indicator: filled = current, light = done, gray = upcoming.
 *
 * @param {{ total: number, current: number }} props
 *   total   - Total number of rounds
 *   current - Zero-based index of the current round
 */
function RoundPips({ total, current }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Round ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        let cls;
        if (i === current) {
          cls = 'w-3 h-3 rounded-full bg-indigo-600 shadow-sm';
        } else if (i < current) {
          cls = 'w-2.5 h-2.5 rounded-full bg-indigo-200';
        } else {
          cls = 'w-2.5 h-2.5 rounded-full bg-slate-300';
        }
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}

/**
 * RoundView — main view during the active session.
 *
 * @param {{
 *   rounds: Array<Array<Array<string>>>,
 *   roundIdx: number,
 *   timerSeconds: number,
 *   discussionPrompt: string,
 *   onPromptChange: (value: string) => void,
 *   onNextRound: () => void,
 *   onFinish: () => void
 * }} props
 *   rounds           - All pre-generated rounds (array of groups per round)
 *   roundIdx         - Current round index (0-based)
 *   timerSeconds     - Initial timer duration in seconds
 *   discussionPrompt - Current discussion prompt text
 *   onPromptChange   - Called when professor edits the prompt
 *   onNextRound      - Called to advance to next round
 *   onFinish         - Called when all rounds are complete
 */
export default function RoundView({
  rounds,
  roundIdx,
  timerSeconds,
  discussionPrompt,
  onPromptChange,
  onNextRound,
  onFinish,
}) {
  const { secondsLeft, running, start, pause, reset } = useTimer(timerSeconds);

  const currentGroups = rounds[roundIdx];
  const isLastRound = roundIdx === rounds.length - 1;
  const totalRounds = rounds.length;

  // Auto-reset the timer when the round index changes
  useEffect(() => {
    reset(timerSeconds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, timerSeconds]);

  function handleNext() {
    reset(timerSeconds);
    if (isLastRound) {
      onFinish();
    } else {
      onNextRound();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-slate-900">Group Rotator</h1>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm font-semibold text-indigo-700">
            Round {roundIdx + 1} of {totalRounds}
          </span>
          <RoundPips total={totalRounds} current={roundIdx} />
        </div>

        <button
          onClick={handleNext}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          {isLastRound ? 'Finish Session →' : `Next Round →`}
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0">
        {/* Group cards area */}
        <main className="flex-1 px-6 py-6 overflow-auto">
          <GroupCards groups={currentGroups} tableLabel="Table" />
        </main>

        {/* Right sidebar: Timer + Prompt */}
        <aside className="w-full lg:w-72 xl:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 px-6 py-6 flex flex-col gap-8 shrink-0">
          <Timer
            secondsLeft={secondsLeft}
            totalSeconds={timerSeconds}
            running={running}
            onStart={start}
            onPause={pause}
            onReset={() => reset(timerSeconds)}
          />

          <hr className="border-slate-100" />

          <DiscussionPrompt value={discussionPrompt} onChange={onPromptChange} />
        </aside>
      </div>
    </div>
  );
}
