import { trapClassName } from "@/lib/traps";

export function TrapBadge({ tag }: { tag: string }) {
  return <span className={trapClassName(tag)}>{tag}</span>;
}
