/**
 * csvParser.js
 * Inline CSV parser — no external dependencies.
 * Handles single-column name lists, "Name" column, and "FirstName"/"LastName" columns.
 * Strips surrounding quotes, ignores blank rows, auto-detects headers.
 */

/**
 * parseCsvRow — splits a raw CSV line into an array of trimmed, unquoted field strings.
 * Handles fields wrapped in double quotes (including fields with embedded commas).
 * @param {string} line - A single CSV row string
 * @returns {Array<string>} Array of field strings
 */
function parseCsvRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double-quote inside a quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * looksLikeHeader — heuristic to decide if the first row is a header.
 * Returns true if the first field matches known header keywords (case-insensitive).
 * @param {Array<string>} firstRow - Parsed fields from the first CSV row
 * @returns {boolean}
 */
function looksLikeHeader(firstRow) {
  const knownHeaders = ['name', 'firstname', 'first name', 'first_name', 'lastname', 'last name', 'last_name', 'student'];
  return firstRow.some(f => knownHeaders.includes(f.toLowerCase()));
}

/**
 * parseCsv — parses raw CSV text (from textarea paste or file upload) into an array of
 * student name strings. Supports three formats:
 *   1. Single column, no header: each row is a name
 *   2. Single column with "Name" header: uses that column
 *   3. Two columns with "FirstName"/"LastName" headers: concatenates them
 *
 * Blank rows are ignored. Surrounding whitespace is stripped.
 *
 * @param {string} text - Raw CSV text content
 * @returns {{ names: Array<string>, error: string|null }} Parsed names or an error message
 */
export function parseCsv(text) {
  if (!text || !text.trim()) {
    return { names: [], error: 'Input is empty.' };
  }

  // Split into non-empty lines
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.filter(l => l.trim() !== '');

  if (lines.length === 0) {
    return { names: [], error: 'No non-empty lines found.' };
  }

  // Parse all rows
  const rows = lines.map(parseCsvRow);
  const firstRow = rows[0];

  // Detect if first row is a header
  const hasHeader = looksLikeHeader(firstRow);
  const dataRows = hasHeader ? rows.slice(1) : rows;

  let names = [];

  if (hasHeader) {
    // Identify column indices by matching header names
    const headers = firstRow.map(h => h.toLowerCase().replace(/[\s_]/g, ''));

    const nameIdx = headers.indexOf('name');
    const firstIdx = headers.findIndex(h => h === 'firstname');
    const lastIdx = headers.findIndex(h => h === 'lastname');

    if (firstIdx !== -1 && lastIdx !== -1) {
      // FirstName + LastName columns
      names = dataRows
        .map(row => {
          const first = row[firstIdx] ?? '';
          const last = row[lastIdx] ?? '';
          return `${first} ${last}`.trim();
        })
        .filter(n => n.length > 0);
    } else if (nameIdx !== -1) {
      // Single "Name" column
      names = dataRows
        .map(row => row[nameIdx] ?? '')
        .map(n => n.trim())
        .filter(n => n.length > 0);
    } else {
      // Unknown header — treat the first column as names
      names = dataRows
        .map(row => row[0] ?? '')
        .map(n => n.trim())
        .filter(n => n.length > 0);
    }
  } else {
    // No header — single column of names (or first column if multi-column)
    const isTwoCol = firstRow.length >= 2 && firstRow[1].trim() !== '';
    if (isTwoCol) {
      // Treat as FirstName LastName columns (no header)
      names = dataRows
        .map(row => `${row[0] ?? ''} ${row[1] ?? ''}`.trim())
        .filter(n => n.length > 0);
    } else {
      names = dataRows
        .map(row => row[0] ?? '')
        .map(n => n.trim())
        .filter(n => n.length > 0);
    }
  }

  // Deduplicate (preserve order, keep first occurrence)
  const seen = new Set();
  const unique = names.filter(n => {
    const key = n.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (unique.length === 0) {
    return { names: [], error: 'No valid names were found after parsing.' };
  }

  return { names: unique, error: null };
}
