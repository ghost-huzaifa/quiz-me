'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  optionA: z.string().min(1, 'Option A is required'),
  optionB: z.string().min(1, 'Option B is required'),
  optionC: z.string().min(1, 'Option C is required'),
  optionD: z.string().min(1, 'Option D is required'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  order: z.number().int().default(1),
});

export async function addQuestionAction(
  quizId: string,
  data: {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    order: number;
  }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    const result = questionSchema.safeParse(data);
    if (!result.success) {
      return { success: false, errors: result.error.flatten().fieldErrors };
    }

    const question = await prisma.question.create({
      data: {
        ...result.data,
        quizId,
      },
    });

    revalidatePath(`/admin/quizzes/${quizId}/edit`);
    return { success: true, questionId: question.id };
  } catch (error) {
    console.error('Add question action error:', error);
    return { success: false, message: 'Failed to add question.' };
  }
}

export async function updateQuestionAction(
  questionId: string,
  data: {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    order: number;
  }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    const result = questionSchema.safeParse(data);
    if (!result.success) {
      return { success: false, errors: result.error.flatten().fieldErrors };
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: result.data,
    });

    revalidatePath(`/admin/quizzes/${question.quizId}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Update question action error:', error);
    return { success: false, message: 'Failed to update question.' };
  }
}

export async function deleteQuestionAction(questionId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    const question = await prisma.question.delete({
      where: { id: questionId },
    });

    revalidatePath(`/admin/quizzes/${question.quizId}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Delete question action error:', error);
    return { success: false, message: 'Failed to delete question.' };
  }
}
