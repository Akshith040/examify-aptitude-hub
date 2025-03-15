
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  topic?: string;
}

export type QuestionStatus = 'answered' | 'unanswered' | 'answered-review' | 'unanswered-review';

export interface TestResult {
  id: string;
  userId: string;
  userName: string;
  testDate: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // In seconds
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    timeSpent: number; // In seconds
  }[];
  testId?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'admin';
  name?: string;
  email?: string;
}

export interface ScheduledTest {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration: number; // In minutes
  topics: string[];
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

// This interface maps to the Supabase questions table structure
export interface SupabaseQuestion {
  id: string;
  text: string;
  options: any; // JSON field in Supabase
  correct_option: number;
  explanation: string | null;
  topic?: string; // Add this as optional since it doesn't exist in the DB yet
  created_at: string;
  updated_at: string;
}
