import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "china-garden-dev-secret-change-in-production"
  );

export const SESSION_COOKIE = "cg_admin_session";

export async function signSession(adminId: number): Promise<string> {
  return new SignJWT({ aid: adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<number | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.aid === "number" ? payload.aid : null;
  } catch {
    return null;
  }
}

/** Returns the authenticated admin id, or null. */
export async function getAdminId(): Promise<number | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
