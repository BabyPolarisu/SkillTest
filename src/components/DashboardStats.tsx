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

  const getRelativeDayLabel = (dueDate: string) => {
    const today = new Date(todayStr);
    const target = new Date(dueDate);
    const diffDays = Math.round(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return `เลยกำหนด ${Math.abs(diffDays)} วัน`;
    if (diffDays === 0) return "วันนี้";
    if (diffDays === 1) return "พรุ่งนี้";
    return `อีก ${diffDays} วัน`;
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">งานทั้งหมด</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{total}</p>
            <p className="text-xs text-slate-400 mt-1">
              สำเร็จแล้ว {completionRate}% ของทั้งหมด
            </p>
          </div>
          <div className="w-12 h-12 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">
              รอดำเนินการ (Pending)
            </p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pending}</p>
            <p className="text-xs text-slate-400 mt-1">
              {overdueTasks.length > 0
                ? `เลยกำหนดส่ง ${overdueTasks.length} งาน`
                : "ไม่มีงานที่เลยกำหนด"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">
              กำลังทำ (In Progress)
            </p>
            <p className="text-3xl font-bold text-sky-600 mt-1">{inProgress}</p>
            <p className="text-xs text-slate-400 mt-1">กำลังดำเนินการอยู่</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">
              เสร็จสิ้น (Completed)
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {completed}
            </p>
            <div className="w-28 bg-slate-100 h-2 rounded-xs mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Progress & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs">
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
                        className="w-3 h-3 rounded-xs inline-block"
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
                  <div className="w-full h-2.5 bg-slate-100 rounded-xs overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
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
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-800">
                ตารางกำหนดเวลาส่งงานที่ใกล้ถึง (Upcoming Schedule)
              </h3>
            </div>
            <span className="text-xs text-slate-400">คลิกเพื่อดูงาน</span>
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              ไม่มีงานค้างที่รอดำเนินการ
            </p>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => {
                const isOverdue = task.dueDate < todayStr;
                const relativeLabel = getRelativeDayLabel(task.dueDate);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onSelectTask && onSelectTask(task)}
                    className={`w-full text-left p-3 rounded-md border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isOverdue
                        ? "bg-red-50/40 border-red-200 hover:bg-red-50"
                        : "bg-slate-50/70 border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">
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

                    {/* Prominent Square Schedule Badge */}
                    <div
                      className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-md border ${
                        isOverdue
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white text-slate-800 border-indigo-200 shadow-2xs"
                      }`}
                    >
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xs font-semibold">
                          <Calendar
                            className={`w-3.5 h-3.5 ${
                              isOverdue ? "text-white" : "text-indigo-600"
                            }`}
                          />
                          <span>{task.dueDate}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-xs text-[10px] font-bold ${
                              isOverdue
                                ? "bg-white/20 text-white"
                                : "bg-indigo-50 text-indigo-700"
                            }`}
                          >
                            {relativeLabel}
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-end gap-1 text-sm font-bold mt-0.5 ${
                            isOverdue ? "text-white" : "text-indigo-700"
                          }`}
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
