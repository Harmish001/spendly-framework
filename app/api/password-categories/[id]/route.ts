import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { PasswordCategory } from "@/lib/models/PasswordCategory";
import { Password } from "@/lib/models/Password";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = UpdateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const category = await PasswordCategory.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      { $set: parsed.data },
      { new: true }
    );
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    return NextResponse.json({ category });
  } catch (error) {
    console.error("[PUT /api/password-categories/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
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
    const category = await PasswordCategory.findOneAndDelete({
      _id: params.id,
      userId: auth.userId,
    });
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });

    // Unlink passwords from this deleted category
    await Password.updateMany(
      { userId: auth.userId, categoryId: params.id },
      { $set: { categoryId: null } }
    );

    return NextResponse.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/password-categories/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
