import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { Password } from "@/lib/models/Password";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const CreatePasswordSchema = z.object({
  title: z.string().min(1, "Title is required"),
  username: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  passwordEncrypted: z.string().min(1, "Password is required"),
  websiteUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const favoritesOnly = searchParams.get("favorites") === "true";

    const filter: Record<string, unknown> = { userId: auth.userId };
    if (categoryId && categoryId !== "all") filter.categoryId = categoryId;
    if (favoritesOnly) filter.isFavorite = true;

    const passwords = await Password.find(filter)
      .populate("categoryId", "name color icon")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ passwords });
  } catch (error) {
    console.error("[GET /api/passwords] Error:", error);
    return NextResponse.json({ error: "Failed to fetch passwords." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = CreatePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const password = await Password.create({ userId: auth.userId, ...parsed.data });
    return NextResponse.json({ password }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/passwords] Error:", error);
    return NextResponse.json({ error: "Failed to create password." }, { status: 500 });
  }
}
