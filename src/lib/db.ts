import fs from "fs";
import path from "path";
import { Category, DatabaseSchema } from "@/types/todo";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export const SYSTEM_CATEGORIES: Category[] = [
  { id: "c1", userId: "system", name: "งานพัฒนาระบบ (Development)", color: "#2563eb" },
  { id: "c2", userId: "system", name: "ประชุม & ประสานงาน (Meeting)", color: "#0284c7" },
  { id: "c3", userId: "system", name: "ออกแบบ UX/UI (Design)", color: "#db2777" },
  { id: "c4", userId: "system", name: "เอกสาร & รายงาน (Document)", color: "#d97706" },
  { id: "c5", userId: "system", name: "งานด่วน & แก้บั๊ก (Urgent/Bug)", color: "#dc2626" },
  { id: "c6", userId: "system", name: "งานทั่วไป (General)", color: "#059669" },
];

const initialData: DatabaseSchema = {
  users: [
    {
      id: "u1",
      name: "Kitthanakorn C.",
      email: "kitthanakorn@example.com",
      password: "password123",
      role: "Fullstack Trainee",
      avatarColor: "#2563eb",
    },
    {
      id: "u2",
      name: "Nattapong S.",
      email: "nattapong@example.com",
      password: "password123",
      role: "Frontend Developer",
      avatarColor: "#0284c7",
    },
    {
      id: "u3",
      name: "Pimchanok W.",
      email: "pimchanok@example.com",
      password: "password123",
      role: "UX/UI Designer",
      avatarColor: "#db2777",
    },
    {
      id: "u4",
      name: "Sarawut K.",
      email: "sarawut@example.com",
      password: "password123",
      role: "Project Manager",
      avatarColor: "#059669",
    },
  ],
  categories: SYSTEM_CATEGORIES,
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
      attachments: [],
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
      attachments: [],
      createdAt: "2026-11-16T11:20:00.000Z",
      updatedAt: "2026-11-17T02:00:00.000Z",
    },
    {
      id: "t3",
      ownerId: "u1",
      title: "เตรียมสไลด์ Presentation และอัดวิดีโอแนะนำตัวส่ง Vanness Plus",
      description: "ตอบคำถาม A-F ในวิดีโอ และทำสไลด์หัวข้อ Dream Job & Characteristics",
      categoryId: "c4",
      status: "pending",
      priority: "high",
      dueDate: "2026-11-19",
      dueTime: "18:00",
      taggedUserIds: [],
      attachments: [],
      createdAt: "2026-11-17T01:00:00.000Z",
      updatedAt: "2026-11-17T01:00:00.000Z",
    },
    {
      id: "t4",
      ownerId: "u1",
      title: "ประชุมสรุป Requirement และตรวจเช็ค UI ร่วมกับทีมออกแบบ",
      description: "เช็คความถูกต้องของฟอร์มสร้างงาน ระบบแท็กผู้เกี่ยวข้อง และการกรองข้อมูลในหน้าหลัก",
      categoryId: "c2",
      status: "pending",
      priority: "medium",
      dueDate: "2026-11-21",
      dueTime: "10:30",
      taggedUserIds: ["u3", "u4"],
      attachments: [],
      createdAt: "2026-11-16T13:00:00.000Z",
      updatedAt: "2026-11-16T13:00:00.000Z",
    },
    {
      id: "t5",
      ownerId: "u2",
      title: "ปรับปรุง Responsive Layout สำหรับหน้าจอมือถือ",
      description: "เช็คการแสดงผลตารางงานและหน้าต่าง Modal บนหน้าจอขนาดเล็ก",
      categoryId: "c3",
      status: "in_progress",
      priority: "medium",
      dueDate: "2026-11-20",
      dueTime: "17:00",
      taggedUserIds: ["u1"],
      attachments: [],
      createdAt: "2026-11-16T15:00:00.000Z",
      updatedAt: "2026-11-16T15:00:00.000Z",
    },
    {
      id: "t6",
      ownerId: "u1",
      title: "วางแผนระบบแจ้งเตือนอัตโนมัติและสรุปรายงานประจำเดือน",
      description: "รวบรวมสถิติการทำงานของทีมและจัดทำเอกสารสรุปส่งช่วงปลายเดือน",
      categoryId: "c6",
      status: "pending",
      priority: "low",
      dueDate: "2026-11-25",
      dueTime: "15:00",
      taggedUserIds: ["u4"],
      attachments: [],
      createdAt: "2026-11-17T02:10:00.000Z",
      updatedAt: "2026-11-17T02:10:00.000Z",
    },
  ],
};

const globalForDb = globalThis as unknown as {
  memoryDb: DatabaseSchema | undefined;
};

export function readDb(): DatabaseSchema {
  if (globalForDb.memoryDb) {
    globalForDb.memoryDb.categories = SYSTEM_CATEGORIES;
    return globalForDb.memoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw) as DatabaseSchema;
      parsed.categories = SYSTEM_CATEGORIES;
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
  data.categories = SYSTEM_CATEGORIES;
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
