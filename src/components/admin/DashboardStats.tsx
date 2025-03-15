
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, FileTextIcon, BarChartIcon, CalendarIcon } from 'lucide-react';

interface DashboardStatsProps {
  questionsCount: number;
  usersCount: number;
  testResultsCount: number;
  scheduledTestsCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  questionsCount,
  usersCount,
  testResultsCount,
  scheduledTestsCount
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-4 mb-6">
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{questionsCount}</div>
          <p className="text-xs text-muted-foreground">
            Aptitude test questions in database
          </p>
        </CardContent>
      </Card>
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registered Students</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{usersCount}</div>
          <p className="text-xs text-muted-foreground">
            Students registered in the system
          </p>
        </CardContent>
      </Card>
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Test Attempts</CardTitle>
          <BarChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{testResultsCount}</div>
          <p className="text-xs text-muted-foreground">
            Total tests taken by students
          </p>
        </CardContent>
      </Card>
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scheduled Tests</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scheduledTestsCount}</div>
          <p className="text-xs text-muted-foreground">
            Upcoming and active tests
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
