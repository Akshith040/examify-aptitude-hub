
import { supabase } from '@/integrations/supabase/client';
import { mockQuestions, mockTestResults } from '@/mock/data';

/**
 * Seeds the Supabase database with mock data
 * Run this function from a button click or in development
 */
export const seedSupabase = async () => {
  try {
    console.log('Starting to seed Supabase...');
    
    // Insert questions
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .upsert(
        mockQuestions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correct_option: q.correctOption,
          explanation: q.explanation
        }))
      );
    
    if (questionError) throw questionError;
    console.log('Successfully added questions:', questionData);
    
    // Insert test results (note: this requires authentication)
    const { data: resultData, error: resultError } = await supabase
      .from('test_results')
      .upsert(
        mockTestResults.map(r => ({
          id: r.id,
          user_id: r.userId,
          score: r.score,
          total_questions: r.totalQuestions,
          time_spent: r.timeSpent,
          answers: r.answers,
          test_date: r.testDate
        }))
      );
    
    if (resultError) throw resultError;
    console.log('Successfully added test results:', resultData);
    
    return { success: true, message: 'Data seeded successfully!' };
  } catch (error) {
    console.error('Error seeding Supabase:', error);
    return { success: false, message: 'Error seeding data', error };
  }
};
