/**
 * RosterInput.jsx
 * Accepts student names via textarea paste or CSV file upload.
 * Calls csvParser to normalize input and reports the parsed list upward.
 */

import { useState, useRef } from 'react';
import { parseCsv } from '../utils/csvParser.js';

/**
 * RosterInput — text area + file upload widget for entering student names.
 *
 * @param {{ onRosterChange: (names: string[]) => void }} props
 *   onRosterChange - called whenever the parsed name list changes
 */
export default function RosterInput({ onRosterChange }) {
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState(null);
  const [parsedCount, setParsedCount] = useState(0);
  const fileRef = useRef(null);

  /**
   * handleTextChange — re-parses on every keystroke in the textarea.
   */
  function handleTextChange(e) {
    const val = e.target.value;
    setText(val);
    reparse(val);
  }

  /**
   * reparse — parses the given text string and notifies the parent.
   * @param {string} raw - Raw text to parse
   */
  function reparse(raw) {
    if (!raw.trim()) {
      setParseError(null);
      setParsedCount(0);
      onRosterChange([]);
      return;
    }
    const { names, error } = parseCsv(raw);
    setParseError(error);
    setParsedCount(names.length);
    onRosterChange(names);
  }

  /**
   * handleFileUpload — reads a .csv or .txt file and loads it into the textarea.
   */
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      setText(content);
      reparse(content);
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">
          Student Roster
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-indigo-400 transition-colors"
        >
          Upload CSV / TXT
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload roster file"
        />
      </div>

      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder={`Paste names here — one per line, or CSV with Name / FirstName,LastName columns.\n\nExample:\nAlice Johnson\nBob Smith\nCarla Reyes`}
        rows={8}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-y font-mono leading-relaxed"
      />

      {/* Status feedback */}
      <div className="flex items-center gap-2 min-h-[1.4rem]">
        {parseError && (
          <p className="text-xs text-red-600">{parseError}</p>
        )}
        {!parseError && parsedCount > 0 && (
          <p className="text-xs text-emerald-600 font-medium">
            {parsedCount} student{parsedCount !== 1 ? 's' : ''} loaded
          </p>
        )}
      </div>
    </div>
  );
}
