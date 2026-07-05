import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function UserDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch quizzes, user attempts, and reattempt permissions in parallel
  const [quizzes, attempts, reattemptPermissions] = await Promise.all([
    prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.id },
    }),
    prisma.reattemptPermission.findMany({
      where: { userId: session.id },
    }),
  ]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-8">
      {/* Welcome banner */}
      <div className="mb-stack-lg">
        <h1 className="font-sans text-display-lg text-primary mb-stack-sm tracking-tight leading-tight">
          Welcome back, {session.name}!
        </h1>
        <p className="font-sans text-body-base text-on-surface-variant">
          Ready to test your knowledge today? Choose a quiz from the list below.
        </p>
      </div>

      {/* Quizzes List */}
      <section className="space-y-stack-md">
        <h2 className="font-sans text-headline-md text-on-background mb-stack-md flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            library_books
          </span>
          Available Quizzes
        </h2>

        {quizzes.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-level-1 text-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4">
              quiz
            </span>
            <p className="font-sans text-body-base text-on-surface-variant">
              No quizzes are currently published. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-column-gap">
            {quizzes.map((quiz) => {
              const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
              const hasPermission = reattemptPermissions.some((p) => p.quizId === quiz.id);
              
              const attemptsCount = quizAttempts.length;
              
              // Can they take it?
              // - 0 attempts: Yes
              // - 1 attempt with reattempt permission: Yes
              // - 2 attempts or 1 attempt with no reattempt permission: No
              const canTake = attemptsCount === 0 || (attemptsCount === 1 && hasPermission);
              
              // Get best score if attempted
              const bestScore = attemptsCount > 0 
                ? Math.max(...quizAttempts.map((a) => a.score)) 
                : null;
              
              const passed = bestScore !== null && bestScore >= quiz.passingPercent;

              return (
                <div 
                  key={quiz.id} 
                  className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-outline-variant/30 transition-all duration-300 card-hover-effect flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-surface-variant text-on-surface-variant text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        Quiz
                      </span>
                      
                      {bestScore !== null && (
                        <span 
                          className={`text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                            passed 
                              ? 'bg-[#e6f4ea] text-[#137333]' 
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {passed ? 'check_circle' : 'cancel'}
                          </span>
                          {passed ? 'Passed' : 'Failed'} ({bestScore.toFixed(0)}%)
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans text-question-text text-on-surface mb-stack-sm leading-tight font-bold group-hover:text-primary transition-colors">
                      {quiz.title}
                    </h3>
                    
                    {quiz.description && (
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                        {quiz.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 mb-stack-lg mt-stack-md">
                      <div className="flex items-center gap-1 text-on-surface-variant font-sans text-sm">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {quiz.timeLimitMins} mins
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant font-sans text-sm">
                        <span className="material-symbols-outlined text-base">done_all</span>
                        Passing: {quiz.passingPercent}%
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant font-sans text-sm">
                        <span className="material-symbols-outlined text-base">help</span>
                        {quiz._count.questions} questions
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-auto">
                    {canTake ? (
                      <Link 
                        href={`/quiz/${quiz.id}`}
                        className="w-full text-center block bg-gradient-brand text-on-primary font-sans text-body-base font-bold py-3 rounded-lg shadow-level-1 hover:shadow-level-2 active:scale-95 transition-all duration-200 cursor-pointer"
                      >
                        {attemptsCount === 1 ? 'Retake Quiz' : 'Take Quiz'}
                      </Link>
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-surface-variant text-on-surface-variant/50 font-sans text-body-base font-bold py-3 rounded-lg opacity-50 cursor-not-allowed"
                      >
                        Completed (No Reattempts)
                      </button>
                    )}

                    {attemptsCount > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        <Link 
                          href={`/quiz/${quiz.id}/review`}
                          className="text-center block border border-outline-variant hover:bg-surface-container text-on-surface-variant font-sans text-xs py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Review Answers
                        </Link>
                        <Link 
                          href={`/leaderboard/${quiz.id}`}
                          className="text-center block border border-outline-variant hover:bg-surface-container text-on-surface-variant font-sans text-xs py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Leaderboard
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
