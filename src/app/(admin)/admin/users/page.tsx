import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import UserManagementClient from '@/components/admin/UserManagementClient';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch users, quizzes, attempts, and permissions in parallel
  const [users, quizzes, attempts, permissions] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
      },
    }),
    prisma.quizAttempt.findMany({
      select: {
        userId: true,
        quizId: true,
      },
    }),
    prisma.reattemptPermission.findMany({
      select: {
        userId: true,
        quizId: true,
      },
    }),
  ]);

  return (
    <UserManagementClient
      users={users as any}
      quizzes={quizzes}
      attempts={attempts}
      permissions={permissions}
    />
  );
}
