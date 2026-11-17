"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Category,
  Task,
  TaskAttachment,
  TaskPriority,
  TaskStatus,
  User,
} from "@/types/todo";
import {
  X,
  Users,
  Calendar,
  Clock,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Trash2,
} from "lucide-react";

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
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFileError("");
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setCategoryId(initialTask.categoryId);
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime || "17:00");
      setTaggedUserIds(initialTask.taggedUserIds || []);
      setAttachments(initialTask.attachments || []);
    } else {
      setTitle("");
      setDescription("");
      setCategoryId(categories[0]?.id || "");
      setStatus("pending");
      setPriority("medium");
      setDueDate(new Date().toISOString().split("T")[0]);
      setDueTime("17:00");
      setTaggedUserIds([]);
      setAttachments([]);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileError("");
    const maxFileSize = 4 * 1024 * 1024;
    const newAttachments: TaskAttachment[] = [];

    for (const file of Array.from(files)) {
      if (file.size > maxFileSize) {
        setFileError(`ไฟล์ "${file.name}" มีขนาดเกิน 4MB`);
        continue;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Read error"));
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        url: dataUrl,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
        attachments,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const taggableUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-xl w-full shadow-xl border border-blue-100 dark:border-slate-700 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/40 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {initialTask ? "แก้ไขรายการงาน" : "เพิ่มรายการงานใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              หัวข้องาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปรายงานการประชุมประจำสัปดาห์"
              className="w-full px-3.5 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              รายละเอียดงาน
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติมหรือสิ่งที่ต้องเตรียม..."
              className="w-full px-3.5 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                หมวดหมู่
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                สถานะงาน
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
              >
                <option value="pending">รอดำเนินการ (Pending)</option>
                <option value="in_progress">กำลังทำ (In Progress)</option>
                <option value="completed">เสร็จสิ้น (Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                ความสำคัญ
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
              >
                <option value="low">ต่ำ (Low)</option>
                <option value="medium">ปานกลาง (Medium)</option>
                <option value="high">สูง (High)</option>
              </select>
            </div>
          </div>

          {/* Schedule Inputs */}
          <div className="p-3.5 rounded-md bg-blue-50/70 dark:bg-slate-900/80 border border-blue-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-blue-950 dark:text-slate-200 mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                  วันที่กำหนดส่ง (Due Date) <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-950 dark:text-slate-200 mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                  เวลากำหนดส่ง (Time Schedule)
                </span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  แนบรูปภาพหรือไฟล์งาน
                </span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-[#252447] text-xs font-medium text-blue-700 dark:text-indigo-200 hover:bg-blue-100 dark:hover:bg-[#302e5c] border border-blue-200 dark:border-indigo-500/40"
              >
                + เลือกรูปภาพ / ไฟล์แนบ
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {fileError && (
              <p className="text-xs text-red-500 mb-2">{fileError}</p>
            )}

            {attachments.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-indigo-500/60 rounded-md p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                  <ImageIcon className="w-5 h-5" />
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  คลิกเพื่ออัปโหลดรูปภาพ หรือไฟล์เอกสารประกอบงาน
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  รองรับรูปภาพ (PNG, JPG) และไฟล์เอกสาร (PDF, DOCX, XLSX, ZIP ฯลฯ)
                </p>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                {attachments.map((att) => {
                  const isImage = att.type.startsWith("image/");
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200/80 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isImage ? (
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-10 h-10 rounded-xs object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xs bg-blue-50 dark:bg-indigo-950/60 text-blue-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                            {att.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatFileSize(att.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md"
                        title="ลบไฟล์แนบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rectangular User Tag Buttons (Soft Eye-care Violet in Dark Mode) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
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
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      selected
                        ? "bg-blue-600 dark:bg-[#5b5bd6] text-white border-blue-600 dark:border-[#6e6ade] shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: selected
                          ? "#ffffff"
                          : user.avatarColor,
                      }}
                    />
                    {user.name} ({user.role})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-md text-sm font-medium bg-blue-600 dark:bg-[#5b5bd6] text-white hover:bg-blue-700 dark:hover:bg-[#6e6ade] disabled:opacity-50"
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
