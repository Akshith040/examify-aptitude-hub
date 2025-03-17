
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Question, SupabaseQuestion } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import QuestionsList from './questions/QuestionsList';
import AddQuestionDialog from './questions/AddQuestionDialog';
import CSVUploaderDialog from './questions/CSVUploaderDialog';
import AddTopicDialog from './questions/AddTopicDialog';

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
      // Ensure correctOption is a number
      const correctOptionNumber = typeof newQuestion.correctOption === 'string' 
        ? parseInt(newQuestion.correctOption, 10) 
        : newQuestion.correctOption;
      
      const { data, error } = await supabase
        .from('questions')
        .insert({
          text: newQuestion.text,
          options: newQuestion.options,
          correct_option: correctOptionNumber,
          explanation: newQuestion.explanation,
          topic: newQuestion.topic
        })
        .select();
        
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const newQ: Question = {
          id: data[0].id,
          text: data[0].text,
          options: Array.isArray(data[0].options) 
            ? data[0].options 
            : (typeof data[0].options === 'string' 
                ? JSON.parse(data[0].options) 
                : Object.values(data[0].options).map(val => String(val))),
          correctOption: data[0].correct_option,
          explanation: data[0].explanation || undefined,
          topic: data[0].topic || undefined
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
      } else {
        toast.error('No data returned from the database');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question: ' + (error.message || 'Unknown error'));
    }
  };
  
  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };
  
  const handleBulkUpload = async (newQuestions: Question[]) => {
    try {
      const questionsToInsert = newQuestions.map(q => ({
        text: q.text,
        options: q.options,
        correct_option: q.correctOption,
        explanation: q.explanation,
        topic: q.topic
      }));
      
      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();
        
      if (error) throw error;
      
      if (data) {
        const addedQuestions: Question[] = data.map((q: SupabaseQuestion) => ({
          id: q.id,
          text: q.text,
          options: Array.isArray(q.options) 
            ? q.options 
            : (typeof q.options === 'string' 
                ? JSON.parse(q.options) 
                : Object.values(q.options).map(val => String(val))),
          correctOption: q.correct_option,
          explanation: q.explanation || undefined,
          topic: q.topic || undefined
        }));
        
        setQuestions(prev => [...prev, ...addedQuestions]);
        
        const newTopics = addedQuestions
          .map(q => q.topic)
          .filter((topic): topic is string => !!topic && !topics.includes(topic));
          
        if (newTopics.length > 0) {
          setTopics(prev => [...prev, ...newTopics]);
        }
        
        toast.success(`${addedQuestions.length} questions added successfully`);
      }
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-medium">Manage Questions</h2>
        <div className="flex space-x-2">
          <CSVUploaderDialog onQuestionsUploaded={handleBulkUpload} />
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
      
      <QuestionsList
        questions={questions}
        onDeleteQuestion={deleteQuestion}
      />
    </div>
  );
};

export default QuestionsTab;
