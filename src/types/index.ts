
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
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
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'admin';
  name?: string;
  email?: string;
}
