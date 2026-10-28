import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NAMA } from "@/lib/util";
import { logout } from "@/app/actions";
const NAV = {
  ADMIN: [["/admin", "Monitoring & Direktori"], ["/admin/master", "Master Data"]],
  TUTOR: [["/tutor", "Ketersediaan Saya"]],
};
export default async function Staff({ children }) {
  const s = await getSession();
  if (!s) redirect("/login");
  return (
    <div className="shell">
      <aside>
        <div className="logo">{NAMA}<small>Workspace {s.role === "ADMIN" ? "Admin" : "Tutor"}</small></div>
        <nav>{NAV[s.role].map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</nav>
        <div className="side-foot">
          <Link href="/" className="lnk">← Lihat portal publik</Link>
          <form action={logout}><button className="lnk bad">Keluar ({s.name})</button></form>
        </div>
      </aside>
      <div className="content">{children}</div>
    </div>
  );
}
