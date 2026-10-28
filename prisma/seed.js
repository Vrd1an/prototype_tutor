const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const db = new PrismaClient();
const h = (p) => bcrypt.hashSync(p, 10);

(async () => {
  // 1. Admin / Koordinator User
  await db.user.upsert({
    where: { email: "admin@bimbel.test" },
    update: {},
    create: { name: "Koordinator Tutor", email: "admin@bimbel.test", password: h("admin123"), role: "ADMIN" },
  });

  // 2. Program Bimbel
  for (const n of ["Reguler", "Private", "Semi-Private"]) {
    await db.program.upsert({ where: { name: n }, update: {}, create: { name: n } });
  }

  // 3. Ruangan
  for (let i = 1; i <= 8; i++) {
    await db.room.upsert({
      where: { name: "Ruang " + i },
      update: {},
      create: { name: "Ruang " + i, lokasi: i <= 4 ? "Lantai 1 (Utama)" : "Lantai 2 (Lab & Multimedia)" },
    });
  }

  // 4. Master Sesi Jam Belajar
  if ((await db.sesi.count()) === 0) {
    await db.sesi.createMany({
      data: [
        { label: "Sesi 1 (Siang)", start: "14:00", end: "15:30" },
        { label: "Sesi 2 (Sore)", start: "16:00", end: "17:30" },
        { label: "Sesi 3 (Malam)", start: "19:00", end: "20:30" },
      ],
    });
  }

  // 5. Data Tutor Lengkap (Modul 1: Database & Profil Tutor)
  const tutorsData = [
    {
      name: "Rina Putri, S.Pd.",
      email: "rina@bimbel.test",
      nik: "3201018902990001",
      alamat: "Jl. Margonda Raya No. 45, Beji, Depok",
      status: "ACTIVE",
      joinDate: "2023-01-15",
      mapel: "Matematika",
      bidang: "Aljabar, Kalkulus & Geometri",
      jenjang: "SMP, SMA, UTBK/Kedinasan",
      jenisKelas: "Reguler, Privat, Semi-Privat, Online, Offline",
      phone: "081200000001",
      bio: "Lulusan Pendidikan Matematika UNJ. Berpengalaman 5+ tahun mengajar persiapan UTBK-SNBT dan olimpiade matematika SMP/SMA.",
      catatanInternal: "Sangat direkomendasikan untuk siswa target UTBK Saintek. Komitmen tinggi dan responsif terhadap arahan koordinasi.",
      docs: [
        { jenis: "CV", namaFile: "CV_Rina_Putri_2025.pdf", fileUrl: "/uploads/docs/cv_rina.pdf", status: "VALID", catatan: "Lengkap dan mutakhir." },
        { jenis: "Ijazah", namaFile: "Ijazah_S1_Pendidikan_Matematika.pdf", fileUrl: "/uploads/docs/ijazah_rina.pdf", status: "VALID", catatan: "IPK 3.82 terverifikasi." },
        { jenis: "Kontrak", namaFile: "Perjanjian_Kerja_Tutor_2025_2026.pdf", fileUrl: "/uploads/docs/kontrak_rina.pdf", status: "VALID", catatan: "Masa kontrak s/d Des 2026." },
      ],
      evals: [
        { penilai: "Koordinator Akademik", tanggal: "2026-09-20", skor: 5, kategori: "Kinerja", catatan: "Penyampaian materi sangat mudah dipahami siswa, tingkat kepuasan siswa 96%." },
        { penilai: "Koordinator Tutor", tanggal: "2026-10-15", skor: 5, kategori: "Kedisiplinan", catatan: "Selalu hadir 15 menit sebelum sesi dimulai dan tertib BAP." },
      ],
    },
    {
      name: "Dimas Aryo, M.Si.",
      email: "dimas@bimbel.test",
      nik: "3275021204940003",
      alamat: "Perum Graha Indah Blok C2 No. 10, Jakarta Selatan",
      status: "ACTIVE",
      joinDate: "2023-07-01",
      mapel: "Fisika",
      bidang: "Fisika Dasar, Mekanika & Termodinamika",
      jenjang: "SMA, UTBK/Kedinasan",
      jenisKelas: "Reguler, Privat, Offline",
      phone: "081200000002",
      bio: "Master Fisika ITB. Mengutamakan pemahaman konsep logika fisika tanpa hafalan rumus mati.",
      catatanInternal: "Ahli di bidang persiapan ujian seleksi PTN & Kedinasan (STIS/Poltekim).",
      docs: [
        { jenis: "CV", namaFile: "CV_Dimas_Aryo.pdf", fileUrl: "/uploads/docs/cv_dimas.pdf", status: "VALID", catatan: "Portofolio mengajar lengkap." },
        { jenis: "Ijazah", namaFile: "Ijazah_S2_Fisika_ITB.pdf", fileUrl: "/uploads/docs/ijazah_s2_dimas.pdf", status: "VALID", catatan: "Ijazah Magister Fisika." },
        { jenis: "Kontrak", namaFile: "Kontrak_Tutor_2025_2026.pdf", fileUrl: "/uploads/docs/kontrak_dimas.pdf", status: "VALID", catatan: "Aktif." },
      ],
      evals: [
        { penilai: "Koordinator Akademik", tanggal: "2026-10-10", skor: 5, kategori: "Metode Mengajar", catatan: "Metode pemecahan soal cepat sangat diminati kelas intensif UTBK." },
      ],
    },
    {
      name: "Sari Lestari, S.Hum.",
      email: "sari@bimbel.test",
      nik: "3171056508980002",
      alamat: "Apartemen Kalibata City Tower Kemuning, Jakarta Selatan",
      status: "ACTIVE",
      joinDate: "2024-02-10",
      mapel: "Bahasa Inggris",
      bidang: "Grammar, Academic Writing & TOEFL/IELTS Preparation",
      jenjang: "SMP, SMA, UTBK/Kedinasan",
      jenisKelas: "Reguler, Privat, Semi-Privat, Online, Offline",
      phone: "081200000003",
      bio: "Sastra Inggris UI, skor TOEFL ITP 640 & IELTS 8.0. Interaktif dengan metode communicative language teaching.",
      catatanInternal: "Tutor favorit kelas privat Bahasa Inggris & persiapan beasiswa.",
      docs: [
        { jenis: "CV", namaFile: "CV_Sari_Lestari.pdf", fileUrl: "/uploads/docs/cv_sari.pdf", status: "VALID", catatan: "Valid." },
        { jenis: "Ijazah", namaFile: "Ijazah_S1_Sastra_Inggris_UI.pdf", fileUrl: "/uploads/docs/ijazah_sari.pdf", status: "VALID", catatan: "Terverifikasi." },
        { jenis: "Sertifikat", namaFile: "Sertifikat_IELTS_Band_8.pdf", fileUrl: "/uploads/docs/ielts_sari.pdf", status: "VALID", catatan: "Skor 8.0 masa berlaku aktif." },
      ],
      evals: [
        { penilai: "Koordinator Tutor", tanggal: "2026-10-05", skor: 4, kategori: "Administrasi", catatan: "Pengisian BAP terkadang dirapel, sudah diingatkan untuk submit harian." },
      ],
    },
    {
      name: "Budi Santoso, S.Si.",
      email: "budi@bimbel.test",
      nik: "3202041101960005",
      alamat: "Jl. Cinere Raya No. 12, Depok",
      status: "ON_LEAVE",
      joinDate: "2024-05-01",
      mapel: "Kimia",
      bidang: "Kimia Organik & Stoikiometri",
      jenjang: "SMA, UTBK/Kedinasan",
      jenisKelas: "Reguler, Privat",
      phone: "081200000004",
      bio: "Kimia MIPA UI. Mengajar kimia secara visual dengan animasi molekul dan analogi sehari-hari.",
      catatanInternal: "Status cuti mengajar s/d akhir semester ganjil karena studi lanjut.",
      docs: [
        { jenis: "CV", namaFile: "CV_Budi_Santoso.pdf", fileUrl: "/uploads/docs/cv_budi.pdf", status: "VALID", catatan: "Lengkap." },
      ],
      evals: [],
    },
  ];

  for (const t of tutorsData) {
    const user = await db.user.upsert({
      where: { email: t.email },
      update: { name: t.name, role: "TUTOR", active: t.status === "ACTIVE" },
      create: {
        name: t.name,
        email: t.email,
        password: h("tutor123"),
        role: "TUTOR",
        active: t.status === "ACTIVE",
      },
    });

    const tutor = await db.tutor.upsert({
      where: { userId: user.id },
      update: {
        nik: t.nik,
        alamat: t.alamat,
        status: t.status,
        joinDate: t.joinDate,
        mapel: t.mapel,
        bidang: t.bidang,
        jenjang: t.jenjang,
        jenisKelas: t.jenisKelas,
        phone: t.phone,
        bio: t.bio,
        catatanInternal: t.catatanInternal,
      },
      create: {
        userId: user.id,
        nik: t.nik,
        alamat: t.alamat,
        status: t.status,
        joinDate: t.joinDate,
        mapel: t.mapel,
        bidang: t.bidang,
        jenjang: t.jenjang,
        jenisKelas: t.jenisKelas,
        phone: t.phone,
        bio: t.bio,
        catatanInternal: t.catatanInternal,
      },
    });

    // Dokumen Administrasi (Modul 1)
    if (t.docs && t.docs.length > 0) {
      await db.tutorDocument.deleteMany({ where: { tutorId: tutor.id } });
      await db.tutorDocument.createMany({
        data: t.docs.map((d) => ({
          tutorId: tutor.id,
          jenis: d.jenis,
          namaFile: d.namaFile,
          fileUrl: d.fileUrl,
          status: d.status,
          catatan: d.catatan,
        })),
      });
    }

    // Evaluasi Koordinator (Modul 1)
    if (t.evals && t.evals.length > 0) {
      await db.tutorEvaluation.deleteMany({ where: { tutorId: tutor.id } });
      await db.tutorEvaluation.createMany({
        data: t.evals.map((e) => ({
          tutorId: tutor.id,
          penilai: e.penilai,
          tanggal: e.tanggal,
          skor: e.skor,
          kategori: e.kategori,
          catatan: e.catatan,
        })),
      });
    }
  }

  // 6. Availability Jadwal Mingguan
  if ((await db.availability.count()) === 0) {
    const tutors = await db.tutor.findMany({ include: { user: true } });
    const tid = Object.fromEntries(tutors.map((t) => [t.user.name, t.id]));
    const P = Object.fromEntries((await db.program.findMany()).map((x) => [x.name, x.id]));
    const R = Object.fromEntries((await db.room.findMany()).map((x) => [x.name, x.id]));
    const S = (await db.sesi.findMany({ orderBy: { start: "asc" } })).map((x) => x.id);

    // [tutor, hari(0=Min..6=Sabtu), sesi(0/1/2), ruang, program, catatan]
    const A = [
      ["Rina Putri, S.Pd.", 1, 0, 1, "Reguler", "Bawa modul kalkulus bab 4."],
      ["Rina Putri, S.Pd.", 1, 1, 2, "Private", "Persiapan intensif tryout."],
      ["Rina Putri, S.Pd.", 3, 0, 1, "Reguler", "Latihan soal SNBT."],
      ["Rina Putri, S.Pd.", 5, 1, 3, "Private", "Pembahasan PR sekolah."],
      ["Dimas Aryo, M.Si.", 1, 0, 2, "Private", "Konsep dinamika partikel."],
      ["Dimas Aryo, M.Si.", 2, 0, 1, "Reguler", "Pembahasan soal ujian fisika."],
      ["Dimas Aryo, M.Si.", 2, 1, 4, "Reguler", "Praktik soal mandiri."],
      ["Dimas Aryo, M.Si.", 4, 1, 1, "Private", "Mekanika lanjut."],
      ["Dimas Aryo, M.Si.", 6, 0, 5, "Reguler", "Bedah kisi-kisi UN/UTBK."],
      ["Sari Lestari, S.Hum.", 2, 1, 2, "Private", "Percakapan aktif & TOEFL grammar."],
      ["Sari Lestari, S.Hum.", 3, 1, 3, "Reguler", "Speaking drill wajib aktif."],
      ["Sari Lestari, S.Hum.", 4, 0, 4, "Private", "Academic essay writing."],
      ["Sari Lestari, S.Hum.", 5, 0, 2, "Reguler", "Reading comprehension tips."],
    ];

    await db.availability.createMany({
      data: A.filter(([n]) => tid[n]).map(([n, hari, s, r, p, catatan]) => ({
        tutorId: tid[n],
        hari,
        sesiId: S[s] || S[0],
        roomId: R["Ruang " + r] || R["Ruang 1"],
        programId: P[p] || P["Reguler"],
        catatan,
      })),
    });
  }

  console.log("Seeding Modul 1 (Database & Profil Tutor) berhasil selesai.");
})().finally(() => db.$disconnect());
