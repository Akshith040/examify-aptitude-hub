// QuestionsTab.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { toast } from 'sonner';
import { Question } from '@/types';
import { DatabaseService } from '@/lib/database-service';
import QuestionsList from './questions/QuestionsList';
import AddQuestionDialog from './questions/AddQuestionDialog';
import CSVFileUploaderDialog from './questions/CSVFileUploaderDialog';
import AddTopicDialog from './questions/AddTopicDialog';
import { Trash2Icon } from 'lucide-react';

interface QuestionsTabProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  topics: string[];
  setTopics: React.Dispatch<React.SetStateAction<string[]>>;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({ 
  questions, 
  setQuestions, 
  topics, 
  setTopics 
}) => {
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    topic: ''
  });
  
  const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);

  const handleQuestionChange = (field: string, value: string | number) => {
    setNewQuestion(prev => ({ ...prev, [field]: value }));
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions[index] = value;
    setNewQuestion(prev => ({ ...prev, options: newOptions }));
  };
  
  const addQuestion = async () => {
    if (!newQuestion.text || newQuestion.options?.some(opt => !opt)) {
      toast.error('Please fill all the fields');
      return;
    }
    
    try {
      const correctOptionNumber = typeof newQuestion.correctOption === 'string' 
        ? parseInt(newQuestion.correctOption, 10) 
        : newQuestion.correctOption;
      
      const questionId = await DatabaseService.createQuestion({
        text: newQuestion.text!,
        options: newQuestion.options!,
        correctOption: correctOptionNumber!,
        explanation: newQuestion.explanation,
        topic: newQuestion.topic
      });
      
      const newQ: Question = {
        id: questionId,
        text: newQuestion.text!,
        options: newQuestion.options!,
        correctOption: correctOptionNumber!,
        explanation: newQuestion.explanation,
        topic: newQuestion.topic
      };
      
      setQuestions(prev => [...prev, newQ]);
      
      if (newQuestion.topic && !topics.includes(newQuestion.topic as string)) {
        setTopics(prev => [...prev, newQuestion.topic as string]);
      }
      
      setNewQuestion({
        text: '',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        topic: ''
      });
      
      toast.success('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  
  const deleteQuestion = async (id: string) => {
    try {
      await DatabaseService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };
  
  const handleBulkUpload = async (newQuestions: Question[]) => {
    try {
      const addedQuestions: Question[] = [];
      
      for (const question of newQuestions) {
        const questionId = await DatabaseService.createQuestion({
          text: question.text,
          options: question.options,
          correctOption: question.correctOption,
          explanation: question.explanation,
          topic: question.topic
        });
        
        addedQuestions.push({
          ...question,
          id: questionId
        });
      }
      
      setQuestions(prev => [...prev, ...addedQuestions]);
      
      const newTopics = addedQuestions
        .map(q => q.topic)
        .filter((topic): topic is string => !!topic && !topics.includes(topic));
        
      if (newTopics.length > 0) {
        setTopics(prev => [...prev, ...newTopics]);
      }
      
      toast.success(`${addedQuestions.length} questions added successfully`);
    } catch (error) {
      console.error('Error adding questions:', error);
      toast.error('Failed to add questions');
    }
  };
  
  const handleAddNewTopic = (topic: string) => {
    if (topic) {
      setTopics(prev => [...prev, topic]);
    }
  };
  
  const handleDeleteTopic = (topicToDelete: string) => {
    setTopics(prevTopics => prevTopics.filter(topic => topic !== topicToDelete));
    setQuestions(prevQuestions => prevQuestions.map(question => {
      if (question.topic === topicToDelete) {
        return { ...question, topic: '' };
      }
      return question;
    }));
    toast.success(`Topic "${topicToDelete}" deleted`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-medium">Manage Questions</h2>
        <div className="flex space-x-2">
          <CSVFileUploaderDialog onQuestionsUploaded={handleBulkUpload} />
          <AddQuestionDialog
            newQuestion={newQuestion}
            topics={topics}
            onQuestionChange={handleQuestionChange}
            onOptionChange={handleOptionChange}
            onAddQuestion={addQuestion}
            onOpenNewTopicDialog={() => setNewTopicDialogOpen(true)}
          />
        </div>
      </div>
      
      <AddTopicDialog
        open={newTopicDialogOpen}
        onOpenChange={setNewTopicDialogOpen}
        topics={topics}
        onAddTopic={handleAddNewTopic}
      />
      
      <div className="mt-4">
        <h2 className="text-xl font-medium">Topics</h2>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <div key={topic} className="flex items-center gap-1 bg-muted/50 p-2 rounded-md">
              <span>{topic}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTopic(topic)}
                className="text-destructive"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <QuestionsList
        questions={questions}
        onDeleteQuestion={deleteQuestion}
      />
    </div>
  );
};

export default QuestionsTab;