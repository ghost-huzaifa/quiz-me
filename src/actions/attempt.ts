'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function submitAttemptAction(
  quizId: string,
  answers: Record<string, string>,
  timeTakenSecs: number
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    // Fetch quiz questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz || !quiz.isPublished) {
      return { success: false, message: 'Quiz not found' };
    }

    // Verify attempt limit
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
    let isReattempt = false;

    if (attemptsCount === 1) {
      if (!permission) {
        return { success: false, message: 'You do not have permission to reattempt this quiz.' };
      }
      isReattempt = true;
    } else if (attemptsCount >= 2) {
      return { success: false, message: 'Attempt limit exceeded for this quiz.' };
    }

    // Grade attempt
    let totalCorrect = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer.toUpperCase() === q.correctAnswer.toUpperCase()) {
        totalCorrect++;
      }
    });

    const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // Create the QuizAttempt row inside a transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.quizAttempt.create({
        data: {
          userId: session.id,
          quizId,
          score,
          totalCorrect,
          totalQuestions,
          answers, // JSON field stores answers directly
          timeTakenSecs,
          isReattempt,
          completedAt: new Date(),
        },
      });

      // If this was a reattempt, consume the permission
      if (isReattempt) {
        await tx.reattemptPermission.delete({
          where: {
            userId_quizId: {
              userId: session.id,
              quizId,
            },
          },
        });
      }

      return newAttempt;
    });

    // Revalidate paths to update attempts listing and leaderboard
    revalidatePath('/dashboard');
    revalidatePath(`/leaderboard/${quizId}`);

    return {
      success: true,
      attemptId: attempt.id,
    };
  } catch (error) {
    console.error('Submit attempt action error:', error);
    return {
      success: false,
      message: 'Something went wrong while submitting your quiz. Please try again.',
    };
  }
}
