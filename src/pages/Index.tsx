
import AuthForm from "@/components/AuthForm";


const Index = () => {



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-accent to-background p-4">
      <div className="w-full max-w-md mx-auto text-center mb-8 animate-fade-in animation-delay-100">
        <h1 className="text-4xl font-medium mb-2">Examify</h1>
        <p className="text-muted-foreground">Aptitude Testing Platform</p>
        

      </div>
      <AuthForm />
    </div>
  );
};

export default Index;
