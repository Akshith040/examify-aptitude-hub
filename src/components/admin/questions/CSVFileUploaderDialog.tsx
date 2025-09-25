// CSVFileUploaderDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Question } from '@/types';
import { FileUpIcon } from 'lucide-react';

interface CSVFileUploaderDialogProps {
  onQuestionsUploaded: (questions: Question[]) => void;
}

const CSVFileUploaderDialog: React.FC<CSVFileUploaderDialogProps> = ({ onQuestionsUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target) {
          const content = e.target.result as string;
          const lines = content.trim().split('\n');
          const questions: Question[] = [];
          
          // Check header
          const header = lines[0]?.trim().toLowerCase();
          if (!header.includes('question,option1,option2,option3,option4,correctoptionindex,explanation,topic')) {
            toast.error('CSV file format is incorrect. Please use the correct format.');
            setIsProcessing(false);
            return;
          }
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const cols = line.split(',');
            if (cols.length < 8) {
              toast.error(`Invalid row format at line ${i + 1}`);
              setIsProcessing(false);
              return;
            }
            
            try {
              const question: Question = {
                id: `temp-${i}`,
                text: cols[0].trim(),
                options: cols.slice(1, 5).map(opt => opt.trim()),
                correctOption: parseInt(cols[5].trim()),
                explanation: cols[6].trim() || undefined,
                topic: cols[7].trim() || undefined
              };
              
              questions.push(question);
            } catch (error) {
              toast.error(`Error processing row ${i + 1}: ${error.message}`);
              setIsProcessing(false);
              return;
            }
          }
          
          onQuestionsUploaded(questions);
          toast.success(`${questions.length} questions processed successfully`);
          setFile(null);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing CSV file:', error);
      toast.error('Failed to process CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileUpIcon className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Import Questions from CSV File</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4" id="dialog-description">
          <div>
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setFile(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isProcessing}>
              {isProcessing ? 'Processing...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVFileUploaderDialog;