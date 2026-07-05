'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebarClient() {
  const pathname = usePathname();

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

  return (
    <nav className="flex-1 space-y-2">
      {links.map((link) => {
        // Match exact or prefix matching for nested paths (e.g. /admin/quizzes/new matches /admin/quizzes)
        const isActive =
          link.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
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
          </Link>
        );
      })}
    </nav>
  );
}
