import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function UserProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch attempts with quiz info
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: session.id },
    include: {
      quiz: true,
    },
    orderBy: { completedAt: 'desc' },
  });

  const initials = session.name
    ? session.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'US';

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-8">
      <div className="mb-8 flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <Link 
            href="/dashboard" 
            className="text-primary hover:underline text-sm font-bold flex items-center gap-1 mb-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs font-bold">arrow_back</span>
            Back to Dashboard
          </Link>
          <h1 className="font-sans text-display-lg text-on-background font-bold tracking-tight leading-tight">
            My Profile
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-column-gap">
        {/* Left Card: Profile Info */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-level-1 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-2xl shadow-sm mb-4 select-none">
              {initials}
            </div>
            <h2 className="font-sans text-headline-md-mobile font-bold text-on-surface leading-tight">
              {session.name}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1 mb-6 font-medium">
              {session.role} Account
            </p>
          </div>

          <div className="space-y-4 border-t border-outline-variant/20 pt-6">
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-medium text-on-surface mt-1 truncate">{session.email}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Quizzes Attempted</p>
              <p className="text-sm font-medium text-on-surface mt-1">{attempts.length}</p>
            </div>
          </div>
        </div>

        {/* Right Card: Attempt History */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-level-1">
          <h3 className="font-sans text-question-text font-bold text-on-surface mb-6">
            Quiz Attempts History
          </h3>

          {attempts.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              You haven't attempted any quizzes yet. Go to the dashboard to start one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-label-caps text-on-surface-variant font-bold uppercase tracking-wider">
                    <th className="p-4">Quiz Title</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Time Taken</th>
                    <th className="p-4 text-center">Result</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {attempts.map((attempt) => {
                    const passed = attempt.score >= attempt.quiz.passingPercent;
                    const mins = Math.floor(attempt.timeTakenSecs / 60);
                    const secs = attempt.timeTakenSecs % 60;
                    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

                    return (
                      <tr key={attempt.id} className="hover:bg-surface-container/10 transition-colors">
                        <td className="p-4 font-bold text-on-surface">
                          {attempt.quiz.title}
                          <p className="text-xs text-on-surface-variant font-normal font-sans mt-0.5">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 text-center font-bold font-sans text-primary">
                          {attempt.score.toFixed(0)}%
                        </td>
                        <td className="p-4 text-center font-sans text-on-surface-variant">
                          {formattedTime}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            passed ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-error-container text-on-error-container'
                          }`}>
                            {passed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/quiz/${attempt.quizId}/review?attemptId=${attempt.id}`}
                            className="text-xs font-bold text-primary hover:underline cursor-pointer"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
