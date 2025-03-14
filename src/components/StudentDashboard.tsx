
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { mockTestResults } from '@/mock/data';
import { TestResult } from '@/types';
import { Brain, ClipboardList, LogOut, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const [testResults, setTestResults] = React.useState<TestResult[]>([]);
  
  // If not logged in, redirect to login
  React.useEffect(() => {
    if (!currentUser.id) {
      navigate('/');
    } else {
      // Filter test results for current user
      setTestResults(mockTestResults.filter(result => result.userId === currentUser.id));
    }
  }, [currentUser, navigate]);
  
  const startTest = () => {
    navigate('/student/test');
  };
  
  const logout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
    toast.info('Logged out successfully');
  };
  
  return (
    <div className="container mx-auto py-10 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium">Welcome, {currentUser.name || currentUser.username}</h1>
          <p className="text-muted-foreground">Access your aptitude tests and view your performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testResults.length}</div>
            <p className="text-xs text-muted-foreground">
              Tests completed so far
            </p>
          </CardContent>
        </Card>
        
        {testResults.length > 0 && (
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (testResults.reduce((acc, result) => acc + (result.score / result.totalQuestions), 0) / 
                   testResults.length) * 100
                )}%
              </div>
              <p className="text-xs text-muted-foreground">
                Your average test performance
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="md:col-span-2">
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle>Your Test History</CardTitle>
              <CardDescription>View your previous test attempts and scores</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Aptitude Test</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.testDate).toLocaleDateString()} at {new Date(result.testDate).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{result.score}/{result.totalQuestions}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((result.score / result.totalQuestions) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't taken any tests yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle>Take a Test</CardTitle>
              <CardDescription>
                Start a new aptitude test to assess your skills
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Each test has multiple-choice questions with a 1-minute time limit per question
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2" onClick={startTest}>
                Start Test <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
