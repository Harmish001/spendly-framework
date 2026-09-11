import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("spendly-session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
    
    let payload: { userId: string; email: string };
    try {
      const { payload: decoded } = await jwtVerify(token, secret);
      payload = decoded as { userId: string; email: string };
    } catch {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[/api/auth/me] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
