
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheetIcon } from 'lucide-react';
import QuestionUploader from '../QuestionUploader';
import { Question } from '@/types';

interface CSVUploaderDialogProps {
  onQuestionsUploaded: (questions: Question[]) => Promise<void>;
}

const CSVUploaderDialog: React.FC<CSVUploaderDialogProps> = ({ onQuestionsUploaded }) => {
  return (
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
        <QuestionUploader onQuestionsUploaded={onQuestionsUploaded} />
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploaderDialog;
