import type { IncomingMessage, ServerResponse } from "http";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { User, IUser } from "@/lib/models/User";

// ─── Passport Local Strategy ──────────────────────────────────────────────────

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUser)._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    await connectDB();
    const user = await User.findById(id).select("-passwordHash");
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ─── Session Middleware ───────────────────────────────────────────────────────

export function createSessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI!,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      sameSite: "lax",
    },
  });
}

// ─── Middleware Runner Helper ─────────────────────────────────────────────────
// Adapts Express-style middleware to work with Next.js API routes
// by converting NextRequest to a mock IncomingMessage

export function runMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  fn: (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (err?: unknown) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// ─── Session-aware request type ──────────────────────────────────────────────

export type AuthenticatedRequest = IncomingMessage & {
  session: session.Session & Partial<session.SessionData> & { userId?: string };
  user?: IUser;
  isAuthenticated: () => boolean;
  login: (user: Express.User, done: (err: unknown) => void) => void;
  logout: (done: (err: unknown) => void) => void;
};

// ─── Auth Guard Utility ───────────────────────────────────────────────────────

export function requireAuth(userId: string | undefined): boolean {
  return Boolean(userId);
}

export { passport };
