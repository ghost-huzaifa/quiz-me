import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import QuizAttemptClient from '@/components/quiz/QuizAttemptClient';
import { redirect } from 'next/navigation';

interface QuizAttemptPageProps {
  params: Promise<{ id: string }>;
}

// Simple Fisher-Yates shuffle array helper
function shuffleQuestions<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    if (temp !== undefined && arr[j] !== undefined) {
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  return arr;
}

export default async function QuizAttemptPage({ params }: QuizAttemptPageProps) {
  const { id: quizId } = await params;
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch quiz detail and questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz || !quiz.isPublished) {
    redirect('/dashboard');
  }

  // Double-verify attempt limit in case they skip the instructions page
  const existingAttempts = await prisma.quizAttempt.findMany({
    where: { userId: session.id, quizId },
  });

  const permission = await prisma.reattemptPermission.findUnique({
    where: {
      userId_quizId: {
        userId: session.id,
        quizId,
      },
    },
  });

  const attemptsCount = existingAttempts.length;
  const canTake = attemptsCount === 0 || (attemptsCount === 1 && !!permission);

  if (!canTake) {
    redirect('/dashboard');
  }

  // Prepare questions (shuffle if enabled, strip correct answer to prevent inspection cheat)
  const orderedQuestions = quiz.randomize 
    ? shuffleQuestions(quiz.questions) 
    : [...quiz.questions].sort((a, b) => a.order - b.order);

  const clientQuestions = orderedQuestions.map((q) => ({
    id: q.id,
    text: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    order: q.order,
  }));

  return (
    <QuizAttemptClient 
      quiz={{
        id: quiz.id,
        title: quiz.title,
        timeLimitMins: quiz.timeLimitMins,
      }}
      questions={clientQuestions}
    />
  );
}
