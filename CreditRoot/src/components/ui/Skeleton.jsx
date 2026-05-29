import { cn } from "../../utils/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-ink/10 dark:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
