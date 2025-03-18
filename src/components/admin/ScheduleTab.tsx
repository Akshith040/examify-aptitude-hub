
import React from 'react';
import { ScheduledTest } from '@/types';
import TestScheduler from './TestScheduler';
import ScheduledTestList from './ScheduledTestList';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';

interface ScheduleTabProps {
  topics: string[];
  scheduledTests: ScheduledTest[];
  onScheduleTest: (test: Omit<ScheduledTest, 'id'>) => void;
  onDeleteTest: (id: string) => void;
  onToggleTestStatus: (id: string, isActive: boolean) => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  topics,
  scheduledTests,
  onScheduleTest,
  onDeleteTest,
  onToggleTestStatus
}) => {
  const handleScheduleTest = async (test: Omit<ScheduledTest, 'id'>) => {
    try {
      // Insert the test into Supabase
      const { data, error } = await supabase
        .from('scheduled_tests')
        .insert({
          title: test.title,
          description: test.description || '',
          start_date: test.startDate,
          end_date: test.endDate,
          duration: test.duration,
          question_count: test.questionCount,
          topics: test.topics,
          is_active: true
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error scheduling test:', error);
        toast.error('Failed to schedule test');
        return;
      }
      
      // Call the parent component's function to update the UI
      onScheduleTest(test);
      
    } catch (error) {
      console.error('Error in handleScheduleTest:', error);
      toast.error('An error occurred while scheduling the test');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <TestScheduler topics={topics} onScheduleTest={handleScheduleTest} />
      </div>
      <div>
        <ScheduledTestList 
          tests={scheduledTests}
          onDeleteTest={onDeleteTest}
          onToggleTestStatus={onToggleTestStatus}
        />
      </div>
    </div>
  );
};

export default ScheduleTab;
