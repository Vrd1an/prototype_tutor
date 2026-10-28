import "./globals.css";
export const metadata = { title: "Jadwal Tutor Bimbel" };
export default function Root({ children }) {
  return (
    <html lang="id"><head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </head><body>{children}</body></html>
  );
}
