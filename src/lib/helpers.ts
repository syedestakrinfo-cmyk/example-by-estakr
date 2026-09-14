/** Client-safe pure helpers (no DB imports). */

export type Content = Record<string, string>;

export function taka(n: number): string {
  return `৳${Number(n || 0).toLocaleString("en-IN")}`;
}

export function waDigits(number: string): string {
  return (number || "").replace(/[^\d]/g, "");
}

export function waLink(number: string, text: string): string {
  return `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(text)}`;
}

export function parseHours(value: string): { day: string; open: string; close: string; closed: boolean }[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseParagraphs(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : value ? [value] : [];
  } catch {
    return value ? [value] : [];
  }
}
