import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { todayWIB, dow, todayInfo, initials, tanggalLengkap } from "@/lib/util";
import Notice from "@/app/notice";
export default async function Admin({ searchParams }) {
  await requireRole("ADMIN");
  const today = dow(todayWIB());
  const [tutors, totalRooms] = await Promise.all([
    db.tutor.findMany({ orderBy: { id: "asc" }, include: { user: true, avails: { include: { sesi: true, room: true } } } }),
    db.room.count(),
  ]);
  const rows = tutors.map((t) => {
    const slots = t.avails.filter((a) => a.hari === today).sort((a, b) => a.sesi.start.localeCompare(b.sesi.start));
    const info = todayInfo(t);
    const s = !t.user.active ? { k: "off", l: "Nonaktif" } : !t.avails.length ? { k: "off", l: "Belum input jadwal" } : info.izin ? { k: "bad", l: "Izin" } : slots.length ? { k: "ok", l: "Mengajar hari ini" } : { k: "off", l: "Tidak ada jadwal hari ini" };
    return { t, slots, info, s };
  });
  const bertugas = rows.filter((r) => r.t.user.active && r.slots.length && !r.info.izin);
  const sesi = bertugas.reduce((n, r) => n + r.slots.length, 0);
  const rUsed = new Set(bertugas.flatMap((r) => r.slots.map((a) => a.roomId))).size;
  return (
    <>
      <div className="top row">
        <div><span className="eyebrow">{tanggalLengkap()}</span><h1>Monitoring &amp; direktori tutor</h1></div>
        <Link href="/admin/tutor/baru" className="btn">Tambah tutor baru</Link>
      </div>
      <Notice sp={searchParams} />
      <div className="stats">
        <div className="stat"><span className="sub">Total tutor</span><b>{tutors.length}</b></div>
        <div className="stat"><span className="sub">Bertugas hari ini</span><b>{bertugas.length}</b></div>
        <div className="stat"><span className="sub">Ruangan terpakai</span><b>{rUsed}<small className="sub"> / {totalRooms}</small></b></div>
        <div className="stat"><span className="sub">Sesi hari ini</span><b>{sesi}</b></div>
      </div>
      <section className="panel" style={{ marginBottom: 20 }}>
        <h2>Monitoring hari ini</h2>
        {rows.length ? <div className="mon">{rows.filter((r) => r.t.user.active).map(({ t, slots, info, s }) => (
          <div className="mcard" key={t.id}>
            <div className="row"><div className="who" style={{ display: "flex", gap: 10, alignItems: "center" }}><div className="av" style={{ width: 40, height: 40 }}>{initials(t.user.name)}</div><div><b style={{ color: "var(--ink)" }}>{t.user.name}</b><div className="sub">{t.mapel}</div></div></div><span className={"pill " + s.k}><i />{s.l}</span></div>
            <div className="box">{slots.length ? slots.map((a) => <div key={a.id}>{a.sesi.start}–{a.sesi.end} · {a.room.name}</div>) : <span className="sub">Tidak ada sesi hari ini</span>}</div>
            {info.notice && <div className="alert">{info.notice}</div>}
            <Link href={"/admin/tutor/" + t.userId + "#override"} className="btn s sm">Override keterangan</Link>
          </div>))}</div> : <p className="empty">Belum ada tutor.</p>}
      </section>
      <section className="panel">
        <h2>Direktori tutor</h2>
        <div className="scroll"><table>
          <thead><tr><th>Nama</th><th>Email</th><th>Mapel / bidang</th><th>Sesi per minggu</th><th>Akun</th><th></th></tr></thead>
          <tbody>{rows.map(({ t }) => (
            <tr key={t.id}><td><b style={{ color: "var(--ink)" }}>{t.user.name}</b></td><td>{t.user.email}</td><td><span className="tag">{t.mapel}</span> <span className="sub">{t.bidang}</span></td><td>{t.avails.length}</td>
              <td><span className={"pill " + (t.user.active ? "ok" : "bad")}><i />{t.user.active ? "Aktif" : "Nonaktif"}</span></td>
              <td><Link href={"/admin/tutor/" + t.userId} className="btn s sm">Kelola</Link></td></tr>))}</tbody>
        </table></div>
      </section>
    </>
  );
}
