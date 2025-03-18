
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { mockUsers, mockTestResults } from '@/mock/data';
import { User, Question, TestResult, ScheduledTest, SupabaseQuestion } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import DashboardStats from './admin/DashboardStats';
import QuestionsTab from './admin/QuestionsTab';
import StudentsTab from './admin/StudentsTab';
import ResultsTab from './admin/ResultsTab';
import ScheduleTab from './admin/ScheduleTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [scheduledTests, setScheduledTests] = useState<ScheduledTest[]>([]);
  const [topics, setTopics] = useState<string[]>(['Mathematics', 'Science', 'English', 'History', 'Geography', 'General Knowledge']);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  useEffect(() => {
    console.log("Admin dashboard mounted. Current user role:", currentUser.role);
    
    if (!currentUser.id) {
      navigate('/');
      return;
    } 
    
    if (currentUser.role !== 'admin') {
      // If non-admin is trying to access admin dashboard, redirect to student dashboard
      console.log("Non-admin user attempting to access admin dashboard. Redirecting...");
      toast.error('You do not have permission to access the admin dashboard');
      navigate('/student/dashboard');
      return;
    }
    
    // Only fetch data if user is admin
    fetchData();
  }, [currentUser.id, currentUser.role, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch questions
      console.log('Fetching questions from Supabase...');
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*');
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }
      
      if (questionsData) {
        const formattedQuestions: Question[] = questionsData.map((q: SupabaseQuestion) => ({
          id: q.id,
          text: q.text,
          options: Array.isArray(q.options) 
            ? q.options 
            : (typeof q.options === 'string' 
                ? JSON.parse(q.options) 
                : Object.values(q.options).map(val => String(val))),
          correctOption: q.correct_option,
          explanation: q.explanation || undefined,
          topic: q.topic || undefined
        }));
        
        setQuestions(formattedQuestions);
        
        const allTopics = formattedQuestions
          .map(q => q.topic)
          .filter((topic): topic is string => !!topic);
        
        if (allTopics.length > 0) {
          setTopics([...new Set(allTopics)]);
        }
      }
      
      // Fetch scheduled tests
      const { data: testsData, error: testsError } = await supabase
        .from('scheduled_tests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (testsError) {
        console.error('Error fetching scheduled tests:', testsError);
      } else if (testsData) {
        const formattedTests: ScheduledTest[] = testsData.map(test => ({
          id: test.id,
          title: test.title,
          description: test.description || undefined,
          startDate: test.start_date,
          endDate: test.end_date,
          duration: test.duration,
          topics: Array.isArray(test.topics) ? test.topics : [],
          questionCount: test.question_count,
          isActive: test.is_active,
          createdAt: test.created_at
        }));
        
        setScheduledTests(formattedTests);
      }
      
      // Fetch test results
      const { data: resultsData, error: resultsError } = await supabase
        .from('test_results')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (resultsError) {
        console.error('Error fetching test results:', resultsError);
        setTestResults(mockTestResults);
      } else if (resultsData) {
        const formattedResults: TestResult[] = resultsData.map(result => ({
          id: result.id,
          userId: result.user_id,
          userName: result.user_name || 'Student', // Using a default value since user_name might not exist
          testDate: result.test_date,
          score: result.score,
          totalQuestions: result.total_questions,
          timeSpent: result.time_spent,
          answers: Array.isArray(result.answers) 
            ? result.answers.map((answer: any) => ({
                questionId: answer.questionId || '',
                selectedOption: typeof answer.selectedOption === 'number' ? answer.selectedOption : -1,
                isCorrect: Boolean(answer.isCorrect),
                timeSpent: typeof answer.timeSpent === 'number' ? answer.timeSpent : 0
              }))
            : [],
          testId: result.test_id
        }));
        
        setTestResults(formattedResults);
      }
      
      setUsers(mockUsers.filter(user => user.role === 'student'));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleTest = async (test: Omit<ScheduledTest, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_tests')
        .insert({
          title: test.title,
          description: test.description,
          start_date: test.startDate,
          end_date: test.endDate,
          duration: test.duration,
          question_count: test.questionCount,
          topics: test.topics,
          is_active: true
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error scheduling test:', error);
        toast.error('Failed to schedule test');
        return;
      }
      
      const newTest: ScheduledTest = {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date,
        duration: data.duration,
        topics: data.topics,
        questionCount: data.question_count,
        isActive: data.is_active,
        createdAt: data.created_at
      };
      
      setScheduledTests(prev => [newTest, ...prev]);
      toast.success('Test scheduled successfully');
    } catch (error) {
      console.error('Error in handleScheduleTest:', error);
      toast.error('Failed to schedule test');
    }
  };
  
  const handleDeleteTest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_tests')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting test:', error);
        toast.error('Failed to delete test');
        return;
      }
      
      setScheduledTests(prev => prev.filter(test => test.id !== id));
      toast.success('Test deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteTest:', error);
      toast.error('Failed to delete test');
    }
  };
  
  const handleToggleTestStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_tests')
        .update({ is_active: isActive })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating test status:', error);
        toast.error('Failed to update test status');
        return;
      }
      
      setScheduledTests(prev => 
        prev.map(test => 
          test.id === id ? { ...test, isActive } : test
        )
      );
      
      toast.success(`Test ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error in handleToggleTestStatus:', error);
      toast.error('Failed to update test status');
    }
  };
  
  const logout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
    toast.info('Logged out successfully');
  };
  
  // If the user is not admin, don't show the dashboard content
  if (currentUser.role !== 'admin') {
    return null; // Will be redirected by the useEffect
  }
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-medium">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>
      
      <DashboardStats 
        questionsCount={questions.length}
        usersCount={users.length}
        testResultsCount={testResults.length}
        scheduledTestsCount={scheduledTests.length}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schedule">Test Schedule</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading questions...</div>
          ) : (
            <QuestionsTab 
              questions={questions} 
              setQuestions={setQuestions}
              topics={topics}
              setTopics={setTopics}
            />
          )}
        </TabsContent>
        
        <TabsContent value="students">
          <StudentsTab users={users} setUsers={setUsers} />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScheduleTab 
            topics={topics}
            scheduledTests={scheduledTests}
            onScheduleTest={handleScheduleTest}
            onDeleteTest={handleDeleteTest}
            onToggleTestStatus={handleToggleTestStatus}
          />
        </TabsContent>
        
        <TabsContent value="results">
          <ResultsTab testResults={testResults} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
