import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { Expense } from "@/lib/models/Expense";
import { getAuthenticatedUserId, isAuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const CreateExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.enum([
    "investment", "food", "transport", "shopping",
    "loan", "medical", "travel", "bill", "houseExpense", "others",
  ]),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
});

// GET /api/expenses — list expenses for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // "01" - "12"
    const year = searchParams.get("year");   // "2025"
    const category = searchParams.get("category");

    // Build date-range filter matching Dashboard's fetchExpenses logic
    const filter: Record<string, unknown> = { userId: auth.userId };

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month.padStart(2, "0")}-${lastDay}`;
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    if (category && category !== "All Categories") {
      filter.category = category;
    }

    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("[GET /api/expenses] Error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses." }, { status: 500 });
  }
}

// POST /api/expenses — create a new expense
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId(request);
  if (isAuthError(auth)) return auth.error;

  try {
    const body = await request.json();
    const parsed = CreateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const expense = await Expense.create({
      userId: auth.userId,
      ...parsed.data,
      date: parsed.data.date || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/expenses] Error:", error);
    return NextResponse.json({ error: "Failed to create expense." }, { status: 500 });
  }
}
