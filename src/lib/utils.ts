import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a human-readable string (e.g., 1,617 or 12.3K).
 * @param num The number to format
 * @returns Formatted string
 */
export function formatNumberHuman(num: number): string {
  if (num < 1000) return num.toLocaleString();
  if (num < 1_000_000)
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
  return (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1) + "B";
}
