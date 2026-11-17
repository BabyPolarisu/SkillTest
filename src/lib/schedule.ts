export type ScheduleUrgencyLevel = "red" | "yellow" | "green";

export interface ScheduleUrgencyInfo {
  diffDays: number;
  level: ScheduleUrgencyLevel;
  label: string;
  boxClass: string;
  badgeClass: string;
  textClass: string;
  iconClass: string;
}

export function getScheduleUrgency(dueDate: string): ScheduleUrgencyInfo {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [y, m, d] = dueDate.split("-").map(Number);
  const target =
    y && m && d ? new Date(y, m - 1, d) : new Date(dueDate + "T00:00:00");

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Red: Overdue (< 0), Today (0), or Tomorrow (1)
  if (diffDays <= 1) {
    const label =
      diffDays < 0
        ? `เลยกำหนด ${Math.abs(diffDays)} วัน`
        : diffDays === 0
        ? "วันนี้"
        : "พรุ่งนี้";

    return {
      diffDays,
      level: "red",
      label,
      boxClass:
        "bg-red-50 dark:bg-[#2b1218] border-red-300 dark:border-red-500/80 text-red-900 dark:text-red-100",
      badgeClass: "bg-red-600 text-white",
      textClass: "text-red-700 dark:text-red-300",
      iconClass: "text-red-600 dark:text-red-400",
    };
  }

  // Yellow: Due in 2 - 4 days
  if (diffDays >= 2 && diffDays <= 4) {
    return {
      diffDays,
      level: "yellow",
      label: `อีก ${diffDays} วัน`,
      boxClass:
        "bg-amber-50 dark:bg-[#2b2110] border-amber-300 dark:border-amber-500/80 text-amber-900 dark:text-amber-100",
      badgeClass: "bg-amber-500 text-white",
      textClass: "text-amber-700 dark:text-amber-300",
      iconClass: "text-amber-600 dark:text-amber-400",
    };
  }

  // Green: Due in 5+ days
  return {
    diffDays,
    level: "green",
    label: `อีก ${diffDays} วัน`,
    boxClass:
      "bg-emerald-50 dark:bg-[#0f2920] border-emerald-300 dark:border-emerald-500/80 text-emerald-900 dark:text-emerald-100",
    badgeClass: "bg-emerald-600 text-white",
    textClass: "text-emerald-700 dark:text-emerald-300",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  };
}
