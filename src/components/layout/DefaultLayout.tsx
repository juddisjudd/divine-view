import Header from "@/components/filter/Header";
import { Footer } from "@/components/filter/Footer";
import { VersionChecker } from "@/components/providers/VersionChecker";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0c0c0c]">
      <VersionChecker />
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      <Footer />
    </div>
  );
}