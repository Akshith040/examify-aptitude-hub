// In QuestionTimer.tsx
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from "@/lib/utils";

interface QuestionTimerProps {
  duration: number; // Duration in seconds
  onTimeUp: () => void;
}

const QuestionTimer: React.FC<QuestionTimerProps> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  
  useEffect(() => {
    let timerId: number;
    
    if (isRunning && timeLeft > 0) {
      timerId = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onTimeUp();
    }
    
    return () => {
      clearInterval(timerId);
    };
  }, [isRunning, timeLeft, onTimeUp]);
  
  useEffect(() => {
    // Reset timer when duration changes (new question)
    setTimeLeft(duration);
    setIsRunning(true);
  }, [duration]);
  
  const progressPercentage = (timeLeft / duration) * 100;
  
  // Determine color based on time left
  const getColorClass = () => {
    if (timeLeft > duration * 0.6) return 'bg-primary';
    if (timeLeft > duration * 0.3) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Time Remaining</span>
        <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-500 animate-pulse-soft' : ''}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className={cn("h-2 transition-all duration-200 ease-linear", getColorClass())}
      />
    </div>
  );
};

export default QuestionTimer;