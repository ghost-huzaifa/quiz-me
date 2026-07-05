'use client';

import { useActionState, useEffect } from 'react';
import { loginAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-level-2 p-stack-lg border border-outline-variant/30 transition-all duration-300">
      <div className="flex flex-col items-center mb-6">
        <div className="text-primary bg-primary-fixed w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            quiz
          </span>
        </div>
        <h1 className="font-sans text-headline-md font-black text-primary tracking-tight">QuizMe</h1>
        <p className="text-sm text-on-surface-variant mt-1 uppercase font-bold tracking-widest text-center">
          Attempt Quizzes & View Leaderboards
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.message && (
          <div className="p-3 bg-error-container text-on-error-container border border-error/20 rounded-lg text-sm font-medium">
            {state.message}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-label-caps text-on-surface-variant mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            className="w-full p-3 rounded-lg bg-surface border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-body-base text-on-surface placeholder:text-on-surface-variant/40"
            placeholder="e.g. admin@quizme.com or user@quizme.com"
          />
          {state?.errors?.email && (
            <p className="text-xs text-error font-medium mt-1">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-label-caps text-on-surface-variant mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            className="w-full p-3 rounded-lg bg-surface border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-body-base text-on-surface placeholder:text-on-surface-variant/40"
            placeholder="••••••••"
          />
          {state?.errors?.password && (
            <p className="text-xs text-error font-medium mt-1">{state.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-on-primary font-bold py-3 px-6 rounded-lg shadow-level-1 hover:shadow-level-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center">
        <p className="text-xs text-on-surface-variant">
          Don't have an account? Ask your administrator to create one.
        </p>
      </div>
    </main>
  );
}
