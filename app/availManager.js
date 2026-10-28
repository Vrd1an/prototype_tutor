import { db } from "@/lib/db";
import { ORDER, dow, todayWIB } from "@/lib/util";
import AvailClient from "@/app/availClient";

export default async function AvailManager({ tutorId, back }) {
  const [sesi, rooms, programs, mine] = await Promise.all([
    db.sesi.findMany({ orderBy: { start: "asc" } }),
    db.room.findMany({ orderBy: { id: "asc" } }),
    db.program.findMany(),
    db.availability.findMany({ where: { tutorId }, include: { sesi: true, room: true, program: true } }),
  ]);
  const today = dow(todayWIB());
  mine.sort((a, b) => ORDER.indexOf(a.hari) - ORDER.indexOf(b.hari) || a.sesi.start.localeCompare(b.sesi.start));

  return (
    <AvailClient
      sesi={sesi}
      rooms={rooms}
      programs={programs}
      mine={mine}
      tutorId={tutorId}
      back={back}
      today={today}
    />
  );
}
