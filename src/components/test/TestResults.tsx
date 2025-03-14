
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TestResult, Question } from '@/types';
import { useNavigate } from 'react-router-dom';

interface TestResultsProps {
  testResult: TestResult;
  questions: Question[];
}

const TestResults: React.FC<TestResultsProps> = ({ testResult, questions }) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-3xl mx-auto glass-panel animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Test Results</CardTitle>
        <CardDescription>
          You scored {testResult.score} out of {testResult.totalQuestions}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-6 py-3 text-3xl font-medium text-primary ring-1 ring-inset ring-primary/30">
              {Math.round((testResult.score / testResult.totalQuestions) * 100)}%
            </div>
            <p className="mt-4 text-muted-foreground">
              Total time spent: {Math.floor(testResult.timeSpent / 60)}m {testResult.timeSpent % 60}s
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Question Summary:</h3>
            {testResult.answers.map((answer, index) => {
              const question = questions.find(q => q.id === answer.questionId);
              if (!question) return null;
              
              return (
                <div key={index} className={`p-4 rounded-md ${answer.isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <p className="font-medium">{index + 1}. {question.text}</p>
                  <p className="mt-2 text-sm">
                    {answer.selectedOption !== -1 ? (
                      <>Your answer: <span className={answer.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {question.options[answer.selectedOption]}
                      </span></>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">No answer provided</span>
                    )}
                  </p>
                  {!answer.isCorrect && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                      Correct answer: {question.options[question.correctOption]}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Time taken: {answer.timeSpent} seconds</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => navigate('/student/dashboard')}>
          Return to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestResults;
