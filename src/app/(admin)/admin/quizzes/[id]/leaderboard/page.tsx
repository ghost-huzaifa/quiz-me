import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface AdminLeaderboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLeaderboardPage({ params }: AdminLeaderboardPageProps) {
  const { id: quizId } = await params;
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch quiz and all attempts
  const [quiz, allAttempts] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id: quizId },
    }),
    prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  if (!quiz) {
    redirect('/admin/quizzes');
  }

  // Group by userId and select the best attempt for each user
  const userBestAttemptsMap: Record<string, typeof allAttempts[0]> = {};

  allAttempts.forEach((attempt) => {
    const existing = userBestAttemptsMap[attempt.userId];
    if (!existing) {
      userBestAttemptsMap[attempt.userId] = attempt;
    } else {
      // Compare scores (higher is better). If equal, compare time taken (lower is better)
      if (
        attempt.score > existing.score ||
        (attempt.score === existing.score && attempt.timeTakenSecs < existing.timeTakenSecs)
      ) {
        userBestAttemptsMap[attempt.userId] = attempt;
      }
    }
  });

  // Convert map to array and sort
  const leaderboardEntries = Object.values(userBestAttemptsMap).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.timeTakenSecs - b.timeTakenSecs;
  });

  const totalParticipants = leaderboardEntries.length;
  const averageScore =
    totalParticipants > 0
      ? leaderboardEntries.reduce((sum, entry) => sum + entry.score, 0) / totalParticipants
      : 0;

  return (
    <div className="flex-grow flex flex-col max-w-container-max mx-auto w-full">
      {/* Header bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-stack-lg border-b border-outline-variant/30 pb-6">
        <div>
          <Link 
            href="/admin/quizzes" 
            className="text-primary hover:underline text-sm font-bold flex items-center gap-1 mb-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs font-bold">arrow_back</span>
            Back to Quizzes
          </Link>
          <h1 className="font-sans text-headline-md text-on-background font-bold tracking-tight leading-tight mb-2">
            {quiz.title} - Leaderboard
          </h1>
          <p className="font-sans text-body-base text-on-surface-variant flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
            Admin View of Rankings
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex gap-8 bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-outline-variant/30">
          <div>
            <p className="text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Total Participants</p>
            <p className="font-sans text-headline-md font-black text-primary">{totalParticipants}</p>
          </div>
          <div className="w-px bg-outline-variant/50"></div>
          <div>
            <p className="text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Average Score</p>
            <p className="font-sans text-headline-md font-black text-secondary">{averageScore.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden border border-outline-variant/30">
        
        {/* Table Header (Desktop only) */}
        <div className="grid grid-cols-12 gap-4 p-6 bg-surface-container-low border-b border-outline-variant/30 font-sans text-label-caps text-on-surface-variant uppercase tracking-widest items-center hidden md:grid font-bold">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">Time Taken</div>
        </div>

        {/* List of Entries */}
        {totalParticipants === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            No attempts recorded for this quiz yet.
          </div>
        ) : (
          <div className="flex flex-col p-4 md:p-6 gap-stack-sm">
            {leaderboardEntries.map((entry, index) => {
              const rank = index + 1;
              
              // Formatting time: MM:SS
              const mins = Math.floor(entry.timeTakenSecs / 60);
              const secs = entry.timeTakenSecs % 60;
              const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

              // Get initials for avatar
              const initials = entry.user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div 
                  key={entry.id}
                  className="grid grid-cols-12 gap-4 p-4 rounded-lg items-center transition-all duration-200 border border-transparent bg-surface-container-lowest hover:bg-surface-container/10"
                >
                  {/* Rank Column */}
                  <div className="col-span-2 md:col-span-1 flex justify-center items-center font-bold">
                    {rank === 1 ? (
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-sans text-xl">
                        <span className="material-symbols-outlined text-yellow-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                          trophy
                        </span>
                      </div>
                    ) : rank === 2 ? (
                      <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-on-surface-variant font-sans text-xl">
                        <span className="material-symbols-outlined text-gray-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                          trophy
                        </span>
                      </div>
                    ) : rank === 3 ? (
                      <div className="w-10 h-10 rounded-full bg-outline-variant flex items-center justify-center text-on-surface-variant font-sans text-xl">
                        <span className="material-symbols-outlined text-amber-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                          trophy
                        </span>
                      </div>
                    ) : (
                      <span className="font-sans text-headline-md-mobile text-on-surface-variant">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Player details */}
                  <div className="col-span-10 md:col-span-4 flex items-center gap-stack-md">
                    <div className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant font-bold flex items-center justify-center text-sm shadow-sm select-none shrink-0 border border-outline-variant/30">
                      {initials}
                    </div>
                    <div>
                      <p className="font-sans text-body-base text-on-surface font-bold truncate">
                        {entry.user.name}
                      </p>
                      {/* Mobile stats summary */}
                      <p className="text-xs text-on-surface-variant md:hidden font-sans mt-1">
                        Score: <span className="font-bold text-primary">{entry.score.toFixed(0)}%</span> | Time: {formattedTime}
                      </p>
                    </div>
                  </div>

                  {/* Email (Desktop only) */}
                  <div className="col-span-3 hidden md:block">
                    <span className="font-sans text-body-base text-on-surface-variant truncate">
                      {entry.user.email}
                    </span>
                  </div>

                  {/* Score (Desktop only) */}
                  <div className="col-span-2 text-right hidden md:block">
                    <span className="font-sans text-headline-md-mobile text-primary font-black">
                      {entry.score.toFixed(0)}%
                    </span>
                  </div>

                  {/* Time Taken (Desktop only) */}
                  <div className="col-span-2 text-right hidden md:block">
                    <span className="font-sans text-mono-timer text-on-surface-variant">
                      {formattedTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
