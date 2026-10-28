import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-ganti-di-produksi");

export async function setSession(u) {
  const t = await new SignJWT({ id: u.id, role: u.role, name: u.name }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key());
  cookies().set("s", t, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 604800 });
}
export async function getSession() {
  const c = cookies().get("s");
  if (!c) return null;
  try { return (await jwtVerify(c.value, key())).payload; } catch { return null; }
}
export function clearSession() { cookies().delete("s"); }
export async function requireRole(role) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role !== role) redirect("/");
  return s;
}
