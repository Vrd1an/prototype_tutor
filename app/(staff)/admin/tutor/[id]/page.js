import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { todayInfo } from "@/lib/util";
import { updateTutor, delTutor } from "@/app/actions";
import AvailManager from "@/app/availManager";
import TodayPanel from "@/app/todayPanel";
import Notice from "@/app/notice";
export default async function Kelola({ params, searchParams }) {
  await requireRole("ADMIN");
  const t = await db.tutor.findUnique({ where: { userId: +params.id }, include: { user: true } });
  if (!t) notFound();
  const info = todayInfo(t);
  const back = "/admin/tutor/" + t.userId;
  return (
    <>
      <p><Link href="/admin">← Kembali ke monitoring</Link></p>
      <div className="top" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {t.foto ? <img src={t.foto} alt={t.user.name} className="av-img" style={{ width: 56, height: 56 }} /> : null}
        <div>
          <h1 style={{ margin: 0 }}>{t.user.name}</h1>
          <span className="sub">{t.mapel}{t.bidang ? " · " + t.bidang : ""}</span>
        </div>
      </div>
      <Notice sp={searchParams} />
      <section className="panel" style={{ marginBottom: 20 }}>
        <h2>Data tutor</h2>
        <form action={updateTutor} className="col" style={{ maxWidth: 520 }}>
          <input type="hidden" name="id" value={t.userId} />
          <label>Nama<input name="name" defaultValue={t.user.name} required /></label>
          <label>Email login<input name="email" type="email" defaultValue={t.user.email} required /></label>
          <label>Mata pelajaran (ditetapkan admin)<input name="mapel" defaultValue={t.mapel} required /></label>
          <label>Bidang / spesialisasi<input name="bidang" defaultValue={t.bidang} /></label>
          <label>No. HP / WhatsApp<input name="phone" defaultValue={t.phone} /></label>
          <label>Foto Profil (Upload File)<input type="file" name="fotoFile" accept="image/*" /></label>
          <label>Atau Link / URL Foto<input name="foto" defaultValue={t.foto || ""} placeholder="https://... atau /uploads/..." /></label>
          <label>Keterangan singkat (tampil di portal)<textarea name="bio" rows={3} maxLength={500} defaultValue={t.bio} /></label>
          <label>Status akun<select name="active" defaultValue={t.user.active ? "1" : "0"}><option value="1">Aktif (tampil di portal)</option><option value="0">Nonaktif (disembunyikan, tidak bisa login)</option></select></label>
          <label>Password baru (kosongkan jika tidak diubah)<input name="password" minLength={6} /></label>
          <button className="btn">Simpan data</button>
        </form>
      </section>
      <TodayPanel tutorId={t.id} izin={info.izin} notice={info.notice} back={back} admin />
      <AvailManager tutorId={t.id} back={back} />
      <form action={delTutor}><input type="hidden" name="id" value={t.userId} /><button className="btn del">Hapus tutor ini</button></form>
    </>
  );
}
