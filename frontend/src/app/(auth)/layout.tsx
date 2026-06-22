export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4EFE6] dark:bg-[#0F1713] text-[#24201D] dark:text-[#F5EFE6] transition-colors duration-200">
      {children}
    </div>
  );
}
