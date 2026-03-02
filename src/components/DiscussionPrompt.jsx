/**
 * DiscussionPrompt.jsx
 * An editable textarea displayed during rounds that shows the discussion prompt.
 * Uses sky-blue styling to visually distinguish it from configuration areas.
 */

/**
 * DiscussionPrompt — editable prompt card with sky-blue styling.
 *
 * @param {{
 *   value: string,
 *   onChange: (newValue: string) => void
 * }} props
 *   value    - Current prompt text
 *   onChange - Called when the professor edits the prompt during a session
 */
export default function DiscussionPrompt({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-sky-400" />
        <h3 className="text-sm font-semibold text-sky-700 uppercase tracking-wide">
          Discussion Prompt
        </h3>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50 overflow-hidden">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={9}
          className="w-full bg-transparent px-4 py-3 text-sm text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-2xl"
          aria-label="Discussion prompt"
        />
      </div>

      <p className="text-xs text-slate-400 pl-1">
        You can edit this prompt at any time during the session.
      </p>
    </div>
  );
}
