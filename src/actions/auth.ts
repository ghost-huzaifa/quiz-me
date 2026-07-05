'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie, deleteSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const isPasswordCorrect = await verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);

    // Return redirection info rather than throwing redirect() inside try-catch.
    // (Next.js redirect() throws a special error which shouldn't be caught by generic catch blocks)
    return {
      success: true,
      redirectTo: user.role === 'ADMIN' ? '/admin' : '/dashboard',
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
}

export async function logoutAction() {
  await deleteSessionCookie();
  redirect('/login');
}
