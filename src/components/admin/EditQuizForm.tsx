'use client';

import { useState, useTransition, useActionState } from 'react';
import { updateQuizAction } from '@/actions/quiz';
import { addQuestionAction, updateQuestionAction, deleteQuestionAction } from '@/actions/question';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  order: number;
}

interface EditQuizFormProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    timeLimitMins: number;
    passingPercent: number;
    isPublished: boolean;
    randomize: boolean;
    questions: Question[];
  };
}

export default function EditQuizForm({ quiz }: EditQuizFormProps) {
  const [questions, setQuestions] = useState<Question[]>(
    [...quiz.questions].sort((a, b) => a.order - b.order)
  );

  const [activeTab, setActiveTab] = useState<'setup' | 'builder'>('builder');
  const [isPending, startTransition] = useTransition();
  const [quizState, quizFormAction, isQuizPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return updateQuizAction(quiz.id, prevState, formData);
    },
    null
  );

  // Add Question State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrect, setNewCorrect] = useState('A');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Edit Question State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptA, setEditOptA] = useState('');
  const [editOptB, setEditOptB] = useState('');
  const [editOptC, setEditOptC] = useState('');
  const [editOptD, setEditOptD] = useState('');
  const [editCorrect, setEditCorrect] = useState('A');

  // Handle Add Question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingQuestion) return;
    setIsAddingQuestion(true);

    const nextOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.order)) + 1 : 1;

    const res = await addQuestionAction(quiz.id, {
      text: newQuestionText,
      optionA: newOptA,
      optionB: newOptB,
      optionC: newOptC,
      optionD: newOptD,
      correctAnswer: newCorrect,
      order: nextOrder,
    });

    if (res.success && res.questionId) {
      const newQuestion: Question = {
        id: res.questionId,
        text: newQuestionText,
        optionA: newOptA,
        optionB: newOptB,
        optionC: newOptC,
        optionD: newOptD,
        correctAnswer: newCorrect,
        order: nextOrder,
      };
      setQuestions((prev) => [...prev, newQuestion].sort((a, b) => a.order - b.order));
      // Reset form
      setNewQuestionText('');
      setNewOptA('');
      setNewOptB('');
      setNewOptC('');
      setNewOptD('');
      setNewCorrect('A');
    } else {
      alert(res.message || 'Failed to add question.');
    }
    setIsAddingQuestion(false);
  };

  // Handle Edit Question
  const startEditing = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.text);
    setEditOptA(q.optionA);
    setEditOptB(q.optionB);
    setEditOptC(q.optionC);
    setEditOptD(q.optionD);
    setEditCorrect(q.correctAnswer);
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestionId) return;

    const target = questions.find((q) => q.id === editingQuestionId);
    if (!target) return;

    const res = await updateQuestionAction(editingQuestionId, {
      text: editQuestionText,
      optionA: editOptA,
      optionB: editOptB,
      optionC: editOptC,
      optionD: editOptD,
      correctAnswer: editCorrect,
      order: target.order,
    });

    if (res.success) {
      setQuestions((prev) =>
        prev
          .map((q) =>
            q.id === editingQuestionId
              ? {
                  ...q,
                  text: editQuestionText,
                  optionA: editOptA,
                  optionB: editOptB,
                  optionC: editOptC,
                  optionD: editOptD,
                  correctAnswer: editCorrect,
                }
              : q
          )
          .sort((a, b) => a.order - b.order)
      );
      setEditingQuestionId(null);
    } else {
      alert(res.message || 'Failed to update question.');
    }
  };

  // Handle Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const res = await deleteQuestionAction(questionId);
    if (res.success) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } else {
      alert(res.message || 'Failed to delete question.');
    }
  };

  // Reordering questions
  const moveQuestion = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const updated = [...questions];
    const temp = updated[idx];
    const other = updated[targetIdx];

    if (!temp || !other) return;

    // Swap local order values
    const tempOrder = temp.order;
    temp.order = other.order;
    other.order = tempOrder;

    // Swap elements in local array
    updated[idx] = other;
    updated[targetIdx] = temp;

    setQuestions(updated.sort((a, b) => a.order - b.order));

    // Update in database in background
    startTransition(async () => {
      await Promise.all([
        updateQuestionAction(temp.id, {
          text: temp.text,
          optionA: temp.optionA,
          optionB: temp.optionB,
          optionC: temp.optionC,
          optionD: temp.optionD,
          correctAnswer: temp.correctAnswer,
          order: temp.order,
        }),
        updateQuestionAction(other.id, {
          text: other.text,
          optionA: other.optionA,
          optionB: other.optionB,
          optionC: other.optionC,
          optionD: other.optionD,
          correctAnswer: other.correctAnswer,
          order: other.order,
        }),
      ]);
    });
  };

  return (
    <div className="flex-grow flex flex-col gap-6">
      {/* Header section */}
      <header className="mb-stack-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-6 w-full">
        <div>
          <Link 
            href="/admin/quizzes" 
            className="text-primary hover:underline text-sm font-bold flex items-center gap-1 mb-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs font-bold">arrow_back</span>
            Back to Quizzes
          </Link>
          <h1 className="font-sans text-headline-md text-on-surface font-bold">Edit Quiz: {quiz.title}</h1>
          <p className="font-sans text-body-base text-on-surface-variant mt-1 leading-snug">
            Configure metadata parameters and construct question lists.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab(activeTab === 'setup' ? 'builder' : 'setup')}
            className="px-6 py-2 rounded-full border border-outline text-on-surface font-sans text-body-base hover:bg-surface-container-high transition-colors font-bold cursor-pointer"
          >
            {activeTab === 'setup' ? 'Go to Question Builder' : 'Go to Setup'}
          </button>
        </div>
      </header>

      {/* Stepper Indicator */}
      <div className="flex items-center mb-stack-lg max-w-3xl mx-auto w-full select-none">
        <button
          type="button"
          onClick={() => setActiveTab('setup')}
          className="flex-1 border-b-2 relative text-left cursor-pointer focus:outline-none"
          style={{ borderBottomColor: activeTab === 'setup' ? 'var(--color-primary-container)' : 'var(--color-outline-variant)' }}
        >
          <div className={`absolute left-1/2 -translate-x-1/2 -top-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            activeTab === 'setup' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
          }`}>
            1
          </div>
          <div className={`absolute left-1/2 -translate-x-1/2 top-6 text-xs font-bold ${
            activeTab === 'setup' ? 'text-primary' : 'text-on-surface-variant'
          }`}>
            Setup
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => setActiveTab('builder')}
          className="flex-1 border-b-2 relative text-left cursor-pointer focus:outline-none"
          style={{ borderBottomColor: activeTab === 'builder' ? 'var(--color-primary-container)' : 'var(--color-outline-variant)' }}
        >
          <div className={`absolute left-1/2 -translate-x-1/2 -top-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            activeTab === 'builder' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
          }`}>
            2
          </div>
          <div className={`absolute left-1/2 -translate-x-1/2 top-6 text-xs font-bold ${
            activeTab === 'builder' ? 'text-primary' : 'text-on-surface-variant'
          }`}>
            Builder
          </div>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="mt-8">
        {activeTab === 'setup' ? (
          /* Step 1: Setup Details Form */
          <form action={quizFormAction} className="grid grid-cols-1 md:grid-cols-2 gap-column-gap">
            {quizState?.message && (
              <div className="col-span-2 bg-error-container text-on-error-container p-4 rounded-xl border border-error/20 font-bold text-sm mb-4">
                {quizState.message}
              </div>
            )}
            
            {/* Basic Info */}
            <div className="col-span-1 md:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-sm">
              <h3 className="font-sans text-body-base font-bold mb-6 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">title</span> Basic Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-2">Quiz Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={quiz.title}
                    disabled={isQuizPending}
                    className="w-full p-4 rounded-lg bg-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-body-base text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={quiz.description || ''}
                    disabled={isQuizPending}
                    className="w-full p-4 rounded-lg bg-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-body-base text-on-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Time limits & Scoring */}
            <div className="col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-sm">
              <h3 className="font-sans text-body-base font-bold mb-6 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">timer</span> Scoring &amp; Time
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-label-caps text-on-surface-variant font-bold">Time Limit (Minutes)</label>
                  <input
                    name="timeLimitMins"
                    type="number"
                    defaultValue={quiz.timeLimitMins}
                    min={1}
                    required
                    disabled={isQuizPending}
                    className="w-20 p-2 text-center rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none font-sans font-bold"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-label-caps text-on-surface-variant font-bold">Passing Score (%)</label>
                  <input
                    name="passingPercent"
                    type="number"
                    defaultValue={quiz.passingPercent}
                    min={1}
                    max={100}
                    required
                    disabled={isQuizPending}
                    className="w-20 p-2 text-center rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none font-sans font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-sm flex flex-col justify-between">
              <h3 className="font-sans text-body-base font-bold mb-6 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">settings</span> Additional Parameters
              </h3>
              <div className="space-y-4">
                <div className="pt-4 border-t border-surface-variant/20 flex justify-between items-center">
                  <label className="text-label-caps text-on-surface font-bold">Randomize Questions</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      name="randomize"
                      type="checkbox"
                      value="true"
                      defaultChecked={quiz.randomize}
                      disabled={isQuizPending}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-surface-variant/20 flex justify-between items-center">
                  <label className="text-label-caps text-on-surface font-bold">Published</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      name="isPublished"
                      type="checkbox"
                      value="true"
                      defaultChecked={quiz.isPublished}
                      disabled={isQuizPending}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end mt-6">
              <button
                type="submit"
                disabled={isQuizPending}
                className="px-8 py-3 rounded-lg bg-primary text-on-primary font-sans text-body-base font-bold shadow-level-1 hover:shadow-level-2 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isQuizPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Builder - Question list and builder interface */
          <div className="flex flex-col lg:flex-row gap-column-gap">
            
            {/* Left Box: Existing Questions Table */}
            <div className="flex-1 bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-sm h-fit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans text-question-text font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">list</span> Questions ({questions.length})
                </h3>
                {isPending && <span className="text-xs text-on-surface-variant animate-pulse">Saving order...</span>}
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  No questions built yet. Add your first question using the builder on the right!
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const isEditing = editingQuestionId === q.id;
                    return (
                      <div 
                        key={q.id}
                        className={`p-4 border rounded-xl flex items-start gap-4 transition-all duration-200 ${
                          isEditing ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/40 hover:bg-surface-container/20'
                        }`}
                      >
                        {/* Drag indicator / reordering arrows */}
                        <div className="flex flex-col items-center shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0 || isPending}
                            onClick={() => moveQuestion(idx, 'up')}
                            className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-20 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_upward</span>
                          </button>
                          <span className="text-xs font-bold text-on-surface-variant font-mono">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === questions.length - 1 || isPending}
                            onClick={() => moveQuestion(idx, 'down')}
                            className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-20 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                          </button>
                        </div>

                        {/* Question details */}
                        <div className="flex-grow min-w-0">
                          <p className="font-sans text-sm font-bold text-on-surface leading-tight">
                            {q.text}
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
                            <div>A: {q.optionA}</div>
                            <div>B: {q.optionB}</div>
                            <div>C: {q.optionC}</div>
                            <div>D: {q.optionD}</div>
                          </div>
                          <p className="text-xs font-bold text-tertiary mt-2">
                            Correct Answer: Option {q.correctAnswer}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditing(q)}
                            className="p-1.5 text-on-surface-variant hover:text-tertiary hover:bg-surface-container-high rounded cursor-pointer"
                            title="Edit Question"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded cursor-pointer"
                            title="Delete Question"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Box: Question Creator Form */}
            <div className="w-full lg:w-96 bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-sm shrink-0">
              <h3 className="font-sans text-body-base font-bold mb-6 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {editingQuestionId ? 'edit_square' : 'add_box'}
                </span>
                {editingQuestionId ? 'Edit Question' : 'Add Question'}
              </h3>

              <form onSubmit={editingQuestionId ? handleUpdateQuestion : handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1 font-bold">
                    Question Text
                  </label>
                  <textarea
                    value={editingQuestionId ? editQuestionText : newQuestionText}
                    onChange={(e) => editingQuestionId ? setEditQuestionText(e.target.value) : setNewQuestionText(e.target.value)}
                    required
                    placeholder="e.g. Which language runs in a web browser?"
                    rows={2}
                    className="w-full p-3 rounded-lg bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-sans text-sm text-on-surface"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-label-caps text-on-surface-variant mb-1 font-bold">
                    Options &amp; Distractors
                  </label>
                  {[
                    { key: 'A', value: editingQuestionId ? editOptA : newOptA, setter: editingQuestionId ? setEditOptA : setNewOptA },
                    { key: 'B', value: editingQuestionId ? editOptB : newOptB, setter: editingQuestionId ? setEditOptB : setNewOptB },
                    { key: 'C', value: editingQuestionId ? editOptC : newOptC, setter: editingQuestionId ? setEditOptC : setNewOptC },
                    { key: 'D', value: editingQuestionId ? editOptD : newOptD, setter: editingQuestionId ? setEditOptD : setNewOptD },
                  ].map(({ key, value, setter }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="font-bold text-xs text-on-surface-variant w-4">{key}:</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        required
                        placeholder={`Option ${key}`}
                        className="flex-1 p-2 rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none font-sans text-xs text-on-surface"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1 font-bold">
                    Correct Answer
                  </label>
                  <select
                    value={editingQuestionId ? editCorrect : newCorrect}
                    onChange={(e) => editingQuestionId ? setEditCorrect(e.target.value) : setNewCorrect(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant focus:border-primary focus:outline-none font-sans text-xs text-on-surface cursor-pointer"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={() => setEditingQuestionId(null)}
                      className="flex-1 py-2.5 rounded-lg border border-outline text-on-surface font-sans text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isAddingQuestion}
                    className="flex-grow py-2.5 bg-primary hover:bg-primary-dark text-on-primary font-sans text-xs font-bold rounded-lg shadow transition-all cursor-pointer disabled:opacity-50 text-center flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {editingQuestionId ? 'save' : 'add'}
                    </span>
                    {editingQuestionId ? 'Save Question' : 'Add to Quiz'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
