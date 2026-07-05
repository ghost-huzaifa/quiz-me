'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const quizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional(),
  timeLimitMins: z.coerce.number().min(1, 'Time limit must be at least 1 minute'),
  passingPercent: z.coerce.number().min(1, 'Passing score must be at least 1%').max(100, 'Passing score cannot exceed 100%'),
  isPublished: z.boolean().default(false),
  randomize: z.boolean().default(true),
});

export async function createQuizAction(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const timeLimitMins = formData.get('timeLimitMins');
    const passingPercent = formData.get('passingPercent');
    const isPublished = formData.get('isPublished') === 'true';
    const randomize = formData.get('randomize') === 'true';

    const result = quizSchema.safeParse({
      title,
      description,
      timeLimitMins,
      passingPercent,
      isPublished,
      randomize,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    const quiz = await prisma.quiz.create({
      data: result.data,
    });

    revalidatePath('/admin/quizzes');
    revalidatePath('/dashboard');

    return {
      success: true,
      quizId: quiz.id,
    };
  } catch (error) {
    console.error('Create quiz action error:', error);
    return {
      success: false,
      message: 'Failed to create quiz.',
    };
  }
}

export async function updateQuizAction(quizId: string, prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const timeLimitMins = formData.get('timeLimitMins');
    const passingPercent = formData.get('passingPercent');
    const isPublished = formData.get('isPublished') === 'true';
    const randomize = formData.get('randomize') === 'true';

    const result = quizSchema.safeParse({
      title,
      description,
      timeLimitMins,
      passingPercent,
      isPublished,
      randomize,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    await prisma.quiz.update({
      where: { id: quizId },
      data: result.data,
    });

    revalidatePath('/admin/quizzes');
    revalidatePath(`/admin/quizzes/${quizId}/edit`);
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update quiz action error:', error);
    return {
      success: false,
      message: 'Failed to update quiz.',
    };
  }
}

export async function deleteQuizAction(quizId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    revalidatePath('/admin/quizzes');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Delete quiz action error:', error);
    return { success: false, message: 'Failed to delete quiz.' };
  }
}
