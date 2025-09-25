
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TestResult, ScheduledTest } from '@/types';
import { Brain, ClipboardList, LogOut, ArrowRight, Calendar } from 'lucide-react';
import { DatabaseService } from '@/lib/database-service';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [scheduledTests, setScheduledTests] = useState<ScheduledTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  
  // If not logged in or is admin, redirect appropriately
  useEffect(() => {
    if (!currentUser.id) {
      navigate('/');
      return;
    } 
    
    if (currentUser.role === 'admin') {
      // If admin is trying to access student dashboard, redirect to admin dashboard
      console.log("Admin user attempting to access student dashboard. Redirecting...");
      navigate('/admin/dashboard');
      return;
    }
    
    // Only fetch results if user is a student
    fetchTestResults();
    fetchScheduledTests();
  }, [currentUser.id, currentUser.role, navigate]);

  const fetchTestResults = async () => {
    try {
      setIsLoading(true);
      
      // Fetch test results for current user
      const results = await DatabaseService.getTestResults(currentUser.id);
      setTestResults(results);
    } catch (error) {
      console.error('Error fetching test results:', error);
      toast.error('Failed to load test results');
      setTestResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScheduledTests = async () => {
    try {
      // Fetch active scheduled tests
      const tests = await DatabaseService.getActiveScheduledTests();
      setScheduledTests(tests);
    } catch (error) {
      console.error('Error fetching scheduled tests:', error);
      toast.error('Failed to load scheduled tests');
      setScheduledTests([]);
    }
  };
  
  const startTest = () => {
    navigate('/student/test');
  };
  
  const startScheduledTest = (testId: string) => {
    navigate(`/student/test?testId=${testId}`);
  };
  
  const logout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
    toast.info('Logged out successfully');
  };


  
  // If the user is admin, don't show the dashboard content
  if (currentUser.role === 'admin') {
    return null; // Will be redirected by the useEffect
  }
  
  return (
    <div className="container mx-auto py-10 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium">Welcome, {currentUser.name || currentUser.username}</h1>
          <p className="text-muted-foreground">Access your aptitude tests and view your performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
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
        
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Tests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledTests.length}</div>
            <p className="text-xs text-muted-foreground">
              Tests available to take
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="md:col-span-2">
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle>Your Test History</CardTitle>
              <CardDescription>View your previous test attempts and scores</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading test results...</p>
                </div>
              ) : testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {result.testId ? 'Scheduled Test' : 'Aptitude Test'}
                        </p>
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
      
      {/* Scheduled Tests Section */}
      <Card className="glass-panel mb-8">
        <CardHeader>
          <CardTitle>Scheduled Tests</CardTitle>
          <CardDescription>Available tests that have been scheduled for you</CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledTests.length > 0 ? (
            <div className="space-y-4">
              {scheduledTests.map((test) => {
                const now = new Date();
                const startDate = new Date(test.startDate);
                const endDate = new Date(test.endDate);
                const isActive = now >= startDate && now <= endDate;
                
                return (
                  <div key={test.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{test.title}</h3>
                          {isActive ? (
                            <Badge>Available Now</Badge>
                          ) : (
                            <Badge variant="outline">Upcoming</Badge>
                          )}
                        </div>
                        {test.description && (
                          <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        disabled={!isActive}
                        onClick={() => startScheduledTest(test.id)}
                      >
                        {isActive ? 'Start Test' : 'Not Available Yet'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Available:</span>
                        <p>{format(startDate, 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <p>{format(endDate, 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p>{test.duration} minutes</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Questions:</span>
                        <p>{test.questionCount}</p>
                      </div>
                    </div>
                    {test.topics.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-muted-foreground">Topics:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {test.topics.map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
              <h3 className="text-lg font-medium">No Scheduled Tests</h3>
              <p className="text-sm text-muted-foreground">
                There are currently no tests scheduled for you
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
