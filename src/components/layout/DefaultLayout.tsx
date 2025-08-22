import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-[#0c0c0c]">
      <Header />
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      <Footer />
    </div>
  );
}