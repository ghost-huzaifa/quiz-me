import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch summary stats in parallel
  const [totalQuizzes, totalUsers, totalAttempts, avgScoreRes, recentAttempts] = await Promise.all([
    prisma.quiz.count(),
    prisma.user.count(),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.aggregate({
      _avg: { score: true },
    }),
    prisma.quizAttempt.findMany({
      take: 4,
      orderBy: { completedAt: 'desc' },
      include: {
        user: { select: { name: true } },
        quiz: { select: { title: true } },
      },
    }),
  ]);

  const avgScore = avgScoreRes._avg.score || 0;

  // Calculate dynamic weekly chart: Attempts over the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const attemptsLast7Days = await prisma.quizAttempt.findMany({
    where: {
      completedAt: {
        gte: last7Days[0],
      },
    },
  });

  const dailyCounts = last7Days.map((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const count = attemptsLast7Days.filter((a) => {
      const completedDate = new Date(a.completedAt);
      return completedDate >= date && completedDate < nextDay;
    }).length;

    const label = date.toLocaleDateString(undefined, { weekday: 'short' });
    return { label, count };
  });

  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);

  return (
    <div className="flex-grow flex flex-col gap-stack-lg max-w-container-max mx-auto w-full">
      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-column-gap">
        {/* Stat Card 1: Total Quizzes */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 hover:border-primary/20 border border-transparent transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                library_books
              </span>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Total Quizzes</p>
              <p className="font-sans text-headline-md-mobile font-black text-on-background">{totalQuizzes}</p>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Total Users */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 hover:border-primary/20 border border-transparent transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                group
              </span>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Total Users</p>
              <p className="font-sans text-headline-md-mobile font-black text-on-background">{totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Stat Card 3: Total Attempts */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 hover:border-primary/20 border border-transparent transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                analytics
              </span>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Total Attempts</p>
              <p className="font-sans text-headline-md-mobile font-black text-on-background">{totalAttempts}</p>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Avg Score */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 hover:border-primary/20 border border-transparent transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Avg Score</p>
              <p className="font-sans text-headline-md-mobile font-black text-on-background">{avgScore.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chart and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-column-gap">
        {/* Weekly attempts bar chart */}
        <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans text-headline-md-mobile text-on-background font-bold tracking-tight">Attempts Over Time</h3>
            <span className="text-label-caps px-3 py-1 bg-surface-container text-on-surface-variant rounded-full font-bold">Last 7 Days</span>
          </div>

          <div className="flex-grow flex items-end justify-between gap-4 h-64 pt-4 border-b border-l border-outline-variant/50 pb-2 pl-4">
            {dailyCounts.map((day, idx) => {
              const heightPercent = (day.count / maxCount) * 80 + 10; // scale between 10% and 90%
              return (
                <div 
                  key={idx} 
                  className="w-full bg-primary/20 rounded-t-sm relative group transition-all duration-300 hover:bg-primary/45 cursor-pointer flex flex-col justify-end"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-background text-surface-container-lowest text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold pointer-events-none select-none z-10 shadow-md">
                    {day.count}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs font-bold text-on-surface-variant mt-2 px-2">
            {dailyCounts.map((day, idx) => (
              <span key={idx} className="w-full text-center">{day.label}</span>
            ))}
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 border border-outline-variant/30 flex flex-col h-full justify-between">
          <div>
            <h3 className="font-sans text-headline-md-mobile text-on-background font-bold tracking-tight mb-6">
              Recent Activity
            </h3>
            
            <div className="flex flex-col gap-4">
              {recentAttempts.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant text-sm">
                  No activity recorded yet.
                </div>
              ) : (
                recentAttempts.map((attempt) => {
                  const initials = attempt.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div 
                      key={attempt.id} 
                      className="flex items-center gap-3 pb-4 border-b border-outline-variant/20 last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold flex items-center justify-center shrink-0 text-sm">
                        {initials}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-sans text-body-base font-bold text-on-background truncate leading-tight">
                          {attempt.user.name}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate font-sans mt-0.5">
                          Attempted '{attempt.quiz.title}'
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-label-caps px-2.5 py-1 rounded font-bold ${
                          attempt.score >= 80 
                            ? 'bg-[#e6f4ea] text-[#137333]' 
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {attempt.score.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {recentAttempts.length > 0 && (
            <Link 
              href="/admin/users" 
              className="mt-6 w-full py-2 text-primary font-bold hover:bg-primary/5 rounded transition-colors text-center text-sm cursor-pointer"
            >
              View User History
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
