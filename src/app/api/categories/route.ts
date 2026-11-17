import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const db = readDb();

  if (!userId) {
    return NextResponse.json({ categories: db.categories });
  }

  // Return user's own categories plus any category referenced by tasks they are tagged in
  const userCategories = db.categories.filter((c) => c.userId === userId);
  return NextResponse.json({
    categories: userCategories,
    allCategories: db.categories,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, color } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อหมวดหมู่" },
        { status: 400 }
      );
    }

    const db = readDb();
    const newCategory = {
      id: `cat_${Date.now()}`,
      userId: String(userId),
      name: String(name).trim(),
      color: color || "#4f46e5",
    };

    db.categories.push(newCategory);
    writeDb(db);

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถสร้างหมวดหมู่ได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ไม่พบรหัสหมวดหมู่" }, { status: 400 });
  }

  const db = readDb();
  db.categories = db.categories.filter((c) => c.id !== id);
  writeDb(db);

  return NextResponse.json({ success: true });
}
