import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { addTutor } from "@/app/actions";
import { todayWIB } from "@/lib/util";
import Notice from "@/app/notice";

export default async function Baru({ searchParams }) {
  await requireRole("ADMIN");

  const jenjangList = ["SD", "SMP", "SMA", "UTBK/Kedinasan"];
  const jenisKelasList = ["Reguler", "Privat", "Semi-Privat", "Kelas Online", "Kelas Offline"];

  return (
    <>
      <p style={{ marginBottom: 12 }}>
        <Link href="/admin" className="lnk">
          ← Kembali ke Direktori Tutor
        </Link>
      </p>

      <div className="top">
        <span className="eyebrow">Modul 1: Database &amp; Profil Tutor</span>
        <h1>Pendaftaran &amp; Input Tutor Baru</h1>
      </div>

      <Notice sp={searchParams} />

      <section className="panel" style={{ maxWidth: 760 }}>
        <form action={addTutor} className="col">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <label>
              Nama Lengkap &amp; Gelar
              <input name="name" required placeholder="Contoh: Budi Prasetyo, S.Pd." />
            </label>
            <label>
              NIK (Nomor Induk Kependudukan)
              <input name="nik" placeholder="16 digit NIK KTP" />
            </label>
            <label>
              Email Login Akun
              <input name="email" type="email" required placeholder="budi@bimbel.test" />
            </label>
            <label>
              Password Akun Awal (min. 6 karakter)
              <input name="password" minLength={6} required defaultValue="tutor123" />
            </label>
            <label>
              No. HP / WhatsApp
              <input name="phone" placeholder="08xxxxxxxxxx" />
            </label>
            <label>
              Tanggal Bergabung (Join Date)
              <input name="joinDate" type="date" defaultValue={todayWIB()} />
            </label>
            <label>
              Status Keaktifan
              <select name="status" defaultValue="ACTIVE">
                <option value="ACTIVE">Aktif (Dapat Diberi Jadwal)</option>
                <option value="ON_LEAVE">Cuti / Izin</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </label>
          </div>

          <label>
            Alamat Domisili
            <input name="alamat" placeholder="Jl. Nama Jalan, No. Rumah, Kota/Kabupaten" />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 4 }}>
            <label>
              Mata Pelajaran Utama
              <input name="mapel" required placeholder="Contoh: Matematika, Fisika, Biologi" />
            </label>
            <label>
              Bidang / Spesialisasi
              <input name="bidang" placeholder="Contoh: Aljabar, Mekanika, Grammar" />
            </label>
          </div>

          {/* Jenjang yang Dapat Ditangani */}
          <div style={{ marginTop: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6 }}>
              Jenjang Pendidikan yang Dikuasai:
            </span>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {jenjangList.map((j) => (
                <label key={j} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" name="jenjang" value={j} style={{ width: "auto" }} defaultChecked={j === "SMA"} />
                  <span>{j}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Jenis Kelas yang Sanggup Ditangani */}
          <div style={{ marginTop: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6 }}>
              Jenis Kelas yang Sanggup Diampu:
            </span>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {jenisKelasList.map((k) => (
                <label key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" name="jenisKelas" value={k} style={{ width: "auto" }} defaultChecked={k === "Reguler" || k === "Privat"} />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <label>
              Foto Profil (Upload File)
              <input type="file" name="fotoFile" accept="image/*" />
            </label>
            <label>
              Atau Link URL Foto
              <input name="foto" placeholder="https://... atau /uploads/..." />
            </label>
          </div>

          <label>
            Keterangan Profil / Bio Singkat (Tampil di Portal Publik)
            <textarea
              name="bio"
              rows={3}
              maxLength={500}
              placeholder="Deskripsikan latar belakang pendidikan atau pendekatan pengajaran tutor..."
            />
          </label>

          {/* Catatan Internal Koordinator */}
          <label style={{ background: "var(--mint)", padding: 14, borderRadius: 14, border: "1px solid rgba(13,148,136,.2)" }}>
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>
              Catatan Internal Koordinator Tutor 🔒
            </span>
            <span className="sub" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
              Catatan evaluasi awal atau histori rekrutmen. Hanya bisa dilihat oleh Koordinator / Admin.
            </span>
            <textarea
              name="catatanInternal"
              rows={2}
              maxLength={1000}
              placeholder="Contoh: Lulusan terbaik, pengalaman 3 tahun di bimbel ternama..."
              style={{ background: "#fff" }}
            />
          </label>

          <button className="btn" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            Simpan Tutor ke Database
          </button>
        </form>
      </section>
    </>
  );
}
