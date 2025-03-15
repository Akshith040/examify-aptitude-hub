
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Question, TestResult, QuestionStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import TestStartPage from './test/TestStartPage';
import TestQuestion from './test/TestQuestion';
import TestResults from './test/TestResults';

const StudentTest = () => {
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
  
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!currentUser.id) {
      navigate('/');
    } else {
      fetchQuestions();
    }
  }, [currentUser, navigate]);
  
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform data to match Question type
        const formattedQuestions: Question[] = data.map(q => ({
          id: q.id,
          text: q.text,
          // Properly handle options parsing based on its type
          options: Array.isArray(q.options) 
            ? q.options 
            : (typeof q.options === 'string' 
                ? JSON.parse(q.options) 
                : Object.values(q.options).map(val => String(val))),
          correctOption: q.correct_option,
          explanation: q.explanation,
          topic: q.topic
        }));
        
        setQuestions(formattedQuestions);
        setSelectedOptions(Array(formattedQuestions.length).fill(-1));
        setTimeSpentPerQuestion(Array(formattedQuestions.length).fill(0));
        setQuestionStatus(Array(formattedQuestions.length).fill('unanswered'));
        setMarkedForReview(Array(formattedQuestions.length).fill(false));
      } else {
        toast.error('No questions available for the test');
        navigate('/student/dashboard');
      }
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
      navigate('/student/dashboard');
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

  const handleTotalTimeUpdate = (time: number) => {
    setTotalTestTime(time);
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
      id: '',  // This will be generated by Supabase
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
    
    // Save test result to Supabase
    try {
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: currentUser.id,
          score,
          total_questions: questions.length,
          time_spent: totalTestTime,
          answers,
          test_date: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update the result ID with the one from Supabase
        result.id = data.id;
        setTestResult(result);
      }
      
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
  
  if (!testStarted) {
    return <TestStartPage questionCount={questions.length} onStartTest={startTest} />;
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
        onTimeUp={handleTimeUp}
        onToggleMarkForReview={toggleMarkForReview}
        onQuestionSelect={goToQuestion}
        onTotalTimeUpdate={handleTotalTimeUpdate}
        isTestComplete={testComplete}
      />
    );
  }
  
  return null;
};

export default StudentTest;
