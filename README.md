# Jadwal Tutor Bimbel (Next.js)

Portal publik (tanpa login) menampilkan tutor yang mengajar per hari, lengkap dengan sesi, ruangan, program, status
(Tersedia / Sedang mengajar / Izin), pencarian, dan penggunaan ruangan. Login hanya untuk admin dan tutor.
Gaya visual mengikuti desain Stitch (teal, Plus Jakarta Sans).

## Menjalankan
```
npm install
npm run reset     # HAPUS dan buat ulang semua tabel + data contoh (hanya untuk awal / pengembangan)
npm run dev       # http://localhost:3000
```
Akun contoh: admin@bimbel.test / admin123; rina@, dimas@, sari@bimbel.test / tutor123.

Peran:
- Publik: lihat tutor per hari, cari, filter mapel/status, tombol WhatsApp.
- Tutor: kelola jadwal mingguan sendiri (hari, sesi, ruangan, program, keterangan) + status izin dan catatan hari ini.
- Admin: monitoring hari ini, direktori tutor, ubah data/akun tutor, kelola jadwal semua tutor, override status hari ini, master data (program, sesi, ruangan).

Nama bimbel: isi NEXT_PUBLIC_NAMA_BIMBEL di .env. Sebelum produksi: hapus akun contoh, ganti AUTH_SECRET.
