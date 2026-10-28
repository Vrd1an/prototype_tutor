import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { todayWIB, dow, todayInfo, initials, tanggalLengkap } from "@/lib/util";
import { updateTutorProfile } from "@/app/actions";
import AvailManager from "@/app/availManager";
import TodayPanel from "@/app/todayPanel";
import Notice from "@/app/notice";
export default async function Saya({ searchParams }) {
  const s = await requireRole("TUTOR");
  const t = await db.tutor.findUnique({ where: { userId: s.id }, include: { avails: true } });
  const today = dow(todayWIB());
  const info = todayInfo(t);
  const now = t.avails.filter((a) => a.hari === today);
  return (
    <>
      <div className="top">
        <span className="eyebrow">{tanggalLengkap()}</span>
        <div className="row" style={{ justifyContent: "flex-start", gap: 14, marginTop: 8 }}>
          {t.foto ? <img src={t.foto} alt={s.name} className="av-img" /> : <div className="av">{initials(s.name)}</div>}
          <div><h1 style={{ margin: 0 }}>Halo, {s.name}</h1><span className="sub">{t.mapel}{t.bidang ? " · " + t.bidang : ""}</span></div>
          <span className={"pill " + (info.izin ? "bad" : "ok")}><i />{info.izin ? "Izin hari ini" : "Hadir"}</span>
        </div>
      </div>
      <Notice sp={searchParams} />
      <div className="stats">
        <div className="stat"><span className="sub">Sesi hari ini</span><b>{info.izin ? 0 : now.length}</b></div>
        <div className="stat"><span className="sub">Slot per minggu</span><b>{t.avails.length}</b></div>
        <div className="stat"><span className="sub">Ruangan hari ini</span><b>{info.izin ? 0 : new Set(now.map((a) => a.roomId)).size}</b></div>
      </div>
      <TodayPanel tutorId={t.id} izin={info.izin} notice={info.notice} back="/tutor" />
      <AvailManager tutorId={t.id} back="/tutor" />

      <section className="panel" id="profil" style={{ marginTop: 24 }}>
        <div className="row" style={{ marginBottom: 14 }}>
          <div>
            <h2>Profil &amp; Biodata Saya</h2>
            <p className="sub" style={{ marginTop: -4 }}>Perbarui foto, kontak, dan keterangan Anda yang tampil di portal siswa.</p>
          </div>
          {t.foto && <img src={t.foto} alt={s.name} className="av-img" style={{ width: 64, height: 64 }} />}
        </div>
        <form action={updateTutorProfile} className="col" style={{ maxWidth: 640 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <label>
              <span>Email login <span className="locked-badge">Terkunci Admin 🔒</span></span>
              <input value={s.email} disabled className="locked-field" title="Ditetapkan oleh admin" />
            </label>
            <label>
              <span>Mata Pelajaran <span className="locked-badge">Terkunci Admin 🔒</span></span>
              <input value={t.mapel} disabled className="locked-field" title="Ditetapkan oleh admin" />
            </label>
          </div>
          <label>Nama Lengkap<input name="name" defaultValue={s.name} required /></label>
          <label>Bidang / Spesialisasi<input name="bidang" defaultValue={t.bidang} placeholder="Contoh: Aljabar, Geometri, Persiapan UTBK" /></label>
          <label>No. HP / WhatsApp (untuk siswa menghubungi Anda)<input name="phone" defaultValue={t.phone} placeholder="Contoh: 081234567890" /></label>
          <label>Foto Profil (Upload File Gambar dari HP/Laptop)<input type="file" name="fotoFile" accept="image/*" /></label>
          <label>Atau Link / URL Foto Profil<input name="foto" defaultValue={t.foto || ""} placeholder="https://... atau /uploads/..." /></label>
          <label>Keterangan Singkat / Bio (tampil di portal siswa)<textarea name="bio" rows={3} maxLength={500} defaultValue={t.bio} placeholder="Deskripsikan pendekatan atau moto mengajar Anda..." /></label>
          <label>Password Baru (kosongkan jika tidak diubah)<input name="password" type="password" minLength={6} placeholder="Minimal 6 karakter" /></label>
          <button className="btn" style={{ alignSelf: "flex-start" }}>Simpan Perubahan Profil</button>
        </form>
      </section>
    </>
  );
}
