import { getSession } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminSidebarClient from '@/components/layout/AdminSidebarClient';
import AdminHeader from '@/components/layout/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Get initials for avatar
  const initials = session.name
    ? session.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  return (
    <div className="bg-background text-on-background flex min-h-screen font-sans antialiased">
      {/* Side Navigation Bar (Stitch side_nav) */}
      <aside className="hidden md:flex flex-col bg-surface h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/30 shadow-sm z-30 p-4">
        {/* Header / Brand */}
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <h2 className="font-sans text-body-base text-primary font-bold leading-tight">Admin Portal</h2>
            <p className="font-sans text-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Management Console</p>
          </div>
        </div>

        {/* Dynamic Client Sidebar Navigation links */}
        <AdminSidebarClient />

        {/* Admin User info (Bottom) */}
        <div className="mt-auto border-t border-outline-variant/30 pt-4 px-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-xs shrink-0 select-none border border-outline-variant/30">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-body-base font-bold text-on-surface truncate text-sm leading-tight">
                {session.name}
              </p>
              <p className="font-sans text-label-caps text-on-surface-variant uppercase font-bold text-[10px]">
                {session.role}
              </p>
            </div>
          </div>
          
          <form action={logoutAction} className="inline shrink-0">
            <button 
              type="submit" 
              className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-lg hover:bg-surface-container-high cursor-pointer flex items-center justify-center"
              title="Logout"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        {/* Header */}
        <AdminHeader initials={initials} userName={session.name} userRole={session.role} />

        {/* Main dynamic section */}
        <main className="flex-grow p-margin-mobile md:p-margin-desktop bg-pattern min-h-[calc(100vh-4rem)] flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
