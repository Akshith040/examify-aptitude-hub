
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TestResult, ScheduledTest } from '@/types';
import { DownloadIcon, FilterIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsTabProps {
  testResults: TestResult[];
}

const ResultsTab: React.FC<ResultsTabProps> = ({ testResults: initialTestResults }) => {
  const [testResults, setTestResults] = useState<TestResult[]>(initialTestResults);
  const [scheduledTests, setScheduledTests] = useState<ScheduledTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch scheduled tests to populate the filter
    fetchScheduledTests();
    // Set initial test results
    setTestResults(initialTestResults);
  }, [initialTestResults]);

  const fetchScheduledTests = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_tests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching scheduled tests:', error);
        return;
      }
      
      if (data) {
        const formattedTests: ScheduledTest[] = data.map(test => ({
          id: test.id,
          title: test.title,
          description: test.description,
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
    } catch (error) {
      console.error('Error fetching scheduled tests:', error);
    }
  };

  const filterResults = async (testId: string) => {
    setLoading(true);
    setSelectedTestId(testId);
    
    try {
      if (testId === 'all') {
        // Show all results
        setTestResults(initialTestResults);
      } else {
        // Filter by test ID
        const filtered = initialTestResults.filter(result => result.testId === testId);
        setTestResults(filtered);
      }
    } catch (error) {
      console.error('Error filtering results:', error);
      toast.error('Failed to filter results');
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    let csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Test,Test Date,Score,Total Questions,Time Spent\n"
      + testResults.map(result => {
          const testTitle = result.testId 
            ? scheduledTests.find(t => t.id === result.testId)?.title || 'Scheduled Test'
            : 'Practice Test';
            
          return `${result.userName},${testTitle},${new Date(result.testDate).toLocaleDateString()},${result.score},${result.totalQuestions},${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s`;
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Test Results</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedTestId}
              onValueChange={filterResults}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Filter by test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="practice">Practice Tests</SelectItem>
                {scheduledTests.map(test => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-8 gap-1" onClick={downloadResults}>
            <DownloadIcon className="h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Time Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading results...
                </TableCell>
              </TableRow>
            ) : testResults.length > 0 ? (
              testResults.map((result) => {
                const testTitle = result.testId 
                  ? scheduledTests.find(t => t.id === result.testId)?.title || 'Scheduled Test'
                  : 'Practice Test';
                
                return (
                  <TableRow key={result.id}>
                    <TableCell>{result.userName}</TableCell>
                    <TableCell>{testTitle}</TableCell>
                    <TableCell>{format(new Date(result.testDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <span className={result.score / result.totalQuestions >= 0.6 ? 'text-green-600' : 'text-red-600'}>
                        {result.score}/{result.totalQuestions}
                      </span>
                    </TableCell>
                    <TableCell>
                      {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No test results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ResultsTab;
