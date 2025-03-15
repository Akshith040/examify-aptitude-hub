
import React, { useState, useEffect } from 'react';
import { ClockIcon } from 'lucide-react';

interface TotalTestTimerProps {
  startTime: Date;
  isTestComplete: boolean;
  onTimeUpdate: (totalTime: number) => void;
}

const TotalTestTimer: React.FC<TotalTestTimerProps> = ({ 
  startTime, 
  isTestComplete,
  onTimeUpdate
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  useEffect(() => {
    if (isTestComplete) return;
    
    const timer = setInterval(() => {
      const currentTime = new Date();
      const timeElapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(timeElapsed);
      onTimeUpdate(timeElapsed);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, isTestComplete, onTimeUpdate]);
  
  // Format time as MM:SS or HH:MM:SS if hours > 0
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <ClockIcon className="h-4 w-4" />
      <span className="font-medium">Total Time: {formatTime(elapsedTime)}</span>
    </div>
  );
};

export default TotalTestTimer;
