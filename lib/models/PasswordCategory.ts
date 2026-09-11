import mongoose, { Document, Schema } from "mongoose";

export interface IPasswordCategory extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  name: string;
  color: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordCategorySchema = new Schema<IPasswordCategory>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordCategory =
  mongoose.models.PasswordCategory ||
  mongoose.model<IPasswordCategory>("PasswordCategory", PasswordCategorySchema);
