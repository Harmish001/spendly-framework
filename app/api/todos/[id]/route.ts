import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { Todo } from "@/lib/models/Todo";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = UpdateTodoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const todo = await Todo.findOneAndUpdate(
      { _id: params.id, userId: auth.userId },
      { $set: parsed.data },
      { new: true }
    );
    if (!todo) return NextResponse.json({ error: "Todo not found." }, { status: 404 });
    return NextResponse.json({ todo });
  } catch (error) {
    console.error("[PUT /api/todos/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update todo." }, { status: 500 });
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
    const todo = await Todo.findOneAndDelete({ _id: params.id, userId: auth.userId });
    if (!todo) return NextResponse.json({ error: "Todo not found." }, { status: 404 });
    return NextResponse.json({ message: "Todo deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/todos/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete todo." }, { status: 500 });
  }
}
