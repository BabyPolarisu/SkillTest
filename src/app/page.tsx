"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Category, Task, TaskStatus, User } from "@/types/todo";
import { getScheduleUrgency } from "@/lib/schedule";
import DashboardStats from "@/components/DashboardStats";
import TaskFormModal from "@/components/TaskFormModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import UserAuthModal from "@/components/UserAuthModal";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
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
  Paperclip,
  Eye,
  X,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Theme state (White-Blue Light Theme vs Dark-Purple Theme)
  const [isDark, setIsDark] = useState(false);

  // UI Modals & Tabs
  const [showDashboard, setShowDashboard] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Notification states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotifMap, setReadNotifMap] = useState<Record<string, string[]>>(
    {}
  );
  const notifRef = useRef<HTMLDivElement>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine" | "tagged">(
    "all"
  );
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Initialize theme & read notifications from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("taskflow_theme");
      if (savedTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      }

      const savedNotifs = localStorage.getItem("taskflow_read_notifs");
      if (savedNotifs) {
        setReadNotifMap(JSON.parse(savedNotifs));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        if (next) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("taskflow_theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("taskflow_theme", "light");
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
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
    setTasks(taskData.tasks || []);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserData(currentUser.id);
    }
  }, [currentUser, fetchUserData]);

  const getCategoryById = useCallback(
    (catId: string) => categories.find((c) => c.id === catId),
    [categories]
  );

  const getUserById = useCallback(
    (userId: string) => users.find((u) => u.id === userId),
    [users]
  );

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

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPersonFilter("all");
    setScopeFilter("all");
  };

  // Jump directly to a task from notification, schedule, or search dropdown click
  const jumpToTask = (task: Task) => {
    markTaskAsRead(task.id);
    setIsNotifOpen(false);
    setIsSearchDropdownOpen(false);
    resetFilters();
    setHighlightedTaskId(task.id);
    setViewingTaskId(task.id);

    setTimeout(() => {
      const el = document.getElementById(`task-card-${task.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedTaskId((prev) => (prev === task.id ? null : prev));
    }, 3500);
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
      if (viewingTaskId === taskId) setViewingTaskId(null);
    }
  };

  // Suggestions for Search Dropdown (Matching People & Matching Tasks)
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matchedUsers = users.filter((u) => {
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });

    const matchedTasks = tasks
      .filter((t) => {
        if (!q) return true;
        const ownerName = getUserById(t.ownerId)?.name.toLowerCase() || "";
        const taggedNames = t.taggedUserIds
          .map((id) => getUserById(id)?.name.toLowerCase() || "")
          .join(" ");
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          ownerName.includes(q) ||
          taggedNames.includes(q)
        );
      })
      .slice(0, 6);

    return { matchedUsers, matchedTasks };
  }, [searchQuery, users, tasks, getUserById]);

  // Filtered tasks for main list
  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const ownerName = getUserById(task.ownerId)?.name.toLowerCase() || "";
        const matchOwner = ownerName.includes(q);
        const matchTaggedUser = task.taggedUserIds.some((uid) =>
          (getUserById(uid)?.name.toLowerCase() || "").includes(q)
        );

        if (!matchTitle && !matchDesc && !matchOwner && !matchTaggedUser) {
          return false;
        }
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

      if (personFilter !== "all") {
        const isOwner = task.ownerId === personFilter;
        const isTagged = task.taggedUserIds.includes(personFilter);
        if (!isOwner && !isTagged) return false;
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
    personFilter,
    getUserById,
  ]);

  const viewingTask = useMemo(
    () => tasks.find((t) => t.id === viewingTaskId) || null,
    [tasks, viewingTaskId]
  );

  const selectedPersonObj = useMemo(
    () => (personFilter !== "all" ? getUserById(personFilter) : undefined),
    [personFilter, getUserById]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf4fc] dark:bg-[#0f0b1d]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-blue-600 dark:border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-purple-200">
            กำลังโหลดข้อมูลระบบ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf4fc] dark:bg-[#0f0b1d] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navbar (Light: White/Blue | Dark: Deep Purple) */}
      <header className="bg-white dark:bg-[#18122b]/95 border-b border-blue-100 dark:border-purple-900/60 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-600 dark:bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-blue-950 dark:text-white leading-tight">
                TaskFlow
              </h1>
              <p className="text-xs text-slate-500 dark:text-purple-300/70 hidden sm:block">
                ระบบจัดการรายการงานและตารางเวลาส่วนตัว
              </p>
            </div>
          </div>

          {/* Theme Toggle, Notification Bell, User Switcher & Account Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md border border-blue-200 dark:border-purple-700 bg-blue-50/50 dark:bg-[#21193a] hover:bg-blue-100/70 dark:hover:bg-purple-900/60 text-blue-700 dark:text-purple-200 transition-colors"
              title={
                isDark
                  ? "สลับเป็นธีมขาว-น้ำเงิน"
                  : "สลับเป็นธีมมืด-สีม่วง (Dark Purple)"
              }
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
              )}
            </button>

            {/* Notification Bell Dropdown (Circular Notification Badge) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-md border border-blue-200 dark:border-purple-700 bg-blue-50/50 dark:bg-[#21193a] hover:bg-blue-100/70 dark:hover:bg-purple-900/60 text-blue-700 dark:text-purple-200 transition-colors"
                title="การแจ้งเตือนงานที่ถูกแท็ก"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadTaggedTasks.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#18122b] shadow-xs">
                    {unreadTaggedTasks.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#18122b] rounded-lg shadow-xl border border-blue-100 dark:border-purple-800 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-purple-900/60 flex items-center justify-between bg-blue-50/50 dark:bg-[#21193a]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">
                        งานที่คุณถูกแท็ก
                      </span>
                      {unreadTaggedTasks.length > 0 && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-100 dark:bg-red-600 text-red-600 dark:text-white rounded-full">
                          ใหม่ {unreadTaggedTasks.length}
                        </span>
                      )}
                    </div>
                    {unreadTaggedTasks.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotifsAsRead}
                        className="px-2 py-1 rounded-md text-xs text-blue-600 dark:text-purple-300 hover:bg-blue-50 dark:hover:bg-purple-900/50 font-medium inline-flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-purple-900/50">
                    {taggedTasksForMe.length === 0 ? (
                      <div className="py-8 px-4 text-center text-xs text-slate-400 dark:text-purple-300/60">
                        ยังไม่มีรายการงานที่คุณถูกแท็ก
                      </div>
                    ) : (
                      taggedTasksForMe.map((t) => {
                        const isUnread = unreadTaggedTasks.some(
                          (u) => u.id === t.id
                        );
                        const owner = getUserById(t.ownerId);
                        const urgency = getScheduleUrgency(t.dueDate);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => jumpToTask(t)}
                            className={`w-full text-left px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-[#251b42] transition-colors flex items-start gap-3 ${
                              isUnread
                                ? "bg-blue-50/40 dark:bg-[#21193a]"
                                : ""
                            }`}
                          >
                            {/* Circular Notification Dot */}
                            <span
                              className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                                isUnread
                                  ? "bg-red-500"
                                  : "bg-slate-300 dark:bg-purple-800"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                                {t.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-purple-200/70 mt-0.5">
                                แท็กโดย{" "}
                                <span className="font-medium text-slate-700 dark:text-purple-100">
                                  {owner?.name || "ไม่ระบุ"}
                                </span>
                              </p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold ${urgency.badgeClass}`}
                                >
                                  {t.dueDate} ({urgency.label}) • {t.dueTime} น.
                                </span>
                                <span className="text-[11px] text-blue-600 dark:text-purple-300 font-semibold">
                                  เปิดดูงาน →
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-blue-50/70 dark:bg-[#21193a] rounded-md px-2.5 py-1.5 border border-blue-200 dark:border-purple-700">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: currentUser?.avatarColor || "#2563eb",
                }}
              />
              <span className="text-xs text-slate-500 dark:text-purple-200/70 hidden md:inline">
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
                className="bg-transparent text-xs sm:text-sm font-medium text-blue-950 dark:text-white focus:outline-none cursor-pointer"
              >
                {users.map((u) => (
                  <option
                    key={u.id}
                    value={u.id}
                    className="bg-white dark:bg-[#18122b] text-slate-800 dark:text-white"
                  >
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-md border border-blue-200 dark:border-purple-700 bg-blue-50/60 dark:bg-[#21193a] hover:bg-blue-100/80 dark:hover:bg-purple-900/60 text-xs sm:text-sm font-medium text-blue-800 dark:text-purple-100 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-blue-600 dark:text-purple-400" />
              <span className="hidden sm:inline">เพิ่ม/สลับบัญชี</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Unread Tagged Task Banner (Circular Ping Dot) */}
        {unreadTaggedTasks.length > 0 && (
          <div className="bg-red-50/90 dark:bg-[#2b1218] border border-red-200 dark:border-red-600/70 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">
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
                onClick={() => jumpToTask(unreadTaggedTasks[0])}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
              >
                เปิดดูงานที่ถูกแท็กทันที
              </button>
              <button
                type="button"
                onClick={markAllNotifsAsRead}
                className="px-3 py-1.5 rounded-md border border-red-200 dark:border-red-700 bg-white dark:bg-[#18122b] text-xs font-medium text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
              >
                รับทราบ
              </button>
            </div>
          </div>
        )}

        {/* Action Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#18122b] p-4 sm:p-5 rounded-lg border border-blue-100 dark:border-purple-900/60 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-blue-950 dark:text-white">
              สวัสดี, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-200/70">
              จัดการงานของคุณ แนบรูปภาพ/ไฟล์งาน แท็กผู้ที่เกี่ยวข้อง และติดตามตารางเวลาได้ในที่เดียว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDashboard((prev) => !prev)}
              className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium border transition-colors inline-flex items-center gap-1.5 ${
                showDashboard
                  ? "bg-blue-50 dark:bg-purple-900/50 text-blue-700 dark:text-purple-200 border-blue-200 dark:border-purple-600"
                  : "bg-white dark:bg-[#21193a] text-slate-700 dark:text-purple-200 border-slate-300 dark:border-purple-800 hover:bg-slate-50 dark:hover:bg-purple-900/40"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {showDashboard ? "ซ่อน Dashboard" : "แสดง Dashboard"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-4 py-2 rounded-md text-xs sm:text-sm font-medium bg-blue-600 dark:bg-purple-600 text-white hover:bg-blue-700 dark:hover:bg-purple-500 shadow-xs inline-flex items-center gap-1.5"
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
            onSelectTask={(task) => jumpToTask(task)}
          />
        )}

        {/* Smart Search & Filter Controls */}
        <div className="bg-white dark:bg-[#18122b] rounded-lg p-4 sm:p-5 border border-blue-100 dark:border-purple-900/60 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Smart Search Input with Dropdown for People & Tasks */}
            <div className="relative flex-1" ref={searchContainerRef}>
              <Search className="w-4 h-4 text-blue-500 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                placeholder="ค้นหาชื่อคน (ผู้สร้าง/ผู้ถูกแท็ก) หรือพิมพ์ค้นหาชื่องาน..."
                className="w-full pl-9 pr-16 py-2 rounded-md border border-blue-200 dark:border-purple-800 bg-blue-50/30 dark:bg-[#120d22] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xs"
                    title="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSearchDropdownOpen((prev) => !prev)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xs"
                  title="เปิดรายการตัวเลือก"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#18122b] rounded-lg shadow-xl border border-blue-100 dark:border-purple-800 z-40 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-purple-900/50">
                  {/* People Section */}
                  <div className="p-2.5">
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-purple-300/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                      ค้นหาตามรายชื่อผู้ใช้งาน ({searchSuggestions.matchedUsers.length})
                    </p>
                    {searchSuggestions.matchedUsers.length === 0 ? (
                      <p className="px-2 py-2 text-xs text-slate-400">
                        ไม่พบรายชื่อผู้ใช้งานที่ตรงกับคำค้นหา
                      </p>
                    ) : (
                      <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {searchSuggestions.matchedUsers.map((u) => {
                          const userTaskCount = tasks.filter(
                            (t) =>
                              t.ownerId === u.id ||
                              t.taggedUserIds.includes(u.id)
                          ).length;
                          const isSelected = personFilter === u.id;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setPersonFilter(isSelected ? "all" : u.id);
                                setSearchQuery("");
                                setIsSearchDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-md border text-left transition-colors ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-purple-900/60 text-blue-700 dark:text-purple-200 border-blue-300 dark:border-purple-500"
                                  : "bg-white dark:bg-[#21193a] hover:bg-blue-50/50 dark:hover:bg-[#2a2048] text-slate-700 dark:text-purple-100 border-slate-200 dark:border-purple-800"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: u.avatarColor }}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate">
                                    {u.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400 dark:text-purple-300/60 truncate">
                                    {u.role}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] px-2 py-0.5 rounded-xs bg-blue-50 dark:bg-purple-950 text-blue-700 dark:text-purple-300 font-medium shrink-0">
                                {userTaskCount} งาน
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tasks Section */}
                  <div className="p-2.5">
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-purple-300/70 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                      รายการงานที่ตรงกับคำค้นหา ({searchSuggestions.matchedTasks.length})
                    </p>
                    {searchSuggestions.matchedTasks.length === 0 ? (
                      <p className="px-2 py-2 text-xs text-slate-400">
                        ไม่พบรายการงานที่ตรงกับคำค้นหา
                      </p>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {searchSuggestions.matchedTasks.map((t) => {
                          const cat = getCategoryById(t.categoryId);
                          const owner = getUserById(t.ownerId);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => jumpToTask(t)}
                              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-transparent hover:border-blue-200 dark:hover:border-purple-700 hover:bg-blue-50/40 dark:hover:bg-[#21193a] text-left transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {cat && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                  )}
                                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                                    {t.title}
                                  </p>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-purple-300/70 mt-0.5 truncate">
                                  ผู้สร้าง: {owner?.name} • กำหนดส่ง {t.dueDate} ({t.dueTime} น.)
                                </p>
                              </div>
                              <span className="px-2.5 py-1 rounded-xs bg-blue-50 dark:bg-purple-900/60 text-[11px] text-blue-600 dark:text-purple-200 font-semibold shrink-0">
                                เปิดดู →
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scope Tabs (Rectangular Buttons + Circular Notification Dot) */}
            <div className="flex rounded-md bg-blue-50/70 dark:bg-[#120d22] p-1 shrink-0 border border-blue-200/80 dark:border-purple-800">
              <button
                type="button"
                onClick={() => setScopeFilter("all")}
                className={`px-3 py-1.5 rounded-xs text-xs font-medium transition-colors ${
                  scopeFilter === "all"
                    ? "bg-blue-600 dark:bg-purple-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-purple-300/80 hover:text-blue-700 dark:hover:text-white"
                }`}
              >
                ทั้งหมด ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("mine")}
                className={`px-3 py-1.5 rounded-xs text-xs font-medium transition-colors ${
                  scopeFilter === "mine"
                    ? "bg-blue-600 dark:bg-purple-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-purple-300/80 hover:text-blue-700 dark:hover:text-white"
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
                className={`relative px-3 py-1.5 rounded-xs text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                  scopeFilter === "tagged"
                    ? "bg-blue-600 dark:bg-purple-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-purple-300/80 hover:text-blue-700 dark:hover:text-white"
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
                {/* Circular Notification Dot */}
                {unreadTaggedTasks.length > 0 && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block ring-1 ring-white"
                    title="มีงานที่ถูกแท็กใหม่"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Fixed System Category Rectangular Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors ${
                categoryFilter === "all"
                  ? "bg-blue-600 dark:bg-purple-600 text-white border-blue-600 dark:border-purple-500 shadow-2xs"
                  : "bg-blue-50/50 dark:bg-[#21193a] text-slate-700 dark:text-purple-200 border-blue-200 dark:border-purple-800 hover:bg-blue-100/60 dark:hover:bg-purple-900/50"
              }`}
            >
              ทุกหมวดหมู่ ({tasks.length})
            </button>
            {categories.map((cat) => {
              const count = tasks.filter((t) => t.categoryId === cat.id).length;
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(active ? "all" : cat.id)}
                  className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors inline-flex items-center gap-2 ${
                    active
                      ? "text-white border-transparent shadow-2xs"
                      : "bg-white dark:bg-[#21193a] text-slate-700 dark:text-purple-100 border-blue-200/80 dark:border-purple-800 hover:bg-blue-50/50 dark:hover:bg-purple-900/50"
                  }`}
                  style={active ? { backgroundColor: cat.color } : undefined}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: active ? "#ffffff" : cat.color,
                    }}
                  />
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-xs text-[11px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-blue-50 dark:bg-[#120d22] text-blue-700 dark:text-purple-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filter Dropdowns (Status & Person) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-purple-900/60">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-purple-300/70">
              <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
              ตัวกรองเพิ่มเติม:
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-blue-200 dark:border-purple-800 text-xs sm:text-sm bg-blue-50/40 dark:bg-[#120d22] text-slate-700 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="in_progress">กำลังทำ (In Progress)</option>
              <option value="completed">เสร็จสิ้น (Completed)</option>
            </select>

            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-blue-200 dark:border-purple-800 text-xs sm:text-sm bg-blue-50/40 dark:bg-[#120d22] text-slate-700 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
            >
              <option value="all">บุคคลที่เกี่ยวข้องทั้งหมด</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  บุคคล: {u.name} ({u.role})
                </option>
              ))}
            </select>

            {selectedPersonObj && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-purple-900/50 text-blue-700 dark:text-purple-200 border border-blue-200 dark:border-purple-700">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedPersonObj.avatarColor }}
                />
                กำลังดูงานของ: {selectedPersonObj.name}
                <button
                  type="button"
                  onClick={() => setPersonFilter("all")}
                  className="hover:text-blue-900 dark:hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(searchQuery ||
              categoryFilter !== "all" ||
              statusFilter !== "all" ||
              personFilter !== "all" ||
              scopeFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-md border border-blue-200 dark:border-purple-700 bg-blue-50 dark:bg-purple-900/50 text-xs text-blue-700 dark:text-purple-200 hover:bg-blue-100 dark:hover:bg-purple-800/60 font-medium inline-flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <h3 className="text-sm font-semibold text-blue-950 dark:text-purple-100">
              รายการงาน ({filteredTasks.length} รายการ)
            </h3>

            {/* 3-Color Due Date Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 dark:text-purple-200/80">
              <span>สีวันครบกำหนด:</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                สีแดง (วันนี้/พรุ่งนี้)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                สีเหลือง (2-4 วัน)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                สีเขียว (5+ วัน)
              </span>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-[#18122b] rounded-lg border border-blue-100 dark:border-purple-900/60 p-12 text-center space-y-3">
              <p className="text-slate-500 dark:text-purple-300/70 text-sm">
                ไม่พบรายการงานที่ตรงกับเงื่อนไขการค้นหา
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-md text-xs font-medium bg-blue-50 dark:bg-purple-900/60 text-blue-600 dark:text-purple-200 border border-blue-200 dark:border-purple-700 hover:bg-blue-100 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                แสดงงานทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredTasks.map((task) => {
                const cat = getCategoryById(task.categoryId);
                const owner = getUserById(task.ownerId);
                const urgency = getScheduleUrgency(task.dueDate);
                const isUnreadTagged = unreadTaggedTasks.some(
                  (u) => u.id === task.id
                );
                const isHighlighted = highlightedTaskId === task.id;
                const attachments = task.attachments || [];
                const previewImgs = attachments
                  .filter((a) => a.type.startsWith("image/"))
                  .slice(0, 3);

                const priorityBadge = {
                  high: {
                    label: "สำคัญสูง",
                    cls: "bg-red-50 dark:bg-[#2b1218] text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/70",
                  },
                  medium: {
                    label: "ปานกลาง",
                    cls: "bg-amber-50 dark:bg-[#2b2110] text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/70",
                  },
                  low: {
                    label: "ทั่วไป",
                    cls: "bg-slate-100 dark:bg-[#251d3d] text-slate-600 dark:text-purple-200 border-slate-200 dark:border-purple-700",
                  },
                }[task.priority];

                return (
                  <div
                    key={task.id}
                    id={`task-card-${task.id}`}
                    onClick={() => {
                      if (isUnreadTagged) markTaskAsRead(task.id);
                      setViewingTaskId(task.id);
                    }}
                    className={`bg-white dark:bg-[#18122b] rounded-lg p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md cursor-pointer ${
                      isHighlighted
                        ? "border-blue-500 dark:border-purple-500 ring-2 ring-blue-200 dark:ring-purple-700"
                        : task.status === "completed"
                        ? "border-slate-200/70 dark:border-purple-900/40 bg-slate-50/70 dark:bg-[#140f24]"
                        : isUnreadTagged
                        ? "border-red-300 dark:border-red-500/80 ring-1 ring-red-100 dark:ring-red-900/40"
                        : "border-blue-100 dark:border-purple-900/60 hover:border-blue-300 dark:hover:border-purple-600"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Badges Row (Circular Notification Dot inside New Tag Badge) */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isUnreadTagged && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white">
                              <span className="w-2 h-2 rounded-full bg-white" />
                              แท็กใหม่
                            </span>
                          )}

                          {cat && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-semibold text-white"
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.name}
                            </span>
                          )}

                          <span
                            className={`px-2.5 py-1 rounded-xs text-xs font-semibold border ${priorityBadge.cls}`}
                          >
                            {priorityBadge.label}
                          </span>

                          {task.ownerId !== currentUser?.id && (
                            <span className="px-2.5 py-1 rounded-xs text-xs font-medium bg-blue-50 dark:bg-purple-900/50 text-blue-700 dark:text-purple-200 border border-blue-200 dark:border-purple-700">
                              แท็กโดย {owner?.name}
                            </span>
                          )}

                          {attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-xs font-medium bg-slate-100 dark:bg-[#251d3d] text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-700">
                              <Paperclip className="w-3 h-3 text-blue-600 dark:text-purple-400" />
                              {attachments.length} ไฟล์แนบ
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4
                            className={`text-base font-bold ${
                              task.status === "completed"
                                ? "line-through text-slate-400 dark:text-purple-400/50"
                                : "text-slate-800 dark:text-white"
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 dark:text-purple-200/80 mt-1 leading-relaxed line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Image Thumbnails Preview on Card */}
                        {previewImgs.length > 0 && (
                          <div className="flex items-center gap-2 pt-1">
                            {previewImgs.map((img) => (
                              <img
                                key={img.id}
                                src={img.url}
                                alt={img.name}
                                className="w-14 h-14 rounded-md object-cover border border-slate-200 dark:border-purple-800"
                              />
                            ))}
                          </div>
                        )}

                        {/* Tagged Users Info */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-purple-300/70">
                          <span>ผู้สร้าง: {owner?.name}</span>
                          {task.taggedUserIds.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 flex-wrap">
                              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-purple-400" />
                              <span>ผู้ที่เกี่ยวข้อง:</span>
                              {task.taggedUserIds.map((uid) => {
                                const u = getUserById(uid);
                                if (!u) return null;
                                return (
                                  <span
                                    key={uid}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-blue-50/60 dark:bg-[#251d3d] border border-blue-200/70 dark:border-purple-700 text-slate-700 dark:text-purple-100 font-medium"
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full"
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

                      {/* 3-Color Prominent Schedule Box + Right Action Buttons */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-purple-900/50"
                      >
                        {/* 3-Color Square Schedule Display (Dark-safe) */}
                        <div
                          className={`px-3.5 py-2 rounded-md border flex items-center gap-3 ${
                            task.status === "completed"
                              ? "bg-slate-100 dark:bg-[#21193a] text-slate-500 dark:text-purple-300/60 border-slate-200 dark:border-purple-800/60"
                              : urgency.boxClass
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              <Calendar
                                className={`w-3.5 h-3.5 ${
                                  task.status === "completed"
                                    ? "text-slate-400 dark:text-purple-400/50"
                                    : urgency.iconClass
                                }`}
                              />
                              <span>กำหนดส่ง: {task.dueDate}</span>
                              {task.status !== "completed" && (
                                <span
                                  className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${urgency.badgeClass}`}
                                >
                                  {urgency.label}
                                </span>
                              )}
                            </div>
                            <div
                              className={`flex items-center gap-1.5 text-sm font-bold mt-0.5 ${
                                task.status === "completed"
                                  ? "text-slate-500 dark:text-purple-300/60"
                                  : urgency.textClass
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span>เวลา {task.dueTime} น.</span>
                            </div>
                          </div>
                        </div>

                        {/* Status + Action Rectangular Buttons */}
                        <div className="flex flex-col items-end gap-2">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(
                                task.id,
                                e.target.value as TaskStatus
                              )
                            }
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer focus:outline-none ${
                              task.status === "completed"
                                ? "bg-emerald-50 dark:bg-[#0f2920] text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600"
                                : task.status === "in_progress"
                                ? "bg-blue-50 dark:bg-[#251b45] text-blue-700 dark:text-purple-300 border-blue-300 dark:border-purple-500"
                                : "bg-amber-50 dark:bg-[#2b2110] text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600"
                            }`}
                          >
                            <option
                              value="pending"
                              className="bg-white dark:bg-[#18122b] text-slate-800 dark:text-white"
                            >
                              รอดำเนินการ (Pending)
                            </option>
                            <option
                              value="in_progress"
                              className="bg-white dark:bg-[#18122b] text-slate-800 dark:text-white"
                            >
                              กำลังทำ (In Progress)
                            </option>
                            <option
                              value="completed"
                              className="bg-white dark:bg-[#18122b] text-slate-800 dark:text-white"
                            >
                              เสร็จสิ้น (Completed)
                            </option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingTaskId(task.id)}
                              className="px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-purple-200 bg-blue-50/60 dark:bg-[#251d3d] border border-blue-200 dark:border-purple-700 hover:bg-blue-600 dark:hover:bg-purple-600 hover:text-white hover:border-blue-600 dark:hover:border-purple-500 rounded-md transition-colors inline-flex items-center gap-1"
                              title="ดูรายละเอียดและไฟล์แนบ"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ดูงาน</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTask(task);
                                setIsTaskModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 dark:text-purple-200 bg-white dark:bg-[#251d3d] border border-slate-300 dark:border-purple-700 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-purple-600 hover:border-blue-300 rounded-md transition-colors"
                              title="แก้ไขงาน"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-600 dark:text-purple-200 bg-white dark:bg-[#251d3d] border border-slate-300 dark:border-purple-700 hover:text-red-600 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-600 hover:border-red-300 rounded-md transition-colors"
                              title="ลบงาน"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
      <footer className="bg-white dark:bg-[#18122b] border-t border-blue-100 dark:border-purple-900/60 py-4 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-purple-300/60 gap-2">
          <p>TaskFlow — To-Do List & Task Management System</p>
          <p>Developed by Kitthanakorn Chueaprathum</p>
        </div>
      </footer>

      {/* Modals */}
      {currentUser && (
        <>
          <TaskDetailModal
            task={viewingTask}
            onClose={() => setViewingTaskId(null)}
            category={
              viewingTask ? getCategoryById(viewingTask.categoryId) : undefined
            }
            owner={viewingTask ? getUserById(viewingTask.ownerId) : undefined}
            users={users}
            onStatusChange={handleStatusChange}
            onEdit={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDelete={handleDeleteTask}
          />

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
