
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScheduledTest } from '@/types';
import { Trash2Icon, FileTextIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledTestListProps {
  tests: ScheduledTest[];
  onDeleteTest: (id: string) => void;
  onToggleTestStatus: (id: string, isActive: boolean) => void;
}

const ScheduledTestList: React.FC<ScheduledTestListProps> = ({ 
  tests,
  onDeleteTest,
  onToggleTestStatus
}) => {
  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <FileTextIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <h3 className="text-lg font-medium">No tests scheduled</h3>
            <p className="text-sm">Create a new test using the test scheduler.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test) => {
            const now = new Date();
            const startDate = new Date(test.startDate);
            const endDate = new Date(test.endDate);
            
            let status: 'scheduled' | 'active' | 'ended' = 'scheduled';
            if (now > endDate) status = 'ended';
            else if (now >= startDate) status = 'active';
            
            return (
              <div 
                key={test.id} 
                className="p-4 border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="space-y-2 w-full sm:w-auto">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{test.title}</h3>
                    <Badge variant={
                      status === 'active' ? 'default' : 
                      status === 'scheduled' ? 'outline' : 'secondary'
                    }>
                      {status === 'active' ? 'In Progress' : 
                       status === 'scheduled' ? 'Upcoming' : 'Completed'}
                    </Badge>
                    {!test.isActive && (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>{format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}</div>
                    <div className="mt-1">
                      Duration: {test.duration} min • Questions: {test.questionCount} • 
                      Topics: {test.topics.join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={test.isActive} 
                      onCheckedChange={(checked) => onToggleTestStatus(test.id, checked)}
                      disabled={status === 'ended'}
                    />
                    <span className="text-sm">{test.isActive ? 'Active' : 'Disabled'}</span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteTest(test.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduledTestList;
