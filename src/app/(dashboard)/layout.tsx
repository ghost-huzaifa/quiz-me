import { getSession } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
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
    : 'US';

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* Top Navigation Bar */}
      <header className="custom-gradient-header text-on-primary font-sans text-headline-md-mobile md:text-headline-md docked full-width fixed top-0 w-full z-40 shadow-md">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="font-sans text-headline-md-mobile md:text-headline-md font-black text-on-primary flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              quiz
            </span>
            QuizMe
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              className="text-on-primary hover:bg-on-primary/10 transition-all px-3 py-2 rounded-md font-bold active:scale-95 duration-200"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-sm font-bold text-on-primary leading-tight">{session.name}</span>
              <span className="text-xs text-on-primary/70 leading-none">{session.role}</span>
            </div>
            
            <div className="w-10 h-10 rounded-full border-2 border-on-primary bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-sm shadow-sm select-none">
              {initials}
            </div>

            <form action={logoutAction} className="inline">
              <button
                type="submit"
                className="text-on-primary/80 hover:text-on-primary hover:bg-on-primary/10 transition-colors px-3 py-2 rounded-md font-sans text-body-base active:scale-95 duration-200 cursor-pointer"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest text-on-surface w-full py-8 border-t border-outline-variant font-sans text-label-caps mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-0 max-w-container-max mx-auto gap-4">
          <div className="font-sans text-headline-md text-primary font-black">
            QuizMe
          </div>
          <div className="text-center md:text-left text-on-surface-variant">
            © {new Date().getFullYear()} QuizMe. Built for high-fidelity competitive learning.
          </div>
          <div className="flex gap-4">
            <span className="text-on-surface-variant opacity-80">Privacy Policy</span>
            <span className="text-on-surface-variant opacity-80">Terms of Service</span>
            <span className="text-on-surface-variant opacity-80">Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
