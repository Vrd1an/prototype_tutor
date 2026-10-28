import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { initials, wa } from "@/lib/util";
import { updateTutorProfile } from "@/app/actions";
import Notice from "@/app/notice";

export default async function TutorProfil({ searchParams }) {
  const s = await requireRole("TUTOR");
  const t = await db.tutor.findUnique({
    where: { userId: s.id },
    include: { user: true },
  });

  return (
    <>
      <p style={{ marginBottom: 12 }}>
        <Link href="/tutor" className="lnk" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px" }}>
          ← Kembali ke Jadwal &amp; Ketersediaan
        </Link>
      </p>

      <div className="top" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Profil &amp; Biodata Tutor</h1>
        <p className="sub" style={{ fontSize: 13, marginTop: 4 }}>
          Kelola biodata, foto profil, dan kontak Anda yang ditampilkan ke siswa di portal jadwal.
        </p>
      </div>

      <Notice sp={searchParams} />

      <div className="two" style={{ alignItems: "start", gap: 24 }}>
        {/* Kolom Kiri: Form Edit Profil */}
        <section className="panel">
          <h2 style={{ marginBottom: 16 }}>Edit Biodata &amp; Informasi</h2>
          <form action={updateTutorProfile} className="col">
            {/* Bagian Terkunci oleh Admin */}
            <div style={{ background: "var(--mute)", border: "1px solid var(--line)", borderRadius: 14, padding: 14 }}>
              <div className="row" style={{ marginBottom: 8 }}>
                <b style={{ color: "var(--ink)", fontSize: 13 }}>Informasi Resmi Bimbel</b>
                <span className="locked-badge">Terkunci Admin 🔒</span>
              </div>
              <p className="sub" style={{ margin: "0 0 10px", fontSize: 12 }}>
                Email akun dan Mata Pelajaran utama ditetapkan oleh admin bimbel sesuai kontrak mengajar.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)" }}>
                  Email Login
                  <input value={s.email} disabled className="locked-field" style={{ marginTop: 4, height: 38 }} />
                </label>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)" }}>
                  Mata Pelajaran Utama
                  <input value={t.mapel} disabled className="locked-field" style={{ marginTop: 4, height: 38 }} />
                </label>
              </div>
            </div>

            {/* Bagian Foto Profil */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 4 }}>
              <b style={{ display: "block", marginBottom: 8, color: "var(--ink)" }}>Foto Profil</b>
              <div className="row" style={{ justifyContent: "flex-start", gap: 14, marginBottom: 12 }}>
                {t.foto ? (
                  <img src={t.foto} alt={s.name} className="av-img" style={{ width: 68, height: 68, borderRadius: 20 }} />
                ) : (
                  <div className="av" style={{ width: 68, height: 68, borderRadius: 20, fontSize: 20 }}>
                    {initials(s.name)}
                  </div>
                )}
                <div>
                  <span className="sub" style={{ display: "block", marginBottom: 4 }}>
                    {t.foto ? "Foto profil aktif terpasang" : "Belum ada foto (tampil inisial nama)"}
                  </span>
                  <span className="sub" style={{ fontSize: 11, color: "var(--sub)" }}>
                    Format yang didukung: JPG, PNG, WebP
                  </span>
                </div>
              </div>

              <label>
                Upload File Foto (dari Komputer / HP)
                <input type="file" name="fotoFile" accept="image/*" />
              </label>

              <label style={{ marginTop: 8 }}>
                Atau masukkan Link / URL Foto Gambar
                <input name="foto" defaultValue={t.foto || ""} placeholder="https://example.com/foto.jpg atau /uploads/..." />
              </label>
            </div>

            {/* Bagian Biodata Personal */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 4 }}>
              <b style={{ display: "block", marginBottom: 10, color: "var(--ink)" }}>Biodata &amp; Kontak</b>

              <label>
                Nama Lengkap
                <input name="name" defaultValue={s.name} required />
              </label>

              <label style={{ marginTop: 10 }}>
                Bidang / Spesialisasi Fokus
                <input name="bidang" defaultValue={t.bidang} placeholder="Contoh: Aljabar, Geometri, Persiapan UTBK" />
              </label>

              <label style={{ marginTop: 10 }}>
                No. HP / WhatsApp (untuk siswa menghubungi Anda)
                <input name="phone" defaultValue={t.phone} placeholder="Contoh: 081234567890" />
              </label>

              <label style={{ marginTop: 10 }}>
                Keterangan Singkat / Bio (tampil di portal publik)
                <textarea
                  name="bio"
                  rows={3}
                  maxLength={500}
                  defaultValue={t.bio}
                  placeholder="Deskripsikan pendekatan, moto, atau pengalaman mengajar Anda secara singkat..."
                />
              </label>
            </div>

            {/* Bagian Keamanan Akun */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 4 }}>
              <b style={{ display: "block", marginBottom: 6, color: "var(--ink)" }}>Keamanan Akun</b>
              <label>
                Password Baru (opsional)
                <input name="password" type="password" minLength={6} placeholder="Kosongkan jika tidak ingin mengganti password" />
              </label>
            </div>

            <div style={{ marginTop: 10 }}>
              <button className="btn" style={{ minWidth: 200 }}>
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </section>

        {/* Kolom Kanan: Preview Tampilan Kartu di Portal Siswa */}
        <section className="panel" style={{ position: "sticky", top: 20 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <h2>Preview Profil Publik</h2>
            <span className="tag">{t.mapel}</span>
          </div>
          <p className="sub" style={{ marginTop: -8, marginBottom: 16 }}>
            Begini tampilan kartu profil Anda saat siswa membuka jadwal bimbel:
          </p>

          <div
            style={{
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "var(--sh)",
              display: "grid",
              gap: 12,
            }}
          >
            <div className="who">
              {t.foto ? (
                <img src={t.foto} alt={s.name} className="av-img" style={{ width: 60, height: 60 }} />
              ) : (
                <div className="av" style={{ width: 60, height: 60 }}>
                  {initials(s.name)}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: 17 }}>{s.name}</h3>
                <div className="sub">{t.bidang || t.mapel}</div>
                <span className="tag" style={{ marginTop: 4 }}>{t.mapel}</span>
              </div>
            </div>

            <div>
              <span className="pill ok"><i />Tersedia hari ini</span>
            </div>

            <div style={{ background: "var(--mint)", borderRadius: 12, padding: 12, fontSize: 12.5 }}>
              <b style={{ color: "var(--mintx)", textTransform: "uppercase", letterSpacing: ".06em", fontSize: 10, display: "block", marginBottom: 4 }}>
                Jadwal &amp; Ruangan
              </b>
              <div>Akan menampilkan sesi mengajar Anda di hari tersebut beserta ruangan kelasnya.</div>
            </div>

            {t.bio ? (
              <p className="bio" style={{ margin: "2px 0" }}>“{t.bio}”</p>
            ) : (
              <p className="sub" style={{ fontStyle: "italic", margin: "2px 0" }}>Belum ada bio/kutipan singkat.</p>
            )}

            {t.phone ? (
              <a className="btn s sm" href={wa(t.phone)} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center" }}>
                Hubungi via WhatsApp ({t.phone})
              </a>
            ) : (
              <span className="sub" style={{ textAlign: "center", display: "block" }}>
                No. WhatsApp belum diisi
              </span>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
