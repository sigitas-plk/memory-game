/**
 * Calculates an optimal grid layout (rows and columns) for a given number of pairs.
 *
 * The goal is to produce a grid that:
 * 1. Holds exactly `pairCount * 2` cards (each pair has two cards).
 * 2. Is as close to square as possible, minimizing the difference between rows and columns.
 *
 * The algorithm tries to find the factor pair (r, c) of `totalCards` where the
 * absolute difference |r - c| is minimal. If multiple factor pairs have the same
 * difference, the one with the smaller number of rows (i.e., more columns) is
 * chosen to give a wider layout, which generally works better on typical screens.
 *
 * @param pairCount Number of pairs in the game (must be a positive integer).
 * @returns An object containing the calculated `rows` and `cols`.
 *
 * @example
 * ```ts
 * calculateGrid(6); // → { rows: 3, cols: 4 } (12 cards)
 * calculateGrid(8); // → { rows: 4, cols: 4 } (16 cards)
 * calculateGrid(5); // → { rows: 2, cols: 5 } (10 cards)
 * ```
 *
 * @throws {Error} If `pairCount` is not a positive integer.
 */
export function calculateGrid(pairCount: number): { rows: number; cols: number } {
  if (!Number.isInteger(pairCount) || pairCount <= 0) {
    throw new Error("pairCount must be a positive integer");
  }

  const totalCards = pairCount * 2;

  // Start with the square root as a good initial guess for rows.
  const sqrt = Math.sqrt(totalCards);
  let bestRows = Math.floor(sqrt);
  let bestCols = Math.ceil(totalCards / bestRows);
  let bestDiff = Math.abs(bestRows - bestCols);

  // Search downward from sqrt to find the factor pair with the smallest diff.
  for (let rows = bestRows; rows >= 1; rows--) {
    if (totalCards % rows === 0) {
      const cols = totalCards / rows;
      const diff = Math.abs(rows - cols);
      if (diff < bestDiff || (diff === bestDiff && rows < bestRows)) {
        bestRows = rows;
        bestCols = cols;
        bestDiff = diff;
      }
      // Since we are iterating from sqrt downwards, once we find a perfect square,
      // we can break early because diff will be 0.
      if (diff === 0) break;
    }
  }

  return { rows: bestRows, cols: bestCols };
}
