import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { addTutor } from "@/app/actions";
import Notice from "@/app/notice";
export default async function Baru({ searchParams }) {
  await requireRole("ADMIN");
  return (
    <>
      <p><Link href="/admin">← Kembali</Link></p>
      <div className="top"><h1>Tambah tutor baru</h1></div>
      <Notice sp={searchParams} />
      <section className="panel" style={{ maxWidth: 520 }}>
        <form action={addTutor} className="col">
          <label>Nama lengkap<input name="name" required /></label>
          <label>Email login<input name="email" type="email" required /></label>
          <label>Password awal (min. 6 karakter)<input name="password" minLength={6} required /></label>
          <label>Mata pelajaran<input name="mapel" required placeholder="Matematika" /></label>
          <label>Bidang / spesialisasi<input name="bidang" placeholder="Aljabar & Kalkulus" /></label>
          <label>No. HP / WhatsApp<input name="phone" placeholder="08xxxxxxxxxx" /></label>
          <label>Foto Profil (Upload File)<input type="file" name="fotoFile" accept="image/*" /></label>
          <label>Atau Link / URL Foto<input name="foto" placeholder="https://... atau /uploads/..." /></label>
          <label>Keterangan singkat<textarea name="bio" rows={3} maxLength={500} /></label>
          <button className="btn">Simpan tutor</button>
        </form>
      </section>
    </>
  );
}
