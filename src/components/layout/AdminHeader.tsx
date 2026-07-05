'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';

interface AdminHeaderProps {
  initials: string;
  userName: string;
  userRole: string;
}

export default function AdminHeader({ initials, userName, userRole }: AdminHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Desktop & Mobile Top Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 py-4 px-4 md:px-margin-desktop sticky top-0 z-20 shadow-level-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            title="Open navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          
          <h1 className="font-sans text-headline-md-mobile md:text-headline-md text-on-background font-bold">
            Admin Console
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 font-bold text-xs text-primary px-3 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/20">
            <span className="material-symbols-outlined text-xs">shield</span>
            Secure Session
          </div>
          
          {/* Mobile Profile & Logout info */}
          <div className="flex md:hidden items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-xs shadow-sm border border-outline-variant/30 select-none">
              {initials}
            </div>
            <form action={logoutAction} className="inline">
              <button
                type="submit"
                className="text-on-surface-variant hover:text-error p-1 rounded-lg hover:bg-surface-container-high cursor-pointer flex items-center justify-center"
                title="Logout"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-on-background/50 backdrop-blur-xs transition-opacity"
          ></div>

          {/* Drawer Menu */}
          <div className="relative flex flex-col w-64 max-w-xs bg-surface h-full shadow-2xl p-4 z-10 animate-[slideRight_0.2s_ease-out_forwards]">
            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-8 px-2 pt-2 border-b border-outline-variant/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    admin_panel_settings
                  </span>
                </div>
                <div>
                  <h2 className="font-sans text-sm text-primary font-bold leading-tight">Admin Portal</h2>
                  <p className="font-sans text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Management</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
              {links.map((link) => {
                const isActive =
                  link.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
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

            {/* Admin User info (Bottom) */}
            <div className="border-t border-outline-variant/30 pt-4 px-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-xs shrink-0 select-none border border-outline-variant/30">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs font-bold text-on-surface truncate leading-tight">
                    {userName}
                  </p>
                  <p className="font-sans text-[9px] text-on-surface-variant uppercase font-bold">
                    {userRole}
                  </p>
                </div>
              </div>
              
              <form action={logoutAction} className="inline shrink-0">
                <button 
                  type="submit" 
                  className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-lg hover:bg-surface-container-high cursor-pointer flex items-center justify-center"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
