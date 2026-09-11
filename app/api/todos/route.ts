import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { Todo } from "@/lib/models/Todo";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const CreateTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
});

// GET /api/todos — list todos for authenticated user
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const filter: Record<string, unknown> = { userId: auth.userId };

    if (status && status !== "all") filter.status = status;
    if (priority && priority !== "all") filter.priority = priority;

    const todos = await Todo.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ todos });
  } catch (error) {
    console.error("[GET /api/todos] Error:", error);
    return NextResponse.json({ error: "Failed to fetch todos." }, { status: 500 });
  }
}

// POST /api/todos — create a new todo
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = CreateTodoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();
    const todo = await Todo.create({ userId: auth.userId, ...parsed.data });
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/todos] Error:", error);
    return NextResponse.json({ error: "Failed to create todo." }, { status: 500 });
  }
}
