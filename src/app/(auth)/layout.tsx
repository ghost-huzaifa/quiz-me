export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-margin-mobile md:p-margin-desktop">
      {children}
    </div>
  );
}
