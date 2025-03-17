import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Question, SupabaseQuestion } from '@/types';
import { FileSpreadsheetIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import QuestionUploader from './QuestionUploader';

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
  
  const handleQuestionChange = (field: string, value: string) => {
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
      const { data, error } = await supabase
        .from('questions')
        .insert({
          text: newQuestion.text,
          options: newQuestion.options,
          correct_option: newQuestion.correctOption,
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
        
        if (newQuestion.topic && !topics.includes(newQuestion.topic)) {
          setTopics(prev => [...prev, newQuestion.topic!]);
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-medium">Manage Questions</h2>
        <div className="flex space-x-2">
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
              <QuestionUploader onQuestionsUploaded={handleBulkUpload} />
            </DialogContent>
          </Dialog>
          
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
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.text}
                    onChange={(e) => handleQuestionChange('text', e.target.value)}
                    placeholder="Enter question text"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Options</Label>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={newQuestion.options?.[i] || ''}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                      />
                      <div className="w-20">
                        <Label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            checked={newQuestion.correctOption === i}
                            onChange={() => handleQuestionChange('correctOption', i.toString())}
                          />
                          <span>Correct</span>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={newQuestion.topic || ''}
                    onChange={(e) => handleQuestionChange('topic', e.target.value)}
                    placeholder="Enter topic (e.g., Mathematics, Science)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={newQuestion.explanation || ''}
                    onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                    placeholder="Explanation for the correct answer"
                  />
                </div>
                
                <Button onClick={addQuestion}>Add Question</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left font-medium">ID</th>
                <th className="h-10 px-4 text-left font-medium">Question</th>
                <th className="h-10 px-4 text-left font-medium">Topic</th>
                <th className="h-10 px-4 text-left font-medium">Correct Option</th>
                <th className="h-10 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="border-b">
                  <td className="p-2 align-middle">{question.id.slice(0, 8)}</td>
                  <td className="p-2 align-middle">
                    {question.text.length > 50
                      ? `${question.text.slice(0, 50)}...`
                      : question.text}
                  </td>
                  <td className="p-2 align-middle">{question.topic || 'N/A'}</td>
                  <td className="p-2 align-middle">Option {question.correctOption + 1}</td>
                  <td className="p-2 align-middle">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuestion(question.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No questions added yet
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

export default QuestionsTab;
