# Group Rotator
_This is a Claude-generated front-end-only (for now) tool for me to use in my classes to facilitate a 'speed dating' approach to project group formation._

Here is the prompt I gave to Claude Code to create: 
```
Build a local-only React + Vite front-end app called "group-rotator". 
No backend. No authentication. Use Tailwind CSS v4 (@tailwindcss/vite plugin). 
No external component libraries — all UI is custom. No PapaParse dependency — 
implement CSV parsing inline.

## Purpose
A classroom tool for a professor to run "speed-dating" style group formation 
activities. Students rotate through groups across multiple rounds, and the app 
minimizes repeated pairings between students.

## File Structure
Scaffold the following modules:

src/
  App.jsx                         # Top-level state, phase routing
  utils/
    groupGenerator.js             # Shuffle, co-occurrence matrix, greedy assignment, generateAllRounds
    csvParser.js                  # Inline CSV parser (no PapaParse) — handles Name or FirstName/LastName columns
    audio.js                      # Web Audio API beep utility (fail silently if unavailable)
  hooks/
    useTimer.js                   # Countdown timer hook: { secondsLeft, running, start, pause, reset }
  components/
    SetupPanel.jsx                # Phase 1: roster input + session config form
    RosterInput.jsx               # Textarea paste + CSV file upload, calls csvParser
    GroupCards.jsx                # Grid of table cards showing student assignments
    Timer.jsx                     # Circular SVG countdown + start/pause/reset controls
    DiscussionPrompt.jsx          # Editable textarea with sky-blue styling
    RoundView.jsx                 # Phase 2: GroupCards + Timer + DiscussionPrompt sidebar + Next Round button
    SummaryView.jsx               # Phase 3: stats cards + co-occurrence heatmap + restart

## Algorithm (implement in utils/groupGenerator.js)
- buildCoMatrix(completedRounds, students): returns pairwise co-occurrence counts
- shuffle(arr): Fisher-Yates, returns new array
- generateRound(students, numGroups, coMatrix): greedy assignment — for each 
  student (shuffled), assign to the open group with lowest sum of co-occurrence 
  scores with current members. Tie-break by group size. Handle uneven sizes by 
  distributing remainder to first N groups.
- generateAllRounds(students, numGroups, numRounds): calls generateRound 
  sequentially, feeding prior rounds into buildCoMatrix each time.

## useTimer hook (hooks/useTimer.js)
- Accepts initialSeconds
- Returns { secondsLeft, running, start, pause, reset(optionalNewDuration) }
- Fires audio: single beep at 60s remaining, triple beep at 0
- Cleans up interval on unmount

## App state & phases
Three phases managed in App.jsx:
1. "setup"  — SetupPanel collects: students[], numGroups, numRounds, 
               timerMinutes, discussionPrompt. Validates before generating.
2. "round"  — RoundView shows current round groups + timer + prompt. 
               "Next Round" advances roundIdx or transitions to "done".
               Timer resets automatically on round advance.
3. "done"   — SummaryView shows co-occurrence stats and optional heatmap.

## Timer component
- Circular SVG progress ring (r=54, 128x128 viewBox)
- Color: indigo normally, amber at ≤60s, red at 0
- Shows MM:SS inside the ring
- Buttons: Start / Pause / Reset
- Shows "⚠️ One minute remaining!" warning text when ≤60s

## Default discussion prompt
"👋 Introduce yourself — name, year, and major.

Then discuss:
- What project ideas are you excited to explore this semester?
- What's your preferred group work style? (Structured check-ins vs. flexible 
  async? Like to lead, contribute, or rotate roles?)"

## Default config values
- numGroups: 8
- numRounds: 4
- timerMinutes: 5

## SummaryView
- Show 3 stat cards: unique pairs who met, pairs who never met, pairs who met 2+ times
- Show co-occurrence heatmap table only if students.length <= 20
- Heatmap legend: white=never met, light indigo=once, dark indigo=twice, red=3+
- "Start New Session" button resets to setup phase

## Styling
- Tailwind utility classes throughout
- Color palette: indigo for primary actions, sky blue for discussion prompt, 
  slate for text, per-table soft colors for GroupCards (cycle through 8 colors: 
  indigo, emerald, amber, rose, cyan, violet, orange, teal)
- Rounded cards with subtle shadows
- Responsive grid for GroupCards: auto-fill minmax(170px, 1fr)

## Validation (in SetupPanel before generating)
- students.length >= 2
- 1 <= numGroups <= students.length
- Show inline error message in a red callout box, don't throw

## CSV format accepted (csvParser.js)
- Single column: just names, one per row
- Two columns: FirstName, LastName (detected via header)
- One column: Name (detected via header)
- Ignore blank rows, strip surrounding quotes
- Auto-detect whether first row is a header

## Round progress indicator
Display pip dots in RoundView header — filled indigo for current round, 
light indigo for completed, gray for upcoming.

## Notes
- No localStorage — all state is in-memory React state
- Comments on every function explaining purpose and parameters
- Clean prop interfaces — no prop drilling beyond one level (lift shared state to App.jsx)
- All file imports use relative paths
```
