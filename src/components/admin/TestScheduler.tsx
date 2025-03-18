import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScheduledTest } from '@/types';
import { toast } from 'sonner';

interface TestSchedulerProps {
  topics: string[];
  onScheduleTest: (test: Omit<ScheduledTest, 'id'>) => void;
}

const TestScheduler: React.FC<TestSchedulerProps> = ({ topics, onScheduleTest }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [duration, setDuration] = useState(60); // Default 60 minutes
  const [questionCount, setQuestionCount] = useState(10); // Default 10 questions
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate || duration <= 0 || questionCount <= 0) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newTest = {
        title,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration,
        questionCount,
        topics: selectedTopics,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Call the parent handler which will insert into Supabase
      onScheduleTest(newTest);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStartDate(undefined);
      setEndDate(undefined);
      setDuration(60);
      setQuestionCount(10);
      setSelectedTopics([]);
      
    } catch (error) {
      console.error('Error scheduling test:', error);
      toast.error('Failed to schedule test');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a New Test</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Test Title*</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter test description..." 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => {
                      // Disable dates before start date
                      return startDate ? date < startDate : false;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)*</Label>
              <Input 
                id="duration" 
                type="number" 
                min={1} 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="questionCount">Number of Questions*</Label>
              <Input 
                id="questionCount" 
                type="number" 
                min={1} 
                max={100}
                value={questionCount} 
                onChange={(e) => setQuestionCount(parseInt(e.target.value))} 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Topics*</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map((topic) => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`topic-${topic}`} 
                    checked={selectedTopics.includes(topic)} 
                    onCheckedChange={() => handleTopicToggle(topic)} 
                  />
                  <Label htmlFor={`topic-${topic}`} className="cursor-pointer">{topic}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Test'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TestScheduler;
