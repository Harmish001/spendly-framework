import mongoose, { Document, Schema } from "mongoose";

export type ExpenseCategory =
  | "investment"
  | "food"
  | "transport"
  | "shopping"
  | "loan"
  | "medical"
  | "travel"
  | "bill"
  | "houseExpense"
  | "others";

export interface IExpense extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  date: string; // ISO date string e.g. "2025-01-15"
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "investment",
        "food",
        "transport",
        "shopping",
        "loan",
        "medical",
        "travel",
        "bill",
        "houseExpense",
        "others",
      ],
      default: "others",
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast per-user date-range queries and sorted results
ExpenseSchema.index({ userId: 1, date: -1, createdAt: -1 });
ExpenseSchema.index({ userId: 1, category: 1, date: -1 });
ExpenseSchema.index({ userId: 1, createdAt: -1 });

export const Expense =
  (mongoose.models.Expense as mongoose.Model<IExpense>) ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);
