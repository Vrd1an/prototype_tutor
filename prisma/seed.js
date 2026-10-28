const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const db = new PrismaClient();
const h = (p) => bcrypt.hashSync(p, 10);
(async () => {
  await db.user.upsert({ where: { email: "admin@bimbel.test" }, update: {}, create: { name: "Admin", email: "admin@bimbel.test", password: h("admin123"), role: "ADMIN" } });
  for (const n of ["Reguler", "Private"]) await db.program.upsert({ where: { name: n }, update: {}, create: { name: n } });
  for (let i = 1; i <= 8; i++) await db.room.upsert({ where: { name: "Ruang " + i }, update: {}, create: { name: "Ruang " + i, lokasi: i <= 4 ? "Lantai 1" : "Lantai 2" } });
  if ((await db.sesi.count()) === 0)
    await db.sesi.createMany({ data: [{ label: "Sesi 1", start: "14:00", end: "15:30" }, { label: "Sesi 2", start: "16:00", end: "17:30" }] });
  const T = [
    ["Rina Putri", "rina@bimbel.test", "Matematika", "Aljabar & Kalkulus", "081200000001", "Mengajar matematika SMP dan SMA dengan latihan soal bertahap."],
    ["Dimas Aryo", "dimas@bimbel.test", "Fisika", "Fisika Dasar & Mekanika", "081200000002", "Fokus pada pemahaman konsep fisika dan persiapan ujian."],
    ["Sari Lestari", "sari@bimbel.test", "Bahasa Inggris", "Grammar & Conversation", "081200000003", "Percakapan, grammar, dan persiapan tes bahasa Inggris."],
  ];
  for (const [name, email, mapel, bidang, phone, bio] of T)
    await db.user.upsert({ where: { email }, update: {}, create: { name, email, password: h("tutor123"), role: "TUTOR", tutor: { create: { mapel, bidang, phone, bio } } } });
  if ((await db.availability.count()) === 0) {
    const tutors = await db.tutor.findMany({ include: { user: true } });
    const tid = Object.fromEntries(tutors.map((t) => [t.user.name, t.id]));
    const P = Object.fromEntries((await db.program.findMany()).map((x) => [x.name, x.id]));
    const R = Object.fromEntries((await db.room.findMany()).map((x) => [x.name, x.id]));
    const S = (await db.sesi.findMany({ orderBy: { start: "asc" } })).map((x) => x.id);
    // [tutor, hari(0=Min), sesi(0/1), ruang, program, catatan]
    const A = [
      ["Rina Putri", 1, 0, 1, "Reguler", "Bawa buku latihan bab terakhir."], ["Rina Putri", 1, 1, 2, "Private", ""], ["Rina Putri", 3, 0, 1, "Reguler", ""], ["Rina Putri", 5, 1, 3, "Private", ""],
      ["Dimas Aryo", 1, 0, 2, "Private", ""], ["Dimas Aryo", 2, 0, 1, "Reguler", "Pembahasan soal ujian."], ["Dimas Aryo", 2, 1, 4, "Reguler", ""], ["Dimas Aryo", 4, 1, 1, "Private", ""], ["Dimas Aryo", 6, 0, 5, "Reguler", ""],
      ["Sari Lestari", 2, 1, 2, "Private", ""], ["Sari Lestari", 3, 1, 3, "Reguler", "Sesi percakapan, wajib aktif bicara."], ["Sari Lestari", 4, 0, 4, "Private", ""], ["Sari Lestari", 5, 0, 2, "Reguler", ""],
    ];
    await db.availability.createMany({ data: A.map(([n, hari, s, r, p, catatan]) => ({ tutorId: tid[n], hari, sesiId: S[s], roomId: R["Ruang " + r], programId: P[p], catatan })) });
  }
  console.log("Seed selesai.");
})().finally(() => db.$disconnect());
