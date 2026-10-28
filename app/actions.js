"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession, setSession, clearSession, requireRole } from "@/lib/auth";
import { todayWIB } from "@/lib/util";

import fs from "fs/promises";
import path from "path";

const safe = (b) => (b && b.startsWith("/") && !b.startsWith("//") ? b : "/");
const go = (back, msg, ok) => redirect(back + (msg ? (back.includes("?") ? "&" : "?") + (ok ? "ok" : "e") + "=" + encodeURIComponent(msg) : ""));
const g = (fd, k) => String(fd.get(k) || "").trim();

async function saveUploadedFile(file, prefix = "tutor") {
  if (!file || typeof file !== "object" || !file.size || !file.name) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${prefix}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return "/uploads/" + filename;
}

/* ---------- Akun ---------- */
export async function login(fd) {
  const u = await db.user.findUnique({ where: { email: g(fd, "email").toLowerCase() } });
  if (!u || !u.active || !(await bcrypt.compare(g(fd, "password"), u.password))) go("/login", "Email atau password salah, atau akun nonaktif.");
  await setSession(u);
  redirect(u.role === "ADMIN" ? "/admin" : "/tutor");
}
export async function logout() { clearSession(); redirect("/"); }

const gList = (fd, k) => {
  const vals = fd.getAll(k).map((s) => String(s).trim()).filter(Boolean);
  return vals.length > 0 ? vals.join(", ") : g(fd, k);
};

/* ---------- Tutor: Update Profil Sendiri ---------- */
export async function updateTutorProfile(fd) {
  const s = await getSession();
  if (!s || s.role !== "TUTOR") redirect("/login");
  const b = "/tutor/profil";
  const name = g(fd, "name"), pw = g(fd, "password");
  if (!name) go(b, "Nama lengkap wajib diisi.");
  if (pw && pw.length < 6) go(b, "Password baru minimal 6 karakter.");

  const uploaded = await saveUploadedFile(fd.get("fotoFile"), "avatar");
  const fotoInput = g(fd, "foto");
  const foto = uploaded || fotoInput;

  await db.user.update({
    where: { id: s.id },
    data: {
      name,
      ...(pw ? { password: await bcrypt.hash(pw, 10) } : {}),
      tutor: {
        update: {
          bidang: g(fd, "bidang"),
          phone: g(fd, "phone"),
          alamat: g(fd, "alamat"),
          bio: g(fd, "bio").slice(0, 500),
          ...(foto ? { foto } : {}),
        },
      },
    },
  });
  s.name = name;
  await setSession(s);
  go("/tutor#profil", "Profil berhasil disimpan.", 1);
}

/* ---------- Admin: Data Tutor (Modul 1) ---------- */
export async function addTutor(fd) {
  await requireRole("ADMIN");
  const b = "/admin/tutor/baru", name = g(fd, "name"), email = g(fd, "email").toLowerCase(), pw = g(fd, "password"), mapel = g(fd, "mapel");
  if (!name || !email || pw.length < 6 || !mapel) go(b, "Lengkapi data. Password minimal 6 karakter.");
  if (await db.user.findUnique({ where: { email } })) go(b, "Email sudah terdaftar.");
  
  const uploaded = await saveUploadedFile(fd.get("fotoFile"), "avatar");
  const foto = uploaded || g(fd, "foto");
  const status = g(fd, "status") || "ACTIVE";
  const active = status === "ACTIVE";

  const u = await db.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(pw, 10),
      role: "TUTOR",
      active,
      tutor: {
        create: {
          nik: g(fd, "nik"),
          alamat: g(fd, "alamat"),
          status,
          joinDate: g(fd, "joinDate") || todayWIB(),
          mapel,
          bidang: g(fd, "bidang"),
          jenjang: gList(fd, "jenjang"),
          jenisKelas: gList(fd, "jenisKelas"),
          phone: g(fd, "phone"),
          bio: g(fd, "bio").slice(0, 500),
          foto: foto || "",
          catatanInternal: g(fd, "catatanInternal"),
        },
      },
    },
  });
  go("/admin/tutor/" + u.id, "Tutor berhasil ditambahkan ke database.", 1);
}

export async function updateTutor(fd) {
  await requireRole("ADMIN");
  const id = +g(fd, "id"), b = "/admin/tutor/" + id;
  const name = g(fd, "name"), email = g(fd, "email").toLowerCase(), mapel = g(fd, "mapel"), pw = g(fd, "password");
  if (!name || !email || !mapel) go(b, "Nama, email, dan mapel wajib diisi.");
  if (pw && pw.length < 6) go(b, "Password baru minimal 6 karakter.");
  if (await db.user.findFirst({ where: { email, NOT: { id } } })) go(b, "Email sudah dipakai akun lain.");

  const uploaded = await saveUploadedFile(fd.get("fotoFile"), "avatar");
  const fotoInput = g(fd, "foto");
  const foto = uploaded || fotoInput;
  const status = g(fd, "status") || "ACTIVE";
  const active = status === "ACTIVE";

  await db.user.update({
    where: { id },
    data: {
      name,
      email,
      active,
      ...(pw ? { password: await bcrypt.hash(pw, 10) } : {}),
      tutor: {
        update: {
          nik: g(fd, "nik"),
          alamat: g(fd, "alamat"),
          status,
          joinDate: g(fd, "joinDate"),
          mapel,
          bidang: g(fd, "bidang"),
          jenjang: gList(fd, "jenjang"),
          jenisKelas: gList(fd, "jenisKelas"),
          phone: g(fd, "phone"),
          bio: g(fd, "bio").slice(0, 500),
          catatanInternal: g(fd, "catatanInternal"),
          ...(foto ? { foto } : {}),
        },
      },
    },
  });
  go(b, "Data tutor berhasil disimpan.", 1);
}

