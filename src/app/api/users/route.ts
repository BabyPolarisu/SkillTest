import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

const AVATAR_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
];

export async function GET() {
  const db = readDb();
  const safeUsers = db.users.map(({ password: _password, ...user }) => user);
  return NextResponse.json({ users: safeUsers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, email, password, role } = body;
    const db = readDb();

    if (action === "login") {
      const user = db.users.find(
        (u) => u.email.toLowerCase() === String(email || "").toLowerCase()
      );
      if (!user) {
        return NextResponse.json(
          { error: "ไม่พบบัญชีผู้ใช้นี้ในระบบ" },
          { status: 404 }
        );
      }
      if (password && user.password && user.password !== password) {
        return NextResponse.json(
          { error: "รหัสผ่านไม่ถูกต้อง" },
          { status: 401 }
        );
      }
      const { password: _p, ...safeUser } = user;
      return NextResponse.json({ user: safeUser });
    }

    // Register new user
    if (!name || !email) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อและอีเมลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const exists = db.users.some(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (exists) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    const newUserId = `u${Date.now()}`;
    const color =
      AVATAR_COLORS[db.users.length % AVATAR_COLORS.length] || "#4f46e5";

    const newUser = {
      id: newUserId,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: password || "password123",
      role: role ? String(role).trim() : "Team Member",
      avatarColor: color,
    };

    db.users.push(newUser);
    writeDb(db);

    const { password: _p, ...safeUser } = newUser;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการประมวลผลข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}
