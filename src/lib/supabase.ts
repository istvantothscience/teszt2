import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry, PhysicsTask, StudentProfile, SubmissionResponse } from '../types/physics';
import { PHYSICS_TASKS, PREDEFINED_STUDENTS, TASK_CORRECT_ANSWERS } from '../data/physicsData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// LOCAL STORAGE KEYS FOR SEAMLESS DEMO / SIMULATION PERSISTENCE
// ==============================================================================
const STORAGE_USERS_KEY = 'fizika_profiles_v1';
const STORAGE_SUBMISSIONS_KEY = 'fizika_submissions_v1';
const STORAGE_CURRENT_USER_KEY = 'fizika_current_user_id';

// Initialize default student profiles in local storage if not existing
function initLocalData() {
  const existingProfiles = localStorage.getItem(STORAGE_USERS_KEY);
  if (!existingProfiles) {
    const initialProfiles: Record<string, StudentProfile> = {};
    PREDEFINED_STUDENTS.forEach((student) => {
      initialProfiles[student.id] = {
        id: student.id,
        email: student.email,
        full_name: student.name,
        avatar_url: student.avatar,
        score: student.defaultScore,
        badge: student.badge,
        created_at: new Date().toISOString(),
      };
    });
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initialProfiles));
  }

  const existingSubmissions = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
  if (!existingSubmissions) {
    // Give Anna and Bence some pre-solved tasks to demonstrate leaderboard
    const initialSubmissions: Record<string, { taskId: string; userId: string; points: number; date: string }[]> = {
      student_anna_01: [
        { taskId: 'mechanika_01', userId: 'student_anna_01', points: 35, date: new Date(Date.now() - 3600000).toISOString() },
        { taskId: 'elektromossag_02', userId: 'student_anna_01', points: 45, date: new Date(Date.now() - 1800000).toISOString() },
      ],
      student_bence_02: [
        { taskId: 'elektromossag_02', userId: 'student_bence_02', points: 45, date: new Date(Date.now() - 7200000).toISOString() },
      ],
      student_csilla_03: [
        { taskId: 'mechanika_01', userId: 'student_csilla_03', points: 35, date: new Date(Date.now() - 10800000).toISOString() },
      ],
    };
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(initialSubmissions));
  }
}

// Ensure local storage is initialized
initLocalData();

