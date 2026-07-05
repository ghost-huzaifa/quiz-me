import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface QuizInstructionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizInstructionsPage({ params }: QuizInstructionsPageProps) {
  const { id: quizId } = await params;
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch quiz, existing attempts, and permissions
  const [quiz, attempts, permission] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.id, quizId },
    }),
    prisma.reattemptPermission.findUnique({
      where: {
        userId_quizId: {
          userId: session.id,
          quizId,
        },
      },
    }),
  ]);

  if (!quiz || !quiz.isPublished) {
    redirect('/dashboard');
  }

  const attemptsCount = attempts.length;
  const canTake = attemptsCount === 0 || (attemptsCount === 1 && !!permission);

  if (!canTake) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-on-background/10 backdrop-blur-sm fixed inset-0 z-50">
      {/* Modal Content Container */}
      <div className="glass-panel w-full max-w-2xl rounded-xl shadow-level-2 overflow-hidden bg-surface-bright border border-outline-variant/30">
        
        {/* Header Section */}
        <div className="p-stack-lg border-b border-surface-variant relative overflow-hidden bg-surface-container-low">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          <h1 className="font-sans text-headline-md-mobile md:text-headline-md text-on-surface mb-stack-sm relative z-10 font-bold leading-tight">
            {quiz.title} - Instructions
          </h1>
          
          {/* Quick Stats Badges */}
          <div className="flex gap-4 mt-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full border border-surface-variant/40">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                help
              </span>
              <span className="font-sans text-label-caps text-on-surface-variant font-bold">
                {quiz._count.questions} Questions
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full border border-surface-variant/40">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
              <span className="font-sans text-label-caps text-on-surface-variant font-bold">
                {quiz.timeLimitMins} Minutes
              </span>
            </div>
          </div>
        </div>

        {/* Rules Checklist */}
        <div className="p-stack-lg bg-surface-container-lowest">
          <h2 className="font-sans text-headline-md-mobile md:text-question-text text-on-surface mb-stack-md flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-secondary text-2xl">fact_check</span>
            Rules &amp; Guidelines
          </h2>
          <ul className="space-y-stack-md">
            <li className="flex items-start gap-4 p-4 rounded-lg bg-surface-bright hover:bg-surface-container-low transition-colors duration-200 group border border-transparent hover:border-surface-variant/30">
              <div className="bg-primary-container/10 text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
              </div>
              <div>
                <p className="font-sans text-body-base font-bold text-on-surface">Read questions carefully.</p>
                <p className="text-sm text-on-surface-variant mt-1">Take your time. Correct answers require paying attention to details.</p>
              </div>
            </li>
            
            <li className="flex items-start gap-4 p-4 rounded-lg bg-surface-bright hover:bg-surface-container-low transition-colors duration-200 group border border-transparent hover:border-surface-variant/30">
              <div className="bg-primary-container/10 text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <div>
                <p className="font-sans text-body-base font-bold text-on-surface">Select only one answer per question.</p>
                <p className="text-sm text-on-surface-variant mt-1">Review your choice before navigating to the next question.</p>
              </div>
            </li>

            <li className="flex items-start gap-4 p-4 rounded-lg bg-surface-bright hover:bg-surface-container-low transition-colors duration-200 group border border-transparent hover:border-surface-variant/30">
              <div className="bg-primary-container/10 text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  explore
                </span>
              </div>
              <div>
                <p className="font-sans text-body-base font-bold text-on-surface">Use the navigator to jump between questions.</p>
                <p className="text-sm text-on-surface-variant mt-1">You can skip questions and return to them later before submitting.</p>
              </div>
            </li>

            <li className="flex items-start gap-4 p-4 rounded-lg bg-surface-bright hover:bg-surface-container-low transition-colors duration-200 group border border-transparent hover:border-surface-variant/30">
              <div className="bg-primary-container/10 text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  alarm_on
                </span>
              </div>
              <div>
                <p className="font-sans text-body-base font-bold text-on-surface">Submit before the timer ends.</p>
                <p className="text-sm text-on-surface-variant mt-1">The quiz will automatically submit when time expires.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="p-stack-lg bg-surface flex flex-col items-center justify-center border-t border-surface-variant/30 gap-4">
          <Link
            href={`/quiz/${quiz.id}/attempt`}
            className="w-full md:w-auto min-w-[280px] bg-gradient-brand text-on-primary font-sans text-question-text font-bold py-4 px-8 rounded-lg shadow-level-1 hover:shadow-level-2 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
            Start Quiz Now
          </Link>
          <Link
            href="/dashboard"
            className="font-sans text-body-base text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            Exit to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
