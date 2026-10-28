import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { todayWIB, dow, todayInfo, initials, tanggalLengkap } from "@/lib/util";
import Notice from "@/app/notice";

export default async function Admin({ searchParams }) {
  await requireRole("ADMIN");
  const today = dow(todayWIB());
  const q = String(searchParams?.q || "").toLowerCase().trim();
  const filterStatus = String(searchParams?.status || "ALL");
  const filterJenjang = String(searchParams?.jenjang || "ALL");

  const [allTutors, totalRooms] = await Promise.all([
    db.tutor.findMany({
      orderBy: { id: "asc" },
      include: {
        user: true,
        avails: { include: { sesi: true, room: true } },
        documents: true,
        evaluations: true,
      },
    }),
    db.room.count(),
  ]);

  // Filter logika Modul 1
  const filteredTutors = allTutors.filter((t) => {
    if (q) {
      const match =
        t.user.name.toLowerCase().includes(q) ||
        t.user.email.toLowerCase().includes(q) ||
        t.mapel.toLowerCase().includes(q) ||
        t.bidang.toLowerCase().includes(q) ||
        t.nik.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterJenjang !== "ALL" && !t.jenjang.toLowerCase().includes(filterJenjang.toLowerCase())) return false;
    return true;
  });

  const rows = allTutors.map((t) => {
    const slots = t.avails.filter((a) => a.hari === today).sort((a, b) => a.sesi.start.localeCompare(b.sesi.start));
    const info = todayInfo(t);
    const s =
      t.status === "INACTIVE" || !t.user.active
        ? { k: "off", l: "Nonaktif" }
        : t.status === "ON_LEAVE" || info.izin
        ? { k: "bad", l: "Izin / Cuti" }
        : !t.avails.length
        ? { k: "off", l: "Belum ada jadwal" }
        : slots.length
        ? { k: "ok", l: "Mengajar hari ini" }
        : { k: "off", l: "Tidak ada jadwal hari ini" };
    return { t, slots, info, s };
  });

  const bertugas = rows.filter((r) => r.t.user.active && r.t.status === "ACTIVE" && r.slots.length && !r.info.izin);
  const sesiHariIni = bertugas.reduce((n, r) => n + r.slots.length, 0);
  const rUsed = new Set(bertugas.flatMap((r) => r.slots.map((a) => a.roomId))).size;

  const totalAktif = allTutors.filter((t) => t.status === "ACTIVE").length;
  const totalCuti = allTutors.filter((t) => t.status === "ON_LEAVE").length;

  return (
    <>
      <div className="top row">
        <div>
          <span className="eyebrow">{tanggalLengkap()}</span>
          <h1>Database &amp; Monitoring Tutor</h1>
        </div>
        <Link href="/admin/tutor/baru" className="btn">
          + Tambah Tutor Baru
        </Link>
      </div>

      <Notice sp={searchParams} />

      {/* Ringkasan Statistik Modul 1 & Operasional */}
      <div className="stats">
        <div className="stat">
          <span className="sub">Total Database Tutor</span>
          <b>{allTutors.length}</b>
        </div>
        <div className="stat">
          <span className="sub">Tutor Aktif</span>
          <b>{totalAktif}</b>
        </div>
        <div className="stat">
          <span className="sub">Cuti / Izin</span>
          <b style={{ color: totalCuti > 0 ? "var(--ambx)" : "inherit" }}>{totalCuti}</b>
        </div>
        <div className="stat">
          <span className="sub">Bertugas Hari Ini</span>
          <b>{bertugas.length}</b>
        </div>
        <div className="stat">
          <span className="sub">Sesi Hari Ini</span>
          <b>{sesiHariIni}</b>
        </div>
      </div>

      {/* Panel Monitoring Hari-H (Operasional) */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <h2>Pemantauan Mengajar Hari Ini</h2>
          <span className="sub">
            Ruangan Terpakai: <b>{rUsed}</b> / {totalRooms}
          </span>
        </div>
        {rows.length ? (
          <div className="mon">
            {rows
              .filter((r) => r.t.user.active && r.t.status === "ACTIVE")
              .map(({ t, slots, info, s }) => (
                <div className="mcard" key={t.id}>
                  <div className="row">
                    <div className="who" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {t.foto ? (
                        <img src={t.foto} alt={t.user.name} className="av-img" style={{ width: 40, height: 40 }} />
                      ) : (
                        <div className="av" style={{ width: 40, height: 40 }}>
                          {initials(t.user.name)}
                        </div>
                      )}
                      <div>
                        <b style={{ color: "var(--ink)" }}>{t.user.name}</b>
                        <div className="sub">{t.mapel}</div>
                      </div>
                    </div>
                    <span className={"pill " + s.k}>
                      <i />
                      {s.l}
                    </span>
                  </div>
                  <div className="box">
                    {slots.length ? (
                      slots.map((a) => (
                        <div key={a.id}>
                          {a.sesi.start}–{a.sesi.end} · {a.room.name}
                        </div>
                      ))
                    ) : (
                      <span className="sub">Tidak ada sesi mengajar hari ini</span>
                    )}
                  </div>
                  {info.notice && <div className="alert">{info.notice}</div>}
                  <Link href={"/admin/tutor/" + t.userId + "#override"} className="btn s sm">
                    Override Keterangan
                  </Link>
                </div>
              ))}
          </div>
        ) : (
          <p className="empty">Belum ada tutor terdaftar.</p>
        )}
      </section>

      {/* Panel Modul 1: Database & Direktori Tutor */}
      <section className="panel">
        <div className="row" style={{ marginBottom: 16 }}>
          <div>
            <h2>Direktori &amp; Profil Tutor (Modul 1)</h2>
            <p className="sub" style={{ marginTop: 2 }}>
              Sumber data utama tenaga pengajar: kompetensi, jenjang, dokumen administrasi, dan catatan evaluasi.
            </p>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="filters" style={{ margin: "0 0 16px" }}>
          <form method="GET" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama tutor, email, mapel, NIK, atau no. HP..."
              style={{ flex: "2 1 240px" }}
            />
            <select name="status" defaultValue={filterStatus} style={{ flex: "1 1 140px" }}>
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="ON_LEAVE">Cuti / Izin</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
            <select name="jenjang" defaultValue={filterJenjang} style={{ flex: "1 1 140px" }}>
              <option value="ALL">Semua Jenjang</option>
              <option value="SD">Jenjang SD</option>
              <option value="SMP">Jenjang SMP</option>
              <option value="SMA">Jenjang SMA</option>
              <option value="UTBK">Jenjang UTBK/Kedinasan</option>
            </select>
            <button className="btn s" type="submit">
              Filter
            </button>
            {(q || filterStatus !== "ALL" || filterJenjang !== "ALL") && (
              <Link href="/admin" className="lnk" style={{ fontSize: 13 }}>
                Reset Filter
              </Link>
            )}
          </form>
        </div>

        {/* Tabel Data Tutor */}
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Tutor &amp; Kontak</th>
                <th>Mata Pelajaran &amp; Jenjang</th>
                <th>Jenis Kelas</th>
                <th>Dokumen Admin</th>
                <th>Evaluasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTutors.length > 0 ? (
                filteredTutors.map((t) => {
                  const validDocs = t.documents.filter((d) => d.status === "VALID").length;
                  const avgScore =
                    t.evaluations.length > 0
                      ? (t.evaluations.reduce((sum, e) => sum + e.skor, 0) / t.evaluations.length).toFixed(1)
                      : null;

                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {t.foto ? (
                            <img src={t.foto} alt={t.user.name} className="av-img" style={{ width: 36, height: 36 }} />
                          ) : (
                            <div className="av" style={{ width: 36, height: 36, fontSize: 13 }}>
                              {initials(t.user.name)}
                            </div>
                          )}
                          <div>
                            <b style={{ color: "var(--ink)", display: "block" }}>{t.user.name}</b>
                            <span className="sub" style={{ fontSize: 12 }}>
                              {t.phone || t.user.email}
                              {t.nik ? ` · NIK: ${t.nik}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tag">{t.mapel}</span>
                        {t.jenjang && (
                          <div style={{ fontSize: 11.5, color: "var(--sub)", marginTop: 4 }}>
                            {t.jenjang}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: "var(--body)" }}>
                          {t.jenisKelas || <span className="sub">-</span>}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            "badge " +
                            (validDocs >= 2
                              ? "badge-valid"
                              : validDocs > 0
                              ? "badge-pending"
                              : "badge-need")
                          }
                        >
                          {validDocs} Berkas Valid ({t.documents.length} Total)
                        </span>
                      </td>
                      <td>
                        {avgScore ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#CA8A04" }}>
                            ★ {avgScore} <small style={{ color: "var(--sub)", fontWeight: 400 }}>({t.evaluations.length})</small>
                          </span>
                        ) : (
                          <span className="sub" style={{ fontSize: 12 }}>Belum dinilai</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            "pill " +
                            (t.status === "ACTIVE"
                              ? "active"
                              : t.status === "ON_LEAVE"
                              ? "leave"
                              : "inactive")
                          }
                        >
                          <i />
                          {t.status === "ACTIVE"
                            ? "Aktif"
                            : t.status === "ON_LEAVE"
                            ? "Cuti / Izin"
                            : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <Link href={"/admin/tutor/" + t.userId} className="btn s sm">
                          Profil &amp; Kelola
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px 16px", color: "var(--sub)" }}>
                    Tidak ada tutor yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
