
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
  topic?: string;
  created_at: string;
  updated_at: string;
}

// This interface maps to the Supabase scheduled_tests table structure
export interface SupabaseScheduledTest {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  duration: number;
  topics: string[];
  question_count: number;
  is_active: boolean;
  created_at: string;
}

// This interface maps to the Supabase test_results table structure
export interface SupabaseTestResult {
  id: string;
  user_id: string;
  user_name?: string;
  test_date: string;
  score: number;
  total_questions: number;
  time_spent: number;
  answers: any; // JSON field in Supabase
  created_at: string;
  test_id?: string;
}
