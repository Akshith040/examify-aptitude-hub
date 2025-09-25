
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Question } from '@/types';

interface AddQuestionFormProps {
  newQuestion: Partial<Question>;
  topics: string[];
  onQuestionChange: (field: string, value: string | number) => void;
  onOptionChange: (index: number, value: string) => void;
  onAddQuestion: () => void;
  onOpenNewTopicDialog: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({
  newQuestion,
  topics,
  onQuestionChange,
  onOptionChange,
  onAddQuestion,
  onOpenNewTopicDialog,
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={newQuestion.text}
          onChange={(e) => onQuestionChange('text', e.target.value)}
          placeholder="Enter question text"
        />
      </div>
      
      <div className="space-y-4">
        <Label>Options</Label>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={newQuestion.options?.[i] || ''}
              onChange={(e) => onOptionChange(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
            <div className="w-20">
              <Label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={newQuestion.correctOption === i}
                  onChange={() => onQuestionChange('correctOption', i)}
                />
                <span>Correct</span>
              </Label>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="topic">Topic</Label>
          <Button 
            type="button" 
            size="sm" 
            variant="outline"
            onClick={onOpenNewTopicDialog}
          >
            Add New Topic
          </Button>
        </div>
        <Select
          value={newQuestion.topic as string || ''}
          onValueChange={value => onQuestionChange('topic', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map(topic => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          value={newQuestion.explanation || ''}
          onChange={(e) => onQuestionChange('explanation', e.target.value)}
          placeholder="Explanation for the correct answer"
        />
      </div>
      
      <Button onClick={onAddQuestion}>Add Question</Button>
    </div>
  );
};

export default AddQuestionForm;
