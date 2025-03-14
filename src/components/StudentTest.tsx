
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import QuestionTimer from '@/components/QuestionTimer';
import { Question, TestResult, QuestionStatus } from '@/types';
import { mockQuestions } from '@/mock/data';
import { CheckIcon, XIcon, BookmarkIcon, HelpCircleIcon } from 'lucide-react';

const StudentTest = () => {
  const [questions] = useState<Question[]>(mockQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(Array(questions.length).fill(-1));
  const [testStarted, setTestStarted] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<number[]>(Array(questions.length).fill(0));
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus[]>(
    Array(questions.length).fill('unanswered')
  );
  const [markedForReview, setMarkedForReview] = useState<boolean[]>(
    Array(questions.length).fill(false)
  );
  
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!currentUser.id) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const startTest = () => {
    setTestStarted(true);
    toast.info('Test started! You have 1 minute per question.');
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
  
  const handleTimeUp = () => {
    toast.warning('Time is up for this question!');
    // Auto-move to next question if no option selected
    if (selectedOptions[currentQuestionIndex] === -1) {
      // Track that full time was spent
      const newTimeSpent = [...timeSpentPerQuestion];
      newTimeSpent[currentQuestionIndex] = 60; // 60 seconds
      setTimeSpentPerQuestion(newTimeSpent);
    }
    moveToNextQuestion();
  };
  
  const completeTest = () => {
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
    
    const totalTimeSpent = timeSpentPerQuestion.reduce((total, time) => total + time, 0);
    
    const result: TestResult = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name || currentUser.username,
      testDate: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      timeSpent: totalTimeSpent,
      answers
    };
    
    setTestResult(result);
    setTestComplete(true);
    toast.success('Test completed!');
    
    // In a real implementation, this would be saved to the database
    console.log('Test result:', result);
  };
  
  const handleQuestionOptionSelect = (option: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = option;
    setSelectedOptions(newSelectedOptions);
    
    // Update question status
    updateQuestionStatus(currentQuestionIndex, option, markedForReview[currentQuestionIndex]);
    
    // Update time spent for this question (for demonstration purposes, using a random time <= 60)
    const timeSpent = Math.floor(Math.random() * 40) + 20; // Between 20-60 seconds
    const newTimeSpent = [...timeSpentPerQuestion];
    newTimeSpent[currentQuestionIndex] = timeSpent;
    setTimeSpentPerQuestion(newTimeSpent);
  };

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
  
  const renderStartPage = () => (
    <Card className="w-full max-w-3xl mx-auto glass-panel animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Aptitude Test</CardTitle>
        <CardDescription>
          You will have 1 minute to answer each question. The test has {questions.length} questions in total.
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
        <Button className="w-full" onClick={startTest}>Start Test</Button>
      </CardFooter>
    </Card>
  );
  
  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    
    return (
      <Card className="w-full max-w-3xl mx-auto glass-panel animate-fade-in">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/30">
                Question {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
          <QuestionTimer duration={60} onTimeUp={handleTimeUp} />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            <h3 className="text-lg font-medium">{question.text}</h3>
            <RadioGroup 
              value={selectedOptions[currentQuestionIndex]?.toString() || ""} 
              onValueChange={handleOptionChange}
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

          {/* Question Navigation */}
          <div className="mt-8">
            <h4 className="text-sm font-medium mb-2">Question Navigation</h4>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  className={`w-10 h-10 p-0 font-medium flex items-center justify-center ${getStatusColor(questionStatus[index])}`}
                  onClick={() => goToQuestion(index)}
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

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={toggleMarkForReview}
              className="mr-2"
            >
              {markedForReview[currentQuestionIndex] ? 'Unmark for Review' : 'Mark for Review'}
              <BookmarkIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Select an option and click Next
          </div>
          <Button 
            onClick={moveToNextQuestion}
            disabled={selectedOptions[currentQuestionIndex] === -1}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  const renderResults = () => {
    if (!testResult) return null;
    
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
              <p className="mt-4 text-muted-foreground">Total time spent: {Math.floor(testResult.timeSpent / 60)}m {testResult.timeSpent % 60}s</p>
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
  
  if (!testStarted) {
    return renderStartPage();
  }
  
  if (testComplete) {
    return renderResults();
  }
  
  return renderQuestion();
};

export default StudentTest;
