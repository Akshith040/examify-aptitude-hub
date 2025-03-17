
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
      console.log('Fetching questions from Supabase...');
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*');
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }
      
      console.log('Questions data received:', questionsData);
      
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
        
        console.log('Formatted questions:', formattedQuestions);
        setQuestions(formattedQuestions);
        
        const allTopics = formattedQuestions
          .map(q => q.topic)
          .filter((topic): topic is string => !!topic);
        
        if (allTopics.length > 0) {
          setTopics([...new Set(allTopics)]);
        }
      }
      
      setUsers(mockUsers.filter(user => user.role === 'student'));
      setTestResults(mockTestResults);
      
      const mockScheduledTests: ScheduledTest[] = [
        {
          id: '1',
          title: 'Mid-term Assessment',
          description: 'Comprehensive test covering all topics from Quarter 1',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          duration: 90,
          topics: ['Mathematics', 'Science'],
          questionCount: 20,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Final Exam',
          description: 'Year-end comprehensive assessment',
          startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 35).toISOString(),
          duration: 120,
          topics: ['Mathematics', 'Science', 'English', 'History'],
          questionCount: 30,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      setScheduledTests(mockScheduledTests);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleTest = (test: Omit<ScheduledTest, 'id'>) => {
    const newTest: ScheduledTest = {
      ...test,
      id: `test-${Date.now()}`
    };
    
    setScheduledTests(prev => [...prev, newTest]);
    toast.success('Test scheduled successfully');
  };
  
  const handleDeleteTest = (id: string) => {
    setScheduledTests(prev => prev.filter(test => test.id !== id));
    toast.success('Test deleted successfully');
  };
  
  const handleToggleTestStatus = (id: string, isActive: boolean) => {
    setScheduledTests(prev => 
      prev.map(test => 
        test.id === id ? { ...test, isActive } : test
      )
    );
    
    toast.success(`Test ${isActive ? 'activated' : 'deactivated'} successfully`);
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
