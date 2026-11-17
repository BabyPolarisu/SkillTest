import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const db = readDb();

    const index = db.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "ไม่พบรายการงานนี้" }, { status: 404 });
    }

    const existing = db.tasks[index];
    const updatedTask = {
      ...existing,
      title: body.title !== undefined ? String(body.title).trim() : existing.title,
      description:
        body.description !== undefined
          ? String(body.description).trim()
          : existing.description,
      categoryId:
        body.categoryId !== undefined ? body.categoryId : existing.categoryId,
      status: body.status !== undefined ? body.status : existing.status,
      priority: body.priority !== undefined ? body.priority : existing.priority,
      dueDate: body.dueDate !== undefined ? body.dueDate : existing.dueDate,
      dueTime: body.dueTime !== undefined ? body.dueTime : existing.dueTime,
      taggedUserIds:
        Array.isArray(body.taggedUserIds)
          ? body.taggedUserIds
          : existing.taggedUserIds,
      updatedAt: new Date().toISOString(),
    };

    db.tasks[index] = updatedTask;
    writeDb(db);

    return NextResponse.json({ task: updatedTask });
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถอัปเดตข้อมูลงานได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = readDb();

  const exists = db.tasks.some((t) => t.id === id);
  if (!exists) {
    return NextResponse.json({ error: "ไม่พบรายการงานที่ต้องการลบ" }, { status: 404 });
  }

  db.tasks = db.tasks.filter((t) => t.id !== id);
  writeDb(db);

  return NextResponse.json({ success: true });
}
