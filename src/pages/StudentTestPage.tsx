
import { useEffect, useState } from "react";
import StudentTest from "@/components/StudentTest";
import { useSearchParams } from "react-router-dom";
import { ScheduledTest } from "@/types"; 
import { DatabaseService } from "@/lib/database-service";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const StudentTestPage = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const [test, setTest] = useState<ScheduledTest | null>(null);
  const [loading, setLoading] = useState(Boolean(testId));
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  useEffect(() => {
    // Only fetch test data if testId is provided and not attempted yet
    if (testId && !fetchAttempted) {
      fetchTestData(testId);
    }
  }, [testId, fetchAttempted]);
  
  const fetchTestData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setFetchAttempted(true);
      
      console.log("Fetching test data for ID:", id);
      
      const data = await DatabaseService.getScheduledTestById(id);
        
      if (!data) {
        setError('Test not found');
        toast.error('Test not found');
        return;
      }
      
      console.log("Test data received:", data);
      
      // Check if test is active
      const now = new Date();
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (!data.isActive) {
        setError('This test has been deactivated by the administrator.');
        return;
      }
      
      if (now < startDate) {
        setError(`This test is not available yet. It will become available on ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}.`);
        return;
      }
      
      if (now > endDate) {
        setError('This test has expired and is no longer available.');
        return;
      }
      
      // Test data is already formatted by DatabaseService
      const formattedTest: ScheduledTest = data;
      
      // Ensure topics is an array and not empty
      if (!formattedTest.topics || formattedTest.topics.length === 0) {
        console.error('Test does not have any topics assigned:', formattedTest);
        setError('This test does not have any topics assigned. Please contact your administrator.');
        return;
      }
      
      console.log("Formatted test data:", formattedTest);
      setTest(formattedTest);
      
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to load test');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 animate-fade-in">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10 animate-fade-in">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-10 text-center">
            <h2 className="text-2xl font-medium mb-4">Test Unavailable</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
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

  // Pass the correct props to StudentTest component
  return <StudentTest testId={testId || ""} scheduledTest={test} />;
};

export default StudentTestPage;
