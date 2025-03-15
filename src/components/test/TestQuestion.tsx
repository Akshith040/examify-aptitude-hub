
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BookmarkIcon } from 'lucide-react';
import QuestionTimer from '@/components/QuestionTimer';
import { Question, QuestionStatus } from '@/types';
import QuestionNavigation from './QuestionNavigation';
import TestProgressBar from './TestProgressBar';
import TotalTestTimer from './TotalTestTimer';

interface TestQuestionProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedOption: number;
  questionStatus: QuestionStatus[];
  markedForReview: boolean;
  testStartTime: Date;
  onOptionChange: (value: string) => void;
  onNextQuestion: () => void;
  onTimeUp: () => void;
  onToggleMarkForReview: () => void;
  onQuestionSelect: (index: number) => void;
  onTotalTimeUpdate: (time: number) => void;
  isTestComplete: boolean;
}

const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedOption,
  questionStatus,
  markedForReview,
  testStartTime,
  onOptionChange,
  onNextQuestion,
  onTimeUp,
  onToggleMarkForReview,
  onQuestionSelect,
  onTotalTimeUpdate,
  isTestComplete
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto glass-panel animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/30">
              Question {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <TotalTestTimer 
            startTime={testStartTime} 
            isTestComplete={isTestComplete} 
            onTimeUpdate={onTotalTimeUpdate} 
          />
        </div>
        <TestProgressBar 
          currentQuestionIndex={currentQuestionIndex} 
          totalQuestions={totalQuestions} 
        />
        <QuestionTimer duration={60} onTimeUp={onTimeUp} />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          <h3 className="text-lg font-medium">{question.text}</h3>
          <RadioGroup 
            value={selectedOption !== -1 ? selectedOption.toString() : ""} 
            onValueChange={onOptionChange}
            className="space-y-4"
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent transition-colors">
                <RadioGroupItem id={`option-${index}`} value={index.toString()} className="peer" />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <QuestionNavigation 
          totalQuestions={totalQuestions}
          currentIndex={currentQuestionIndex}
          questionStatus={questionStatus}
          onQuestionSelect={onQuestionSelect}
        />

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onToggleMarkForReview}
            className="mr-2"
          >
            {markedForReview ? 'Unmark for Review' : 'Mark for Review'}
            <BookmarkIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Select an option and click Next
        </div>
        <Button 
          onClick={onNextQuestion}
          disabled={selectedOption === -1}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestQuestion;
