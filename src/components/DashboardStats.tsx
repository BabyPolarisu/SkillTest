"use client";

import React from "react";
import { Category, Task, User } from "@/types/todo";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  CalendarClock,
  FolderKanban,
} from "lucide-react";

interface DashboardStatsProps {
  tasks: Task[];
  categories: Category[];
  users: User[];
  currentUserId: string;
}

export default function DashboardStats({
  tasks,
  categories,
  users,
}: DashboardStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate < todayStr
  );

  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) =>
      `${a.dueDate}T${a.dueTime}`.localeCompare(`${b.dueDate}T${b.dueTime}`)
    )
    .slice(0, 5);

  // Calculate tasks per category
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
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">งานทั้งหมด</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{total}</p>
            <p className="text-xs text-slate-400 mt-1">
              สำเร็จแล้ว {completionRate}% ของทั้งหมด
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">รอดำเนินการ (Pending)</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pending}</p>
            <p className="text-xs text-slate-400 mt-1">
              {overdueTasks.length > 0
                ? `เลยกำหนดส่ง ${overdueTasks.length} งาน`
                : "ไม่มีงานที่เลยกำหนด"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">กำลังทำ (In Progress)</p>
            <p className="text-3xl font-bold text-sky-600 mt-1">{inProgress}</p>
            <p className="text-xs text-slate-400 mt-1">กำลังดำเนินการอยู่</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">เสร็จสิ้น (Completed)</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {completed}
            </p>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Progress & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">
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
                      <span className="font-medium text-slate-700">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">
                      เสร็จ {cat.completed}/{cat.total} งาน ({cat.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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

        {/* Upcoming Deadlines Schedule */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">
              ตารางกำหนดเวลาส่งงานที่ใกล้ถึง (Upcoming Schedule)
            </h3>
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              ไม่มีงานค้างที่รอดำเนินการ
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingTasks.map((task) => {
                const isOverdue = task.dueDate < todayStr;
                return (
                  <div
                    key={task.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>เจ้าของ: {getUserName(task.ownerId)}</span>
                        {task.taggedUserIds.length > 0 && (
                          <span>
                            • แท็ก:{" "}
                            {task.taggedUserIds.map(getUserName).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          isOverdue
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {task.dueDate} • {task.dueTime} น.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
