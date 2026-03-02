/**
 * SummaryView.jsx
 * Phase 3 UI — shows co-occurrence statistics and an optional heatmap
 * (only rendered when the roster is ≤20 students).
 */

import { useMemo } from 'react';
import { buildCoMatrix } from '../utils/groupGenerator.js';

/**
 * HEATMAP_COLORS — maps co-occurrence count to Tailwind background + text classes.
 * white=never, light indigo=once, dark indigo=twice, red=3+
 */
function heatColor(count) {
  if (count === 0) return 'bg-white text-slate-300';
  if (count === 1) return 'bg-indigo-100 text-indigo-600';
  if (count === 2) return 'bg-indigo-500 text-white';
  return 'bg-red-500 text-white';
}

/**
 * StatCard — a single summary statistic displayed in a colored card.
 *
 * @param {{ label: string, value: number, color: string, icon: React.ReactNode }} props
 */
function StatCard({ label, value, color, icon }) {
  return (
    <div className={`rounded-2xl border ${color} p-5 flex items-start gap-4`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/**
 * SummaryView — session-end statistics and optional co-occurrence heatmap.
 *
 * @param {{
 *   students: Array<string>,
 *   rounds: Array<Array<Array<string>>>,
 *   onRestart: () => void
 * }} props
 *   students  - Full roster
 *   rounds    - All completed round group assignments
 *   onRestart - Callback to return to setup phase
 */
export default function SummaryView({ students, rounds, onRestart }) {
  const coMatrix = useMemo(() => buildCoMatrix(rounds, students), [rounds, students]);

  // Compute statistics across all unique pairs
  const stats = useMemo(() => {
    let metOnce = 0;
    let neverMet = 0;
    let metTwicePlus = 0;
    const n = students.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const count = coMatrix[students[i]]?.[students[j]] ?? 0;
        if (count === 0) neverMet++;
        else if (count === 1) metOnce++;
        else metTwicePlus++;
      }
    }

    return { metOnce, neverMet, metTwicePlus };
  }, [coMatrix, students]);

  const showHeatmap = students.length <= 20;

  // Shorten long names for heatmap axis labels
  function shortName(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}. ${parts[parts.length - 1]}`;
    }
    return name.length > 10 ? name.slice(0, 10) + '…' : name;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Session Complete!</h1>
          <p className="mt-2 text-slate-500 text-sm">
            {rounds.length} round{rounds.length !== 1 ? 's' : ''} completed — {students.length} students
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Unique pairs who met"
            value={stats.metOnce + stats.metTwicePlus}
            color="border-emerald-200 bg-emerald-50"
            icon="🤝"
          />
          <StatCard
            label="Pairs who never met"
            value={stats.neverMet}
            color="border-slate-200 bg-white"
            icon="👥"
          />
          <StatCard
            label="Pairs who met 2+ times"
            value={stats.metTwicePlus}
            color="border-amber-200 bg-amber-50"
            icon="🔄"
          />
        </div>

        {/* Heatmap */}
        {showHeatmap ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-auto">
            <h2 className="text-base font-bold text-slate-800 mb-1">Co-occurrence Heatmap</h2>
            <p className="text-xs text-slate-400 mb-4">How many times each pair of students shared a group.</p>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {[
                { label: 'Never met', cls: 'bg-white border border-slate-200' },
                { label: 'Met once', cls: 'bg-indigo-100' },
                { label: 'Met twice', cls: 'bg-indigo-500' },
                { label: 'Met 3×+', cls: 'bg-red-500' },
              ].map(({ label, cls }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded ${cls} shrink-0`} />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            <div className="overflow-auto">
              <table className="border-collapse text-xs">
                <thead>
                  <tr>
                    {/* Top-left corner cell */}
                    <th className="w-8 h-8" />
                    {students.map((s, j) => (
                      <th key={j} className="w-8 h-8 p-0">
                        <div
                          className="text-slate-500 font-medium"
                          style={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            whiteSpace: 'nowrap',
                            maxHeight: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={s}
                        >
                          {shortName(s)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((rowStudent, i) => (
                    <tr key={i}>
                      {/* Row label */}
                      <td
                        className="pr-2 text-right text-slate-500 font-medium whitespace-nowrap"
                        title={rowStudent}
                      >
                        {shortName(rowStudent)}
                      </td>
                      {students.map((colStudent, j) => {
                        if (i === j) {
                          // Diagonal
                          return (
                            <td key={j} className="w-8 h-8 p-0.5">
                              <div className="w-full h-full rounded bg-slate-100" />
                            </td>
                          );
                        }
                        const count = coMatrix[rowStudent]?.[colStudent] ?? 0;
                        return (
                          <td key={j} className="w-8 h-8 p-0.5" title={`${rowStudent} & ${colStudent}: ${count}`}>
                            <div className={`w-full h-full rounded flex items-center justify-center font-semibold ${heatColor(count)}`}>
                              {count > 0 ? count : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-400 text-sm">
            Heatmap hidden — available for classes of 20 or fewer students.
          </div>
        )}

        {/* Restart */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}
