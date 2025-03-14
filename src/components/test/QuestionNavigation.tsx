
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, XIcon, BookmarkIcon, HelpCircleIcon } from 'lucide-react';
import { QuestionStatus } from '@/types';

interface QuestionNavigationProps {
  totalQuestions: number;
  currentIndex: number;
  questionStatus: QuestionStatus[];
  onQuestionSelect: (index: number) => void;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({ 
  totalQuestions, 
  currentIndex, 
  questionStatus, 
  onQuestionSelect 
}) => {
  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return <CheckIcon className="h-3 w-3" />;
      case 'unanswered':
        return <XIcon className="h-3 w-3" />;
      case 'answered-review':
        return <BookmarkIcon className="h-3 w-3" />;
      case 'unanswered-review':
        return <HelpCircleIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
      case 'unanswered':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
      case 'answered-review':
        return 'bg-violet-100 text-violet-800 border-violet-300 hover:bg-violet-200';
      case 'unanswered-review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
    }
  };

  return (
    <div className="mt-8">
      <h4 className="text-sm font-medium mb-2">Question Navigation</h4>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            className={`w-10 h-10 p-0 font-medium flex items-center justify-center ${getStatusColor(questionStatus[index])}`}
            onClick={() => onQuestionSelect(index)}
          >
            <span className="sr-only">Question {index + 1}</span>
            <span>{index + 1}</span>
            <span className="absolute bottom-0.5 right-0.5">
              {getStatusIcon(questionStatus[index])}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuestionNavigation;
