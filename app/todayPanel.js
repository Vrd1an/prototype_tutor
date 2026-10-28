import { setToday } from "@/app/actions";
export default function TodayPanel({ tutorId, izin, notice, back, admin }) {
  return (
    <section className="panel" id="override" style={{ marginBottom: 20 }}>
      <h2>{admin ? "Override keterangan hari ini" : "Status & catatan khusus hari ini"}</h2>
      <p className="sub" style={{ marginTop: -8 }}>Catatan harian ini berlaku untuk hari ini saja (langsung tampil di portal publik) dan otomatis hilang besok.</p>
      <form action={setToday} className="col" style={{ maxWidth: 520 }}>
        <input type="hidden" name="tutorId" value={tutorId} /><input type="hidden" name="back" value={back} />
        <label>Status kehadiran hari ini<select name="izin" defaultValue={izin ? "1" : "0"}><option value="0">Hadir, mengajar sesuai jadwal</option><option value="1">Izin / tidak mengajar</option></select></label>
        <label>Catatan khusus hari ini (override harian)<textarea name="notice" rows={2} maxLength={300} defaultValue={notice} placeholder="Contoh: Sesi sore mundur 30 menit karena persiapan lab" /></label>
        <button className="btn">Simpan status &amp; catatan hari ini</button>
      </form>
    </section>
  );
}
