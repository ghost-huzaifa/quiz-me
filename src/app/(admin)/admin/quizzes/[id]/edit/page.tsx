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

  return <EditQuizForm quiz={quiz} />;
}
