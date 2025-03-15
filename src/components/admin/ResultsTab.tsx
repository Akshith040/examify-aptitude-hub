
import React from 'react';
import { Button } from '@/components/ui/button';
import { TestResult } from '@/types';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ResultsTabProps {
  testResults: TestResult[];
}

const ResultsTab: React.FC<ResultsTabProps> = ({ testResults }) => {
  const downloadResults = () => {
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
  
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default ResultsTab;
