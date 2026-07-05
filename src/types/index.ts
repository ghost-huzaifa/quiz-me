export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface QuizAttemptWithDetails {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  timeTakenSecs: number;
  completedAt: Date;
  isReattempt: boolean;
  quiz: {
    title: string;
    passingPercent: number;
  };
  user: {
    name: string;
    email: string;
  };
}
