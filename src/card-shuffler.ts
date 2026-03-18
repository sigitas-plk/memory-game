/**
 * Fisher–Yates shuffle implementation.
 *
 * Returns a new array with the elements of `cards` shuffled in place.
 * The original array is **not** mutated.
 *
 * @param cards - The array of items to shuffle.
 * @returns A new array containing the shuffled items.
 *
 * @example
 * ```ts
 * const original = [1, 2, 3, 4];
 * const shuffled = shuffleCards(original);
 * // `shuffled` contains the same items in a random order.
 * // `original` is unchanged.
 * ```
 */
export function shuffleCards<T>(cards: T[]): T[] {
  // Copy the input to avoid mutating the original array.
  const result = [...cards];
  // Perform two passes of the Fisher–Yates shuffle for extra randomness.
  for (let pass = 0; pass < 2; pass++) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
  }
  return result;
}
