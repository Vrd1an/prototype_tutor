import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { addMaster, delMaster } from "@/app/actions";
import Notice from "@/app/notice";
function Del({ type, id }) {
  return <form action={delMaster}><input type="hidden" name="type" value={type} /><input type="hidden" name="id" value={id} /><button className="btn s sm del">Hapus</button></form>;
}
export default async function Master({ searchParams }) {
  await requireRole("ADMIN");
  const [programs, rooms, sesi] = await Promise.all([db.program.findMany(), db.room.findMany({ orderBy: { id: "asc" } }), db.sesi.findMany({ orderBy: { start: "asc" } })]);
  return (
    <>
      <div className="top"><h1>Master data</h1></div>
      <Notice sp={searchParams} />
      <div className="master">
        <section className="panel"><h2>Program</h2>
          <form action={addMaster} className="inline"><input type="hidden" name="type" value="program" /><label>Nama program<input name="name" placeholder="Reguler" required /></label><button className="btn">Tambah</button></form>
          {programs.map((p) => <div className="li" key={p.id}>{p.name}<Del type="program" id={p.id} /></div>)}
        </section>
        <section className="panel"><h2>Sesi</h2>
          <form action={addMaster} className="inline"><input type="hidden" name="type" value="sesi" />
            <label>Nama<input name="name" placeholder="Sesi 1" required /></label>
            <label>Mulai<input name="start" type="time" required /></label><label>Selesai<input name="end" type="time" required /></label>
            <button className="btn">Tambah</button></form>
          {sesi.map((s) => <div className="li" key={s.id}>{s.label} ({s.start}–{s.end})<Del type="sesi" id={s.id} /></div>)}
        </section>
        <section className="panel"><h2>Ruangan</h2>
          <form action={addMaster} className="inline"><input type="hidden" name="type" value="room" />
            <label>Nama<input name="name" placeholder="Ruang 9" required /></label><label>Lokasi<input name="lokasi" placeholder="Lantai 2" /></label>
            <button className="btn">Tambah</button></form>
          {rooms.map((r) => <div className="li" key={r.id}><span>{r.name} <span className="sub">{r.lokasi}</span></span><Del type="room" id={r.id} /></div>)}
        </section>
      </div>
    </>
  );
}
