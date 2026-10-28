import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { todayWIB, dow, todayInfo, initials, tanggalLengkap } from "@/lib/util";
import { updateTutorProfile, addTutorDocument, delTutorDocument } from "@/app/actions";
import AvailManager from "@/app/availManager";
import TodayPanel from "@/app/todayPanel";
import Notice from "@/app/notice";

export default async function Saya({ searchParams }) {
  const s = await requireRole("TUTOR");
  const t = await db.tutor.findUnique({
    where: { userId: s.id },
    include: {
      avails: true,
      documents: { orderBy: { id: "desc" } },
      evaluations: { orderBy: { id: "desc" } },
    },
  });

  const today = dow(todayWIB());
  const info = todayInfo(t);
  const now = t.avails.filter((a) => a.hari === today);

  const validDocs = t.documents.filter((d) => d.status === "VALID").length;

  return (
    <>
      <div className="top">
        <span className="eyebrow">{tanggalLengkap()}</span>
        <div className="row" style={{ justifyContent: "flex-start", gap: 14, marginTop: 8 }}>
          {t.foto ? (
            <img src={t.foto} alt={s.name} className="av-img" />
          ) : (
            <div className="av">{initials(s.name)}</div>
          )}
          <div>
            <h1 style={{ margin: 0 }}>Halo, {s.name}</h1>
            <span className="sub">
              {t.mapel}
              {t.bidang ? " · " + t.bidang : ""}
              {t.jenjang ? " (" + t.jenjang + ")" : ""}
            </span>
          </div>
          <span className={"pill " + (info.izin ? "bad" : "ok")}>
            <i />
            {info.izin ? "Izin Hari Ini" : "Hadir"}
          </span>
        </div>
      </div>

      <Notice sp={searchParams} />

      {/* Ringkasan Statistik */}
      <div className="stats">
        <div className="stat">
          <span className="sub">Sesi Hari Ini</span>
          <b>{info.izin ? 0 : now.length}</b>
        </div>
        <div className="stat">
          <span className="sub">Slot Mengajar / Minggu</span>
          <b>{t.avails.length}</b>
        </div>
        <div className="stat">
          <span className="sub">Berkas Administrasi</span>
          <b>{validDocs}/{t.documents.length} Valid</b>
        </div>
        <div className="stat">
          <span className="sub">Catatan Evaluasi</span>
          <b>{t.evaluations.length} Catatan</b>
        </div>
      </div>

      {/* Status Hari Ini & Jadwal */}
      <TodayPanel tutorId={t.id} izin={info.izin} notice={info.notice} back="/tutor" />
      <AvailManager tutorId={t.id} back="/tutor" />

      {/* SEKSI DOKUMEN ADMINISTRASI MANDIRI (MODUL 1) */}
      <section className="panel" id="dokumen" style={{ marginTop: 24 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <h2>Dokumen Administrasi Saya</h2>
            <p className="sub" style={{ marginTop: -4 }}>
              Status berkas wajib pengajar (CV, Ijazah, Kontrak Kerja, dan Sertifikat Pendidik).
            </p>
          </div>
          <span className={"badge " + (validDocs >= 2 ? "badge-valid" : "badge-pending")}>
            {validDocs >= 2 ? "Administrasi Memenuhi Syarat" : "Perlu Melengkapi Berkas"}
          </span>
        </div>

        {t.documents.length > 0 ? (
          <div className="doc-grid" style={{ marginBottom: 20 }}>
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
                      ? "Terverifikasi"
                      : doc.status === "MENUNGGU_VERIFIKASI"
                      ? "Menunggu Cek"
                      : "Perlu Diperbarui"}
                  </span>
                </div>
                <div className="doc-meta">
                  <span>Kategori: <b>{doc.jenis}</b></span>
                  {doc.catatan && <div style={{ fontStyle: "italic", marginTop: 4 }}>Catatan Koordinator: {doc.catatan}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8 }}>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn s sm" style={{ flex: 1, textAlign: "center" }}>
                    Lihat Berkas ↗
                  </a>
                  {doc.status !== "VALID" && (
                    <form action={delTutorDocument}>
                      <input type="hidden" name="id" value={doc.id} />
                      <input type="hidden" name="back" value="/tutor#dokumen" />
                      <button className="btn s sm del">Hapus</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty" style={{ margin: "14px 0 20px" }}>
            Anda belum mengunggah dokumen administrasi. Silakan unggah CV dan Ijazah Anda di bawah ini.
          </p>
        )}

        {/* Upload Berkas Baru oleh Tutor */}
        <div style={{ background: "var(--mute)", padding: 16, borderRadius: 16, border: "1px solid var(--line)" }}>
          <h3 style={{ fontSize: 14, marginBottom: 8, color: "var(--ink)" }}>+ Unggah Berkas Baru</h3>
          <form action={addTutorDocument} className="col">
            <input type="hidden" name="tutorId" value={t.id} />
            <input type="hidden" name="back" value="/tutor#dokumen" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label>
                Jenis Berkas
                <select name="jenis" required>
                  <option value="CV">Curriculum Vitae (CV)</option>
                  <option value="Ijazah">Ijazah / Transkrip</option>
                  <option value="Kontrak">Surat Perjanjian Kerja (PKS)</option>
                  <option value="Sertifikat">Sertifikat Pelatihan / Pendidik</option>
                  <option value="Lainnya">Dokumen Lainnya</option>
                </select>
              </label>
              <label>
                Nama Dokumen
                <input name="namaFile" required placeholder="Contoh: CV Terbaru 2026" />
              </label>
              <label>
                Pilih File Berkas (PDF / Foto)
                <input type="file" name="documentFile" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
              <label>
                Atau Link File Cloud (Google Drive)
                <input name="fileUrl" placeholder="https://drive.google.com/..." />
              </label>
            </div>
            <button className="btn s" style={{ alignSelf: "flex-start", marginTop: 4 }}>
              Kirim Dokumen ke Koordinator
            </button>
          </form>
        </div>
      </section>

      {/* SEKSI PROFIL & BIODATA SAYA (MODUL 1) */}
      <section className="panel" id="profil" style={{ marginTop: 24 }}>
        <div className="row" style={{ marginBottom: 14 }}>
          <div>
            <h2>Biodata &amp; Profil Pengajar</h2>
            <p className="sub" style={{ marginTop: -4 }}>
              Perbarui kontak WhatsApp, alamat, dan deskripsi diri yang tampil pada sistem bimbel.
            </p>
          </div>
          {t.foto && <img src={t.foto} alt={s.name} className="av-img" style={{ width: 64, height: 64 }} />}
        </div>

        <form action={updateTutorProfile} className="col" style={{ maxWidth: 640 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <label>
              <span>Email Login <span className="locked-badge">Terkunci 🔒</span></span>
              <input value={s.email} disabled className="locked-field" title="Ditetapkan oleh koordinator/admin" />
            </label>
            <label>
              <span>Mata Pelajaran <span className="locked-badge">Terkunci 🔒</span></span>
              <input value={t.mapel} disabled className="locked-field" title="Ditetapkan oleh koordinator/admin" />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <label>
              <span>Jenjang Ditetapkan <span className="locked-badge">Terkunci 🔒</span></span>
              <input value={t.jenjang || "Belum ditentukan"} disabled className="locked-field" />
            </label>
            <label>
              <span>Jenis Kelas <span className="locked-badge">Terkunci 🔒</span></span>
              <input value={t.jenisKelas || "Belum ditentukan"} disabled className="locked-field" />
            </label>
          </div>

          <label>
            Nama Lengkap
            <input name="name" defaultValue={s.name} required />
          </label>
          <label>
            Bidang / Spesialisasi
            <input name="bidang" defaultValue={t.bidang} placeholder="Contoh: Aljabar, Geometri, Persiapan UTBK" />
          </label>
          <label>
            No. HP / WhatsApp (Kontak Aktif)
            <input name="phone" defaultValue={t.phone} placeholder="Contoh: 081234567890" />
          </label>
          <label>
            Alamat Domisili
            <input name="alamat" defaultValue={t.alamat} placeholder="Jl. Alamat Tempat Tinggal Saat Ini" />
          </label>
          <label>
            Upload Foto Profil Baru
            <input type="file" name="fotoFile" accept="image/*" />
          </label>
          <label>
            Atau Link URL Foto
            <input name="foto" defaultValue={t.foto || ""} placeholder="https://... atau /uploads/..." />
          </label>
          <label>
            Keterangan Singkat / Bio (Tampil di Portal Publik)
            <textarea
              name="bio"
              rows={3}
              maxLength={500}
              defaultValue={t.bio}
              placeholder="Deskripsikan pendekatan atau moto mengajar Anda..."
            />
          </label>
          <label>
            Password Baru (Kosongkan jika tidak ingin mengubah password)
            <input name="password" type="password" minLength={6} placeholder="Minimal 6 karakter" />
          </label>
          <button className="btn" style={{ alignSelf: "flex-start" }}>
            Simpan Perubahan Profil
          </button>
        </form>
      </section>
    </>
  );
}