export async function delTutor(fd) {
  await requireRole("ADMIN");
  await db.user.delete({ where: { id: +g(fd, "id") } });
  go("/admin", "Tutor berhasil dihapus.", 1);
}

/* ---------- Modul 1: Dokumen Administrasi Tutor ---------- */
export async function addTutorDocument(fd) {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "TUTOR")) redirect("/login");
  const tutorId = +g(fd, "tutorId");
  const back = safe(g(fd, "back")) || (s.role === "ADMIN" ? "/admin/tutor/" + tutorId : "/tutor");
  const jenis = g(fd, "jenis") || "Lainnya";
  const namaFile = g(fd, "namaFile");
  if (!namaFile) go(back, "Nama / label dokumen wajib diisi.");

  const uploaded = await saveUploadedFile(fd.get("documentFile"), "doc");
  const fileUrl = uploaded || g(fd, "fileUrl");
  if (!fileUrl) go(back, "Pilih file dokumen atau masukkan link dokumen.");

  const status = s.role === "ADMIN" ? (g(fd, "status") || "VALID") : "MENUNGGU_VERIFIKASI";
  const catatan = g(fd, "catatan");

  await db.tutorDocument.create({
    data: { tutorId, jenis, namaFile, fileUrl, status, catatan },
  });
  go(back, "Dokumen administrasi berhasil ditambahkan.", 1);
}

export async function updateTutorDocumentStatus(fd) {
  await requireRole("ADMIN");
  const id = +g(fd, "id");
  const back = safe(g(fd, "back"));
  const status = g(fd, "status");
  const catatan = g(fd, "catatan");
  await db.tutorDocument.update({
    where: { id },
    data: { status, catatan },
  });
  go(back, "Status verifikasi dokumen diperbarui.", 1);
}

export async function delTutorDocument(fd) {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "TUTOR")) redirect("/login");
  const id = +g(fd, "id");
  const back = safe(g(fd, "back"));
  await db.tutorDocument.delete({ where: { id } });
  go(back, "Dokumen dihapus.", 1);
}

/* ---------- Modul 1: Catatan Evaluasi Koordinator ---------- */
export async function addTutorEvaluation(fd) {
  const s = await requireRole("ADMIN");
  const tutorId = +g(fd, "tutorId");
  const back = safe(g(fd, "back"));
  const catatan = g(fd, "catatan");
  if (!catatan) go(back, "Catatan evaluasi wajib diisi.");

  await db.tutorEvaluation.create({
    data: {
      tutorId,
      penilai: g(fd, "penilai") || s.name || "Koordinator",
      tanggal: g(fd, "tanggal") || todayWIB(),
      skor: Math.max(1, Math.min(5, +g(fd, "skor") || 5)),
      kategori: g(fd, "kategori") || "Kinerja",
      catatan,
    },
  });
  go(back, "Catatan evaluasi internal berhasil disimpan.", 1);
}

export async function delTutorEvaluation(fd) {
  await requireRole("ADMIN");
  const id = +g(fd, "id");
  const back = safe(g(fd, "back"));
  await db.tutorEvaluation.delete({ where: { id } });
  go(back, "Catatan evaluasi dihapus.", 1);
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
export async function updateAvail(fd) {
  const tutorId = await ownerId(fd), b = safe(g(fd, "back"));
  const id = +g(fd, "id");
  if (!id) go(b, "Jadwal tidak ditemukan.");
  const existing = await db.availability.findFirst({ where: { id, tutorId } });
  if (!existing) go(b, "Jadwal tidak ditemukan atau tidak memiliki akses.");

  const d = {
    hari: +g(fd, "hari"),
    sesiId: +g(fd, "sesiId"),
    roomId: +g(fd, "roomId"),
    programId: +g(fd, "programId"),
    catatan: g(fd, "catatan").slice(0, 255),
  };
  if (!d.sesiId || !d.roomId || !d.programId) go(b, "Pilih sesi, ruangan, dan program.");

  const tutorConflict = await db.availability.findFirst({
    where: { tutorId, hari: d.hari, sesiId: d.sesiId, NOT: { id } },
  });
  if (tutorConflict) go(b, "Anda sudah memiliki jadwal lain di hari dan sesi tersebut.");

  const roomConflict = await db.availability.findFirst({
    where: { roomId: d.roomId, hari: d.hari, sesiId: d.sesiId, NOT: { id } },
    include: { tutor: { include: { user: true } } },
  });
  if (roomConflict) go(b, "Ruangan sudah dipakai oleh " + roomConflict.tutor.user.name + " di hari dan sesi tersebut.");

  await db.availability.update({ where: { id }, data: d });
  go(b, "Jadwal berhasil diperbarui.", 1);
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
