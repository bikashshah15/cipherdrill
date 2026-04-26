import { cn } from "@/lib/utils";

const palette = [
  {
    border: "border-cyan-400/40",
    bg: "bg-cyan-400/10",
    text: "text-cyan-200"
  },
  {
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/10",
    text: "text-emerald-200"
  },
  {
    border: "border-amber-400/40",
    bg: "bg-amber-400/10",
    text: "text-amber-200"
  },
  {
    border: "border-rose-400/40",
    bg: "bg-rose-400/10",
    text: "text-rose-200"
  },
  {
    border: "border-indigo-400/40",
    bg: "bg-indigo-400/10",
    text: "text-indigo-200"
  },
  {
    border: "border-lime-400/40",
    bg: "bg-lime-400/10",
    text: "text-lime-200"
  },
  {
    border: "border-orange-400/40",
    bg: "bg-orange-400/10",
    text: "text-orange-200"
  }
] as const;

function hashTag(tag: string): number {
  let hash = 0;
  for (const char of tag) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function trapClassName(tag: string, extra?: string): string {
  const color = palette[hashTag(tag) % palette.length];
  return cn(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
    color.border,
    color.bg,
    color.text,
    extra
  );
}
