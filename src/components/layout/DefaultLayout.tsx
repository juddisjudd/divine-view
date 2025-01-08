import Header from "@/components/filter/Header";
import { Footer } from "@/components/filter/Footer";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#121212]">
      <Header />
      <main className="flex-1 min-h-0 overflow-auto">{children}</main>
      <Footer />
    </div>
  );
}
