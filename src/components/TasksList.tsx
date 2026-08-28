import React from 'react';
import { Award, CheckCircle, Sparkles, Target, Zap } from 'lucide-react';
import { PhysicsTask, SubmissionResponse } from '../types/physics';
import { TaskCard } from './TaskCard';

interface TasksListProps {
  tasks: (PhysicsTask & { isSolved: boolean; awardedPoints?: number })[];
  onSolveTask: (taskId: string, optionIndex: number) => Promise<SubmissionResponse>;
  isSubmitting: boolean;
  userScore: number;
}

export const TasksList: React.FC<TasksListProps> = ({
  tasks,
  onSolveTask,
  isSubmitting,
  userScore,
}) => {
  const solvedCount = tasks.filter((t) => t.isSolved).length;
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const earnedPoints = tasks
    .filter((t) => t.isSolved)
    .reduce((sum, t) => sum + (t.awardedPoints || t.points), 0);

  const progressPercentage = Math.round((solvedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner / Progress overview */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>3 Kiemelt Fizika Feladat</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Oldd meg a feladatokat és gyűjts pontokat!
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Minden helyes megoldásért közvetlenül a Supabase adatbázisban kerülnek jóváírásra a pontjaid.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider block">
                Saját Haladás
              </span>
              <span className="text-xl font-extrabold text-white">
                {solvedCount} / {tasks.length} kész
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex flex-col items-center justify-center font-bold shadow-sm">
              <span className="text-xs leading-none">+{earnedPoints}</span>
              <span className="text-[9px] uppercase font-bold tracking-tighter">pont</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-blue-200 font-medium">
            <span>Kihívás teljesítve: {progressPercentage}%</span>
            <span>{totalPoints} maximális pontszám</span>
          </div>
          <div className="w-full h-2.5 bg-blue-950/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge Cards list */}
      <div className="space-y-6">
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            index={idx}
            onSolve={onSolveTask}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>
    </div>
  );
};
