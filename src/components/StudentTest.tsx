import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Question, TestResult, QuestionStatus, SupabaseQuestion, ScheduledTest } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import TestStartPage from './test/TestStartPage';
import TestQuestion from './test/TestQuestion';
import TestResults from './test/TestResults';
import { Card, CardContent } from '@/components/ui/card';  // Added missing imports

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
      setLoadError(null);
      
      console.log("Fetching questions for scheduled test:", scheduledTest);
      
      // Exit early if there's no scheduled test
      if (!scheduledTest) {
        setLoadError('Test information not found. Please try again later.');
        toast.error('Test information not found');
        setIsLoading(false);
        return;
      }
      
      // Check if we have valid topics
      if (!Array.isArray(scheduledTest.topics) || scheduledTest.topics.length === 0) {
        console.log("No topics specified in the test");
        setLoadError('This test does not have any topics assigned. Please contact your administrator.');
        toast.error('No topics assigned to this test');
        setIsLoading(false);
        return;
      }
      
      // Get the required number of questions, distributed evenly across topics
      const questionsPerTopic = Math.ceil(scheduledTest.questionCount / scheduledTest.topics.length);
      console.log(`Attempting to fetch ~${questionsPerTopic} questions per topic`);
      
      let allQuestions: SupabaseQuestion[] = [];
      
      // Fetch questions for each topic
      for (const topic of scheduledTest.topics) {
        console.log(`Fetching questions for topic: ${topic}`);
        
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('topic', topic)
          .limit(questionsPerTopic);
          
        if (error) {
          console.error(`Error fetching questions for topic ${topic}:`, error);
          continue; // Try other topics if one fails
        }
        
        if (data && data.length > 0) {
          console.log(`Found ${data.length} questions for topic ${topic}`);
          allQuestions = [...allQuestions, ...data];
        } else {
          console.log(`No questions found for topic ${topic}`);
        }
      }
      
      // If we couldn't get enough questions from the specified topics, log a warning
      if (allQuestions.length < scheduledTest.questionCount) {
        console.warn(`Could only find ${allQuestions.length} questions across all topics, needed ${scheduledTest.questionCount}`);
      }
      
      // Limit to the required number of questions, but ensure we have at least one from each topic if possible
      if (allQuestions.length > scheduledTest.questionCount) {
        // Shuffle the questions to randomize the selection
        allQuestions = shuffleArray(allQuestions);
        
        // Try to ensure at least one question from each topic if possible
        const questionsMap = new Map<string, SupabaseQuestion[]>();
        
        // Group questions by topic
        allQuestions.forEach(q => {
          const topic = q.topic || 'unknown';
          if (!questionsMap.has(topic)) {
            questionsMap.set(topic, []);
          }
          questionsMap.get(topic)?.push(q);
        });
        
        // Select questions, prioritizing having at least one from each topic
        const selectedQuestions: SupabaseQuestion[] = [];
        
        // First, take one question from each topic
        for (const topic of scheduledTest.topics) {
          const topicQuestions = questionsMap.get(topic) || [];
          if (topicQuestions.length > 0) {
            selectedQuestions.push(topicQuestions.shift()!);
          }
        }
        
        // Then fill up remaining slots with random questions
        const remainingQuestions = Array.from(questionsMap.values()).flat();
        while (selectedQuestions.length < scheduledTest.questionCount && remainingQuestions.length > 0) {
          selectedQuestions.push(remainingQuestions.shift()!);
        }
        
        allQuestions = selectedQuestions;
      }
      
      if (allQuestions.length === 0) {
        console.error("No questions found matching the criteria");
        setLoadError('No questions available for this test. Please contact your administrator.');
        toast.error('No questions available for this test');
        setIsLoading(false);
        return;
      }
      
      console.log(`Successfully fetched ${allQuestions.length} questions across all topics`);
      
      // Transform data to match Question type
      const formattedQuestions: Question[] = allQuestions.map((q: SupabaseQuestion) => {
        let parsedOptions;
        try {
          if (Array.isArray(q.options)) {
            parsedOptions = q.options;
          } else if (typeof q.options === 'string') {
            parsedOptions = JSON.parse(q.options);
          } else if (typeof q.options === 'object') {
            parsedOptions = Object.values(q.options).map(val => String(val));
          } else {
            console.error('Invalid options format:', q.options);
            parsedOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
          }
        } catch (err) {
          console.error('Error parsing options:', err);
          parsedOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
        }
        
        return {
          id: q.id,
          text: q.text,
          options: parsedOptions,
          correctOption: q.correct_option,
          explanation: q.explanation || undefined,
          topic: q.topic || undefined
        };
      });
      
      console.log("Formatted questions:", formattedQuestions);
      
      setQuestions(formattedQuestions);
      setSelectedOptions(Array(formattedQuestions.length).fill(-1));
      setTimeSpentPerQuestion(Array(formattedQuestions.length).fill(0));
      setQuestionStatus(Array(formattedQuestions.length).fill('unanswered'));
      setMarkedForReview(Array(formattedQuestions.length).fill(false));
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      setLoadError('Failed to load questions. Please try again later.');
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to shuffle an array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
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
          user_name: currentUser.name || currentUser.username, // Include user_name field
          score,
          total_questions: questions.length,
          time_spent: totalTestTime,
          answers,
          test_date: new Date().toISOString(),
          test_id: testId // Include test ID if available
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
        onTimeUp={handleTimeUp}
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
