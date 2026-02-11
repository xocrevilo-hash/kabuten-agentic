import { cookies } from "next/headers";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "fingerthumb";
const COOKIE_NAME = "kabuten_auth";
const COOKIE_VALUE = "authenticated";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === COOKIE_VALUE;
}

export function verifyPassword(password: string): boolean {
  return password === SITE_PASSWORD;
}

export { COOKIE_NAME, COOKIE_VALUE };
