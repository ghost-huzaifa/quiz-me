import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface QuizResultPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function QuizResultPage({ params, searchParams }: QuizResultPageProps) {
  const { id: quizId } = await params;
  const { attemptId } = await searchParams;

  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  if (!attemptId) {
    redirect('/dashboard');
  }

  // Fetch the quiz attempt and verify ownership
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: true },
  });

  if (!attempt || attempt.userId !== session.id || attempt.quizId !== quizId) {
    redirect('/dashboard');
  }

  const passed = attempt.score >= attempt.quiz.passingPercent;

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
      <main className="w-full max-w-lg bg-surface-container-low rounded-xl shadow-level-2 p-stack-lg flex flex-col items-center text-center transform transition-all duration-300 hover:scale-[1.01] border border-outline-variant/30">
        
        {/* Target Icon */}
        <div className={`mb-stack-md w-24 h-24 rounded-full flex items-center justify-center shadow-sm select-none ${
          passed ? 'text-[#10B981] bg-[#e6f4ea]' : 'text-error bg-error-container'
        }`}>
          <span className="material-symbols-outlined text-display-lg" style={{ fontSize: '64px', lineHeight: 1 }}>
            {passed ? 'emoji_events' : 'crisis_alert'}
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-sans text-headline-md-mobile md:text-headline-md text-on-surface mb-stack-sm font-bold">
          Quiz Completed!
        </h1>

        {/* Score Display */}
        <div className={`font-sans text-display-lg font-black mb-stack-sm ${
          passed ? 'text-[#10B981]' : 'text-[#ba1a1a]'
        }`}>
          {attempt.score.toFixed(0)}%
        </div>

        {/* Pass/Fail Feedback */}
        <p className="font-sans text-body-base text-on-surface-variant mb-stack-lg">
          {passed 
            ? `Excellent work! You passed the quiz by scoring above the ${attempt.quiz.passingPercent}% threshold.`
            : `Keep learning! You scored below the ${attempt.quiz.passingPercent}% passing threshold. You can ask an admin to grant a reattempt.`
          }
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-stack-md">
          <Link
            href={`/quiz/${quizId}/review?attemptId=${attemptId}`}
            className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-sans text-body-base py-3 px-6 rounded-lg shadow-sm transition-colors active:scale-95 duration-200 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            Review Quiz
          </Link>
          <Link
            href={`/leaderboard/${quizId}`}
            className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-sans text-body-base py-3 px-6 rounded-lg shadow-sm transition-colors active:scale-95 duration-200 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">emoji_events</span>
            View Leaderboard
          </Link>
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-white font-sans text-body-base py-3 px-6 rounded-lg shadow-sm transition-colors active:scale-95 duration-200 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
