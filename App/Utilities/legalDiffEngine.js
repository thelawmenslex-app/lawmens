/**
 * Accurate LCS (Longest Common Subsequence) Word Diff Engine for Legal Provisions
 * 100% precision token-by-token comparison for New, Change, and Delete annotations.
 */

export function tokenize(text = '') {
  if (!text) return [];
  return String(text).match(/[\w']+|[^\w\s]|\s+/g) || [];
}

export function computeLegalDiff(oldText = '', newText = '') {
  const cleanOld = String(oldText || '').trim();
  const cleanNew = String(newText || '').trim();

  // Fast-path: Identical content
  if (cleanOld === cleanNew) {
    return {
      status: 'Unchanged',
      leftSegments: [{ text: oldText, type: 'UNCHANGED' }],
      rightSegments: [{ text: newText, type: 'UNCHANGED' }],
      diffCount: 0,
      hasChange: false
    };
  }

  // Fast-path: Complete insertion (New Law Only)
  if (!cleanOld && cleanNew) {
    return {
      status: 'New',
      leftSegments: [{ text: 'No corresponding colonial provision.', type: 'UNCHANGED' }],
      rightSegments: [{ text: newText, type: 'NEW', color: '#10B981', bold: true, bg: '#DCFCE7' }],
      diffCount: 1,
      hasChange: true
    };
  }

  // Fast-path: Complete deletion (Colonial Law Repealed/Omitted)
  if (cleanOld && !cleanNew) {
    return {
      status: 'Delete',
      leftSegments: [{ text: oldText, type: 'DELETE', color: '#EF4444', bold: true, bg: '#FEE2E2' }],
      rightSegments: [{ text: 'Provision omitted / repealed in Bharatiya Sanhita.', type: 'UNCHANGED' }],
      diffCount: 1,
      hasChange: true
    };
  }

  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);
  const m = oldTokens.length;
  const n = newTokens.length;

  // Build DP table for LCS
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldTokens[i].toLowerCase() === newTokens[j].toLowerCase()) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const leftSegments = [];
  const rightSegments = [];
  let additions = 0;
  let deletions = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1].toLowerCase() === newTokens[j - 1].toLowerCase()) {
      leftSegments.unshift({ text: oldTokens[i - 1], type: 'UNCHANGED' });
      rightSegments.unshift({ text: newTokens[j - 1], type: 'UNCHANGED' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      const isWhitespace = /^\s+$/.test(newTokens[j - 1]);
      rightSegments.unshift({
        text: newTokens[j - 1],
        type: isWhitespace ? 'UNCHANGED' : 'NEW',
        color: isWhitespace ? undefined : '#10B981',
        bold: !isWhitespace,
        bg: isWhitespace ? undefined : '#DCFCE7'
      });
      if (!isWhitespace) additions++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      const isWhitespace = /^\s+$/.test(oldTokens[i - 1]);
      leftSegments.unshift({
        text: oldTokens[i - 1],
        type: isWhitespace ? 'UNCHANGED' : 'DELETE',
        color: isWhitespace ? undefined : '#EF4444',
        bold: !isWhitespace,
        bg: isWhitespace ? undefined : '#FEE2E2'
      });
      if (!isWhitespace) deletions++;
      i--;
    }
  }

  function groupSegments(segments) {
    const grouped = [];
    segments.forEach(seg => {
      if (grouped.length === 0) {
        grouped.push({ ...seg });
      } else {
        const last = grouped[grouped.length - 1];
        if (last.type === seg.type && last.color === seg.color) {
          last.text += seg.text;
        } else {
          grouped.push({ ...seg });
        }
      }
    });
    return grouped;
  }

  const groupedLeft = groupSegments(leftSegments);
  const groupedRight = groupSegments(rightSegments);

  let status = 'Unchanged';
  if (additions > 0 && deletions === 0) status = 'New';
  else if (deletions > 0 && additions === 0) status = 'Delete';
  else if (additions > 0 || deletions > 0) status = 'Change';

  return {
    status,
    leftSegments: groupedLeft,
    rightSegments: groupedRight,
    diffCount: additions + deletions,
    hasChange: additions > 0 || deletions > 0
  };
}
