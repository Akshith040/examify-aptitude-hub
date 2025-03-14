
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface TestStartPageProps {
  questionCount: number;
  onStartTest: () => void;
}

const TestStartPage: React.FC<TestStartPageProps> = ({ questionCount, onStartTest }) => {
  return (
    <Card className="w-full max-w-3xl mx-auto glass-panel animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Aptitude Test</CardTitle>
        <CardDescription>
          You will have 1 minute to answer each question. The test has {questionCount} questions in total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Instructions:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Each question has only one correct answer</li>
            <li>If you don't answer within 60 seconds, the test will automatically move to the next question</li>
            <li>You cannot go back to previous questions</li>
            <li>Your final score will be displayed at the end of the test</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onStartTest}>Start Test</Button>
      </CardFooter>
    </Card>
  );
};

export default TestStartPage;
