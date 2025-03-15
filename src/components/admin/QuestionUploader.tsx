
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Question } from '@/types';

interface QuestionUploaderProps {
  onQuestionsUploaded: (questions: Question[]) => void;
}

const QuestionUploader: React.FC<QuestionUploaderProps> = ({ onQuestionsUploaded }) => {
  const [csvData, setCsvData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleProcess = () => {
    if (!csvData.trim()) {
      toast.error('Please paste CSV data');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Sample expected CSV format:
      // Question,Option1,Option2,Option3,Option4,CorrectOptionIndex,Explanation,Topic
      const lines = csvData.trim().split('\n');
      const questions: Question[] = [];
      let errorLines: number[] = [];
      
      // Skip header row if present
      const startIdx = lines[0].includes('Question,Option') ? 1 : 0;
      
      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        
        // Validate minimum required fields
        if (cols.length < 6) {
          errorLines.push(i+1);
          continue;
        }
        
        try {
          const correctOption = parseInt(cols[5]);
          if (isNaN(correctOption) || correctOption < 0 || correctOption > 3) {
            errorLines.push(i+1);
            continue;
          }
          
          const question: Question = {
            id: `temp-${i}`, // Temporary ID, will be replaced by database
            text: cols[0],
            options: [cols[1], cols[2], cols[3], cols[4]],
            correctOption: correctOption,
            explanation: cols[6] || undefined,
            topic: cols[7] || undefined
          };
          
          questions.push(question);
        } catch (error) {
          errorLines.push(i+1);
        }
      }
      
      if (questions.length === 0) {
        toast.error('No valid questions found in CSV data');
        return;
      }
      
      if (errorLines.length > 0) {
        toast.warning(`Found ${errorLines.length} invalid rows. Check lines: ${errorLines.join(', ')}`);
      }
      
      onQuestionsUploaded(questions);
      setCsvData('');
      toast.success(`${questions.length} questions processed successfully`);
    } catch (error) {
      console.error('Error processing CSV data:', error);
      toast.error('Failed to process CSV data. Check format and try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Paste CSV data with the following format:</p>
            <code className="block bg-muted p-2 rounded text-xs overflow-x-auto whitespace-pre">
              Question,Option1,Option2,Option3,Option4,CorrectOptionIndex,Explanation,Topic
            </code>
            <p className="mt-2">Example:</p>
            <code className="block bg-muted p-2 rounded text-xs overflow-x-auto whitespace-pre">
              What is 2+2?,2,3,4,5,2,The answer is 4 (index 2),Mathematics
            </code>
          </div>
          
          <Textarea 
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Paste CSV content here..."
            rows={10}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleProcess} disabled={isUploading} className="w-full">
          {isUploading ? (
            <>Processing...</>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" />
              Process Questions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionUploader;
