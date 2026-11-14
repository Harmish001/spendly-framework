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
      const paddedMonth = month.padStart(2, "0");
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const startDate = `${year}-${paddedMonth}-01`;
      const endDate = `${year}-${paddedMonth}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

      filter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      filter.date = { $gte: `${year}-01-01`, $lte: `${year}-12-31T23:59:59.999Z` };
    }

    if (category && category !== "All Categories") {
      filter.category = category;
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
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

    const rawDate = parsed.data.date || new Date().toISOString();
    const cleanDate = rawDate.split("T")[0];

    const expense = await Expense.create({
      userId: auth.userId,
      ...parsed.data,
      date: cleanDate,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/expenses] Error:", error);
    return NextResponse.json({ error: "Failed to create expense." }, { status: 500 });
  }
}
