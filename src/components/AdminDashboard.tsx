import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { mockUsers, mockTestResults } from '@/mock/data';
import { User, Question, TestResult, ScheduledTest } from '@/types';
import { DatabaseService } from '@/lib/database-service';
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
      console.log('Fetching questions from database...');
      const questionsData = await DatabaseService.getQuestions();
      setQuestions(questionsData);
      
      // Get topics from questions
      const allTopics = await DatabaseService.getTopics();
      if (allTopics.length > 0) {
        setTopics(allTopics);
      }
      
      // Fetch scheduled tests
      const testsData = await DatabaseService.getScheduledTests();
      setScheduledTests(testsData);
      
      // Fetch test results
      const resultsData = await DatabaseService.getTestResults();
      setTestResults(resultsData);
      
      // Fetch users
      const usersData = await DatabaseService.getUsers();
      setUsers(usersData.filter(user => user.role === 'student'));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleTest = async (test: Omit<ScheduledTest, 'id' | 'createdAt'>) => {
    try {
      console.log('Scheduling test with data:', test);
      
      const testId = await DatabaseService.createScheduledTest({
        ...test,
        isActive: true
      });
      
      // Refresh the scheduled tests list
      const updatedTests = await DatabaseService.getScheduledTests();
      setScheduledTests(updatedTests);
      
      toast.success('Test scheduled successfully');
    } catch (error) {
      console.error('Error in handleScheduleTest:', error);
      toast.error('Failed to schedule test');
    }
  };
  
  const handleDeleteTest = async (id: string) => {
    try {
      await DatabaseService.deleteScheduledTest(id);
      setScheduledTests(prev => prev.filter(test => test.id !== id));
      toast.success('Test deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteTest:', error);
      toast.error('Failed to delete test');
    }
  };
  
  const handleToggleTestStatus = async (id: string, isActive: boolean) => {
    try {
      await DatabaseService.updateScheduledTest(id, { isActive });
      
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
