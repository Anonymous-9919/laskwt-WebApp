export const DEMO_SESSION_COOKIE = "laskwt.demo.session";
export const DEMO_ADMIN_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_EMPLOYEE_ID = "00000000-0000-0000-0000-000000000002";

export function setDemoSession(userId: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_SESSION_COOKIE}=${userId}; path=/; max-age=2592000; samesite=lax`;
}

export function clearDemoSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getDemoSession(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)laskwt\.demo\.session=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}
