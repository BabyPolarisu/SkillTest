import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { Task, TaskPriority, TaskStatus } from "@/types/todo";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const db = readDb();

  if (!userId) {
    return NextResponse.json({ tasks: db.tasks });
  }

  // Return tasks owned by user OR tasks where the user is tagged
  const userTasks = db.tasks.filter(
    (t) => t.ownerId === userId || t.taggedUserIds.includes(userId)
  );

  // Sort by dueDate + dueTime ascending
  userTasks.sort((a, b) => {
    const dtA = `${a.dueDate}T${a.dueTime || "23:59"}`;
    const dtB = `${b.dueDate}T${b.dueTime || "23:59"}`;
    return dtA.localeCompare(dtB);
  });

  return NextResponse.json({ tasks: userTasks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerId,
      title,
      description,
      categoryId,
      status,
      priority,
      dueDate,
      dueTime,
      taggedUserIds,
      attachments,
    } = body;

    if (!ownerId || !title || !dueDate) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่องานและวันที่กำหนดส่งให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const db = readDb();
    const now = new Date().toISOString();

    const newTask: Task = {
      id: `task_${Date.now()}`,
      ownerId: String(ownerId),
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      categoryId: categoryId || "",
      status: (status as TaskStatus) || "pending",
      priority: (priority as TaskPriority) || "medium",
      dueDate: String(dueDate),
      dueTime: dueTime ? String(dueTime) : "17:00",
      taggedUserIds: Array.isArray(taggedUserIds) ? taggedUserIds : [],
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: now,
      updatedAt: now,
    };

    db.tasks.push(newTask);
    writeDb(db);

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างงานใหม่" },
      { status: 500 }
    );
  }
}
