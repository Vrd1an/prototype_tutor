"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession, setSession, clearSession, requireRole } from "@/lib/auth";
import { todayWIB } from "@/lib/util";

const safe = (b) => (b && b.startsWith("/") && !b.startsWith("//") ? b : "/");
const go = (back, msg, ok) => redirect(back + (msg ? (back.includes("?") ? "&" : "?") + (ok ? "ok" : "e") + "=" + encodeURIComponent(msg) : ""));
const g = (fd, k) => String(fd.get(k) || "").trim();

/* ---------- Akun ---------- */
export async function login(fd) {
  const u = await db.user.findUnique({ where: { email: g(fd, "email").toLowerCase() } });
  if (!u || !u.active || !(await bcrypt.compare(g(fd, "password"), u.password))) go("/login", "Email atau password salah, atau akun nonaktif.");
  await setSession(u);
  redirect(u.role === "ADMIN" ? "/admin" : "/tutor");
}
export async function logout() { clearSession(); redirect("/"); }

/* ---------- Admin: data tutor ---------- */
export async function addTutor(fd) {
  await requireRole("ADMIN");
  const b = "/admin/tutor/baru", name = g(fd, "name"), email = g(fd, "email").toLowerCase(), pw = g(fd, "password"), mapel = g(fd, "mapel");
  if (!name || !email || pw.length < 6 || !mapel) go(b, "Lengkapi data. Password minimal 6 karakter.");
  if (await db.user.findUnique({ where: { email } })) go(b, "Email sudah terdaftar.");
  const u = await db.user.create({ data: { name, email, password: await bcrypt.hash(pw, 10), role: "TUTOR", tutor: { create: { mapel, bidang: g(fd, "bidang"), phone: g(fd, "phone"), bio: g(fd, "bio").slice(0, 500) } } } });
  go("/admin/tutor/" + u.id, "Tutor ditambahkan. Lanjut isi jadwalnya.", 1);
}
export async function updateTutor(fd) {
  await requireRole("ADMIN");
  const id = +g(fd, "id"), b = "/admin/tutor/" + id;
  const name = g(fd, "name"), email = g(fd, "email").toLowerCase(), mapel = g(fd, "mapel"), pw = g(fd, "password");
  if (!name || !email || !mapel) go(b, "Nama, email, dan mapel wajib diisi.");
  if (pw && pw.length < 6) go(b, "Password baru minimal 6 karakter.");
  if (await db.user.findFirst({ where: { email, NOT: { id } } })) go(b, "Email sudah dipakai akun lain.");
  await db.user.update({ where: { id }, data: { name, email, active: g(fd, "active") !== "0", ...(pw ? { password: await bcrypt.hash(pw, 10) } : {}), tutor: { update: { mapel, bidang: g(fd, "bidang"), phone: g(fd, "phone"), bio: g(fd, "bio").slice(0, 500) } } } });
  go(b, "Data tutor disimpan.", 1);
}
export async function delTutor(fd) {
  await requireRole("ADMIN");
  await db.user.delete({ where: { id: +g(fd, "id") } });
  go("/admin", "Tutor dihapus.", 1);
}

/* ---------- Admin: master data ---------- */
export async function addMaster(fd) {
  await requireRole("ADMIN");
  const b = "/admin/master", t = g(fd, "type"), n = g(fd, "name");
  if (!n) go(b, "Nama wajib diisi.");
  try {
    if (t === "program") await db.program.create({ data: { name: n } });
    else if (t === "room") await db.room.create({ data: { name: n, lokasi: g(fd, "lokasi") } });
    else await db.sesi.create({ data: { label: n, start: g(fd, "start"), end: g(fd, "end") } });
  } catch { go(b, "Gagal menyimpan. Nama mungkin sudah ada."); }
  go(b, "Tersimpan.", 1);
}
export async function delMaster(fd) {
  await requireRole("ADMIN");
  const b = "/admin/master", t = g(fd, "type"), id = +g(fd, "id");
  try { await db[t === "program" ? "program" : t === "room" ? "room" : "sesi"].delete({ where: { id } }); } catch { go(b, "Tidak bisa dihapus karena masih dipakai jadwal tutor."); }
  go(b, "Dihapus.", 1);
}

/* ---------- Ketersediaan (admin untuk semua tutor, tutor untuk dirinya sendiri) ---------- */
async function ownerId(fd) {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "TUTOR")) redirect("/login");
  if (s.role === "TUTOR") return (await db.tutor.findUnique({ where: { userId: s.id } })).id;
  return +g(fd, "tutorId");
}
export async function addAvail(fd) {
  const tutorId = await ownerId(fd), b = safe(g(fd, "back"));
  const d = { tutorId, hari: +g(fd, "hari"), sesiId: +g(fd, "sesiId"), roomId: +g(fd, "roomId"), programId: +g(fd, "programId"), catatan: g(fd, "catatan").slice(0, 255) };
  if (!d.sesiId || !d.roomId || !d.programId) go(b, "Pilih sesi, ruangan, dan program.");
  if (await db.availability.findFirst({ where: { tutorId, hari: d.hari, sesiId: d.sesiId } })) go(b, "Tutor sudah punya jadwal di hari dan sesi itu.");
  const c = await db.availability.findFirst({ where: { roomId: d.roomId, hari: d.hari, sesiId: d.sesiId }, include: { tutor: { include: { user: true } } } });
  if (c) go(b, "Ruangan sudah dipakai " + c.tutor.user.name + " di hari dan sesi itu.");
  await db.availability.create({ data: d });
  go(b, "Jadwal ditambahkan.", 1);
}
export async function delAvail(fd) {
  const tutorId = await ownerId(fd), b = safe(g(fd, "back"));
  await db.availability.deleteMany({ where: { id: +g(fd, "id"), tutorId } });
  go(b, "Jadwal dihapus.", 1);
}
// Status dan catatan khusus untuk hari ini (tutor sendiri, atau admin sebagai override)
export async function setToday(fd) {
  const tutorId = await ownerId(fd), b = safe(g(fd, "back"));
  await db.tutor.update({ where: { id: tutorId }, data: { statusDate: todayWIB(), izin: g(fd, "izin") === "1", notice: g(fd, "notice").slice(0, 300) } });
  go(b, "Status hari ini disimpan.", 1);
}
