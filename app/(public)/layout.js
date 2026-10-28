import Link from "next/link";
import { NAMA } from "@/lib/util";
export default function PublicLayout({ children }) {
  return (
    <>
      <header className="pub-head"><div className="wrap">
        <Link href="/" className="brand">{NAMA}</Link>
        <nav className="pub-nav"><a href="#tutor">Daftar Tutor</a><a href="#ruangan">Ruangan &amp; Sesi</a></nav>
        <Link href="/login" className="btn sm">Masuk Staf</Link>
      </div></header>
      {children}
      <footer className="pub-foot"><div className="wrap row"><span>© {NAMA}. Jadwal tutor diperbarui langsung oleh tutor dan admin.</span><span>Info sesi dapat berubah sewaktu-waktu.</span></div></footer>
    </>
  );
}
