"use client";

import React, { useState } from "react";
import { Category } from "@/types/todo";
import { X, Trash2, Plus } from "lucide-react";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
];

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAddCategory(name.trim(), color);
      setName("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            จัดการหมวดหมู่งานของคุณ
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                เพิ่มหมวดหมู่ใหม่
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อหมวดหมู่ เช่น งานด่วน, การเรียน"
                  className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">เลือกสีป้าย:</span>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-offset-1 ring-slate-400" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </form>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              หมวดหมู่ปัจจุบัน ({categories.length})
            </h3>
            {categories.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                ยังไม่มีหมวดหมู่
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {cat.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                      title="ลบหมวดหมู่"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
