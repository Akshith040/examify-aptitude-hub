
import React from 'react';
import { ScheduledTest } from '@/types';
import TestScheduler from './TestScheduler';
import ScheduledTestList from './ScheduledTestList';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <TestScheduler topics={topics} onScheduleTest={onScheduleTest} />
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
