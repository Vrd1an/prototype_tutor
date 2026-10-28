export const NAMA = process.env.NEXT_PUBLIC_NAMA_BIMBEL || "Bimbel Kami";
export const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const ORDER = [1, 2, 3, 4, 5, 6, 0];
const wib = () => new Date(Date.now() + 7 * 36e5);
export const todayWIB = () => wib().toISOString().slice(0, 10);
export const nowMin = () => wib().getUTCHours() * 60 + wib().getUTCMinutes();
export const tanggalLengkap = () => { const d = wib(); return HARI[d.getUTCDay()] + ", " + d.getUTCDate() + " " + BULAN[d.getUTCMonth()] + " " + d.getUTCFullYear(); };
export const tmin = (s) => { const [h, m] = s.split(":"); return +h * 60 + +m; };
export const dow = (s) => new Date(s + "T00:00:00Z").getUTCDay();
export const wa = (phone) => { const d = String(phone).replace(/\D/g, ""); return "https://wa.me/" + (d.startsWith("0") ? "62" + d.slice(1) : d); };
export const initials = (n) => n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
// status hari ini milik tutor (berlaku hanya jika disimpan hari ini)
export const todayInfo = (t) => (t.statusDate === todayWIB() ? { izin: t.izin, notice: t.notice } : { izin: false, notice: "" });
