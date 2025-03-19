
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { seedSupabase } from "@/utils/seedSupabase";
import { toast } from "sonner";
import { useState } from "react";

const Index = () => {
  const [isSeeding, setIsSeeding] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-accent to-background p-4">
      <div className="w-full max-w-md mx-auto text-center mb-8 animate-fade-in animation-delay-100">
        <h1 className="text-4xl font-medium mb-2">Examify</h1>
        <p className="text-muted-foreground">Aptitude Testing Platform</p>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={handleSeedDatabase} 
            disabled={isSeeding}
            className="mt-4"
          >
            {isSeeding ? "Seeding Database..." : "Seed Database"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will populate the database with sample data
          </p>
        </div>
      </div>
      <AuthForm />
    </div>
  );
};

export default Index;
