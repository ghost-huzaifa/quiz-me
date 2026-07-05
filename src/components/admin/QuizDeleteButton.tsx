'use client';

import { useState } from 'react';
import { deleteQuizAction } from '@/actions/quiz';

interface QuizDeleteButtonProps {
  quizId: string;
  quizTitle: string;
}

export default function QuizDeleteButton({ quizId, quizTitle }: QuizDeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteQuizAction(quizId);
    if (!res.success) {
      alert(res.message || 'Failed to delete quiz.');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors cursor-pointer"
        title="Delete Quiz"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-level-2 max-w-sm w-full p-6 border border-outline-variant/30 text-left">
            <h3 className="font-sans text-question-text text-on-surface font-bold mb-2">Delete Quiz?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Are you sure you want to delete the quiz "{quizTitle}"? This will permanently delete the quiz, all its questions, and all attempt history.
            </p>
            <div className="flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-bold bg-error text-white hover:bg-error/95 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
