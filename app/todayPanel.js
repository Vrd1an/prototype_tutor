import { setToday } from "@/app/actions";
export default function TodayPanel({ tutorId, izin, notice, back, admin }) {
  return (
    <section className="panel" id="override" style={{ marginBottom: 20 }}>
      <h2>{admin ? "Override keterangan hari ini" : "Status & catatan hari ini"}</h2>
      <p className="sub" style={{ marginTop: -8 }}>Berlaku untuk hari ini saja dan langsung tampil di portal publik.</p>
      <form action={setToday} className="col" style={{ maxWidth: 520 }}>
        <input type="hidden" name="tutorId" value={tutorId} /><input type="hidden" name="back" value={back} />
        <label>Status hari ini<select name="izin" defaultValue={izin ? "1" : "0"}><option value="0">Hadir, mengajar sesuai jadwal</option><option value="1">Izin / tidak mengajar</option></select></label>
        <label>Catatan khusus (opsional)<textarea name="notice" rows={2} maxLength={300} defaultValue={notice} placeholder="Contoh: sesi sore mundur 30 menit" /></label>
        <button className="btn">Simpan status</button>
      </form>
    </section>
  );
}
