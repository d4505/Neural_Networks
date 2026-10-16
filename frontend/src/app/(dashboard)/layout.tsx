import { Sidebar } from "../../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4EFE6] dark:bg-[#0F1713] text-[#24201D] dark:text-[#F5EFE6] transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#F4EFE6] dark:bg-[#0F1713]">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
