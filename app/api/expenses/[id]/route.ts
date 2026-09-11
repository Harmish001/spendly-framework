import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { Expense } from "@/lib/models/Expense";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const UpdateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.enum([
    "investment", "food", "transport", "shopping",
    "loan", "medical", "travel", "bill", "houseExpense", "others",
  ]).optional(),
  description: z.string().nullable().optional(),
  date: z.string().optional(),
});

// PUT /api/expenses/[id] — update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = UpdateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const expense = await Expense.findOneAndUpdate(
      { _id: params.id, userId: auth.userId }, // Ensures users can only edit their own
      { $set: parsed.data },
      { new: true }
    );

    if (!expense) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("[PUT /api/expenses/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to update expense." }, { status: 500 });
  }
}

// DELETE /api/expenses/[id] — delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    await connectDB();

    const expense = await Expense.findOneAndDelete({
      _id: params.id,
      userId: auth.userId, // Ensures users can only delete their own
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/expenses/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete expense." }, { status: 500 });
  }
}
