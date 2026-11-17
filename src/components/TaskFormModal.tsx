"use client";

import React, { useState, useEffect } from "react";
import { Category, Task, TaskPriority, TaskStatus, User } from "@/types/todo";
import { X, Users, Calendar, Clock } from "lucide-react";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  initialTask?: Task | null;
  categories: Category[];
  users: User[];
  currentUserId: string;
}

export default function TaskFormModal({
  isOpen,
  onClose,
  onSave,
  initialTask,
  categories,
  users,
  currentUserId,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("17:00");
  const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setCategoryId(initialTask.categoryId);
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime || "17:00");
      setTaggedUserIds(initialTask.taggedUserIds || []);
    } else {
      setTitle("");
      setDescription("");
      setCategoryId(categories[0]?.id || "");
      setStatus("pending");
      setPriority("medium");
      setDueDate(new Date().toISOString().split("T")[0]);
      setDueTime("17:00");
      setTaggedUserIds([]);
    }
  }, [initialTask, categories, isOpen]);

  if (!isOpen) return null;

  const toggleUserTag = (userId: string) => {
    setTaggedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setSubmitting(true);
    try {
      await onSave({
        title,
        description,
        categoryId,
        status,
        priority,
        dueDate,
        dueTime,
        taggedUserIds,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const taggableUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialTask ? "แก้ไขรายการงาน" : "เพิ่มรายการงานใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              หัวข้องาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปรายงานการประชุมประจำสัปดาห์"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              รายละเอียดงาน
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติมหรือสิ่งที่ต้องเตรียม..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                หมวดหมู่
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">ไม่ระบุหมวดหมู่</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                สถานะงาน
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">รอดำเนินการ (Pending)</option>
                <option value="in_progress">กำลังทำ (In Progress)</option>
                <option value="completed">เสร็จสิ้น (Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ความสำคัญ
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">ต่ำ (Low)</option>
                <option value="medium">ปานกลาง (Medium)</option>
                <option value="high">สูง (High)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  วันที่กำหนดส่ง <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  เวลากำหนดส่ง
                </span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                แท็กผู้ที่เกี่ยวข้อง (สามารถเลือกได้หลายคน)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {taggableUsers.map((user) => {
                const selected = taggedUserIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUserTag(user.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: selected ? "#ffffff" : user.avatarColor,
                      }}
                    />
                    {user.name} ({user.role})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting
                ? "กำลังบันทึก..."
                : initialTask
                ? "บันทึกการแก้ไข"
                : "เพิ่มงาน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
