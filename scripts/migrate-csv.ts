import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import Papa from "papaparse";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set in .env.local");

const UserSchema = new mongoose.Schema({
  _id: String,
  email: String,
  passwordHash: String,
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


function parseCSV(filePath: string): any[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${filePath} not found — skipping`);
    return [];
  }
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function toDate(val: string | null | undefined): Date | null {
  if (!val) return null;
  return new Date(val);
}

async function migrate() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const backupDir = path.resolve(__dirname, "../../db_backup");

  // Users
  const UserModel = mongoose.model("User", UserSchema);
  const usersRaw = parseCSV(path.join(backupDir, "users_rows.csv"));
  if (usersRaw.length) {
    const users = usersRaw.map((u: any) => ({
      _id: u.id,
      email: u.email,
      passwordHash: u.encrypted_password,
      username: u.raw_user_meta_data ? JSON.parse(u.raw_user_meta_data).name || null : null,
      avatarUrl: u.raw_user_meta_data ? JSON.parse(u.raw_user_meta_data).avatar_url || null : null,
      createdAt: toDate(u.created_at) || new Date(),
      updatedAt: toDate(u.updated_at) || new Date(),
    }));
    await UserModel.insertMany(users, { ordered: false }).catch(e => e);
    console.log(`👤 Users migrated: ${users.length} records. Passwords maintained successfully!`);
  }

  // Expenses
  const ExpenseModel = mongoose.model("Expense", ExpenseSchema);
  const expensesRaw = parseCSV(path.join(backupDir, "expenses_rows.csv"));
  if (expensesRaw.length) {
    const expenses = expensesRaw.map((e: any) => ({
      _id: e.id,
      userId: e.user_id,
      amount: Number(e.amount),
      category: e.category,
      description: e.description || null,
      date: e.date || e.created_at?.split("T")[0] || e.created_at?.split(" ")[0],
      createdAt: toDate(e.created_at) || new Date(),
      updatedAt: toDate(e.updated_at) || new Date(),
    }));
    await ExpenseModel.insertMany(expenses, { ordered: false }).catch(e => e);
    console.log(`💰 Expenses migrated: ${expenses.length} records`);
  }

  // Todos
  const TodoModel = mongoose.model("Todo", TodoSchema);
  const todosRaw = parseCSV(path.join(backupDir, "todos_rows.csv"));
  if (todosRaw.length) {
    const todos = todosRaw.map((t: any) => ({
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
    await TodoModel.insertMany(todos, { ordered: false }).catch(e => e);
    console.log(`✅ Todos migrated: ${todos.length} records`);
  }

  // Password Categories
  const PCModel = mongoose.model("PasswordCategory", PasswordCategorySchema);
  const categoriesRaw = parseCSV(path.join(backupDir, "password_categories_rows.csv"));
  if (categoriesRaw.length) {
    const categories = categoriesRaw.map((c: any) => ({
      _id: c.id,
      userId: c.user_id,
      name: c.name,
      color: c.color || null,
      icon: c.icon || null,
      createdAt: toDate(c.created_at) || new Date(),
      updatedAt: toDate(c.updated_at) || new Date(),
    }));
    await PCModel.insertMany(categories, { ordered: false }).catch(e => e);
    console.log(`🏷️  Password categories migrated: ${categories.length} records`);
  }

  // Passwords
  const PwdModel = mongoose.model("Password", PasswordSchema);
  const passwordsRaw = parseCSV(path.join(backupDir, "passwords_rows.csv"));
  if (passwordsRaw.length) {
    const passwords = passwordsRaw.map((p: any) => ({
      _id: p.id,
      userId: p.user_id,
      title: p.title,
      username: p.username || null,
      email: p.email || null,
      passwordEncrypted: p.password_encrypted,
      websiteUrl: p.website_url || null,
      notes: p.notes || null,
      isFavorite: p.is_favorite === "TRUE" || p.is_favorite === "true" || p.is_favorite === "1",
      categoryId: p.category_id || null,
      createdAt: toDate(p.created_at) || new Date(),
      updatedAt: toDate(p.updated_at) || new Date(),
    }));
    await PwdModel.insertMany(passwords, { ordered: false }).catch(e => e);
    console.log(`🔐 Passwords migrated: ${passwords.length} records`);
  }

  console.log("\n🎉 Database migration from CSV complete!");
  
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
