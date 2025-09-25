
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Question } from '@/types';
import AddQuestionForm from './AddQuestionForm';

interface AddQuestionDialogProps {
  newQuestion: Partial<Question>;
  topics: string[];
  onQuestionChange: (field: string, value: string | number) => void;
  onOptionChange: (index: number, value: string) => void;
  onAddQuestion: () => void;
  onOpenNewTopicDialog: () => void;
}

const AddQuestionDialog: React.FC<AddQuestionDialogProps> = ({
  newQuestion,
  topics,
  onQuestionChange,
  onOptionChange,
  onAddQuestion,
  onOpenNewTopicDialog,
}) => {
  return (
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
        <AddQuestionForm
          newQuestion={newQuestion}
          topics={topics}
          onQuestionChange={onQuestionChange}
          onOptionChange={onOptionChange}
          onAddQuestion={onAddQuestion}
          onOpenNewTopicDialog={onOpenNewTopicDialog}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionDialog;
