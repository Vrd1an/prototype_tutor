import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { todayInfo, initials, todayWIB } from "@/lib/util";
import {
  updateTutor,
  delTutor,
  addTutorDocument,
  updateTutorDocumentStatus,
  delTutorDocument,
  addTutorEvaluation,
  delTutorEvaluation,
} from "@/app/actions";
import AvailManager from "@/app/availManager";
import TodayPanel from "@/app/todayPanel";
import Notice from "@/app/notice";

export default async function KelolaTutor({ params, searchParams }) {
  const s = await requireRole("ADMIN");
  const t = await db.tutor.findUnique({
    where: { userId: +params.id },
    include: {
      user: true,
      documents: { orderBy: { id: "desc" } },
      evaluations: { orderBy: { id: "desc" } },
    },
  });

  if (!t) notFound();

  const info = todayInfo(t);
  const back = "/admin/tutor/" + t.userId;

  const jenjangList = ["SD", "SMP", "SMA", "UTBK/Kedinasan"];
  const currentJenjang = t.jenjang ? t.jenjang.split(",").map((x) => x.trim()) : [];

  const jenisKelasList = ["Reguler", "Privat", "Semi-Privat", "Kelas Online", "Kelas Offline"];
  const currentJenisKelas = t.jenisKelas ? t.jenisKelas.split(",").map((x) => x.trim()) : [];

  const validDocs = t.documents.filter((d) => d.status === "VALID").length;
  const avgScore =
    t.evaluations.length > 0
      ? (t.evaluations.reduce((sum, e) => sum + e.skor, 0) / t.evaluations.length).toFixed(1)
      : null;

  return (
    <>
      <p style={{ marginBottom: 12 }}>
        <Link href="/admin" className="lnk">
          ← Kembali ke Direktori &amp; Monitoring
        </Link>
      </p>

      {/* Header Profil Tutor */}
      <div
        className="top"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          background: "#fff",
          padding: 20,
          borderRadius: 20,
          border: "1px solid var(--line)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {t.foto ? (
            <img src={t.foto} alt={t.user.name} className="av-img" style={{ width: 68, height: 68 }} />
          ) : (
            <div className="av" style={{ width: 68, height: 68, fontSize: 24 }}>
              {initials(t.user.name)}
            </div>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 24 }}>{t.user.name}</h1>
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
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              <b>{t.mapel}</b>
              {t.bidang ? ` · ${t.bidang}` : ""}
              {t.nik ? ` · NIK: ${t.nik}` : ""}
              {t.joinDate ? ` · Bergabung: ${t.joinDate}` : ""}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <span className="sub" style={{ fontSize: 11, textTransform: "uppercase" }}>Dokumen</span>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>
              {validDocs}/{t.documents.length} Valid
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="sub" style={{ fontSize: 11, textTransform: "uppercase" }}>Evaluasi</span>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#CA8A04" }}>
              {avgScore ? `★ ${avgScore}` : "-"}
            </div>
          </div>
        </div>
      </div>

      <Notice sp={searchParams} />

      {/* Navigasi Tab Cepat */}
      <div className="tab-bar">
        <a href="#profil" className="tab-btn active">Profil &amp; Kompetensi</a>
        <a href="#dokumen" className="tab-btn">Dokumen Administrasi ({t.documents.length})</a>
        <a href="#evaluasi" className="tab-btn">Catatan Evaluasi ({t.evaluations.length})</a>
        <a href="#jadwal" className="tab-btn">Jadwal &amp; Kehadiran</a>
      </div>

      {/* 1. SEKSI PROFIL & KOMPETENSI (MODUL 1) */}
      <section className="panel" id="profil" style={{ marginBottom: 24 }}>
        <h2>1. Database Biodata &amp; Kompetensi Tutor</h2>
        <form action={updateTutor} className="col">
          <input type="hidden" name="id" value={t.userId} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <label>
              Nama Lengkap &amp; Gelar
              <input name="name" defaultValue={t.user.name} required />
            </label>
            <label>
              Nomor Induk Kependudukan (NIK)
              <input name="nik" defaultValue={t.nik} placeholder="Contoh: 3201018902990001" />
            </label>
            <label>
              Email Login Akun
              <input name="email" type="email" defaultValue={t.user.email} required />
            </label>
            <label>
              No. HP / WhatsApp
              <input name="phone" defaultValue={t.phone} placeholder="08xxxxxxxxxx" />
            </label>
            <label>
              Tanggal Bergabung (Join Date)
              <input name="joinDate" type="date" defaultValue={t.joinDate || todayWIB()} />
            </label>
            <label>
              Status Keaktifan Tutor
              <select name="status" defaultValue={t.status}>
                <option value="ACTIVE">Aktif (Dapat Diberi Jadwal)</option>
                <option value="ON_LEAVE">Cuti / Izin Sementara</option>
                <option value="INACTIVE">Nonaktif / Berhenti</option>
              </select>
            </label>
          </div>

          <label>
            Alamat Domisili
            <input name="alamat" defaultValue={t.alamat} placeholder="Jl. Nama Jalan, No. Rumah, Kota/Kabupaten" />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 4 }}>
            <label>
              Mata Pelajaran Utama
              <input name="mapel" defaultValue={t.mapel} required placeholder="Contoh: Matematika" />
            </label>
            <label>
              Bidang / Spesialisasi
              <input name="bidang" defaultValue={t.bidang} placeholder="Contoh: Aljabar, Geometri, Kalkulus" />
            </label>
          </div>

          {/* Jenjang yang Dapat Ditangani */}
          <div style={{ marginTop: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6 }}>
              Jenjang yang Dapat Ditangani:
            </span>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {jenjangList.map((j) => (
                <label key={j} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    name="jenjang"
                    value={j}
                    defaultChecked={currentJenjang.includes(j)}
                    style={{ width: "auto" }}
                  />
                  <span>{j}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Jenis Kelas yang Sanggup Diampu */}
          <div style={{ marginTop: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6 }}>
              Jenis Kelas yang Sanggup Diampu:
            </span>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {jenisKelasList.map((k) => (
                <label key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    name="jenisKelas"
                    value={k}
                    defaultChecked={currentJenisKelas.includes(k)}
                    style={{ width: "auto" }}
                  />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <label>
              Upload Foto Profil Baru
              <input type="file" name="fotoFile" accept="image/*" />
            </label>
            <label>
              Atau Link URL Foto
              <input name="foto" defaultValue={t.foto || ""} placeholder="https://... atau /uploads/..." />
            </label>
          </div>

          <label>
            Keterangan Profil / Bio Singkat (Tampil di Portal Publik)
            <textarea
              name="bio"
              rows={3}
              maxLength={500}
              defaultValue={t.bio}
              placeholder="Deskripsi pengalaman atau pendekatan mengajar tutor..."
            />
          </label>

          {/* Catatan Khusus Koordinator (Internal Admin) */}
          <label style={{ background: "var(--mint)", padding: 14, borderRadius: 14, border: "1px solid rgba(13,148,136,.2)" }}>
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>
              Catatan Internal Koordinator Tutor 🔒
            </span>
            <span className="sub" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
              Catatan rahasia evaluasi, kepatuhan, atau arahan khusus. Hanya terlihat oleh Koordinator &amp; Admin.
            </span>
            <textarea
              name="catatanInternal"
              rows={3}
              maxLength={1000}
              defaultValue={t.catatanInternal}
              placeholder="Tulis catatan kualifikasi khusus, histori koordinasi, atau catatan kedisiplinan..."
              style={{ background: "#fff" }}
            />
          </label>

          <label>
            Password Baru (Kosongkan jika tidak ingin mengubah password akun)
            <input name="password" minLength={6} placeholder="Minimal 6 karakter" />
          </label>

          <button className="btn" style={{ alignSelf: "flex-start", marginTop: 6 }}>
            Simpan Perubahan Data Profil
          </button>
        </form>
      </section>

      {/* 2. SEKSI DOKUMEN ADMINISTRASI (MODUL 1) */}
      <section className="panel" id="dokumen" style={{ marginBottom: 24 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <h2>2. Dokumen Administrasi Tutor</h2>
            <p className="sub" style={{ marginTop: 2 }}>
              Penyimpanan dan verifikasi berkas: CV, Ijazah, Surat Perjanjian Kontrak (PKS), dan Sertifikat.
            </p>
          </div>
        </div>

        {/* Daftar Dokumen yang Tersedia */}
        {t.documents.length > 0 ? (
          <div className="doc-grid" style={{ marginBottom: 24 }}>
            {t.documents.map((doc) => (
              <div className="doc-card" key={doc.id}>
                <div className="doc-title">
                  <span>{doc.namaFile}</span>
                  <span
                    className={
                      "badge " +
                      (doc.status === "VALID"
                        ? "badge-valid"
                        : doc.status === "MENUNGGU_VERIFIKASI"
                        ? "badge-pending"
                        : "badge-need")
                    }
                  >
                    {doc.status === "VALID"
                      ? "Valid"
                      : doc.status === "MENUNGGU_VERIFIKASI"
                      ? "Menunggu Cek"
                      : "Perlu Update"}
                  </span>
                </div>
                <div className="doc-meta">
                  <span>Kategori: <b>{doc.jenis}</b></span>
                  {doc.catatan && <div style={{ fontStyle: "italic", marginTop: 4 }}>Note: {doc.catatan}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8 }}>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn s sm" style={{ flex: 1, textAlign: "center" }}>
                    Buka Berkas ↗
                  </a>
                  <form action={delTutorDocument}>
                    <input type="hidden" name="id" value={doc.id} />
                    <input type="hidden" name="back" value={back + "#dokumen"} />
                    <button className="btn s sm del" title="Hapus dokumen ini">
                      Hapus
                    </button>
                  </form>
                </div>

                {/* Form Verifikasi Cepat oleh Koordinator */}
                <form action={updateTutorDocumentStatus} style={{ marginTop: 6, paddingTop: 6, borderTop: "1px dashed var(--line)" }}>
                  <input type="hidden" name="id" value={doc.id} />
                  <input type="hidden" name="back" value={back + "#dokumen"} />
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <select name="status" defaultValue={doc.status} style={{ fontSize: 12, padding: "4px 8px", flex: 1 }}>
                      <option value="VALID">Set Valid</option>
                      <option value="MENUNGGU_VERIFIKASI">Set Menunggu</option>
                      <option value="PERLU_DIPERBARUI">Set Perlu Update</option>
                    </select>
                    <button className="btn s sm" style={{ fontSize: 11, padding: "4px 10px" }}>
                      Update
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty" style={{ margin: "14px 0 20px" }}>
            Belum ada dokumen administrasi yang diunggah untuk tutor ini.
          </p>
        )}

        {/* Form Tambah Dokumen Administrasi */}
        <div style={{ background: "var(--mute)", padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
          <h3 style={{ fontSize: 15, marginBottom: 8, color: "var(--ink)" }}>+ Unggah / Tambah Dokumen Administrasi Baru</h3>
          <form action={addTutorDocument} className="col">
            <input type="hidden" name="tutorId" value={t.id} />
            <input type="hidden" name="back" value={back + "#dokumen"} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label>
                Jenis Berkas
                <select name="jenis" required>
                  <option value="CV">Curriculum Vitae (CV)</option>
                  <option value="Ijazah">Ijazah / Transkrip Nilai</option>
                  <option value="Kontrak">Surat Perjanjian Kerja (Kontrak/PKS)</option>
                  <option value="Sertifikat">Sertifikat Pendidik / Pelatihan</option>
                  <option value="Lainnya">Dokumen Pendukung Lainnya</option>
                </select>
              </label>
              <label>
                Nama / Judul Dokumen
                <input name="namaFile" required placeholder="Contoh: Ijazah S1 Matematika UNJ" />
              </label>
              <label>
                Upload File Dokumen (PDF / JPG / PNG)
                <input type="file" name="documentFile" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
              <label>
                Atau Link URL Dokumen (Google Drive / Cloud)
                <input name="fileUrl" placeholder="https://drive.google.com/..." />
              </label>
            </div>
            <label>
              Catatan Status Dokumen
              <input name="catatan" placeholder="Contoh: Terverifikasi asli, masa berlaku s/d 2026" />
            </label>
            <button className="btn s" style={{ alignSelf: "flex-start" }}>
              Simpan Dokumen Administrasi
            </button>
          </form>
        </div>
      </section>

      {/* 3. SEKSI CATATAN EVALUASI KOORDINATOR (MODUL 1) */}
      <section className="panel" id="evaluasi" style={{ marginBottom: 24 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <h2>3. Catatan Evaluasi &amp; Penilaian Kinerja Tutor</h2>
            <p className="sub" style={{ marginTop: 2 }}>
              Rekam jejak penilaian berkala koordinator terkait kinerja pengajaran, kedisiplinan, dan administrasi.
            </p>
          </div>
        </div>

        {/* Riwayat Evaluasi */}
        {t.evaluations.length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            {t.evaluations.map((ev) => (
              <div className="eval-card" key={ev.id}>
                <div className="eval-head">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="eval-stars">
                      {"★".repeat(ev.skor)}
                      <span style={{ color: "var(--line)" }}>{"★".repeat(5 - ev.skor)}</span>
                    </span>
                    <b style={{ color: "var(--ink)", fontSize: 14 }}>{ev.kategori}</b>
                    <span className="sub" style={{ fontSize: 12 }}>
                      oleh {ev.penilai} · {ev.tanggal}
                    </span>
                  </div>
                  <form action={delTutorEvaluation}>
                    <input type="hidden" name="id" value={ev.id} />
                    <input type="hidden" name="back" value={back + "#evaluasi"} />
                    <button className="btn s sm del" style={{ padding: "3px 8px", fontSize: 11 }}>
                      Hapus
                    </button>
                  </form>
                </div>
                <div className="eval-note">{ev.catatan}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty" style={{ margin: "14px 0 20px" }}>
            Belum ada catatan evaluasi berkala untuk tutor ini.
          </p>
        )}

        {/* Form Tambah Catatan Evaluasi */}
        <div style={{ background: "var(--mute)", padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
          <h3 style={{ fontSize: 15, marginBottom: 8, color: "var(--ink)" }}>+ Tambah Catatan Evaluasi Baru</h3>
          <form action={addTutorEvaluation} className="col">
            <input type="hidden" name="tutorId" value={t.id} />
            <input type="hidden" name="back" value={back + "#evaluasi"} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <label>
                Kategori Evaluasi
                <select name="kategori">
                  <option value="Kinerja">Kinerja Pengajaran</option>
                  <option value="Kedisiplinan">Kedisiplinan &amp; Kehadiran</option>
                  <option value="Metode Mengajar">Metode &amp; Penguasaan Materi</option>
                  <option value="Administrasi">Ketertiban Administrasi / BAP</option>
                </select>
              </label>
              <label>
                Skor Penilaian (1 - 5 Bintang)
                <select name="skor" defaultValue="5">
                  <option value="5">★★★★★ (5 - Sangat Baik)</option>
                  <option value="4">★★★★☆ (4 - Baik)</option>
                  <option value="3">★★★☆☆ (3 - Cukup)</option>
                  <option value="2">★★☆☆☆ (2 - Kurang)</option>
                  <option value="1">★☆☆☆☆ (1 - Sangat Kurang)</option>
                </select>
              </label>
              <label>
                Tanggal Evaluasi
                <input name="tanggal" type="date" defaultValue={todayWIB()} />
              </label>
              <label>
                Nama Penilai
                <input name="penilai" defaultValue={s.name || "Koordinator Tutor"} />
              </label>
            </div>
            <label>
              Catatan Detail / Umpan Balik Koordinator
              <textarea
                name="catatan"
                rows={3}
                required
                placeholder="Tuliskan catatan observasi kelas, hasil review siswa, atau poin perbaikan..."
              />
            </label>
            <button className="btn s" style={{ alignSelf: "flex-start" }}>
              Simpan Evaluasi
            </button>
          </form>
        </div>
      </section>

      {/* 4. SEKSI STATUS HARI INI & JADWAL (OPERASIONAL) */}
      <div id="jadwal">
        <TodayPanel tutorId={t.id} izin={info.izin} notice={info.notice} back={back} admin />
        <AvailManager tutorId={t.id} back={back} />
      </div>

      {/* Zona Bahaya / Hapus Akun */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        <form action={delTutor}>
          <input type="hidden" name="id" value={t.userId} />
          <button className="btn del">Hapus Tutor dari Database</button>
        </form>
      </div>
    </>
  );
}
