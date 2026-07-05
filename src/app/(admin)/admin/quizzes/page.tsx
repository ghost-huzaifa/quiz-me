import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import QuizzesFilter from '@/components/admin/QuizzesFilter';
import QuizDeleteButton from '@/components/admin/QuizDeleteButton';

interface AdminQuizzesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default async function AdminQuizzesPage({ searchParams }: AdminQuizzesPageProps) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const { search = '', status = '' } = await searchParams;

  // Build filter conditions
  const whereCondition: any = {};

  if (search) {
    whereCondition.title = {
      contains: search,
      mode: 'insensitive', // Case-insensitive matching in Postgres
    };
  }

  if (status) {
    whereCondition.isPublished = status === 'published';
  }

  // Fetch quizzes matching conditions
  const quizzes = await prisma.quiz.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  return (
    <div className="flex-grow flex flex-col max-w-container-max mx-auto w-full">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h2 className="font-sans text-headline-md text-on-background font-bold tracking-tight">Quiz Management</h2>
          <p className="font-sans text-body-base text-on-surface-variant mt-2 leading-snug">
            Create, edit, and manage your competitive learning modules.
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="bg-primary hover:bg-primary-dark text-on-primary font-sans text-body-base font-bold py-3 px-6 rounded-lg shadow-level-1 hover:shadow-level-2 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined">add</span>
          Create New Quiz
        </Link>
      </header>

      {/* Filters (Client component) */}
      <QuizzesFilter />

      {/* Quizzes Table Card */}
      <section className="glass-card rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-level-1 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 font-sans text-label-caps text-on-surface-variant font-bold uppercase tracking-wider">
                <th className="p-4">Title</th>
                <th className="p-4 text-center">Questions</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                    No quizzes found matching filters.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => {
                  return (
                    <tr key={quiz.id} className="hover:bg-surface-container/10 transition-colors group">
                      <td className="p-4">
                        <p className="font-sans text-body-base font-bold text-on-background">{quiz.title}</p>
                        {quiz.description && (
                          <p className="text-xs text-on-surface-variant line-clamp-1 max-w-md font-sans mt-0.5">
                            {quiz.description}
                          </p>
                        )}
                      </td>
                      
                      <td className="p-4 text-center">
                        <span className="font-sans text-body-base font-bold">{quiz._count.questions}</span>
                      </td>

                      <td className="p-4">
                        {quiz.isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e6f4ea] text-[#137333] rounded-full text-label-caps font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#137333]"></span>
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-label-caps font-bold">
                            <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/quiz/${quiz.id}`}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                            title="Preview Instructions"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                          <Link
                            href={`/admin/quizzes/${quiz.id}/edit`}
                            className="p-2 text-on-surface-variant hover:text-tertiary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                            title="Edit Quiz & Questions"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </Link>
                          <QuizDeleteButton quizId={quiz.id} quizTitle={quiz.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats Summary */}
        <div className="border-t border-outline-variant/30 bg-surface-container-low p-4 flex items-center justify-between">
          <p className="font-sans text-sm text-on-surface-variant">
            Showing <span className="font-bold text-on-background">{quizzes.length}</span> results.
          </p>
        </div>
      </section>
    </div>
  );
}
