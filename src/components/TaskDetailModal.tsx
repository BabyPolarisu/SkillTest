"use client";

import React, { useState } from "react";
import { Category, Task, TaskStatus, User } from "@/types/todo";
import {
  X,
  Calendar,
  Clock,
  Users,
  User as UserIcon,
  FileText,
  Download,
  Edit3,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  category?: Category;
  owner?: User;
  users: User[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetailModal({
  task,
  onClose,
  category,
  owner,
  users,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!task) return null;

  const attachments = task.attachments || [];
  const imageAttachments = attachments.filter((att) =>
    att.type.startsWith("image/")
  );
  const fileAttachments = attachments.filter(
    (att) => !att.type.startsWith("image/")
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const priorityBadge = {
    high: {
      label: "ความสำคัญสูง",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
    medium: {
      label: "ความสำคัญปานกลาง",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    low: {
      label: "ความสำคัญทั่วไป",
      cls: "bg-slate-100 text-slate-600 border-slate-200",
    },
  }[task.priority];

  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = task.status !== "completed" && task.dueDate < todayStr;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityBadge.cls}`}
            >
              {priorityBadge.label}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Title & Status Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 leading-snug">
              {task.title}
            </h2>

            <select
              value={task.status}
              onChange={(e) =>
                onStatusChange(task.id, e.target.value as TaskStatus)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 focus:outline-none ${
                task.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : task.status === "in_progress"
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="in_progress">กำลังทำ (In Progress)</option>
              <option value="completed">เสร็จสิ้น (Completed)</option>
            </select>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>วันที่กำหนดส่ง:</span>
              <span
                className={`font-semibold ${
                  isOverdue ? "text-red-600" : "text-slate-800"
                }`}
              >
                {task.dueDate}
              </span>
              {isOverdue && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[11px] font-medium">
                  เลยกำหนด
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>เวลา:</span>
              <span className="font-semibold text-slate-800">
                {task.dueTime} น.
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <UserIcon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>ผู้สร้างงาน:</span>
              <span className="font-semibold text-slate-800">
                {owner?.name || "ไม่ระบุ"}
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-600 sm:col-span-2 pt-1 border-t border-slate-200/60">
              <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="flex flex-wrap items-center gap-1.5">
                <span>ผู้ที่เกี่ยวข้อง:</span>
                {task.taggedUserIds.length === 0 ? (
                  <span className="text-slate-400">ไม่มีผู้ถูกแท็ก</span>
                ) : (
                  task.taggedUserIds.map((uid) => {
                    const u = users.find((user) => user.id === uid);
                    if (!u) return null;
                    return (
                      <span
                        key={uid}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: u.avatarColor }}
                        />
                        {u.name} ({u.role})
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              รายละเอียดงาน
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description || "ไม่ได้ระบุรายละเอียดเพิ่มเติม"}
            </div>
          </div>

          {/* Image Attachments Gallery */}
          {imageAttachments.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                รูปภาพประกอบงาน ({imageAttachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageAttachments.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      onClick={() => setPreviewImage(img.url)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-2 flex items-center justify-between text-white">
                      <span className="text-[11px] truncate">{img.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img.url)}
                          className="p-1 hover:bg-white/20 rounded"
                          title="ดูภาพขยาย"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={img.url}
                          download={img.name}
                          className="p-1 hover:bg-white/20 rounded"
                          title="ดาวน์โหลดรูปภาพ"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other File Attachments */}
          {fileAttachments.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                ไฟล์เอกสารแนบ ({fileAttachments.length})
              </h3>
              <div className="space-y-2">
                {fileAttachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      ดาวน์โหลด
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(task.id);
            }}
            className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            ลบงานนี้
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              แก้ไขข้อมูล / แนบไฟล์เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
