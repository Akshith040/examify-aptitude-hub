// StudentTest.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Question, TestResult, QuestionStatus, ScheduledTest } from '@/types';
import { DatabaseService } from '@/lib/database-service';
import TestStartPage from './test/TestStartPage';
import TestQuestion from './test/TestQuestion';
import TestResults from './test/TestResults';
import { Card, CardContent } from '@/components/ui/card';  

interface StudentTestProps {
  testId?: string;
  scheduledTest?: ScheduledTest | null;
}

const StudentTest: React.FC<StudentTestProps> = ({ testId, scheduledTest }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<number[]>([]);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus[]>([]);
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testStartTime, setTestStartTime] = useState<Date>(new Date());
  const [totalTestTime, setTotalTestTime] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchCompleted, setFetchCompleted] = useState(false);
  
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!currentUser.id) {
      navigate('/');
    } else if (!fetchCompleted) {  // Only fetch once
      fetchQuestions();
    }
  }, [currentUser, navigate, fetchCompleted]);
  
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log("Fetching questions for scheduled test:", scheduledTest);
      
      // Exit early if there's no scheduled test
      if (!scheduledTest) {
        console.error("No scheduled test information available");
        setLoadError('Test information not found. Please try again later.');
        toast.error('Test information not found');
        setIsLoading(false);
        setFetchCompleted(true);
        return;
      }
      
      // Check if we have valid topics
      if (!Array.isArray(scheduledTest.topics) || scheduledTest.topics.length === 0) {
        console.error("No topics specified in the test:", scheduledTest.topics);
        setLoadError('This test does not have any topics assigned. Please contact your administrator.');
        toast.error('No topics assigned to this test');
        setIsLoading(false);
        setFetchCompleted(true);
        return;
      }
      
      // Get the required number of questions, distributed evenly across topics
      const questionsPerTopic = Math.ceil(scheduledTest.questionCount / scheduledTest.topics.length);
      console.log(`Attempting to fetch ~${questionsPerTopic} questions per topic`);
      
      let allQuestions: Question[] = [];
      let fetchErrors = 0;
      
      // Fetch questions for the specified topics
      console.log(`Fetching questions for topics: ${scheduledTest.topics.join(', ')}`);
      
      try {
        const allQuestions = await DatabaseService.getQuestionsByTopics(
          scheduledTest.topics, 
          scheduledTest.questionCount
        );
        
        if (allQuestions.length === 0) {
          setLoadError('No questions available for this test. Please contact your administrator.');
          toast.error('No questions available for this test');
          setIsLoading(false);
          setFetchCompleted(true);
          return;
        }
        
        console.log(`Successfully fetched ${allQuestions.length} questions`);
        
        // Set up the test
        setQuestions(allQuestions);
        setSelectedOptions(Array(allQuestions.length).fill(-1));
        setTimeSpentPerQuestion(Array(allQuestions.length).fill(0));
        setQuestionStatus(Array(allQuestions.length).fill('unanswered'));
        setMarkedForReview(Array(allQuestions.length).fill(false));
        setFetchCompleted(true);
        
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoadError('Failed to fetch questions. Please try again later.');
        toast.error('Failed to load questions');
        fetchErrors = scheduledTest.topics.length;
      }
      
      // If all fetch attempts failed, show an error
      if (fetchErrors === scheduledTest.topics.length) {
        setLoadError('Failed to fetch questions. Please try again later.');
        toast.error('Failed to load questions');
        setIsLoading(false);
        setFetchCompleted(true);
        return;
      }
      
      // If we couldn't get enough questions from the specified topics, log a warning
      if (allQuestions.length < scheduledTest.questionCount) {
        console.warn(`Could only find ${allQuestions.length} questions across all topics, needed ${scheduledTest.questionCount}`);
      }
      
      if (allQuestions.length === 0) {
        console.error("No questions found matching the criteria");
        setLoadError('No questions available for this test. Please contact your administrator.');
        toast.error('No questions available for this test');
        setIsLoading(false);
        setFetchCompleted(true);
        return;
      }
      

      

    } catch (error: any) {
      console.error('Error fetching questions:', error);
      setLoadError('Failed to load questions. Please try again later.');
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };


  
  const startTest = () => {
    setTestStarted(true);
    setTestStartTime(new Date());
    toast.info('Test started! Good luck!');
  };
  
  const handleOptionChange = (value: string) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = parseInt(value);
    setSelectedOptions(newSelectedOptions);
    
    // Update question status
    updateQuestionStatus(currentQuestionIndex, parseInt(value), markedForReview[currentQuestionIndex]);
  };

  const updateQuestionStatus = (index: number, selectedOption: number, isMarkedForReview: boolean) => {
    const newStatus = [...questionStatus];
    
    if (selectedOption !== -1) {
      newStatus[index] = isMarkedForReview ? 'answered-review' : 'answered';
    } else {
      newStatus[index] = isMarkedForReview ? 'unanswered-review' : 'unanswered';
    }
    
    setQuestionStatus(newStatus);
  };
  
  const toggleMarkForReview = () => {
    const newMarkedForReview = [...markedForReview];
    newMarkedForReview[currentQuestionIndex] = !newMarkedForReview[currentQuestionIndex];
    setMarkedForReview(newMarkedForReview);
    
    // Update question status
    updateQuestionStatus(
      currentQuestionIndex, 
      selectedOptions[currentQuestionIndex], 
      newMarkedForReview[currentQuestionIndex]
    );
  };
  
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      completeTest();
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  const handleTotalTimeUpdate = (time: number) => {
    setTotalTestTime(time);
    if (time <= 0) {
      completeTest();
    }
  };
  
  const completeTest = async () => {
    // Calculate score
    let score = 0;
    const answers = questions.map((question, index) => {
      const selectedOption = selectedOptions[index];
      const isCorrect = selectedOption === question.correctOption;
      if (isCorrect) score++;
      
      return {
        questionId: question.id,
        selectedOption: selectedOption !== -1 ? selectedOption : -1,
        isCorrect: isCorrect,
        timeSpent: timeSpentPerQuestion[index]
      };
    });
    
    const result: TestResult = {
      id: '',  // This will be generated by the database
      userId: currentUser.id,
      userName: currentUser.name || currentUser.username,
      testDate: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      timeSpent: totalTestTime,
      answers
    };
    
    setTestResult(result);
    setTestComplete(true);
    
    // Save test result to database
    try {
      const resultId = await DatabaseService.createTestResult({
        userId: currentUser.id,
        userName: currentUser.name || currentUser.username,
        testId: testId,
        testDate: new Date().toISOString(),
        score,
        totalQuestions: questions.length,
        timeSpent: totalTestTime,
        answers
      });
      
      // Update the result ID
      result.id = resultId;
      setTestResult(result);
      
      toast.success('Test completed and results saved!');
    } catch (error: any) {
      console.error('Error saving test result:', error);
      toast.error('Test completed, but there was an error saving your results');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading test questions...</p>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="container mx-auto py-10 animate-fade-in">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-10 text-center">
            <h2 className="text-2xl font-medium mb-4">Cannot Load Test</h2>
            <p className="text-muted-foreground mb-6">{loadError}</p>
            <a 
              href="/student/dashboard" 
              className="text-primary hover:underline"
            >
              Return to Dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!testStarted) {
    return (
      <TestStartPage 
        questionCount={questions.length} 
        onStartTest={startTest} 
        testTitle={scheduledTest?.title || "Aptitude Test"}
        testDuration={scheduledTest?.duration || 60}
      />
    );
  }
  
  if (testComplete && testResult) {
    return <TestResults testResult={testResult} questions={questions} />;
  }
  
  if (questions.length > 0) {
    return (
      <TestQuestion
        question={questions[currentQuestionIndex]}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        selectedOption={selectedOptions[currentQuestionIndex]}
        questionStatus={questionStatus}
        markedForReview={markedForReview[currentQuestionIndex]}
        testStartTime={testStartTime}
        onOptionChange={handleOptionChange}
        onNextQuestion={moveToNextQuestion}
        onToggleMarkForReview={toggleMarkForReview}
        onQuestionSelect={goToQuestion}
        onTotalTimeUpdate={handleTotalTimeUpdate}
        isTestComplete={testComplete}
      />
    );
  }
  
  return (
    <div className="container mx-auto py-10 animate-fade-in">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-10 text-center">
          <h2 className="text-2xl font-medium mb-4">No Questions Available</h2>
          <p className="text-muted-foreground mb-6">
            There are no questions available for this test. Please contact your administrator.
          </p>
          <a 
            href="/student/dashboard" 
            className="text-primary hover:underline"
          >
            Return to Dashboard
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTest;