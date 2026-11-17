"use client";

import React from "react";
import { Category, Task, User } from "@/types/todo";
import { getScheduleUrgency } from "@/lib/schedule";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  CalendarClock,
  FolderKanban,
  Calendar,
} from "lucide-react";

interface DashboardStatsProps {
  tasks: Task[];
  categories: Category[];
  users: User[];
  currentUserId: string;
  onSelectTask?: (task: Task) => void;
}

export default function DashboardStats({
  tasks,
  categories,
  users,
  onSelectTask,
}: DashboardStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const urgentTasks = tasks.filter(
    (t) =>
      t.status !== "completed" && getScheduleUrgency(t.dueDate).level === "red"
  );

  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) =>
      `${a.dueDate}T${a.dueTime}`.localeCompare(`${b.dueDate}T${b.dueTime}`)
    )
    .slice(0, 5);

  const categorySummary = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.categoryId === cat.id);
    const catCompleted = catTasks.filter((t) => t.status === "completed").length;
    return {
      ...cat,
      total: catTasks.length,
      completed: catCompleted,
      percent:
        catTasks.length > 0
          ? Math.round((catCompleted / catTasks.length) * 100)
          : 0,
    };
  });

  const getUserName = (id: string) =>
    users.find((u) => u.id === id)?.name || "ไม่ระบุ";

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18122b] rounded-lg p-5 border border-blue-100 dark:border-purple-900/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-purple-200/70 font-medium">
              งานทั้งหมด
            </p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
              {total}
            </p>
            <p className="text-xs text-slate-400 dark:text-purple-300/60 mt-1">
              สำเร็จแล้ว {completionRate}% ของทั้งหมด
            </p>
          </div>
          <div className="w-12 h-12 rounded-md bg-blue-50 dark:bg-purple-900/50 text-blue-600 dark:text-purple-300 flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#18122b] rounded-lg p-5 border border-blue-100 dark:border-purple-900/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-purple-200/70 font-medium">
              รอดำเนินการ (Pending)
            </p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pending}
            </p>
            <p className="text-xs text-slate-400 dark:text-purple-300/60 mt-1">
              {urgentTasks.length > 0
                ? `ครบกำหนดวันนี้/พรุ่งนี้ ${urgentTasks.length} งาน`
                : "ไม่มีงานเร่งด่วน"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-md bg-amber-50 dark:bg-[#2b2110] text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#18122b] rounded-lg p-5 border border-blue-100 dark:border-purple-900/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-purple-200/70 font-medium">
              กำลังทำ (In Progress)
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-purple-400 mt-1">
              {inProgress}
            </p>
            <p className="text-xs text-slate-400 dark:text-purple-300/60 mt-1">
              กำลังดำเนินการอยู่
            </p>
          </div>
          <div className="w-12 h-12 rounded-md bg-blue-50 dark:bg-purple-900/50 text-blue-600 dark:text-purple-300 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#18122b] rounded-lg p-5 border border-blue-100 dark:border-purple-900/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-purple-200/70 font-medium">
              เสร็จสิ้น (Completed)
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {completed}
            </p>
            <div className="w-28 bg-slate-100 dark:bg-purple-950 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-md bg-emerald-50 dark:bg-[#0f2920] text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Progress & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-[#18122b] rounded-lg p-5 border border-blue-100 dark:border-purple-900/60 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban className="w-5 h-5 text-blue-600 dark:text-purple-400" />
            <h3 className="font-semibold text-slate-800 dark:text-white">
              สัดส่วนงานแยกตามหมวดหมู่
            </h3>
          </div>

          {categorySummary.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              ยังไม่มีหมวดหมู่ในระบบ
            </p>
          ) : (
            <div className="space-y-4">
              {categorySummary.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-slate-700 dark:text-purple-100">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-purple-300/70 text-xs">
                      เสร็จ {cat.completed}/{cat.total} งาน ({cat.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-purple-950 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines Schedule with 3-Color Indicator */}
        <div className="bg-white dark:bg-[#18122b] rounded-lg p-5 border border-blue-100 dark:border-purple-900/60 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-600 dark:text-purple-400" />
              <h3 className="font-semibold text-slate-800 dark:text-white">
                ตารางกำหนดเวลาส่งงาน (Upcoming Schedule)
              </h3>
            </div>
            {/* 3-Color Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-purple-200/80">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                วันนี้/พรุ่งนี้
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                2-4 วัน
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                5+ วัน
              </span>
            </div>
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              ไม่มีงานค้างที่รอดำเนินการ
            </p>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => {
                const urgency = getScheduleUrgency(task.dueDate);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onSelectTask && onSelectTask(task)}
                    className="w-full text-left p-3 rounded-md border border-slate-200/90 dark:border-purple-800/60 bg-slate-50/70 dark:bg-[#21193a] hover:bg-blue-50/60 dark:hover:bg-[#2a2048] hover:border-blue-300 dark:hover:border-purple-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-purple-200/70">
                        <span>เจ้าของ: {getUserName(task.ownerId)}</span>
                        {task.taggedUserIds.length > 0 && (
                          <span>
                            • แท็ก:{" "}
                            {task.taggedUserIds.map(getUserName).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-Color Prominent Square Schedule Badge (Dark-safe) */}
                    <div
                      className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-md border ${urgency.boxClass}`}
                    >
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs font-semibold">
                          <Calendar
                            className={`w-3.5 h-3.5 ${urgency.iconClass}`}
                          />
                          <span>{task.dueDate}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${urgency.badgeClass}`}
                          >
                            {urgency.label}
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-end gap-1 text-sm font-bold mt-0.5 ${urgency.textClass}`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>เวลา {task.dueTime} น.</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
