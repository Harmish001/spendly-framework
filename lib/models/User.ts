import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Omit<Document, "_id"> {
  _id: string;
  email: string;
  passwordHash: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: null,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the model isn't compiled multiple times (Next.js hot reload)
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
