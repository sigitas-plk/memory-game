/**
 * Formats a duration given in seconds to a string in the form "mm:ss".
 *
 * The function:
 * - Rounds down to the nearest whole second.
 * - Handles any non‑negative number (including zero).
 * - Pads minutes and seconds with leading zeros to always produce two digits.
 *
 * @param totalSeconds - The total duration in seconds.
 * @returns A string formatted as "mm:ss".
 *
 * @example
 * ```ts
 * formatTime(0);   // "00:00"
 * formatTime(5);   // "00:05"
 * formatTime(65);  // "01:05"
 * formatTime(125); // "02:05"
 * ```
 */
export function formatTime(totalSeconds: number): string {
  // Ensure we work with a non‑negative integer number of seconds.
  const seconds = Math.max(0, Math.floor(totalSeconds));

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const pad = (n: number): string => n.toString().padStart(2, "0");

  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}
