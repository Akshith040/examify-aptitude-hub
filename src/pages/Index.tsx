
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { seedSupabase } from "@/utils/seedSupabase";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoggingInAsDemo, setIsLoggingInAsDemo] = useState(false);

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      toast.info("Starting database seeding process. This may take a while...");
      const result = await seedSupabase();
      if (result.success) {
        toast.success("Database seeded successfully!");
      } else {
        toast.error("Failed to seed database");
        console.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred while seeding the database");
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const loginAsDemo = async (role: 'admin' | 'student') => {
    try {
      setIsLoggingInAsDemo(true);
      toast.info(`Logging in as demo ${role}...`);
      
      // Store the user in localStorage for demo purposes
      const demoUser = {
        id: role === 'admin' ? 'demo-admin-id' : 'demo-student-id',
        email: role === 'admin' ? 'admin@example.com' : 'student@example.com',
        name: role === 'admin' ? 'Administrator' : 'Student',
        username: role.toLowerCase(),
        role: role
      };
      
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
      
      // Redirect to the appropriate dashboard
      window.location.href = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    } catch (error) {
      toast.error(`Failed to log in as demo ${role}`);
      console.error(error);
    } finally {
      setIsLoggingInAsDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-accent to-background p-4">
      <div className="w-full max-w-md mx-auto text-center mb-8 animate-fade-in animation-delay-100">
        <h1 className="text-4xl font-medium mb-2">Examify</h1>
        <p className="text-muted-foreground">Aptitude Testing Platform</p>
        
        <div className="mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => loginAsDemo('admin')} 
              disabled={isLoggingInAsDemo}
              className="w-full sm:w-auto"
            >
              Demo Admin Login
            </Button>
            <Button 
              onClick={() => loginAsDemo('student')} 
              disabled={isLoggingInAsDemo}
              className="w-full sm:w-auto"
              variant="outline"
            >
              Demo Student Login
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSeedDatabase} 
            disabled={isSeeding}
            className="w-full"
          >
            {isSeeding ? "Seeding Database..." : "Seed Database"}
          </Button>
          <p className="text-xs text-muted-foreground">
            This will populate the database with sample data
          </p>
        </div>
      </div>
      <AuthForm />
    </div>
  );
};

export default Index;
