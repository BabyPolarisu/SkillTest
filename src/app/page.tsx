"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Category, Task, TaskStatus, User } from "@/types/todo";
import DashboardStats from "@/components/DashboardStats";
import TaskFormModal from "@/components/TaskFormModal";
import CategoryManagerModal from "@/components/CategoryManagerModal";
import UserAuthModal from "@/components/UserAuthModal";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  FolderCog,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  UserPlus,
  Users,
  LayoutDashboard,
  RotateCcw,
  Bell,
  CheckCheck,
} from "lucide-react";

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // UI Modals & Tabs
  const [showDashboard, setShowDashboard] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Notification states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotifMap, setReadNotifMap] = useState<Record<string, string[]>>({});
  const notifRef = useRef<HTMLDivElement>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [taggedUserFilter, setTaggedUserFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine" | "tagged">(
    "all"
  );

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("taskflow_read_notifs");
      if (saved) {
        setReadNotifMap(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load initial users
  useEffect(() => {
    async function initUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          setCurrentUser(data.users[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    initUsers();
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    const [catRes, taskRes] = await Promise.all([
      fetch(`/api/categories?userId=${userId}`),
      fetch(`/api/tasks?userId=${userId}`),
    ]);
    const catData = await catRes.json();
    const taskData = await taskRes.json();

    setCategories(catData.categories || []);
    setAllCategories(catData.allCategories || catData.categories || []);
    setTasks(taskData.tasks || []);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserData(currentUser.id);
    }
  }, [currentUser, fetchUserData]);

  // Tasks where current user is tagged by someone else
  const taggedTasksForMe = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(
      (t) =>
        t.ownerId !== currentUser.id && t.taggedUserIds.includes(currentUser.id)
    );
  }, [tasks, currentUser]);

  // Unread tagged tasks for current user
  const unreadTaggedTasks = useMemo(() => {
    if (!currentUser) return [];
    const readIds = readNotifMap[currentUser.id] || [];
    return taggedTasksForMe.filter((t) => !readIds.includes(t.id));
  }, [taggedTasksForMe, readNotifMap, currentUser]);

  const markTaskAsRead = (taskId: string) => {
    if (!currentUser) return;
    setReadNotifMap((prev) => {
      const currentRead = prev[currentUser.id] || [];
      if (currentRead.includes(taskId)) return prev;
      const next = {
        ...prev,
        [currentUser.id]: [...currentRead, taskId],
      };
      try {
        localStorage.setItem("taskflow_read_notifs", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const markAllNotifsAsRead = () => {
    if (!currentUser) return;
    const allIds = taggedTasksForMe.map((t) => t.id);
    setReadNotifMap((prev) => {
      const next = {
        ...prev,
        [currentUser.id]: allIds,
      };
      try {
        localStorage.setItem("taskflow_read_notifs", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Handlers for Task CRUD
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!currentUser) return;

    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        await fetchUserData(currentUser.id);
      }
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskData,
          ownerId: currentUser.id,
        }),
      });
      if (res.ok) {
        await fetchUserData(currentUser.id);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!currentUser) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) return;
    if (!window.confirm("ต้องการลบรายการงานนี้ใช่หรือไม่?")) return;

    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Handlers for Category CRUD
  const handleAddCategory = async (name: string, color: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, name, color }),
    });
    if (res.ok) {
      await fetchUserData(currentUser.id);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!currentUser) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchUserData(currentUser.id);
      if (categoryFilter === id) setCategoryFilter("all");
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      if (scopeFilter === "mine" && task.ownerId !== currentUser.id) {
        return false;
      }
      if (
        scopeFilter === "tagged" &&
        !task.taggedUserIds.includes(currentUser.id)
      ) {
        return false;
      }

      if (categoryFilter !== "all" && task.categoryId !== categoryFilter) {
        return false;
      }

      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      if (
        taggedUserFilter !== "all" &&
        !task.taggedUserIds.includes(taggedUserFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    tasks,
    currentUser,
    searchQuery,
    scopeFilter,
    categoryFilter,
    statusFilter,
    taggedUserFilter,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setTaggedUserFilter("all");
    setScopeFilter("all");
  };

  const getCategoryById = (catId: string) =>
    allCategories.find((c) => c.id === catId);

  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  const todayStr = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                TaskFlow
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบจัดการรายการงานและตารางเวลาส่วนตัว
              </p>
            </div>
          </div>

          {/* Notification Bell, User Switcher & Account Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="การแจ้งเตือนงานที่ถูกแท็ก"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadTaggedTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadTaggedTasks.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        งานที่คุณถูกแท็ก
                      </span>
                      {unreadTaggedTasks.length > 0 && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-100 text-red-600 rounded-full">
                          ใหม่ {unreadTaggedTasks.length}
                        </span>
                      )}
                    </div>
                    {unreadTaggedTasks.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotifsAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {taggedTasksForMe.length === 0 ? (
                      <div className="py-8 px-4 text-center text-xs text-slate-400">
                        ยังไม่มีรายการงานที่คุณถูกแท็ก
                      </div>
                    ) : (
                      taggedTasksForMe.map((t) => {
                        const isUnread = unreadTaggedTasks.some(
                          (u) => u.id === t.id
                        );
                        const owner = getUserById(t.ownerId);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              markTaskAsRead(t.id);
                              setScopeFilter("tagged");
                              setIsNotifOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                              isUnread ? "bg-indigo-50/40" : ""
                            }`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                                isUnread ? "bg-red-500" : "bg-slate-200"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                                {t.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                แท็กโดย{" "}
                                <span className="font-medium text-slate-700">
                                  {owner?.name || "ไม่ระบุ"}
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                กำหนดส่ง: {t.dueDate} เวลา {t.dueTime} น.
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2.5 py-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: currentUser?.avatarColor || "#4f46e5",
                }}
              />
              <span className="text-xs text-slate-500 hidden md:inline">
                ผู้ใช้งาน:
              </span>
              <select
                value={currentUser?.id || ""}
                onChange={(e) => {
                  const found = users.find((u) => u.id === e.target.value);
                  if (found) {
                    setCurrentUser(found);
                    setIsNotifOpen(false);
                    resetFilters();
                  }
                }}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">เพิ่ม/สลับบัญชี</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Unread Tagged Task Banner */}
        {unreadTaggedTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <p className="text-xs sm:text-sm font-medium text-red-800">
                คุณมีงานที่ถูกแท็กใหม่{" "}
                <span className="font-bold underline">
                  {unreadTaggedTasks.length} รายการ
                </span>{" "}
                จากเพื่อนร่วมทีม
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setScopeFilter("tagged");
                  markAllNotifsAsRead();
                }}
                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
              >
                ดูงานที่ถูกแท็ก
              </button>
              <button
                type="button"
                onClick={markAllNotifsAsRead}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                รับทราบ
              </button>
            </div>
          </div>
        )}

        {/* Action Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              สวัสดี, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              จัดการงานของคุณ แบ่งหมวดหมู่ แท็กผู้ที่เกี่ยวข้อง และติดตามความคืบหน้าได้ในที่เดียว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDashboard((prev) => !prev)}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors inline-flex items-center gap-1.5 ${
                showDashboard
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {showDashboard ? "ซ่อน Dashboard" : "แสดง Dashboard"}
            </button>

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <FolderCog className="w-4 h-4 text-slate-500" />
              จัดการหมวดหมู่
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              เพิ่มงานใหม่
            </button>
          </div>
        </div>

        {/* Dashboard Section */}
        {showDashboard && currentUser && (
          <DashboardStats
            tasks={tasks}
            categories={categories}
            users={users}
            currentUserId={currentUser.id}
          />
        )}

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่องาน หรือรายละเอียดงาน..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Scope Tabs (All / My Tasks / Tagged) */}
            <div className="flex rounded-lg bg-slate-100 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setScopeFilter("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  scopeFilter === "all"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                ทั้งหมด ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("mine")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  scopeFilter === "mine"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                งานของฉัน (
                {tasks.filter((t) => t.ownerId === currentUser?.id).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopeFilter("tagged");
                  markAllNotifsAsRead();
                }}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                  scopeFilter === "tagged"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <span>
                  ถูกแท็ก (
                  {
                    tasks.filter((t) =>
                      t.taggedUserIds.includes(currentUser?.id || "")
                    ).length
                  }
                  )
                </span>
                {unreadTaggedTasks.length > 0 && (
                  <span
                    className="w-2 h-2 rounded-full bg-red-500 inline-block"
                    title="มีงานที่ถูกแท็กใหม่"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              ตัวกรอง:
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  หมวดหมู่: {cat.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="in_progress">กำลังทำ (In Progress)</option>
              <option value="completed">เสร็จสิ้น (Completed)</option>
            </select>

            <select
              value={taggedUserFilter}
              onChange={(e) => setTaggedUserFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">ผู้ที่เกี่ยวข้องทั้งหมด</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  แท็ก: {u.name}
                </option>
              ))}
            </select>

            {(searchQuery ||
              categoryFilter !== "all" ||
              statusFilter !== "all" ||
              taggedUserFilter !== "all" ||
              scopeFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-700">
              รายการงาน ({filteredTasks.length} รายการ)
            </h3>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <p className="text-slate-500 text-sm">
                ไม่พบรายการงานที่ตรงกับเงื่อนไขการค้นหา
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                สร้างรายการงานใหม่
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredTasks.map((task) => {
                const cat = getCategoryById(task.categoryId);
                const owner = getUserById(task.ownerId);
                const isOverdue =
                  task.status !== "completed" && task.dueDate < todayStr;
                const isUnreadTagged = unreadTaggedTasks.some(
                  (u) => u.id === task.id
                );

                const priorityBadge = {
                  high: {
                    label: "สำคัญสูง",
                    cls: "bg-red-50 text-red-700 border-red-200",
                  },
                  medium: {
                    label: "ปานกลาง",
                    cls: "bg-amber-50 text-amber-700 border-amber-200",
                  },
                  low: {
                    label: "ทั่วไป",
                    cls: "bg-slate-100 text-slate-600 border-slate-200",
                  },
                }[task.priority];

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      if (isUnreadTagged) markTaskAsRead(task.id);
                    }}
                    className={`bg-white rounded-xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                      task.status === "completed"
                        ? "border-slate-200 bg-slate-50/60"
                        : isUnreadTagged
                        ? "border-red-300 ring-1 ring-red-100"
                        : isOverdue
                        ? "border-red-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isUnreadTagged && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500 text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              แท็กใหม่
                            </span>
                          )}

                          {cat && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.name}
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityBadge.cls}`}
                          >
                            {priorityBadge.label}
                          </span>

                          {task.ownerId !== currentUser?.id && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              แท็กโดย {owner?.name}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4
                            className={`text-base font-semibold ${
                              task.status === "completed"
                                ? "line-through text-slate-400"
                                : "text-slate-800"
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Meta Info: Schedule & Tagged Users */}
                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                          <div
                            className={`inline-flex items-center gap-1.5 font-medium ${
                              isOverdue ? "text-red-600" : "text-slate-600"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>กำหนดส่ง: {task.dueDate}</span>
                            <Clock className="w-3.5 h-3.5 ml-1" />
                            <span>{task.dueTime} น.</span>
                            {isOverdue && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[11px]">
                                เลยกำหนด
                              </span>
                            )}
                          </div>

                          {task.taggedUserIds.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 flex-wrap">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>ผู้ที่เกี่ยวข้อง:</span>
                              {task.taggedUserIds.map((uid) => {
                                const u = getUserById(uid);
                                if (!u) return null;
                                return (
                                  <span
                                    key={uid}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: u.avatarColor }}
                                    />
                                    {u.name}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions: Status Switcher + Edit/Delete */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as TaskStatus
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none ${
                            task.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : task.status === "in_progress"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="pending">รอดำเนินการ (Pending)</option>
                          <option value="in_progress">
                            กำลังทำ (In Progress)
                          </option>
                          <option value="completed">
                            เสร็จสิ้น (Completed)
                          </option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="แก้ไขงาน"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบงาน"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>TaskFlow — To-Do List & Task Management System</p>
          <p>Developed by Kitthanakorn Chueaprathum</p>
        </div>
      </footer>

      {/* Modals */}
      {currentUser && (
        <>
          <TaskFormModal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
            initialTask={editingTask}
            categories={categories}
            users={users}
            currentUserId={currentUser.id}
          />

          <CategoryManagerModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />

          <UserAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(newUser) => {
              setUsers((prev) => {
                const exists = prev.some((u) => u.id === newUser.id);
                return exists ? prev : [...prev, newUser];
              });
              setCurrentUser(newUser);
              resetFilters();
            }}
          />
        </>
      )}
    </div>
  );
}
