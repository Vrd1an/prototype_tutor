import Link from "next/link";
import { db } from "@/lib/db";
import { HARI, ORDER, todayWIB, dow, nowMin, tmin, wa, initials, todayInfo, tanggalLengkap } from "@/lib/util";

export default async function Portal({ searchParams }) {
  const today = dow(todayWIB());
  const hq = searchParams.hari;
  const hari = hq !== undefined && /^[0-6]$/.test(hq) ? +hq : today;
  const isToday = hari === today;
  const q = (searchParams.q || "").trim().toLowerCase();
  const mapel = searchParams.mapel || "";
  const st = searchParams.status || "";
  const now = nowMin();

  const [tutors, rooms] = await Promise.all([
    db.tutor.findMany({ where: { user: { active: true } }, orderBy: { id: "asc" }, include: { user: true, avails: { where: { hari }, include: { sesi: true, room: true, program: true } } } }),
    db.room.findMany({ orderBy: { id: "asc" } }),
  ]);
  const mapels = [...new Set(tutors.map((t) => t.mapel))];

  const rows = tutors.map((t) => {
    const slots = [...t.avails].sort((a, b) => a.sesi.start.localeCompare(b.sesi.start));
    const info = isToday ? todayInfo(t) : { izin: false, notice: "" };
    let s = null;
    if (slots.length) {
      if (!isToday) s = { k: "ok", l: "Mengajar hari " + HARI[hari] };
      else if (info.izin) s = { k: "bad", l: "Izin hari ini" };
      else {
        const run = slots.find((a) => tmin(a.sesi.start) <= now && now < tmin(a.sesi.end));
        const next = slots.find((a) => tmin(a.sesi.start) > now);
        s = run ? { k: "busy", l: "Sedang mengajar", run } : next ? { k: "ok", l: "Tersedia hari ini", next } : { k: "off", l: "Sesi hari ini selesai" };
      }
    }
    return { t, slots, info, s };
  }).filter((r) => r.slots.length);

  const active = rows.filter((r) => !r.info.izin);
  const sesiCount = active.reduce((n, r) => n + r.slots.length, 0);
  const roomCount = {};
  active.forEach((r) => r.slots.forEach((a) => (roomCount[a.roomId] = (roomCount[a.roomId] || 0) + 1)));

  const list = rows.filter((r) =>
    (!q || (r.t.user.name + " " + r.t.mapel + " " + r.t.bidang).toLowerCase().includes(q)) &&
    (!mapel || r.t.mapel === mapel) &&
    (!isToday || !st || (st === "tersedia" && r.s.k === "ok") || (st === "mengajar" && r.s.k === "busy")));

  const u = (o) => {
    const p = { hari, q: searchParams.q || "", mapel, status: st, ...o };
    return "/?" + new URLSearchParams(Object.entries(p).filter(([, v]) => v !== "" && v !== undefined && v !== null).map(([k, v]) => [k, String(v)])).toString();
  };
  const label = isToday ? "hari ini" : "hari " + HARI[hari];

  return (
    <>
      <div className="wrap">
        <section className="hero" id="jadwal">
          <div>
            <div className="chip-row"><span className="chip"><span className="pill ok" style={{ padding: 0, background: "none" }}><i /></span>Diperbarui langsung</span><span className="chip">{tanggalLengkap()}</span></div>
            <h1>Jadwal &amp; Ketersediaan <em>Tutor Hari Ini</em></h1>
            <p>Lihat tutor yang mengajar, jam sesi, dan ruangannya. Tidak perlu login atau registrasi.</p>
          </div>
          <div className="statcard">
            <span className="eyebrow">Ringkasan {label}</span>
            <div className="nums">
              <div><b>{active.length}</b><span className="sub">Tutor mengajar</span></div>
              <div><b>{sesiCount}</b><span className="sub">Sesi</span></div>
              <div><b>{Object.keys(roomCount).length}</b><span className="sub">Ruangan terpakai</span></div>
            </div>
          </div>
        </section>

        <div className="filters">
          <form action="/">
            <input type="hidden" name="hari" value={hari} />
            <input name="q" defaultValue={searchParams.q || ""} placeholder="Cari nama tutor atau mata pelajaran" aria-label="Cari tutor" />
            <select name="mapel" defaultValue={mapel} aria-label="Mata pelajaran"><option value="">Semua mata pelajaran</option>{mapels.map((m) => <option key={m} value={m}>{m}</option>)}</select>
            <button className="btn">Cari</button>
          </form>
        </div>
        <div className="chips">{ORDER.map((h) => <Link key={h} href={u({ hari: h })} className={"pchip" + (h === hari ? " on" : "")}>{HARI[h]}{h === today ? " (hari ini)" : ""}</Link>)}</div>
        {isToday && <div className="chips">
          <Link href={u({ status: "" })} className={"pchip" + (!st ? " on" : "")}>Semua</Link>
          <Link href={u({ status: "tersedia" })} className={"pchip" + (st === "tersedia" ? " on" : "")}>Tersedia</Link>
          <Link href={u({ status: "mengajar" })} className={"pchip" + (st === "mengajar" ? " on" : "")}>Sedang mengajar</Link>
        </div>}

        <section className="section" id="tutor">
          <span className="eyebrow">Daftar jadwal</span>
          <div className="row"><h2>Tutor yang mengajar {label}</h2><span className="sub">{list.length} tutor</span></div>
          {list.length ? (
            <div className="tgrid">{list.map(({ t, slots, info, s }) => {
              const room = s.run ? s.run.room.name : s.next ? s.next.room.name : null;
              return (
                <article className="tcard" key={t.id}>
                  <div className="tcard-bio">
                    <div className="who">
                      {t.foto ? <img src={t.foto} alt={t.user.name} className="av-img" /> : <div className="av">{initials(t.user.name)}</div>}
                      <div><h3>{t.user.name}</h3><div className="sub">{t.bidang || t.mapel}</div><span className="tag">{t.mapel}</span></div>
                    </div>
                    <div><span className={"pill " + s.k}><i />{s.l}</span></div>
                    {t.bio && <p className="bio">“{t.bio}”</p>}
                    {t.phone && <a className="btn s sm wa-btn" href={wa(t.phone)} target="_blank" rel="noopener noreferrer">Hubungi via WhatsApp</a>}
                  </div>
                  <div className="tcard-sched">
                    {info.notice && <div className="alert">{info.notice}</div>}
                    <div className="slotbox">
                      <div className="cap">Jadwal sesi {label}</div>
                      {slots.map((a) => (
                        <div className="slot" key={a.id}>
                          <b>{a.sesi.label}: {a.sesi.start}–{a.sesi.end} WIB</b>
                          <div>{a.room.name}{a.room.lokasi ? " · " + a.room.lokasi : ""} · {a.program.name}</div>
                          {a.catatan && <em>{a.catatan}</em>}
                        </div>
                      ))}
                      <div className="foot">
                        <span className="sub">{s.run ? "Selesai pukul " + s.run.sesi.end : s.next ? "Mulai pukul " + s.next.sesi.start : ""}</span>
                        {room && <span className={"roompill" + (s.run ? "" : " q")}>{room}</span>}
                      </div>
                    </div>
                  </div>
                </article>);
            })}</div>
          ) : <p className="empty" style={{ marginTop: 16 }}>Tidak ada tutor yang cocok dengan pencarian ini.</p>}
        </section>
      </div>

      <section className="rwrap" id="ruangan"><div className="wrap">
        <span className="eyebrow">Ruang belajar</span>
        <h2 style={{ marginTop: 4 }}>Penggunaan ruangan {label}</h2>
        <div className="rgrid">{rooms.map((r) => { const n = roomCount[r.id] || 0; return (
          <div className="rcard" key={r.id}>
            <div className="row"><b style={{ color: "var(--ink)" }}>{r.name}</b><span className={"pill " + (n ? "busy" : "ok")}><i />{n ? "Terpakai" : "Kosong"}</span></div>
            <span className="sub">{r.lokasi || "Lokasi belum diisi"}</span>
            <span className="sub">Sesi berjalan: {n}</span>
          </div>); })}</div>
      </div></section>
    </>
  );
}
