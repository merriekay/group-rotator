/**
 * App.jsx
 * Top-level state container and phase router for the Group Rotator app.
 *
 * Three phases:
 *   "setup" — SetupPanel: collect roster + config, generate rounds
 *   "round" — RoundView: display groups, timer, and discussion prompt
 *   "done"  — SummaryView: show co-occurrence stats and heatmap
 *
 * All state lives here; child components receive only what they need.
 */

import { useState } from 'react';
import SetupPanel from './components/SetupPanel.jsx';
import RoundView from './components/RoundView.jsx';
import SummaryView from './components/SummaryView.jsx';
import { generateAllRounds } from './utils/groupGenerator.js';

/**
 * App — root component managing global phase and session state.
 */
export default function App() {
  // Current phase: "setup" | "round" | "done"
  const [phase, setPhase] = useState('setup');

  // Session data — populated when the professor clicks "Generate Groups"
  const [students, setStudents] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [discussionPrompt, setDiscussionPrompt] = useState('');

  // Which round we're currently showing (0-based)
  const [roundIdx, setRoundIdx] = useState(0);

  /**
   * handleGenerate — receives validated config from SetupPanel,
   * generates all rounds, and transitions to the "round" phase.
   *
   * @param {{
   *   students: string[],
   *   numGroups: number,
   *   numRounds: number,
   *   timerSeconds: number,
   *   discussionPrompt: string
   * }} config
   */
  function handleGenerate({ students: s, numGroups, numRounds, timerSeconds: t, discussionPrompt: p }) {
    const allRounds = generateAllRounds(s, numGroups, numRounds);
    setStudents(s);
    setRounds(allRounds);
    setTimerSeconds(t);
    setDiscussionPrompt(p);
    setRoundIdx(0);
    setPhase('round');
  }

  /**
   * handleNextRound — advances to the next round.
   */
  function handleNextRound() {
    setRoundIdx(prev => prev + 1);
  }

  /**
   * handleFinish — transitions to the summary phase after the last round.
   */
  function handleFinish() {
    setPhase('done');
  }

  /**
   * handleRestart — resets all state back to the setup phase.
   */
  function handleRestart() {
    setPhase('setup');
    setStudents([]);
    setRounds([]);
    setRoundIdx(0);
    setDiscussionPrompt('');
  }

  if (phase === 'setup') {
    return <SetupPanel onGenerate={handleGenerate} />;
  }

  if (phase === 'round') {
    return (
      <RoundView
        rounds={rounds}
        roundIdx={roundIdx}
        timerSeconds={timerSeconds}
        discussionPrompt={discussionPrompt}
        onPromptChange={setDiscussionPrompt}
        onNextRound={handleNextRound}
        onFinish={handleFinish}
      />
    );
  }

  // phase === 'done'
  return (
    <SummaryView
      students={students}
      rounds={rounds}
      onRestart={handleRestart}
    />
  );
}
