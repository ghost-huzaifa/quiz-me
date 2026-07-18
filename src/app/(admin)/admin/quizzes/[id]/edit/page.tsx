import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EditQuizForm from '@/components/admin/EditQuizForm';
import { redirect } from 'next/navigation';

interface AdminEditQuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditQuizPage({ params }: AdminEditQuizPageProps) {
  const { id: quizId } = await params;
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch quiz details including all questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!quiz) {
    redirect('/admin/quizzes');
  }

  // Transform questions to include image URLs where images exist
  const quizWithImageUrls = {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      order: q.order,
      quizId: q.quizId,
      imageUrl: q.imageData ? `/api/upload/${q.id}?field=image` : null,
      optionAImageUrl: q.optionAImageData ? `/api/upload/${q.id}?field=optionAImage` : null,
      optionBImageUrl: q.optionBImageData ? `/api/upload/${q.id}?field=optionBImage` : null,
      optionCImageUrl: q.optionCImageData ? `/api/upload/${q.id}?field=optionCImage` : null,
      optionDImageUrl: q.optionDImageData ? `/api/upload/${q.id}?field=optionDImage` : null,
    })),
  };

  return <EditQuizForm quiz={quizWithImageUrls} />;
}
