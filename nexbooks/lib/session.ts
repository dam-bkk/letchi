import { cookies } from "next/headers";

const COOKIE = "lb_session";

// Demo-grade session: signed-value-free cookie holding the demo user id.
// Prod path: replace with central SSO (see PLATFORM.md).
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function setSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export const SESSION_COOKIE = COOKIE;
