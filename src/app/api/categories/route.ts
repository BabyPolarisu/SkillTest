import { NextResponse } from "next/server";
import { SYSTEM_CATEGORIES } from "@/lib/db";

export async function GET() {
  // All users share the fixed system categories
  return NextResponse.json({
    categories: SYSTEM_CATEGORIES,
    allCategories: SYSTEM_CATEGORIES,
  });
}
