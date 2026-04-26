import { Progress } from "@/components/ui/progress";

export function ProgressBar({
  current,
  total
}: {
  current: number;
  total: number;
}) {
  const value = total === 0 ? 0 : (current / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {Math.min(current, total)} of {total}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
