import { Sidebar } from "../../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#FCFAF8] dark:bg-[#141113] text-[#241F1D] dark:text-[#EFEAEB] transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 bg-[#FCFAF8] dark:bg-[#141113]">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
