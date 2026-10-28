"use client";
import { useState } from "react";
import { HARI, ORDER } from "@/lib/util";
import { addAvail, updateAvail, delAvail } from "@/app/actions";

export default function AvailClient({ sesi, rooms, programs, mine, tutorId, back, today }) {
  const [editing, setEditing] = useState(null);

  const hidden = (
    <>
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="back" value={back} />
    </>
  );

  return (
    <div className="two" id="jadwal-form">
      <section className="panel">
        <div className="row" style={{ marginBottom: 8 }}>
          <h2>{editing ? "Edit sesi mengajar" : "Atur sesi mengajar"}</h2>
          {editing && <span className="pill busy"><i />Mode Edit</span>}
        </div>
        <p className="sub" style={{ marginTop: -4 }}>
          {editing
            ? "Ubah sesi, hari, ruangan, atau keterangan mingguan jika salah jadwal."
            : "Tambahkan jadwal rutin mingguan. Muncul otomatis setiap minggu."}
        </p>

        <form key={editing ? "edit-" + editing.id : "new"} action={editing ? updateAvail : addAvail} className="col">
          {hidden}
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <label>
            Hari
            <select name="hari" defaultValue={editing ? editing.hari : ORDER[0]}>
              {ORDER.map((h) => (
                <option key={h} value={h}>
                  {HARI[h]}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sesi
            <select name="sesiId" defaultValue={editing ? editing.sesiId : sesi[0]?.id}>
              {sesi.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label} ({x.start}–{x.end})
                </option>
              ))}
            </select>
          </label>

          <label>
            Ruangan
            <select name="roomId" defaultValue={editing ? editing.roomId : rooms[0]?.id}>
              {rooms.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}{x.lokasi ? " · " + x.lokasi : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Program
            <select name="programId" defaultValue={editing ? editing.programId : programs[0]?.id}>
              {programs.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Keterangan mingguan sesi (opsional, muncul rutin setiap minggu)
            <textarea
              name="catatan"
              rows={2}
              maxLength={255}
              defaultValue={editing ? editing.catatan : ""}
              placeholder="Contoh: Bawa modul latihan bab terkait &amp; aktif berdiskusi"
            />
          </label>

          <div className="row" style={{ justifyContent: "flex-start", gap: 10, marginTop: 4 }}>
            <button className="btn">
              {editing ? "Simpan Perubahan Jadwal" : "Simpan Jadwal Mingguan"}
            </button>
            {editing && (
              <button
                type="button"
                className="btn s"
                onClick={() => setEditing(null)}
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="row" style={{ marginBottom: 12 }}>
          <h2>Jadwal mingguan</h2>
          <span className="sub">{mine.length} sesi terdaftar</span>
        </div>
        {mine.length ? (
          mine.map((a) => {
            const isEditingThis = editing?.id === a.id;
            return (
              <div
                className={"item" + (a.hari === today ? " now" : "")}
                key={a.id}
                style={isEditingThis ? { borderColor: "var(--pri)", background: "var(--mint)" } : {}}
              >
                <div>
                  <b>{HARI[a.hari]}</b>{" "}
                  {a.hari === today && <span className="pill ok"><i />Hari ini</span>}
                  {isEditingThis && <span className="pill busy" style={{ marginLeft: 6 }}><i />Sedang diedit</span>}
                  <div>{a.sesi.label} ({a.sesi.start}–{a.sesi.end}) · {a.room.name} · {a.program.name}</div>
                  {a.catatan && <em>{a.catatan}</em>}
                </div>
                <div className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
                  <button
                    type="button"
                    className="btn s sm"
                    onClick={() => {
                      setEditing(a);
                      const el = document.getElementById("jadwal-form");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    title="Edit hari, sesi, ruangan, atau catatan jadwal ini"
                  >
                    Edit
                  </button>
                  <form action={delAvail}>
                    <input type="hidden" name="id" value={a.id} />
                    {hidden}
                    <button className="btn s sm del" title="Hapus jadwal ini">Hapus</button>
                  </form>
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty">Belum ada jadwal. Tambahkan lewat form di sebelah kiri.</p>
        )}
      </section>
    </div>
  );
}
