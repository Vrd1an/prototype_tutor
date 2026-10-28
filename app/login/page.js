import Link from "next/link";
import { login } from "@/app/actions";
import Notice from "@/app/notice";
export default function Login({ searchParams }) {
  return (
    <div className="box1"><p className="eyebrow">Khusus staf</p><h1>Masuk</h1><Notice sp={searchParams} />
      <form action={login} className="col">
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <button className="btn">Masuk</button>
      </form>
      <p className="sub" style={{ marginTop: 14 }}>Akun tutor dibuat oleh admin. <Link href="/">← Kembali ke portal</Link></p>
    </div>
  );
}
