import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { TasksList } from './components/TasksList';
import { LeaderboardView } from './components/LeaderboardView';
import { physicsService } from './lib/supabase';
import { LeaderboardEntry, PhysicsTask, StudentProfile, SubmissionResponse } from './types/physics';

export default function App() {
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard'>('tasks');
  const [tasks, setTasks] = useState<(PhysicsTask & { isSolved: boolean; awardedPoints?: number })[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize and check current session
  useEffect(() => {
    async function initAuth() {
      try {
        const user = await physicsService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error initializing user:', err);
      } finally {
        setIsLoadingUser(false);
      }
    }
    initAuth();
  }, []);

  // When user is logged in, load tasks and leaderboard
  useEffect(() => {
    if (currentUser) {
      loadAppData(currentUser.id);
    }
  }, [currentUser]);

  const loadAppData = async (userId: string) => {
    setIsLoadingData(true);
    try {
      const [loadedTasks, loadedLeaderboard] = await Promise.all([
        physicsService.getTasksWithStatus(userId),
        physicsService.getLeaderboard(userId),
      ]);
      setTasks(loadedTasks);
      setLeaderboard(loadedLeaderboard);
    } catch (err) {
      console.error('Error loading app data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (email: string, password?: string) => {
    const res = await physicsService.signIn(email, password);
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const handleRegister = async (fullName: string, email: string, password?: string) => {
    const res = await physicsService.signUp(fullName, email, password);
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const handleLogout = async () => {
    await physicsService.signOut();
    setCurrentUser(null);
    setTasks([]);
    setLeaderboard([]);
  };

  const handleSolveTask = async (taskId: string, optionIndex: number): Promise<SubmissionResponse> => {
    if (!currentUser) {
      return {
        success: false,
        is_correct: false,
        points_awarded: 0,
        new_total_score: 0,
        message: 'Kérjük, jelentkezz be a válasz beküldéséhez!',
      };
    }

    setIsSubmitting(true);
    try {
      const result = await physicsService.submitAnswer(currentUser.id, taskId, optionIndex);

      if (result.is_correct) {
        // Update current user state with the securely returned score
        setCurrentUser((prev) => (prev ? { ...prev, score: result.new_total_score } : null));

        // Update task solved status in state
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, isSolved: true, awardedPoints: t.points }
              : t
          )
        );

        // Refresh the leaderboard to reflect updated scores and ranks
        const updatedLeaderboard = await physicsService.getLeaderboard(currentUser.id);
        setLeaderboard(updatedLeaderboard);
      }

      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshLeaderboard = async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      const updated = await physicsService.getLeaderboard(currentUser.id);
      setLeaderboard(updated);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Fizika Kihívás betöltése...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const solvedCount = tasks.filter((t) => t.isSolved).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        solvedCount={solvedCount}
        totalTasks={tasks.length || 3}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tasks' ? (
          <TasksList
            tasks={tasks}
            onSolveTask={handleSolveTask}
            isSubmitting={isSubmitting}
            userScore={currentUser.score}
          />
        ) : (
          <LeaderboardView
            entries={leaderboard}
            currentUserId={currentUser.id}
            onRefresh={handleRefreshLeaderboard}
            isLoading={isLoadingData}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Fizika Kihívás &copy; {new Date().getFullYear()} — Oktatási Fizika Platform</span>
          <span className="text-slate-700">
            Adatbázis & Auth: <strong className="text-slate-800">Supabase</strong> • Pontszámítás: <strong className="text-slate-800">Szerver-oldali PostgreSQL RPC</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
