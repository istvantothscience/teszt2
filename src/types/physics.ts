export interface StudentProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  score: number;
  badge?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PhysicsTask {
  id: string;
  title: string;
  category: string;
  description: string;
  formula_hint?: string;
  options: string[];
  points: number;
  explanation: string;
}

export interface SubmissionResponse {
  success: boolean;
  is_correct: boolean;
  already_solved?: boolean;
  points_awarded: number;
  new_total_score: number;
  message: string;
  explanation?: string;
}

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  score: number;
  rank: number;
  badge?: string;
  solved_tasks_count: number;
  is_current_user?: boolean;
}

export interface PredefinedStudent {
  id: string;
  email: string;
  name: string;
  role: string;
  badge: string;
  defaultScore: number;
  avatar: string;
  passwordPlaceholder: string;
}
