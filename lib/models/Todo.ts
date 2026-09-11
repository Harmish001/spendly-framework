import mongoose, { Document, Schema } from "mongoose";

export type TodoStatus = "pending" | "in_progress" | "completed";
export type TodoPriority = "low" | "medium" | "high";

export interface ITodo extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

TodoSchema.index({ userId: 1, createdAt: -1 });
TodoSchema.index({ userId: 1, status: 1 });
TodoSchema.index({ userId: 1, priority: 1 });

export const Todo =
  mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);
