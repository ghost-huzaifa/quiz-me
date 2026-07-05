import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuizMe - Take Quizzes and View Leaderboards',
  description: 'A high-fidelity quiz-taking and management platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col font-sans bg-background text-on-background">
        {children}
      </body>
    </html>
  );
}
