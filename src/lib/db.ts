import fs from "fs";
import path from "path";
import { DatabaseSchema } from "@/types/todo";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const initialData: DatabaseSchema = {
  users: [
    {
      id: "u1",
      name: "Kitthanakorn C.",
      email: "kitthanakorn@example.com",
      password: "password123",
      role: "Fullstack Trainee",
      avatarColor: "#4f46e5",
    },
    {
      id: "u2",
      name: "Nattapong S.",
      email: "nattapong@example.com",
      password: "password123",
      role: "Frontend Developer",
      avatarColor: "#0ea5e9",
    },
    {
      id: "u3",
      name: "Pimchanok W.",
      email: "pimchanok@example.com",
      password: "password123",
      role: "UX/UI Designer",
      avatarColor: "#ec4899",
    },
    {
      id: "u4",
      name: "Sarawut K.",
      email: "sarawut@example.com",
      password: "password123",
      role: "Project Manager",
      avatarColor: "#10b981",
    },
  ],
  categories: [
    { id: "c1", userId: "u1", name: "งานพัฒนาเว็บ (Dev)", color: "#4f46e5" },
    { id: "c2", userId: "u1", name: "ประชุมทีม (Meeting)", color: "#0ea5e9" },
    { id: "c3", userId: "u1", name: "เอกสาร & รายงาน", color: "#f59e0b" },
    { id: "c4", userId: "u1", name: "ส่วนตัว (Personal)", color: "#10b981" },
    { id: "c5", userId: "u2", name: "UI Components", color: "#0ea5e9" },
    { id: "c6", userId: "u2", name: "Bug Fixes", color: "#ef4444" },
  ],
  tasks: [
    {
      id: "t1",
      ownerId: "u1",
      title: "ออกแบบโครงสร้าง Database และ API สำหรับระบบ To-Do List",
      description: "วางโครงสร้างตาราง Users, Categories และ Tasks พร้อมทำ RESTful API สำหรับดึงและบันทึกข้อมูล",
      categoryId: "c1",
      status: "completed",
      priority: "high",
      dueDate: "2026-11-17",
      dueTime: "14:00",
      taggedUserIds: ["u2"],
      createdAt: "2026-11-16T09:00:00.000Z",
      updatedAt: "2026-11-17T01:30:00.000Z",
    },
    {
      id: "t2",
      ownerId: "u1",
      title: "พัฒนาหน้า Dashboard สรุปสถิติงานและกราฟความคืบหน้า",
      description: "แสดงจำนวนงานแยกตามสถานะ เปอร์เซ็นต์งานที่เสร็จแล้ว และตารางกำหนดการส่งงาน",
      categoryId: "c1",
      status: "in_progress",
      priority: "high",
      dueDate: "2026-11-18",
      dueTime: "16:30",
      taggedUserIds: ["u2", "u3"],
      createdAt: "2026-11-16T11:20:00.000Z",
      updatedAt: "2026-11-17T02:00:00.000Z",
    },
    {
      id: "t3",
      ownerId: "u1",
      title: "ประชุมสรุป Requirement และตรวจเช็ค UI ร่วมกับทีมออกแบบ",
      description: "เช็คความถูกต้องของฟอร์มสร้างงาน ระบบแท็กผู้เกี่ยวข้อง และการกรองข้อมูลในหน้าหลัก",
      categoryId: "c2",
      status: "pending",
      priority: "medium",
      dueDate: "2026-11-18",
      dueTime: "10:30",
      taggedUserIds: ["u3", "u4"],
      createdAt: "2026-11-16T13:00:00.000Z",
      updatedAt: "2026-11-16T13:00:00.000Z",
    },
    {
      id: "t4",
      ownerId: "u1",
      title: "เตรียมสไลด์ Presentation และอัดวิดีโอแนะนำตัวส่ง Vanness Plus",
      description: "ตอบคำถาม A-F ในวิดีโอ และทำสไลด์หัวข้อ Dream Job & Characteristics",
      categoryId: "c3",
      status: "pending",
      priority: "high",
      dueDate: "2026-11-19",
      dueTime: "18:00",
      taggedUserIds: [],
      createdAt: "2026-11-17T01:00:00.000Z",
      updatedAt: "2026-11-17T01:00:00.000Z",
    },
    {
      id: "t5",
      ownerId: "u1",
      title: "ทดสอบการ Deploy ระบบขึ้น Vercel และเช็คความพร้อมก่อนส่งมอบ",
      description: "ตรวจสอบการทำงานทุกฟีเจอร์บนลิงก์ Production พร้อมเขียนไฟล์ README อธิบายวิธีใช้งาน",
      categoryId: "c1",
      status: "pending",
      priority: "medium",
      dueDate: "2026-11-19",
      dueTime: "15:00",
      taggedUserIds: ["u4"],
      createdAt: "2026-11-17T02:10:00.000Z",
      updatedAt: "2026-11-17T02:10:00.000Z",
    },
    {
      id: "t6",
      ownerId: "u2",
      title: "ปรับปรุง Responsive Layout สำหรับหน้าจอมือถือ",
      description: "เช็คการแสดงผลตารางงานและหน้าต่าง Modal บนหน้าจอขนาดเล็ก",
      categoryId: "c5",
      status: "in_progress",
      priority: "medium",
      dueDate: "2026-11-18",
      dueTime: "17:00",
      taggedUserIds: ["u1"],
      createdAt: "2026-11-16T15:00:00.000Z",
      updatedAt: "2026-11-16T15:00:00.000Z",
    },
  ],
};

// Keep a global reference in memory so serverless environments (like Vercel)
// still work smoothly even when the project root is read-only.
const globalForDb = globalThis as unknown as {
  memoryDb: DatabaseSchema | undefined;
};

export function readDb(): DatabaseSchema {
  if (globalForDb.memoryDb) {
    return globalForDb.memoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw) as DatabaseSchema;
      globalForDb.memoryDb = parsed;
      return parsed;
    }
  } catch {
    // Fallback to initialData if file read fails
  }

  globalForDb.memoryDb = structuredClone(initialData);
  writeDb(globalForDb.memoryDb);
  return globalForDb.memoryDb;
}

export function writeDb(data: DatabaseSchema): void {
  globalForDb.memoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // On read-only serverless filesystems, memoryDb handles runtime persistence
  }
}
