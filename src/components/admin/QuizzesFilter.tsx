'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function QuizzesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const updateFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch) {
      params.set('search', newSearch);
    } else {
      params.delete('search');
    }

    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }

    startTransition(() => {
      router.push(`/admin/quizzes?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    updateFilters(val, status);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    updateFilters(search, val);
  };

  return (
    <section className="glass-card rounded-xl p-4 mb-stack-lg flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest">
      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search quizzes..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all font-sans text-body-base text-on-background placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>

      <div className="flex gap-4 w-full md:w-auto">
        <select
          value={status}
          onChange={handleStatusChange}
          className="w-full md:w-auto px-4 py-2 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary font-sans text-body-base text-on-background cursor-pointer focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {isPending && (
          <span className="text-xs text-on-surface-variant font-medium animate-pulse self-center">
            Filtering...
          </span>
        )}
      </div>
    </section>
  );
}
