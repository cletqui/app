import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function niceBytes(n: number): string {
  const units = ["B", "KB", "MB", "GB"];
  if (n === 0) return "0 B";
  const l = Math.min(Math.floor(Math.log2(n) / 10), units.length - 1);
  const v = n / Math.pow(1024, l);
  return `${v.toFixed(l > 0 ? 1 : 0)} ${units[l]}`;
}
