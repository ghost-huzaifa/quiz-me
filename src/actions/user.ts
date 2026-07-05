'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['USER', 'ADMIN']),
});

export async function addUserAction(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'USER' | 'ADMIN';

    const result = userCreateSchema.safeParse({ name, email, password, role });
    if (!result.success) {
      return { success: false, errors: result.error.flatten().fieldErrors };
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: 'Email address already in use.' };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
      },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Add user action error:', error);
    return { success: false, message: 'Failed to create user.' };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    // Prevent self-deletion
    if (session.id === userId) {
      return { success: false, message: 'You cannot delete yourself.' };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Delete user action error:', error);
    return { success: false, message: 'Failed to delete user.' };
  }
}

export async function toggleUserRoleAction(userId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    if (session.id === userId) {
      return { success: false, message: 'You cannot toggle your own role.' };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return { success: false, message: 'User not found.' };
    }

    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Toggle role action error:', error);
    return { success: false, message: 'Failed to toggle user role.' };
  }
}

export async function grantReattemptAction(userId: string, quizId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    await prisma.reattemptPermission.upsert({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
      create: {
        userId,
        quizId,
      },
      update: {}, // do nothing if already exists
    });

    revalidatePath('/admin/users');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Grant reattempt action error:', error);
    return { success: false, message: 'Failed to grant reattempt permission.' };
  }
}
