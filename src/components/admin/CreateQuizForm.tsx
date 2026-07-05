'use client';

import { useActionState, useEffect, useState } from 'react';
import { createQuizAction } from '@/actions/quiz';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateQuizForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createQuizAction, null);
  const [publishQuiz, setPublishQuiz] = useState(false);

  useEffect(() => {
    if (state?.success && state.quizId) {
      router.push(`/admin/quizzes/${state.quizId}/edit`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex-1 max-w-container-max mx-auto w-full flex flex-col gap-6">
      {/* Hidden input to pass isPublished value based on button pressed */}
      <input type="hidden" name="isPublished" value={String(publishQuiz)} />

      {/* Header bar */}
      <header className="mb-stack-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-6 w-full">
        <div>
          <Link 
            href="/admin/quizzes" 
            className="text-primary hover:underline text-sm font-bold flex items-center gap-1 mb-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs font-bold">arrow_back</span>
            Back to Quizzes
          </Link>
          <h1 className="font-sans text-headline-md text-on-surface font-bold">Create New Quiz</h1>
          <p className="font-sans text-body-base text-on-surface-variant mt-1 leading-snug">
            Configure quiz details, timing limits, and passing standards.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            onClick={() => setPublishQuiz(false)}
            disabled={isPending}
            className="px-6 py-2 rounded-full border border-outline text-on-surface font-sans text-body-base hover:bg-surface-container-high transition-colors font-bold cursor-pointer disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="submit"
            onClick={() => setPublishQuiz(true)}
            disabled={isPending}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-sans text-body-base font-bold shadow-level-1 hover:shadow-level-2 transition-all cursor-pointer disabled:opacity-50"
          >
            Publish Quiz
          </button>
        </div>
      </header>

      {/* Stepper Indicator */}
      <div className="flex items-center mb-stack-lg max-w-3xl mx-auto w-full select-none">
        <div className="flex-1 border-b-2 border-primary-container relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-6 text-xs font-bold text-primary">Setup</div>
        </div>
        <div className="flex-1 border-b-2 border-outline-variant relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-6 text-xs font-bold text-on-surface-variant">Builder</div>
        </div>
      </div>

      {state?.message && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl border border-error/20 font-bold text-sm">
          {state.message}
        </div>
      )}

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-column-gap mt-8">
        
        {/* Basic Info Box */}
        <div className="col-span-1 md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-surface-container-high">
          <h3 className="font-sans text-body-base font-bold mb-6 text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">title</span> Basic Info
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-label-caps text-on-surface-variant mb-2">Quiz Title</label>
              <input
                name="title"
                type="text"
                required
                disabled={isPending}
                placeholder="e.g., Advanced JavaScript Concepts"
                className="w-full p-4 rounded-lg bg-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-body-base text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
              />
              {state?.errors?.title && (
                <p className="text-xs text-error font-bold mt-1">{state.errors.title[0]}</p>
              )}
            </div>
            
            <div>
              <label className="block text-label-caps text-on-surface-variant mb-2">Description</label>
              <textarea
                name="description"
                rows={3}
                disabled={isPending}
                placeholder="Briefly describe what this quiz covers..."
                className="w-full p-4 rounded-lg bg-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-body-base text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
              />
              {state?.errors?.description && (
                <p className="text-xs text-error font-bold mt-1">{state.errors.description[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Scoring & Time Card */}
        <div className="col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-surface-container-high">
          <h3 className="font-sans text-body-base font-bold mb-6 text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">timer</span> Scoring &amp; Time
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-label-caps text-on-surface-variant font-bold">Time Limit (Minutes)</label>
              <input
                name="timeLimitMins"
                type="number"
                defaultValue={15}
                min={1}
                required
                disabled={isPending}
                className="w-20 p-2 text-center rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none font-sans font-bold"
              />
            </div>
            {state?.errors?.timeLimitMins && (
              <p className="text-xs text-error font-bold text-right">{state.errors.timeLimitMins[0]}</p>
            )}

            <div className="flex justify-between items-center">
              <label className="text-label-caps text-on-surface-variant font-bold">Passing Score (%)</label>
              <input
                name="passingPercent"
                type="number"
                defaultValue={70}
                min={1}
                max={100}
                required
                disabled={isPending}
                className="w-20 p-2 text-center rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none font-sans font-bold"
              />
            </div>
            {state?.errors?.passingPercent && (
              <p className="text-xs text-error font-bold text-right">{state.errors.passingPercent[0]}</p>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-surface-container-high flex flex-col justify-between">
          <h3 className="font-sans text-body-base font-bold mb-6 text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">settings</span> Additional Parameters
          </h3>
          <div className="space-y-4">
            <div className="pt-4 border-t border-surface-variant/20 flex justify-between items-center">
              <label className="text-label-caps text-on-surface font-bold">Randomize Questions</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  name="randomize"
                  type="checkbox"
                  value="true"
                  defaultChecked
                  disabled={isPending}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Button footer */}
        <div className="col-span-1 md:col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            onClick={() => setPublishQuiz(false)}
            disabled={isPending}
            className="px-8 py-3 rounded-lg bg-on-background text-background font-sans text-body-base font-bold shadow-level-1 hover:shadow-level-2 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Next: Question Builder'}
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>
        </div>
      </div>
    </form>
  );
}
