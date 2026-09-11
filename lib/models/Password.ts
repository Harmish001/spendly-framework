import mongoose, { Document, Schema } from "mongoose";

export interface IPassword extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  title: string;
  username: string | null;
  email: string | null;
  passwordEncrypted: string;
  websiteUrl: string | null;
  notes: string | null;
  isFavorite: boolean;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordSchema = new Schema<IPassword>(
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
    username: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    passwordEncrypted: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
      default: null,
      trim: true,
    },
    notes: {
      type: String,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: String,
      ref: "PasswordCategory",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

PasswordSchema.index({ userId: 1, createdAt: -1 });
PasswordSchema.index({ userId: 1, isFavorite: 1 });

export const Password =
  mongoose.models.Password ||
  mongoose.model<IPassword>("Password", PasswordSchema);
