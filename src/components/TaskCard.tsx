import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { PhysicsTask, SubmissionResponse } from '../types/physics';
import { PhysicsDiagram } from './PhysicsDiagram';

interface TaskCardProps {
  task: PhysicsTask & { isSolved: boolean; awardedPoints?: number };
  index: number;
  onSolve: (taskId: string, selectedIndex: number) => Promise<SubmissionResponse>;
  isSubmitting: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onSolve,
  isSubmitting,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    explanation?: string;
  }>({
    status: task.isSolved ? 'success' : 'idle',
    message: task.isSolved ? 'Ezt a feladatot már sikeresen megoldottad!' : '',
    explanation: task.isSolved ? task.explanation : undefined,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === null || loading || isSubmitting) return;

    setLoading(true);
    try {
      const result = await onSolve(task.id, selectedOption);

      if (result.is_correct) {
        // Trigger celebratory confetti if points were awarded or solved
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.65 },
            colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
          });
        } catch {
          // confetti fallback safe
        }

        setFeedback({
          status: 'success',
          message: result.message,
          explanation: result.explanation || task.explanation,
        });
      } else {
        setFeedback({
          status: 'error',
          message: result.message,
        });
      }
    } catch (err: any) {
      setFeedback({
        status: 'error',
        message: 'Hiba történt a válasz érvényesítése közben. Próbáld újra!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetTry = () => {
    setSelectedOption(null);
    setFeedback({ status: 'idle', message: '' });
  };

  return (
    <article
      id={`physics-task-card-${task.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        task.isSolved
          ? 'border-emerald-200 shadow-sm shadow-emerald-500/5'
          : 'border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Header section */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center border border-blue-200">
            {index + 1}.
          </span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {task.category}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {task.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {task.isSolved ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Megoldva (+{task.points} pont)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{task.points} pont érhető el</span>
            </span>
          )}
        </div>
      </div>

      {/* Body content */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Problem Description */}
        <div className="text-slate-800 text-sm sm:text-base leading-relaxed">
          {task.description}
        </div>

        {/* Physics formula hint if available */}
        {task.formula_hint && (
          <div className="flex items-start space-x-2.5 bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-blue-900">
            <BookOpen className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-blue-950 mr-1.5">Képlet segédlet:</span>
              <code className="font-mono bg-white/80 px-2 py-0.5 rounded border border-blue-300 font-semibold text-blue-900">
                {task.formula_hint}
              </code>
            </div>
          </div>
        )}

        {/* Visual Physics Diagram / Plot */}
        <PhysicsDiagram taskId={task.id} />

        {/* Multiple Choice Options */}
        <div className="space-y-2.5 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Válaszd ki a helyes eredményt:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {task.options.map((optionText, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isSolvedAndOption = task.isSolved;

              return (
                <button
                  key={optIdx}
                  type="button"
                  id={`task-${task.id}-option-${optIdx}`}
                  disabled={task.isSolved || loading}
                  onClick={() => {
                    setSelectedOption(optIdx);
                    if (feedback.status === 'error') {
                      setFeedback({ status: 'idle', message: '' });
                    }
                  }}
                  className={`relative flex items-center p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  } ${
                    task.isSolved ? 'cursor-default opacity-85' : 'cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 shrink-0 text-xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white font-bold'
                        : 'border-slate-300 text-slate-500'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="flex-1 select-none font-mono text-xs sm:text-sm text-slate-900">
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback.status === 'error' && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3 text-rose-900 animate-in fade-in duration-150">
            <div className="flex items-start space-x-2.5">
              <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-950">Nem helyes megoldás</h4>
                <p className="text-xs sm:text-sm text-rose-800 mt-0.5">{feedback.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetTry}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center space-x-1 shrink-0 bg-rose-100 hover:bg-rose-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Újrapróbálkozás</span>
            </button>
          </div>
        )}

        {/* Success / Solved Explanation */}
        {(feedback.status === 'success' || task.isSolved) && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 sm:p-5 text-emerald-950 animate-in fade-in duration-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {task.isSolved ? 'Feladat sikeresen teljesítve!' : feedback.message}
              </span>
            </div>
            {(feedback.explanation || task.explanation) && (
              <div className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed bg-white/70 p-3.5 rounded-lg border border-emerald-200/70">
                <span className="font-semibold text-emerald-950 block mb-1">
                  Hivatalos fizikai levezetés:
                </span>
                {feedback.explanation || task.explanation}
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        {!task.isSolved && (
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              id={`submit-task-btn-${task.id}`}
              disabled={selectedOption === null || loading || isSubmitting}
              onClick={handleSubmit}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
                selectedOption !== null && !loading && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-blue-500/20'
                  : 'bg-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Pontszámítás Supabase-en...</span>
                </>
              ) : (
                <>
                  <span>Válasz beküldése és ellenőrzés</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
