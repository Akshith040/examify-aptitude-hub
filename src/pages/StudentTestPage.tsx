
import { useEffect, useState } from "react";
import StudentTest from "@/components/StudentTest";
import { useSearchParams } from "react-router-dom";
import { ScheduledTest } from "@/types"; 
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StudentTestPage = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const [test, setTest] = useState<ScheduledTest | null>(null);
  const [loading, setLoading] = useState(Boolean(testId));
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only fetch test data if testId is provided
    if (testId) {
      fetchTestData(testId);
    }
  }, [testId]);
  
  const fetchTestData = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('scheduled_tests')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching test:', error);
        setError('Could not load test. It may have been deleted or is no longer available.');
        return;
      }
      
      if (!data) {
        setError('Test not found');
        return;
      }
      
      // Check if test is active
      const now = new Date();
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (!data.is_active) {
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
      
      // Format test data
      const formattedTest: ScheduledTest = {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date,
        duration: data.duration,
        topics: Array.isArray(data.topics) ? data.topics : [],
        questionCount: data.question_count,
        isActive: data.is_active,
        createdAt: data.created_at
      };
      
      setTest(formattedTest);
      
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
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

  return <StudentTest testId={testId || ""} scheduledTest={test} />;
};

export default StudentTestPage;
