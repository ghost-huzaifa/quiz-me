import { getSession } from '@/lib/auth';
import CreateQuizForm from '@/components/admin/CreateQuizForm';
import { redirect } from 'next/navigation';

export default async function AdminNewQuizPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  return <CreateQuizForm />;
}
