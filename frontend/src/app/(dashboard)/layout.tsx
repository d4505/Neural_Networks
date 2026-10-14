import { Navbar } from "../../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FCFAF8] dark:bg-[#141113] text-[#241F1D] dark:text-[#EFEAEB] flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
