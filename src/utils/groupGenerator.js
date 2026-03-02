/**
 * groupGenerator.js
 * Core algorithm for generating student group assignments across rounds.
 * Uses a greedy co-occurrence minimization strategy to spread pairings.
 */

/**
 * Fisher-Yates shuffle — returns a new shuffled array without mutating the original.
 * @param {Array} arr - Any array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * buildCoMatrix — tallies how many times each pair of students has been in the same group.
 * @param {Array<Array<Array<string>>>} completedRounds - Array of rounds; each round is an
 *   array of groups; each group is an array of student name strings.
 * @param {Array<string>} students - Full student roster (used to initialize matrix keys)
 * @returns {Object} Nested object: coMatrix[studentA][studentB] = count
 */
export function buildCoMatrix(completedRounds, students) {
  // Initialize all pairs to 0
  const matrix = {};
  for (const a of students) {
    matrix[a] = {};
    for (const b of students) {
      matrix[a][b] = 0;
    }
  }

  // Increment counts for every pair that appeared in the same group
  for (const round of completedRounds) {
    for (const group of round) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = group[i];
          const b = group[j];
          if (matrix[a] && matrix[a][b] !== undefined) {
            matrix[a][b]++;
            matrix[b][a]++;
          }
        }
      }
    }
  }

  return matrix;
}

/**
 * coScore — sum of co-occurrence counts between a candidate student and all current group members.
 * Lower is better (fewer prior pairings).
 * @param {string} candidate - The student being considered for placement
 * @param {Array<string>} groupMembers - Students already in the target group
 * @param {Object} coMatrix - Co-occurrence matrix from buildCoMatrix
 * @returns {number} Total prior co-occurrence count
 */
function coScore(candidate, groupMembers, coMatrix) {
  let score = 0;
  for (const member of groupMembers) {
    score += (coMatrix[candidate]?.[member] ?? 0);
  }
  return score;
}

/**
 * generateRound — assigns students to groups for a single round using greedy minimization.
 * Each student (in shuffled order) is placed in the group with the lowest co-occurrence
 * score with its current members. Ties are broken by group size (prefer smaller groups).
 * Handles uneven class sizes by distributing remainder students to the first N groups.
 *
 * @param {Array<string>} students - Full roster of student names
 * @param {number} numGroups - Desired number of groups
 * @param {Object} coMatrix - Co-occurrence matrix from buildCoMatrix
 * @returns {Array<Array<string>>} Array of groups, each group is an array of names
 */
export function generateRound(students, numGroups, coMatrix) {
  const n = numGroups;
  const groups = Array.from({ length: n }, () => []);

  // Calculate target sizes to handle remainders
  const baseSize = Math.floor(students.length / n);
  const remainder = students.length % n;
  // First `remainder` groups get one extra student
  const targetSizes = Array.from({ length: n }, (_, i) => baseSize + (i < remainder ? 1 : 0));

  // Shuffle the student order to avoid bias
  const shuffled = shuffle(students);

  for (const student of shuffled) {
    let bestGroupIdx = -1;
    let bestScore = Infinity;
    let bestSize = Infinity;

    for (let i = 0; i < n; i++) {
      // Skip groups that have already hit their target size
      if (groups[i].length >= targetSizes[i]) continue;

      const score = coScore(student, groups[i], coMatrix);
      // Prefer lower co-occurrence; tie-break by smaller current group size
      if (
        score < bestScore ||
        (score === bestScore && groups[i].length < bestSize)
      ) {
        bestScore = score;
        bestSize = groups[i].length;
        bestGroupIdx = i;
      }
    }

    // Fallback: if all target slots are filled, find any group that has room
    if (bestGroupIdx === -1) {
      for (let i = 0; i < n; i++) {
        if (groups[i].length < targetSizes[i] + 1) {
          bestGroupIdx = i;
          break;
        }
      }
    }

    // Final fallback: just use group 0 (should never happen with valid inputs)
    if (bestGroupIdx === -1) bestGroupIdx = 0;

    groups[bestGroupIdx].push(student);
  }

  return groups;
}

/**
 * generateAllRounds — generates all rounds sequentially, feeding prior co-occurrences
 * into each subsequent round so pairings are spread as evenly as possible.
 *
 * @param {Array<string>} students - Full roster
 * @param {number} numGroups - Number of groups per round
 * @param {number} numRounds - Total rounds to generate
 * @returns {Array<Array<Array<string>>>} Array of rounds (round → groups → students)
 */
export function generateAllRounds(students, numGroups, numRounds) {
  const rounds = [];

  for (let r = 0; r < numRounds; r++) {
    const coMatrix = buildCoMatrix(rounds, students);
    const round = generateRound(students, numGroups, coMatrix);
    rounds.push(round);
  }

  return rounds;
}
