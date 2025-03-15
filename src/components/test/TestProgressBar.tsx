
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface TestProgressBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
}

const TestProgressBar: React.FC<TestProgressBarProps> = ({ 
  currentQuestionIndex, 
  totalQuestions 
}) => {
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default TestProgressBar;
