
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockUsers, mockQuestions, mockTestResults } from '@/mock/data';
import { User, Question, TestResult, ScheduledTest } from '@/types';
import { PlusIcon, Trash2Icon, FileSpreadsheetIcon, DownloadIcon, UsersIcon, FileTextIcon, BarChartIcon, CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import QuestionUploader from './admin/QuestionUploader';
import TestScheduler from './admin/TestScheduler';
import ScheduledTestList from './admin/ScheduledTestList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [scheduledTests, setScheduledTests] = useState<ScheduledTest[]>([]);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    topic: ''
  });
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'student'
  });
  const [csvData, setCsvData] = useState('');
  const [topics, setTopics] = useState<string[]>(['Mathematics', 'Science', 'English', 'History', 'Geography', 'General Knowledge']);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // If not logged in or not admin, redirect to login
  useEffect(() => {
    if (!currentUser.id || currentUser.role !== 'admin') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [currentUser, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*');
      
      if (questionsError) throw questionsError;
      if (questionsData) {
        const formattedQuestions: Question[] = questionsData.map(q => ({
          id: q.id,
          text: q.text,
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
        
        // Extract unique topics
        const allTopics = formattedQuestions
          .map(q => q.topic)
          .filter((topic): topic is string => !!topic);
        
        if (allTopics.length > 0) {
          setTopics([...new Set(allTopics)]);
        }
      }
      
      // For demo purposes, use mock data for users and test results
      setUsers(mockUsers.filter(user => user.role === 'student'));
      setTestResults(mockTestResults);
      
      // Mock scheduled tests for demo
      const mockScheduledTests: ScheduledTest[] = [
        {
          id: '1',
          title: 'Mid-term Assessment',
          description: 'Comprehensive test covering all topics from Quarter 1',
          startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          endDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
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
          startDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
          endDate: new Date(Date.now() + 86400000 * 35).toISOString(), // 35 days from now
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
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuestionChange = (field: string, value: string) => {
    setNewQuestion(prev => ({ ...prev, [field]: value }));
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions[index] = value;
    setNewQuestion(prev => ({ ...prev, options: newOptions }));
  };
  
  const handleUserChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };
  
  const addQuestion = async () => {
    if (!newQuestion.text || newQuestion.options?.some(opt => !opt)) {
      toast.error('Please fill all the fields');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          text: newQuestion.text,
          options: newQuestion.options,
          correct_option: newQuestion.correctOption,
          explanation: newQuestion.explanation,
          topic: newQuestion.topic
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newQ: Question = {
          id: data.id,
          text: data.text,
          options: Array.isArray(data.options) 
            ? data.options 
            : (typeof data.options === 'string' 
                ? JSON.parse(data.options) 
                : Object.values(data.options).map(val => String(val))),
          correctOption: data.correct_option,
          explanation: data.explanation,
          topic: data.topic
        };
        
        setQuestions(prev => [...prev, newQ]);
        
        // If it's a new topic, add it to the topics list
        if (newQuestion.topic && !topics.includes(newQuestion.topic)) {
          setTopics(prev => [...prev, newQuestion.topic!]);
        }
        
        setNewQuestion({
          text: '',
          options: ['', '', '', ''],
          correctOption: 0,
          explanation: '',
          topic: ''
        });
        
        toast.success('Question added successfully');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };
  
  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };
  
  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast.error('Please fill all the required fields');
      return;
    }
    
    const user: User = {
      id: (users.length + 1).toString(),
      username: newUser.username || '',
      password: newUser.password || '',
      name: newUser.name,
      email: newUser.email,
      role: 'student'
    };
    
    setUsers(prev => [...prev, user]);
    
    setNewUser({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'student'
    });
    
    toast.success('Student added successfully');
  };
  
  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('Student deleted successfully');
  };
  
  const processCsvData = () => {
    if (!csvData.trim()) {
      toast.error('Please paste CSV data');
      return;
    }
    
    try {
      // Simple CSV parsing (in a real app, use a proper CSV parser)
      const lines = csvData.trim().split('\n');
      const newQuestions: Question[] = [];
      
      for (let i = 1; i < lines.length; i++) { // Skip header row
        const cols = lines[i].split(',');
        if (cols.length >= 6) {
          newQuestions.push({
            id: (questions.length + i).toString(),
            text: cols[0],
            options: [cols[1], cols[2], cols[3], cols[4]],
            correctOption: parseInt(cols[5]),
            explanation: cols[6] || '',
            topic: cols[7] || undefined
          });
        }
      }
      
      if (newQuestions.length === 0) {
        toast.error('No valid questions found in CSV');
        return;
      }
      
      setQuestions(prev => [...prev, ...newQuestions]);
      setCsvData('');
      toast.success(`${newQuestions.length} questions imported successfully`);
    } catch (error) {
      toast.error('Failed to process CSV data');
      console.error(error);
    }
  };

  const handleBulkUpload = async (newQuestions: Question[]) => {
    try {
      // Convert questions to Supabase format
      const questionsToInsert = newQuestions.map(q => ({
        text: q.text,
        options: q.options,
        correct_option: q.correctOption,
        explanation: q.explanation,
        topic: q.topic
      }));
      
      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();
        
      if (error) throw error;
      
      if (data) {
        const addedQuestions: Question[] = data.map(q => ({
          id: q.id,
          text: q.text,
          options: Array.isArray(q.options) 
            ? q.options 
            : (typeof q.options === 'string' 
                ? JSON.parse(q.options) 
                : Object.values(q.options).map(val => String(val))),
          correctOption: q.correct_option,
          explanation: q.explanation,
          topic: q.topic
        }));
        
        setQuestions(prev => [...prev, ...addedQuestions]);
        
        // Update topics list with any new topics
        const newTopics = addedQuestions
          .map(q => q.topic)
          .filter((topic): topic is string => !!topic && !topics.includes(topic));
          
        if (newTopics.length > 0) {
          setTopics(prev => [...prev, ...newTopics]);
        }
        
        toast.success(`${addedQuestions.length} questions added successfully`);
      }
    } catch (error) {
      console.error('Error adding questions:', error);
      toast.error('Failed to add questions');
    }
  };
  
  const handleScheduleTest = (test: Omit<ScheduledTest, 'id'>) => {
    // For demo, assign a random ID
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
  
  const downloadResults = () => {
    // In a real app, this would generate a CSV/Excel file
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Test Date,Score,Total Questions,Time Spent\n"
      + testResults.map(result => {
          return `${result.userName},${new Date(result.testDate).toLocaleDateString()},${result.score},${result.totalQuestions},${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "test_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Results exported successfully');
  };
  
  const logout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
    toast.info('Logged out successfully');
  };
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-medium">Admin Dashboard</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              Aptitude test questions in database
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Students</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Students registered in the system
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Attempts</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testResults.length}</div>
            <p className="text-xs text-muted-foreground">
              Total tests taken by students
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Tests</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledTests.length}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming and active tests
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schedule">Test Schedule</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-medium">Manage Questions</h2>
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1">
                    <FileSpreadsheetIcon className="h-4 w-4" />
                    Import CSV
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Questions from CSV</DialogTitle>
                  </DialogHeader>
                  <QuestionUploader onQuestionsUploaded={handleBulkUpload} />
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1">
                    <PlusIcon className="h-4 w-4" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        value={newQuestion.text}
                        onChange={(e) => handleQuestionChange('text', e.target.value)}
                        placeholder="Enter question text"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Options</Label>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={newQuestion.options?.[i] || ''}
                            onChange={(e) => handleOptionChange(i, e.target.value)}
                            placeholder={`Option ${i + 1}`}
                          />
                          <div className="w-20">
                            <Label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={newQuestion.correctOption === i}
                                onChange={() => handleQuestionChange('correctOption', i.toString())}
                              />
                              <span>Correct</span>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <Input
                        id="topic"
                        value={newQuestion.topic || ''}
                        onChange={(e) => handleQuestionChange('topic', e.target.value)}
                        placeholder="Enter topic (e.g., Mathematics, Science)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="explanation">Explanation (Optional)</Label>
                      <Textarea
                        id="explanation"
                        value={newQuestion.explanation || ''}
                        onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                        placeholder="Explanation for the correct answer"
                      />
                    </div>
                    
                    <Button onClick={addQuestion}>Add Question</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">ID</th>
                    <th className="h-10 px-4 text-left font-medium">Question</th>
                    <th className="h-10 px-4 text-left font-medium">Topic</th>
                    <th className="h-10 px-4 text-left font-medium">Correct Option</th>
                    <th className="h-10 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr key={question.id} className="border-b">
                      <td className="p-2 align-middle">{question.id.slice(0, 8)}</td>
                      <td className="p-2 align-middle">
                        {question.text.length > 50
                          ? `${question.text.slice(0, 50)}...`
                          : question.text}
                      </td>
                      <td className="p-2 align-middle">{question.topic || 'N/A'}</td>
                      <td className="p-2 align-middle">Option {question.correctOption + 1}</td>
                      <td className="p-2 align-middle">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion(question.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No questions added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-medium">Manage Students</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusIcon className="h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username*</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => handleUserChange('username', e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password*</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => handleUserChange('password', e.target.value)}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name*</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => handleUserChange('name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => handleUserChange('email', e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  
                  <Button onClick={addUser}>Add Student</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">ID</th>
                    <th className="h-10 px-4 text-left font-medium">Username</th>
                    <th className="h-10 px-4 text-left font-medium">Name</th>
                    <th className="h-10 px-4 text-left font-medium">Email</th>
                    <th className="h-10 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2 align-middle">{user.id}</td>
                      <td className="p-2 align-middle">{user.username}</td>
                      <td className="p-2 align-middle">{user.name}</td>
                      <td className="p-2 align-middle">{user.email}</td>
                      <td className="p-2 align-middle">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(user.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No students added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TestScheduler topics={topics} onScheduleTest={handleScheduleTest} />
            </div>
            <div>
              <ScheduledTestList 
                tests={scheduledTests}
                onDeleteTest={handleDeleteTest}
                onToggleTestStatus={handleToggleTestStatus}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-medium">Test Results</h2>
            <Button size="sm" className="h-8 gap-1" onClick={downloadResults}>
              <DownloadIcon className="h-4 w-4" />
              Export Results
            </Button>
          </div>
          
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">ID</th>
                    <th className="h-10 px-4 text-left font-medium">Student</th>
                    <th className="h-10 px-4 text-left font-medium">Date</th>
                    <th className="h-10 px-4 text-left font-medium">Score</th>
                    <th className="h-10 px-4 text-left font-medium">Time Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result) => (
                    <tr key={result.id} className="border-b">
                      <td className="p-2 align-middle">{result.id}</td>
                      <td className="p-2 align-middle">{result.userName}</td>
                      <td className="p-2 align-middle">{new Date(result.testDate).toLocaleDateString()}</td>
                      <td className="p-2 align-middle">
                        <span className={result.score / result.totalQuestions >= 0.6 ? 'text-green-600' : 'text-red-600'}>
                          {result.score}/{result.totalQuestions}
                        </span>
                      </td>
                      <td className="p-2 align-middle">
                        {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                      </td>
                    </tr>
                  ))}
                  {testResults.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No test results yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
