
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { Question } from '@/types';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';

interface QuestionsListProps {
  questions: Question[];
  onDeleteQuestion: (id: string) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions, onDeleteQuestion }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Correct Option</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>{question.id.slice(0, 8)}</TableCell>
              <TableCell>
                {question.text.length > 50
                  ? `${question.text.slice(0, 50)}...`
                  : question.text}
              </TableCell>
              <TableCell>{question.topic || 'N/A'}</TableCell>
              <TableCell>Option {question.correctOption + 1}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteQuestion(question.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {questions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No questions added yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionsList;
