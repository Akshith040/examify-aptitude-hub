
import React from 'react';
import { ScheduledTest } from '@/types';
import TestScheduler from './TestScheduler';
import ScheduledTestList from './ScheduledTestList';
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
  const handleScheduleTest = async (test: Omit<ScheduledTest, 'id' | 'createdAt'>) => {
    try {
      // Check if user is logged in (from localStorage)
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser.id) {
        toast.error('You must be logged in to schedule tests');
        return;
      }
      
      // Ensure topics is an array with at least one topic
      const topicsArray = Array.isArray(test.topics) ? test.topics : 
                         (typeof test.topics === 'string' ? [test.topics] : []);
      
      if (topicsArray.length === 0) {
        toast.error('Please select at least one topic for the test');
        return;
      }
      
      // Validate question count
      if (!test.questionCount || test.questionCount <= 0) {
        toast.error('Question count must be greater than zero');
        return;
      }
      
      // Validate test duration
      if (!test.duration || test.duration <= 0) {
        toast.error('Test duration must be greater than zero');
        return;
      }
      
      // Validate dates
      if (!test.startDate || !test.endDate) {
        toast.error('Start and end dates are required');
        return;
      }
      
      const formattedTest = {
        ...test,
        topics: topicsArray,
        questionCount: parseInt(String(test.questionCount)),
        duration: parseInt(String(test.duration))
      };
      
      console.log("Scheduling test with data:", formattedTest);
      
      // The onScheduleTest function from AdminDashboard handles the database insert
      onScheduleTest(formattedTest);
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
