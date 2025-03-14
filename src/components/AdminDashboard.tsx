
import React, { useState } from 'react';
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
import { User, Question, TestResult } from '@/types';
import { PlusIcon, Trash2Icon, FileSpreadsheetIcon, DownloadIcon, UsersIcon, FileTextIcon, BarChartIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [users, setUsers] = useState<User[]>(mockUsers.filter(user => user.role === 'student'));
  const [testResults] = useState<TestResult[]>(mockTestResults);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: ''
  });
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'student'
  });
  const [csvData, setCsvData] = useState('');
  
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // If not logged in or not admin, redirect to login
  React.useEffect(() => {
    if (!currentUser.id || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
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
  
  const addQuestion = () => {
    if (!newQuestion.text || newQuestion.options?.some(opt => !opt)) {
      toast.error('Please fill all the fields');
      return;
    }
    
    const question: Question = {
      id: (questions.length + 1).toString(),
      text: newQuestion.text || '',
      options: newQuestion.options || ['', '', '', ''],
      correctOption: newQuestion.correctOption || 0,
      explanation: newQuestion.explanation
    };
    
    setQuestions(prev => [...prev, question]);
    
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: ''
    });
    
    toast.success('Question added successfully');
  };
  
  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast.success('Question deleted successfully');
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
            explanation: cols[6] || ''
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
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
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
      </div>
      
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Questions from CSV</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Paste CSV data with columns: Question,Option1,Option2,Option3,Option4,CorrectOptionIndex,Explanation
                    </p>
                    <Textarea 
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="Paste CSV content here..."
                      rows={10}
                    />
                    <Button onClick={processCsvData}>Import Questions</Button>
                  </div>
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
                    <th className="h-10 px-4 text-left font-medium">Correct Option</th>
                    <th className="h-10 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr key={question.id} className="border-b">
                      <td className="p-2 align-middle">{question.id}</td>
                      <td className="p-2 align-middle">{question.text}</td>
                      <td className="p-2 align-middle">Option {question.correctOption + 1}: {question.options[question.correctOption]}</td>
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
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
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
