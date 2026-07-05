'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function AdminSidebarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const links = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: 'dashboard',
    },
    {
      name: 'Quizzes',
      href: '/admin/quizzes',
      icon: 'quiz',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: 'group',
    },
  ];

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (pathname === href) return;
    
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      {/* Route Navigation Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center font-sans">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-level-2 border border-outline-variant/30 flex flex-col items-center gap-4 max-w-xs w-full text-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-surface-variant"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h3 className="text-on-background font-bold text-lg leading-tight">Loading Page</h3>
              <p className="text-on-surface-variant text-sm mt-1">Please wait a moment...</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          // Match exact or prefix matching for nested paths (e.g. /admin/quizzes/new matches /admin/quizzes)
          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);

          return (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavigate(e, link.href)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-sans text-body-base transition-all hover:translate-x-1 duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
              >
                {link.icon}
              </span>
              <span>{link.name}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
