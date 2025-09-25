import { query } from './db';
import { Question, TestResult, ScheduledTest, User } from '@/types';

export class DatabaseService {
  // Questions
  static async getQuestions(): Promise<Question[]> {
    const result = await query('SELECT * FROM questions ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id,
      text: row.text,
      options: row.options,
      correctOption: row.correct_option,
      explanation: row.explanation,
      topic: row.topic
    }));
  }

  static async getQuestionsByTopic(topic: string): Promise<Question[]> {
    const result = await query('SELECT * FROM questions WHERE topic = $1', [topic]);
    return result.rows.map(row => ({
      id: row.id,
      text: row.text,
      options: row.options,
      correctOption: row.correct_option,
      explanation: row.explanation,
      topic: row.topic
    }));
  }

  static async getQuestionsByTopics(topics: string[], limit?: number): Promise<Question[]> {
    let queryText = 'SELECT * FROM questions WHERE topic = ANY($1)';
    let params: any[] = [topics];
    
    if (limit) {
      queryText += ' LIMIT $2';
      params.push(limit);
    }
    
    const result = await query(queryText, params);
    return result.rows.map(row => ({
      id: row.id,
      text: row.text,
      options: row.options,
      correctOption: row.correct_option,
      explanation: row.explanation,
      topic: row.topic
    }));
  }

  static async createQuestion(question: Omit<Question, 'id'>): Promise<string> {
    const result = await query(
      'INSERT INTO questions (text, options, correct_option, explanation, topic) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [question.text, JSON.stringify(question.options), question.correctOption, question.explanation, question.topic]
    );
    return result.rows[0].id;
  }

  static async updateQuestion(id: string, question: Partial<Question>): Promise<void> {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (question.text !== undefined) {
      updates.push(`text = $${paramCount++}`);
      values.push(question.text);
    }
    if (question.options !== undefined) {
      updates.push(`options = $${paramCount++}`);
      values.push(JSON.stringify(question.options));
    }
    if (question.correctOption !== undefined) {
      updates.push(`correct_option = $${paramCount++}`);
      values.push(question.correctOption);
    }
    if (question.explanation !== undefined) {
      updates.push(`explanation = $${paramCount++}`);
      values.push(question.explanation);
    }
    if (question.topic !== undefined) {
      updates.push(`topic = $${paramCount++}`);
      values.push(question.topic);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(id);
      await query(
        `UPDATE questions SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }
  }

  static async deleteQuestion(id: string): Promise<void> {
    await query('DELETE FROM questions WHERE id = $1', [id]);
  }

  // Scheduled Tests
  static async getScheduledTests(): Promise<ScheduledTest[]> {
    const result = await query('SELECT * FROM scheduled_tests ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      duration: row.duration,
      topics: row.topics,
      questionCount: row.question_count,
      isActive: row.is_active,
      createdAt: row.created_at
    }));
  }

  static async getActiveScheduledTests(): Promise<ScheduledTest[]> {
    const now = new Date().toISOString();
    const result = await query(
      'SELECT * FROM scheduled_tests WHERE is_active = true AND start_date <= $1 AND end_date >= $1 ORDER BY start_date',
      [now]
    );
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      duration: row.duration,
      topics: row.topics,
      questionCount: row.question_count,
      isActive: row.is_active,
      createdAt: row.created_at
    }));
  }

  static async getScheduledTestById(id: string): Promise<ScheduledTest | null> {
    const result = await query('SELECT * FROM scheduled_tests WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      duration: row.duration,
      topics: row.topics,
      questionCount: row.question_count,
      isActive: row.is_active,
      createdAt: row.created_at
    };
  }

  static async createScheduledTest(test: Omit<ScheduledTest, 'id' | 'createdAt'>): Promise<string> {
    const result = await query(
      'INSERT INTO scheduled_tests (title, description, start_date, end_date, duration, question_count, topics, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [test.title, test.description, test.startDate, test.endDate, test.duration, test.questionCount, test.topics, test.isActive]
    );
    return result.rows[0].id;
  }

  static async updateScheduledTest(id: string, test: Partial<ScheduledTest>): Promise<void> {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (test.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(test.title);
    }
    if (test.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(test.description);
    }
    if (test.startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(test.startDate);
    }
    if (test.endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(test.endDate);
    }
    if (test.duration !== undefined) {
      updates.push(`duration = $${paramCount++}`);
      values.push(test.duration);
    }
    if (test.questionCount !== undefined) {
      updates.push(`question_count = $${paramCount++}`);
      values.push(test.questionCount);
    }
    if (test.topics !== undefined) {
      updates.push(`topics = $${paramCount++}`);
      values.push(test.topics);
    }
    if (test.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(test.isActive);
    }

    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE scheduled_tests SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }
  }

  static async deleteScheduledTest(id: string): Promise<void> {
    await query('DELETE FROM scheduled_tests WHERE id = $1', [id]);
  }

  // Test Results
  static async getTestResults(userId?: string): Promise<TestResult[]> {
    let queryText = 'SELECT * FROM test_results';
    let params: any[] = [];
    
    if (userId) {
      queryText += ' WHERE user_id = $1';
      params = [userId];
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      testDate: row.test_date,
      score: row.score,
      totalQuestions: row.total_questions,
      timeSpent: row.time_spent,
      answers: row.answers,
      testId: row.test_id
    }));
  }

  static async createTestResult(result: Omit<TestResult, 'id'>): Promise<string> {
    const queryResult = await query(
      'INSERT INTO test_results (user_id, user_name, test_id, test_date, score, total_questions, time_spent, answers) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [result.userId, result.userName, result.testId, result.testDate, result.score, result.totalQuestions, result.timeSpent, JSON.stringify(result.answers)]
    );
    return queryResult.rows[0].id;
  }

  // Users and Profiles
  static async getUsers(): Promise<User[]> {
    const result = await query(
      'SELECT u.id, p.username, u.email, p.name, p.role FROM users u JOIN profiles p ON u.id = p.id ORDER BY p.created_at DESC'
    );
    return result.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      name: row.name,
      role: row.role,
      password: '' // Don't return password
    }));
  }

  static async getUserRole(userId: string): Promise<string | null> {
    const result = await query('SELECT role FROM profiles WHERE id = $1', [userId]);
    return result.rows[0]?.role || null;
  }

  static async getTopics(): Promise<string[]> {
    const result = await query('SELECT DISTINCT topic FROM questions WHERE topic IS NOT NULL ORDER BY topic');
    return result.rows.map(row => row.topic);
  }
}