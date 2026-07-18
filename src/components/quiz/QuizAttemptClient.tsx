'use client';

import { useState, useRef, useEffect } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { submitAttemptAction } from '@/actions/attempt';
import { useRouter } from 'next/navigation';

import ImageZoom from '@/components/ui/ImageZoom';

interface ClientQuestion {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  order: number;
  imageUrl: string | null;
  optionAImageUrl: string | null;
  optionBImageUrl: string | null;
  optionCImageUrl: string | null;
  optionDImageUrl: string | null;
}

interface QuizAttemptClientProps {
  quiz: {
    id: string;
    title: string;
    timeLimitMins: number;
  };
  questions: ClientQuestion[];
}

export default function QuizAttemptClient({ quiz, questions }: QuizAttemptClientProps) {
  const router = useRouter();
  const startTimeRef = useRef<number>(Date.now());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx];

  // Calculate stats
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Auto-submit on timer expiry
  const handleTimeUp = async () => {
    // If already submitting, do nothing
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const timeTakenSecs = quiz.timeLimitMins * 60;
    const res = await submitAttemptAction(quiz.id, answers, timeTakenSecs);
    
    if (res.success && res.attemptId) {
      router.push(`/quiz/${quiz.id}/result?attemptId=${res.attemptId}`);
    } else {
      setErrorMessage(res.message || 'Submission failed.');
      setIsSubmitting(false);
    }
  };

  const { display, secondsLeft } = useCountdown(quiz.timeLimitMins * 60, handleTimeUp);

  const handleSelectOption = (option: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const elapsedSecs = Math.round((Date.now() - startTimeRef.current) / 1000);
    const timeTakenSecs = Math.min(elapsedSecs, quiz.timeLimitMins * 60);

    const res = await submitAttemptAction(quiz.id, answers, timeTakenSecs);
    
    if (res.success && res.attemptId) {
      router.push(`/quiz/${quiz.id}/result?attemptId=${res.attemptId}`);
    } else {
      setErrorMessage(res.message || 'Submission failed.');
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <header className="bg-surface-container-lowest w-full px-margin-mobile md:px-margin-desktop py-4 shadow-sm flex justify-between items-center z-30 sticky top-0 border-b border-outline-variant/30">
        <div className="font-sans text-headline-md-mobile md:text-headline-md font-black text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            quiz
          </span>
          QuizMe
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full font-sans text-mono-timer font-bold select-none ${
            secondsLeft <= 30 ? 'text-error animate-pulse bg-error-container' : 'text-primary'
          }`}>
            <span className="material-symbols-outlined">timer</span>
            <span>{display}</span>
          </div>
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="font-sans text-label-caps text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            <span className="hidden sm:inline">EXIT QUIZ</span>
          </button>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col md:flex-row gap-column-gap">
        {errorMessage && (
          <div className="w-full bg-error-container text-on-error-container p-4 rounded-xl mb-4 font-bold border border-error/20">
            {errorMessage}
          </div>
        )}

        {currentQuestion ? (
          <>
            {/* Left Panel: Question Area */}
            <section className="w-full md:w-3/4 flex flex-col justify-between gap-stack-lg min-h-[50vh]">
              <div>
                {/* Question Header */}
                <div className="flex flex-col gap-stack-sm mb-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-surface-variant text-on-surface-variant text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      Question {currentIdx + 1} of {totalQuestions}
                    </span>
                    <span className="bg-surface-variant text-on-surface-variant text-label-caps px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      {quiz.title}
                    </span>
                  </div>
                  <h1 className="font-sans text-question-text text-on-surface mt-4 font-bold leading-snug">
                    {currentQuestion.text}
                  </h1>
                  {/* Question image */}
                  {currentQuestion.imageUrl && (
                    <div className="mt-4">
                      <ImageZoom
                        src={currentQuestion.imageUrl}
                        alt="Question illustration"
                        className="max-w-full max-h-72 rounded-xl border border-outline-variant/30 shadow-level-1 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Options list */}
                <div className="flex flex-col gap-stack-md">
                  {[
                    { key: 'A', text: currentQuestion.optionA, imageUrl: currentQuestion.optionAImageUrl },
                    { key: 'B', text: currentQuestion.optionB, imageUrl: currentQuestion.optionBImageUrl },
                    { key: 'C', text: currentQuestion.optionC, imageUrl: currentQuestion.optionCImageUrl },
                    { key: 'D', text: currentQuestion.optionD, imageUrl: currentQuestion.optionDImageUrl },
                  ].map(({ key, text, imageUrl }) => {
                    const isSelected = answers[currentQuestion.id] === key;
                    return (
                      <label 
                        key={key} 
                        onClick={() => handleSelectOption(key)}
                        className="cursor-pointer block relative select-none"
                      >
                        <div className={`bg-surface-container-lowest border-2 rounded-xl p-6 transition-all duration-200 shadow-level-1 hover:shadow-level-2 flex items-center gap-4 ${
                          isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-surface-variant hover:border-primary'
                        }`}>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors shrink-0 ${
                            isSelected ? 'border-primary bg-primary text-on-primary' : 'border-surface-variant text-on-surface-variant'
                          }`}>
                            {key}
                          </div>
                          <div className="flex-grow">
                            <span className="font-sans text-body-base text-on-surface font-medium">
                              {text}
                            </span>
                            {imageUrl && (
                              <ImageZoom
                                src={imageUrl}
                                alt={`Option ${key}`}
                                className="mt-2 max-w-full max-h-40 rounded-lg border border-outline-variant/30 object-contain"
                              />
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between mt-8 gap-4 border-t border-outline-variant/30 pt-6">
                <button 
                  onClick={handleSkip}
                  className="px-6 py-3 rounded-lg font-sans text-label-caps text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-2 font-bold cursor-pointer"
                >
                  Skip
                </button>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="px-6 py-3 rounded-lg font-sans text-label-caps border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-2 font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>

                  {currentIdx === totalQuestions - 1 ? (
                    <button 
                      onClick={() => setShowSubmitConfirm(true)}
                      className="px-8 py-3 rounded-lg font-sans text-label-caps bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-md flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">done</span>
                      Submit Quiz
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext}
                      className="px-8 py-3 rounded-lg font-sans text-label-caps bg-primary text-on-primary hover:bg-primary-dark transition-colors shadow-md flex items-center gap-2 font-bold cursor-pointer"
                    >
                      Next
                      <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Right Panel: Navigation Grid */}
            <aside className="w-full md:w-1/4 flex flex-col gap-stack-lg shrink-0">
              {/* Stats Card */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-outline-variant/30">
                <h3 className="font-sans text-label-caps text-on-surface-variant uppercase tracking-wider mb-4 font-bold">
                  Quiz Progress
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface font-medium">Attempted</span>
                    <span className="font-bold text-tertiary">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface font-medium">Unattempted</span>
                    <span className="font-bold text-on-surface-variant">{unansweredCount}</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-surface-variant h-2.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Navigator Grid */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sans text-label-caps text-on-surface-variant uppercase tracking-wider font-bold">
                    Navigator
                  </h3>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">grid_view</span>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentIdx;
                    
                    let buttonClass = '';
                    if (isCurrent) {
                      buttonClass = 'bg-secondary-container text-on-secondary-container border-2 border-secondary shadow-md ring-2 ring-secondary/30';
                    } else if (isAnswered) {
                      buttonClass = 'bg-tertiary text-on-primary';
                    } else {
                      buttonClass = 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`aspect-square rounded-md flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-pointer ${buttonClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-outline-variant/20 pt-4">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <div className="w-3 h-3 rounded-sm bg-tertiary"></div> Answered
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <div className="w-3 h-3 rounded-sm bg-secondary-container border border-secondary"></div> Current
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <div className="w-3 h-3 rounded-sm bg-surface border border-outline-variant"></div> Unanswered
                  </div>
                </div>

                <button 
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full mt-6 bg-[#10B981] hover:bg-[#059669] text-white font-sans text-xs py-3 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xs">done</span>
                  Submit Quiz
                </button>
              </div>
            </aside>
          </>
        ) : (
          <div className="w-full text-center p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-level-1">
            No questions in this quiz.
          </div>
        )}
      </main>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-level-2 max-w-sm w-full p-6 border border-outline-variant/30">
            <h3 className="font-sans text-question-text text-on-surface font-bold mb-2">Exit Quiz?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Are you sure you want to exit? Your progress will not be saved and you will lose this attempt.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-bold bg-error text-white hover:bg-error/90 rounded-lg cursor-pointer"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-level-2 max-w-sm w-full p-6 border border-outline-variant/30">
            <h3 className="font-sans text-question-text text-on-surface font-bold mb-2">Submit Quiz?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              You have answered {answeredCount} of {totalQuestions} questions. Are you sure you want to submit your answers?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container rounded-lg cursor-pointer"
              >
                No, Keep Editing
              </button>
              <button 
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-bold bg-[#10B981] hover:bg-[#059669] text-white rounded-lg cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
