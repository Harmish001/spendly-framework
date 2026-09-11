/**
 * Spendly: Supabase → MongoDB Data Migration Script
 *
 * Usage:
 *   1. Export your Supabase tables as JSON (using pg_dump or Supabase Dashboard CSV/JSON export)
 *   2. Place the exports in ./migration-data/ as:
 *      - profiles.json
 *      - expenses.json
 *      - todos.json
 *      - passwords.json
 *      - password_categories.json
 *   3. Set MONGODB_URI in your .env.local
 *   4. Run: npx ts-node --project tsconfig.json scripts/migrate-supabase-to-mongo.ts
 *
 * Notes:
 *   - UUIDs from Supabase are stored as strings in MongoDB (_id field)
 *   - chat_* tables are intentionally skipped (chatbot feature removed)
 *   - Existing users will need to reset passwords (Supabase hashes are not portable)
 */

import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set in .env.local");

// ─── Schemas (inline for script — no model caching needed) ────────────────────

const UserSchema = new mongoose.Schema({
  _id: String,
  email: String,
  passwordHash: { type: String, default: "MIGRATION_RESET_REQUIRED" },
  username: { type: String, default: null },
  avatarUrl: { type: String, default: null },
  createdAt: Date,
  updatedAt: Date,
}, { _id: false });

const ExpenseSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  amount: Number,
  category: String,
  description: { type: String, default: null },
  date: String,
  createdAt: Date,
  updatedAt: Date,
}, { _id: false });

const TodoSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  title: String,
  description: { type: String, default: null },
  status: { type: String, default: "pending" },
  priority: { type: String, default: "medium" },
  dueDate: { type: String, default: null },
  createdAt: Date,
  updatedAt: Date,
}, { _id: false });

const PasswordCategorySchema = new mongoose.Schema({
  _id: String,
  userId: String,
  name: String,
  color: { type: String, default: null },
  icon: { type: String, default: null },
  createdAt: Date,
  updatedAt: Date,
}, { _id: false });

const PasswordSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  title: String,
  username: { type: String, default: null },
  email: { type: String, default: null },
  passwordEncrypted: String,
  websiteUrl: { type: String, default: null },
  notes: { type: String, default: null },
  isFavorite: { type: Boolean, default: false },
  categoryId: { type: String, default: null },
  createdAt: Date,
  updatedAt: Date,
}, { _id: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJson(filename: string): any[] {
  const filePath = path.resolve(process.cwd(), "migration-data", filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${filename} not found — skipping`);
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function toDate(val: string | null | undefined): Date | null {
  if (!val) return null;
  return new Date(val);
}

// ─── Migration ────────────────────────────────────────────────────────────────

async function migrate() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  // ── Users (from profiles table) ─────────────────────────────────────────────
  const UserModel = mongoose.model("User", UserSchema);
  const profiles = loadJson("profiles.json");
  if (profiles.length) {
    const users = profiles.map((p: any) => ({
      _id: p.id,
      email: p.email || `migrated-${p.id}@spendly.app`, // fallback if email missing
      passwordHash: "MIGRATION_RESET_REQUIRED", // users must reset password
      username: p.username || null,
      avatarUrl: p.avatar_url || null,
      createdAt: toDate(p.created_at) || new Date(),
      updatedAt: toDate(p.updated_at) || new Date(),
    }));
    const result = await UserModel.insertMany(users, { ordered: false }).catch(e => e);
    console.log(`👤 Users migrated: ${profiles.length} records`);
    console.log("   ⚠️  All users have passwordHash='MIGRATION_RESET_REQUIRED' — they must reset passwords on first login.\n");
  }

  // ── Expenses ─────────────────────────────────────────────────────────────────
  const ExpenseModel = mongoose.model("Expense", ExpenseSchema);
  const expenses = loadJson("expenses.json");
  if (expenses.length) {
    const docs = expenses.map((e: any) => ({
      _id: e.id,
      userId: e.user_id,
      amount: Number(e.amount),
      category: e.category,
      description: e.description || null,
      date: e.date || e.created_at?.split("T")[0],
      createdAt: toDate(e.created_at) || new Date(),
      updatedAt: toDate(e.updated_at) || new Date(),
    }));
    await ExpenseModel.insertMany(docs, { ordered: false }).catch(e => e);
    console.log(`💰 Expenses migrated: ${expenses.length} records`);
  }

  // ── Todos ────────────────────────────────────────────────────────────────────
  const TodoModel = mongoose.model("Todo", TodoSchema);
  const todos = loadJson("todos.json");
  if (todos.length) {
    const docs = todos.map((t: any) => ({
      _id: t.id,
      userId: t.user_id,
      title: t.title,
      description: t.description || null,
      status: t.status || "pending",
      priority: t.priority || "medium",
      dueDate: t.due_date || null,
      createdAt: toDate(t.created_at) || new Date(),
      updatedAt: toDate(t.updated_at) || new Date(),
    }));
    await TodoModel.insertMany(docs, { ordered: false }).catch(e => e);
    console.log(`✅ Todos migrated: ${todos.length} records`);
  }

  // ── Password Categories ───────────────────────────────────────────────────────
  const PCModel = mongoose.model("PasswordCategory", PasswordCategorySchema);
  const categories = loadJson("password_categories.json");
  if (categories.length) {
    const docs = categories.map((c: any) => ({
      _id: c.id,
      userId: c.user_id,
      name: c.name,
      color: c.color || null,
      icon: c.icon || null,
      createdAt: toDate(c.created_at) || new Date(),
      updatedAt: toDate(c.updated_at) || new Date(),
    }));
    await PCModel.insertMany(docs, { ordered: false }).catch(e => e);
    console.log(`🏷️  Password categories migrated: ${categories.length} records`);
  }

  // ── Passwords ─────────────────────────────────────────────────────────────────
  const PwdModel = mongoose.model("Password", PasswordSchema);
  const passwords = loadJson("passwords.json");
  if (passwords.length) {
    const docs = passwords.map((p: any) => ({
      _id: p.id,
      userId: p.user_id,
      title: p.title,
      username: p.username || null,
      email: p.email || null,
      passwordEncrypted: p.password_encrypted,
      websiteUrl: p.website_url || null,
      notes: p.notes || null,
      isFavorite: Boolean(p.is_favorite),
      categoryId: p.category_id || null,
      createdAt: toDate(p.created_at) || new Date(),
      updatedAt: toDate(p.updated_at) || new Date(),
    }));
    await PwdModel.insertMany(docs, { ordered: false }).catch(e => e);
    console.log(`🔐 Passwords migrated: ${passwords.length} records`);
  }

  console.log("\n🎉 Migration complete!");
  console.log("\n⚠️  IMPORTANT: Existing users cannot log in until they reset their password.");
  console.log("   Implement a 'Forgot Password' flow or manually set passwords for existing users.");

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
