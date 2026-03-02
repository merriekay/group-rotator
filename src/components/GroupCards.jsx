/**
 * GroupCards.jsx
 * Renders a responsive grid of table/group cards, each listing the students assigned to it.
 * Each card gets a soft color from a cycling palette of 8 colors.
 */

/** Tailwind color classes cycling through 8 hues for group cards. */
const GROUP_COLORS = [
  { bg: 'bg-indigo-50',  border: 'border-indigo-200', header: 'bg-indigo-100',  label: 'text-indigo-700',  dot: 'bg-indigo-400'  },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'bg-emerald-100', label: 'text-emerald-700', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-50',   border: 'border-amber-200',   header: 'bg-amber-100',   label: 'text-amber-700',   dot: 'bg-amber-400'   },
  { bg: 'bg-rose-50',    border: 'border-rose-200',    header: 'bg-rose-100',    label: 'text-rose-700',    dot: 'bg-rose-400'    },
  { bg: 'bg-cyan-50',    border: 'border-cyan-200',    header: 'bg-cyan-100',    label: 'text-cyan-700',    dot: 'bg-cyan-400'    },
  { bg: 'bg-violet-50',  border: 'border-violet-200',  header: 'bg-violet-100',  label: 'text-violet-700',  dot: 'bg-violet-400'  },
  { bg: 'bg-orange-50',  border: 'border-orange-200',  header: 'bg-orange-100',  label: 'text-orange-700',  dot: 'bg-orange-400'  },
  { bg: 'bg-teal-50',    border: 'border-teal-200',    header: 'bg-teal-100',    label: 'text-teal-700',    dot: 'bg-teal-400'    },
];

/**
 * GroupCards — displays all groups for the current round as colored cards in a responsive grid.
 *
 * @param {{ groups: Array<Array<string>>, tableLabel?: string }} props
 *   groups     - Array of groups (each group is an array of student name strings)
 *   tableLabel - Optional prefix label (e.g. "Table"), defaults to "Group"
 */
export default function GroupCards({ groups, tableLabel = 'Table' }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}
    >
      {groups.map((group, idx) => {
        const colors = GROUP_COLORS[idx % GROUP_COLORS.length];

        return (
          <div
            key={idx}
            className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden shadow-sm`}
          >
            {/* Card header */}
            <div className={`${colors.header} px-4 py-2 flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.label}`}>
                {tableLabel} {idx + 1}
              </span>
            </div>

            {/* Student list */}
            <ul className="px-4 py-3 flex flex-col gap-1.5">
              {group.map((name, nameIdx) => (
                <li key={nameIdx} className="text-sm text-slate-700 leading-snug">
                  {name}
                </li>
              ))}
            </ul>

            {/* Footer: member count */}
            <div className="px-4 pb-2">
              <span className="text-xs text-slate-400">
                {group.length} {group.length === 1 ? 'student' : 'students'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
