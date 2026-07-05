import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface QuizReviewPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function QuizReviewPage({ params, searchParams }: QuizReviewPageProps) {
  const { id: quizId } = await params;
  const { attemptId } = await searchParams;

  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  if (!attemptId) {
    redirect('/dashboard');
  }

  // Fetch the quiz attempt and include quiz questions
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  // Verify ownership (only the user who took the quiz or an ADMIN can review it)
  if (!attempt || (attempt.userId !== session.id && session.role !== 'ADMIN') || attempt.quizId !== quizId) {
    redirect('/dashboard');
  }

  const userAnswers = attempt.answers as Record<string, string>;

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto py-8">
      {/* Header bar */}
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
            Review: {attempt.quiz.title}
          </h1>
          <p className="text-on-surface-variant font-sans text-sm mt-1">
            Score: <span className="font-bold text-primary">{attempt.score.toFixed(0)}%</span> | Correct: <span className="font-bold text-tertiary">{attempt.totalCorrect} / {attempt.totalQuestions}</span>
          </p>
        </div>
        <Link
          href={`/quiz/${quizId}/result?attemptId=${attemptId}`}
          className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 px-4 py-2 rounded-lg font-sans text-xs font-bold transition-colors cursor-pointer"
        >
          View Score Card
        </Link>
      </div>

      {/* Questions list */}
      <div className="space-y-8">
        {attempt.quiz.questions.map((q, index) => {
          const userAnswer = userAnswers[q.id];
          const correctAnswer = q.correctAnswer;
          const isCorrect = userAnswer === correctAnswer;
          const isSkipped = !userAnswer;

          return (
            <div 
              key={q.id}
              className={`p-6 rounded-xl border bg-surface-container-lowest shadow-sm ${
                isSkipped 
                  ? 'border-outline-variant/50' 
                  : isCorrect 
                    ? 'border-[#10B981]/30 bg-[#e6f4ea]/10' 
                    : 'border-error/20 bg-error-container/5'
              }`}
            >
              {/* Question number and badge */}
              <div className="flex justify-between items-center mb-4">
                <span className="bg-surface-variant text-on-surface-variant text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Question {index + 1}
                </span>

                {isSkipped ? (
                  <span className="bg-surface-variant text-on-surface-variant text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">help</span>
                    Skipped
                  </span>
                ) : isCorrect ? (
                  <span className="bg-[#e6f4ea] text-[#137333] text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Correct
                  </span>
                ) : (
                  <span className="bg-error-container text-on-error-container text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">cancel</span>
                    Incorrect
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="font-sans text-body-base text-on-surface font-bold mb-4">
                {q.text}
              </h3>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: 'A', text: q.optionA },
                  { key: 'B', text: q.optionB },
                  { key: 'C', text: q.optionC },
                  { key: 'D', text: q.optionD },
                ].map(({ key, text }) => {
                  const wasSelected = userAnswer === key;
                  const isCorrectOption = correctAnswer === key;

                  let cardClass = 'border-surface-variant bg-surface-container-lowest';
                  let badgeClass = 'border-surface-variant text-on-surface-variant';

                  if (isCorrectOption) {
                    cardClass = 'border-[#10B981] bg-[#e6f4ea]/30 text-on-surface';
                    badgeClass = 'border-[#10B981] bg-[#10B981] text-white';
                  } else if (wasSelected) {
                    cardClass = 'border-error bg-error-container/20 text-on-surface';
                    badgeClass = 'border-error bg-error text-white';
                  }

                  return (
                    <div 
                      key={key}
                      className={`border-2 rounded-lg p-4 flex items-center gap-4 transition-all duration-200 ${cardClass}`}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs ${badgeClass}`}>
                        {key}
                      </div>
                      <span className="font-sans text-sm font-medium">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
