import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { PasswordCategory } from "@/lib/models/PasswordCategory";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    await connectDB();
    const categories = await PasswordCategory.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/password-categories] Error:", error);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = CreateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const category = await PasswordCategory.create({ userId: auth.userId, ...parsed.data });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/password-categories] Error:", error);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
