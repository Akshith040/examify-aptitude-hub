// TestStartPage.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, ClockIcon } from 'lucide-react';

interface TestStartPageProps {
  questionCount: number;
  onStartTest: () => void;
  testTitle?: string;
  testDuration?: number;
}

const TestStartPage: React.FC<TestStartPageProps> = ({ 
  questionCount, 
  onStartTest,
  testTitle = "Aptitude Test",
  testDuration = 60
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto glass-panel animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">{testTitle}</CardTitle>
        <CardDescription>
          {testDuration > 0 
            ? `This test has a total duration of ${testDuration} minutes.` 
            : `You will have 1 minute to answer each question.`}
          {questionCount > 0 
            ? ` The test has ${questionCount} questions in total.`
            : " No questions have been assigned to this test."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questionCount > 0 ? (
            <>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  This test will present {questionCount} questions drawn from the topics selected by your instructor.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center space-x-2 mt-4 text-muted-foreground">
                <ClockIcon className="h-4 w-4" />
                <span>Total Test Duration: {questionCount * 1} minutes</span>
              </div>
              
              <p className="font-medium mt-4">Instructions:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Each question has only one correct answer</li>
                <li>You can take as much time as needed for each question, but the total test time is limited</li>
                <li>You cannot go back to previous questions once submitted</li>
                <li>Your final score will be displayed at the end of the test</li>
              </ul>
            </>
          ) : (
            <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                No questions have been assigned to this test. Please contact your instructor.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onStartTest}
          disabled={questionCount === 0}
        >
          {questionCount === 0 ? 'No Questions Available' : 'Start Test'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestStartPage;