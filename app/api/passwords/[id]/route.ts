import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { Password } from "@/lib/models/Password";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const UpdatePasswordSchema = z.object({
  title: z.string().min(1).optional(),
  username: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  passwordEncrypted: z.string().optional(),
  websiteUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = UpdatePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const password = await Password.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      { $set: parsed.data },
      { new: true }
    );
    if (!password) return NextResponse.json({ error: "Password not found." }, { status: 404 });
    return NextResponse.json({ password });
  } catch (error) {
    console.error("[PUT /api/passwords/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    await connectDB();
    const password = await Password.findOneAndDelete({ _id: params.id, userId: auth.userId });
    if (!password) return NextResponse.json({ error: "Password not found." }, { status: 404 });
    return NextResponse.json({ message: "Password deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/passwords/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete password." }, { status: 500 });
  }
}
