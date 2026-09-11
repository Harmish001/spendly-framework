import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

/**
 * Extracts and verifies the session token from a request.
 * Returns the userId string or throws a 401 NextResponse.
 */
export async function getAuthenticatedUserId(
  request: NextRequest
): Promise<{ userId: string } | { error: NextResponse }> {
  const token = request.cookies.get("spendly-session")?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  try {
    const { payload } = await jwtVerify(token, SECRET());
    const userId = (payload as { userId?: string }).userId;
    if (!userId) throw new Error("No userId in token");
    return { userId };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      ),
    };
  }
}

/**
 * Type guard — narrows the result of getAuthenticatedUserId
 */
export function isAuthError(
  result: { userId: string } | { error: NextResponse }
): result is { error: NextResponse } {
  return "error" in result;
}
