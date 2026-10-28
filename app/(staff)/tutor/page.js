import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { todayWIB, dow, todayInfo, initials, tanggalLengkap } from "@/lib/util";
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
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {t.foto ? <img src={t.foto} alt={s.name} className="av-img" /> : <div className="av">{initials(s.name)}</div>}
            <div>
              <h1 style={{ margin: 0 }}>Halo, {s.name}</h1>
              <span className="sub">{t.mapel}{t.bidang ? " · " + t.bidang : ""}</span>
            </div>
            <span className={"pill " + (info.izin ? "bad" : "ok")}><i />{info.izin ? "Izin hari ini" : "Hadir"}</span>
          </div>

          <Link href="/tutor/profil" className="btn s sm" style={{ textDecoration: "none" }}>
            👤 Edit Profil &amp; Biodata
          </Link>
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
    </>
  );
}
