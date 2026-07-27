import "./globals.css";
import AdminLayout from "./components/AdminLayout";

export const metadata = {
  title: "THE-LAWMEN'S | Administrative Operations Console",
  description: "Secure administrative control portal for THE-LAWMEN'S application platform, offering user diagnostics, subscription allocation, legal content CRUD, and campaigns control.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-800 antialiased overflow-hidden">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
