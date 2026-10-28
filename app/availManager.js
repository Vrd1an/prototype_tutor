import { db } from "@/lib/db";
import { HARI, ORDER, dow, todayWIB } from "@/lib/util";
import { addAvail, delAvail } from "@/app/actions";
export default async function AvailManager({ tutorId, back }) {
  const [sesi, rooms, programs, mine] = await Promise.all([
    db.sesi.findMany({ orderBy: { start: "asc" } }), db.room.findMany({ orderBy: { id: "asc" } }), db.program.findMany(),
    db.availability.findMany({ where: { tutorId }, include: { sesi: true, room: true, program: true } }),
  ]);
  const today = dow(todayWIB());
  mine.sort((a, b) => ORDER.indexOf(a.hari) - ORDER.indexOf(b.hari) || a.sesi.start.localeCompare(b.sesi.start));
  const hidden = (<><input type="hidden" name="tutorId" value={tutorId} /><input type="hidden" name="back" value={back} /></>);
  return (
    <div className="two">
      <section className="panel">
        <h2>Atur sesi mengajar</h2>
        <form action={addAvail} className="col">
          {hidden}
          <label>Hari<select name="hari">{ORDER.map((h) => <option key={h} value={h}>{HARI[h]}</option>)}</select></label>
          <label>Sesi<select name="sesiId">{sesi.map((x) => <option key={x.id} value={x.id}>{x.label} ({x.start}–{x.end})</option>)}</select></label>
          <label>Ruangan<select name="roomId">{rooms.map((x) => <option key={x.id} value={x.id}>{x.name}{x.lokasi ? " · " + x.lokasi : ""}</option>)}</select></label>
          <label>Program<select name="programId">{programs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Keterangan mingguan sesi (opsional, muncul rutin setiap minggu)<textarea name="catatan" rows={2} maxLength={255} placeholder="Contoh: Bawa modul latihan bab terkait &amp; aktif berdiskusi" /></label>
          <button className="btn">Simpan jadwal mingguan</button>
        </form>
      </section>
      <section className="panel">
        <h2>Jadwal mingguan</h2>
        {mine.length ? mine.map((a) => (
          <div className={"item" + (a.hari === today ? " now" : "")} key={a.id}>
            <div>
              <b>{HARI[a.hari]}</b> {a.hari === today && <span className="pill ok"><i />Hari ini</span>}
              <div>{a.sesi.label} ({a.sesi.start}–{a.sesi.end}) · {a.room.name} · {a.program.name}</div>
              {a.catatan && <em>{a.catatan}</em>}
            </div>
            <form action={delAvail}><input type="hidden" name="id" value={a.id} />{hidden}<button className="btn s sm del">Hapus</button></form>
          </div>
        )) : <p className="empty">Belum ada jadwal. Tambahkan lewat form.</p>}
      </section>
    </div>
  );
}