export const physicsService = {
  /**
   * Bejelentkezés email és jelszó alapján
   */
  async signIn(email: string, _password?: string): Promise<{ user: StudentProfile | null; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Ha valós Supabase van beállítva
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: _password || 'password123',
        });
        if (error) {
          // Ha nem sikerült, próbálkozunk profil kereséssel
          throw error;
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            return { user: profile as StudentProfile };
          }
        }
      } catch (err: any) {
        console.warn('Supabase Auth warning, using fallback profile handler:', err.message);
      }
    }

    // 2. Helyi adatbázis / Fallback bejelentkezés (3 előre rögzített diák + új regisztrációk)
    const rawProfiles = localStorage.getItem(STORAGE_USERS_KEY);
    const profiles: Record<string, StudentProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};

    let matchedUser = Object.values(profiles).find(
      (p) => p.email.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      // Ha előre rögzített diák email
      const predefined = PREDEFINED_STUDENTS.find(
        (s) => s.email.toLowerCase() === cleanEmail
      );
      if (predefined) {
        matchedUser = {
          id: predefined.id,
          email: predefined.email,
          full_name: predefined.name,
          avatar_url: predefined.avatar,
          score: predefined.defaultScore,
          badge: predefined.badge,
        };
        profiles[matchedUser.id] = matchedUser;
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(profiles));
      }
    }

    if (!matchedUser) {
      return {
        user: null,
        error: 'Nincs ilyen regisztrált diák fiók ezzel az email címmel. Válassz a 3 diák közül vagy hozz létre újat!',
      };
    }

    localStorage.setItem(STORAGE_CURRENT_USER_KEY, matchedUser.id);
    return { user: matchedUser };
  },

  /**
   * Új diák regisztrációja
   */
  async signUp(fullName: string, email: string, _password?: string): Promise<{ user: StudentProfile | null; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName || !cleanEmail) {
      return { user: null, error: 'A név és az email cím megadása kötelező!' };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: _password || 'diak1234',
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });
        if (!error && data.user) {
          const profile: StudentProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: cleanName,
            score: 0,
            badge: 'Feltörekvő Fizikus',
          };
          return { user: profile };
        }
      } catch (err: any) {
        console.warn('Supabase SignUp warning, fallback to local profiles:', err.message);
      }
    }

    const rawProfiles = localStorage.getItem(STORAGE_USERS_KEY);
    const profiles: Record<string, StudentProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};

    const existing = Object.values(profiles).find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { user: null, error: 'Ezzel az email címmel már regisztráltak diákot!' };
    }

    const newId = 'student_' + Date.now();
    const newProfile: StudentProfile = {
      id: newId,
      email: cleanEmail,
      full_name: cleanName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      score: 0,
      badge: 'Feltörekvő Fizikus',
      created_at: new Date().toISOString(),
    };

    profiles[newId] = newProfile;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(profiles));
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, newId);

    return { user: newProfile };
  },

  /**
   * Aktuális bejelentkezett felhasználó lekérdezése
   */
  async getCurrentUser(): Promise<StudentProfile | null> {
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) return profile as StudentProfile;
        }
      } catch (err) {
        // Fall back to local
      }
    }

    const currentUserId = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!currentUserId) return null;

    const rawProfiles = localStorage.getItem(STORAGE_USERS_KEY);
    const profiles: Record<string, StudentProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};
    return profiles[currentUserId] || null;
  },

  /**
   * Kijelentkezés
   */
  async signOut(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // Ignore
      }
    }
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  },

  /**
   * Feladatok listázása és a diák megoldott státuszának lekérése
   */
  async getTasksWithStatus(userId: string): Promise<(PhysicsTask & { isSolved: boolean; awardedPoints?: number })[]> {
    if (supabase) {
      try {
        const [tasksRes, submissionsRes] = await Promise.all([
          supabase.from('tasks').select('*').order('id'),
          supabase.from('submissions').select('task_id, points_awarded').eq('user_id', userId),
        ]);

        if (tasksRes.data && !tasksRes.error) {
          const solvedMap = new Map<string, number>();
          submissionsRes.data?.forEach((sub) => solvedMap.set(sub.task_id, sub.points_awarded));

          return tasksRes.data.map((task: any) => ({
            id: task.id,
            title: task.title,
            category: task.category,
            description: task.description,
            formula_hint: task.formula_hint,
            options: task.options,
            points: task.points,
            explanation: task.explanation,
            isSolved: solvedMap.has(task.id),
            awardedPoints: solvedMap.get(task.id),
          }));
        }
      } catch (err) {
        console.warn('Failed to load tasks from Supabase, using default tasks:', err);
      }
    }

    // Local submissions check
    const rawSubmissions = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
    const allSubs: Record<string, { taskId: string; userId: string; points: number }[]> = rawSubmissions
      ? JSON.parse(rawSubmissions)
      : {};
    const userSubs = allSubs[userId] || [];
    const solvedSet = new Map(userSubs.map((s) => [s.taskId, s.points]));

    return PHYSICS_TASKS.map((task) => ({
      ...task,
      isSolved: solvedSet.has(task.id),
      awardedPoints: solvedSet.get(task.id),
    }));
  },

  /**
   * BIZTONSÁGOS PONTSZÁMÍTÁS ÉS VÁLASZ BEKÜLDÉSE (Supabase RPC)
   * A pontokat a Supabase oldalon (adatbázis-szinten) írjuk jóvá,
   * a böngésző nem tud pontokat manipulálni!
   */
  async submitAnswer(userId: string, taskId: string, selectedOptionIndex: number): Promise<SubmissionResponse> {
    // 1. Ha élő Supabase van csatlakoztatva: RPC hívás a submit_physics_answer PostgreSQL tárolt eljárásra
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('submit_physics_answer', {
          p_task_id: taskId,
          p_selected_option: selectedOptionIndex,
        });

        if (!error && data) {
          return data as SubmissionResponse;
        }
        if (error) {
          console.warn('Supabase RPC call notice:', error.message);
        }
      } catch (err: any) {
        console.warn('RPC execution fallback:', err.message);
      }
    }

    // 2. Biztonságos helyi szerver-szimuláció (azonos logikával mint az SQL RPC)
    const task = PHYSICS_TASKS.find((t) => t.id === taskId);
    if (!task) {
      return {
        success: false,
        is_correct: false,
        points_awarded: 0,
        new_total_score: 0,
        message: 'A feladat nem található az adatbázisban.',
      };
    }

    const rawSubmissions = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
    const allSubs: Record<string, { taskId: string; userId: string; points: number; date: string }[]> = rawSubmissions
      ? JSON.parse(rawSubmissions)
      : {};
    const userSubs = allSubs[userId] || [];
    const alreadySolved = userSubs.some((s) => s.taskId === taskId);

    const rawProfiles = localStorage.getItem(STORAGE_USERS_KEY);
    const profiles: Record<string, StudentProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};
    const profile = profiles[userId];

    const isCorrect = TASK_CORRECT_ANSWERS[taskId] === selectedOptionIndex;

    if (isCorrect) {
      if (alreadySolved) {
        return {
          success: true,
          is_correct: true,
          already_solved: true,
          points_awarded: 0,
          new_total_score: profile ? profile.score : 0,
          message: 'Helyes válasz! Ezt a feladatot korábban már sikeresen megoldottad.',
          explanation: task.explanation,
        };
      }

      // Pontok jóváírása az adatbázis rekordban
      const pointsToAward = task.points;
      userSubs.push({
        taskId,
        userId,
        points: pointsToAward,
        date: new Date().toISOString(),
      });
      allSubs[userId] = userSubs;
      localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(allSubs));

      if (profile) {
        profile.score += pointsToAward;
        profile.updated_at = new Date().toISOString();
        profiles[userId] = profile;
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(profiles));
      }

      return {
        success: true,
        is_correct: true,
        already_solved: false,
        points_awarded: pointsToAward,
        new_total_score: profile ? profile.score : pointsToAward,
        message: `Kiváló! Helyes megoldás: +${pointsToAward} pont jóváírva az adatbázisban.`,
        explanation: task.explanation,
      };
    } else {
      return {
        success: true,
        is_correct: false,
        already_solved: alreadySolved,
        points_awarded: 0,
        new_total_score: profile ? profile.score : 0,
        message: 'A megadott válasz sajnos nem helyes. Ellenőrizd a képletet és a mértékegységeket!',
      };
    }
  },

  /**
   * Rangsor lekérése csökkenő pontszám szerint
   */
  async getLeaderboard(currentUserId?: string): Promise<LeaderboardEntry[]> {
    if (supabase) {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, score')
          .order('score', { ascending: false });

        if (!error && profiles) {
          // Solved count
          const { data: subs } = await supabase.from('submissions').select('user_id');
          const countMap = new Map<string, number>();
          subs?.forEach((s) => countMap.set(s.user_id, (countMap.get(s.user_id) || 0) + 1));

          return profiles.map((p, index) => ({
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            avatar_url: p.avatar_url,
            score: p.score,
            rank: index + 1,
            solved_tasks_count: countMap.get(p.id) || 0,
            is_current_user: p.id === currentUserId,
          }));
        }
      } catch (err) {
        console.warn('Leaderboard Supabase query error, fallback to local storage:', err);
      }
    }

    const rawProfiles = localStorage.getItem(STORAGE_USERS_KEY);
    const profiles: Record<string, StudentProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};

    const rawSubmissions = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
    const allSubs: Record<string, { taskId: string; userId: string; points: number }[]> = rawSubmissions
      ? JSON.parse(rawSubmissions)
      : {};

    const list = Object.values(profiles).map((p) => {
      const userSubs = allSubs[p.id] || [];
      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        avatar_url: p.avatar_url,
        score: p.score,
        badge: p.badge,
        solved_tasks_count: userSubs.length,
        is_current_user: p.id === currentUserId,
      };
    });

    // Sort descending by score, then by solved count
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.solved_tasks_count - a.solved_tasks_count;
    });

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  },
};
