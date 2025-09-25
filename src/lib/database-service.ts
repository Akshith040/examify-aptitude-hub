import { 
  getQuestions as getQuestionsAPI,
  getScheduledTests as getScheduledTestsAPI,
  getActiveScheduledTests as getActiveScheduledTestsAPI,
  getScheduledTestById as getScheduledTestByIdAPI,
  getQuestionsByTopics as getQuestionsByTopicsAPI,
  getTestResults as getTestResultsAPI,
  createTestResult as createTestResultAPI,
  getUsers as getUsersAPI,
  getTopics as getTopicsAPI
} from './db';
import { Question, TestResult, ScheduledTest, User } from '@/types';

export class DatabaseService {
  // Questions
  static async getQuestions(): Promise<Question[]> {
    return getQuestionsAPI();
  }

  static async getQuestionsByTopic(topic: string): Promise<Question[]> {
    const questions = await getQuestionsAPI();
    return questions.filter(q => q.topic === topic);
  }

  static async getQuestionsByTopics(topics: string[], limit?: number): Promise<Question[]> {
    return getQuestionsByTopicsAPI(topics, limit);
  }

  static async createQuestion(question: Omit<Question, 'id'>): Promise<string> {
    // For demo purposes, just add to mock data
    const questions = await getQuestionsAPI();
    const newId = (questions.length + 1).toString();
    // In a real app, this would make an API call
    return newId;
  }

  static async updateQuestion(id: string, question: Partial<Question>): Promise<void> {
    // For demo purposes, this would make an API call
    console.log('Update question:', id, question);
  }

  static async deleteQuestion(id: string): Promise<void> {
    // For demo purposes, this would make an API call
    console.log('Delete question:', id);
  }

  // Scheduled Tests
  static async getScheduledTests(): Promise<ScheduledTest[]> {
    return getScheduledTestsAPI();
  }

  static async getActiveScheduledTests(): Promise<ScheduledTest[]> {
    return getActiveScheduledTestsAPI();
  }

  static async getScheduledTestById(id: string): Promise<ScheduledTest | null> {
    return getScheduledTestByIdAPI(id);
  }

  static async createScheduledTest(test: Omit<ScheduledTest, 'id' | 'createdAt'>): Promise<string> {
    // For demo purposes, just return a new ID
    return Date.now().toString();
  }

  static async updateScheduledTest(id: string, test: Partial<ScheduledTest>): Promise<void> {
    // For demo purposes, this would make an API call
    console.log('Update scheduled test:', id, test);
  }

  static async deleteScheduledTest(id: string): Promise<void> {
    // For demo purposes, this would make an API call
    console.log('Delete scheduled test:', id);
  }

  // Test Results
  static async getTestResults(userId?: string): Promise<TestResult[]> {
    return getTestResultsAPI(userId);
  }

  static async createTestResult(result: Omit<TestResult, 'id'>): Promise<string> {
    return createTestResultAPI(result);
  }

  // Users and Profiles
  static async getUsers(): Promise<User[]> {
    return getUsersAPI();
  }

  static async getUserRole(userId: string): Promise<string | null> {
    const users = await getUsersAPI();
    const user = users.find(u => u.id === userId);
    return user?.role || null;
  }

  static async getTopics(): Promise<string[]> {
    return getTopicsAPI();
  }
}