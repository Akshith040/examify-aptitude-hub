import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Handle email not confirmed error specifically
        if (error.message.includes('Email not confirmed')) {
          // Try to sign up again to resend confirmation email
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: email.split('@')[0],
                name: name || email.split('@')[0],
                role: email.includes('admin') ? 'admin' : 'student'
              }
            }
          });
          
          toast.info('Email confirmation required. We have resent the confirmation email.');
          throw new Error('Please check your email to confirm your account before logging in.');
        }
        throw error;
      }
      
      if (data.user) {
        // Determine role directly from user metadata
        const userRole = data.user.user_metadata.role || 'student';
        
        // Store user data in local storage 
        localStorage.setItem('currentUser', JSON.stringify({
          id: data.user.id,
          username: data.user.user_metadata.username || email.split('@')[0],
          email: data.user.email,
          role: userRole,
          name: data.user.user_metadata.name || ''
        }));
        
        toast.success('Login successful');
        
        // Redirect based on role
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            name,
            role: email.includes('admin') ? 'admin' : 'student'
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          toast.error('This email is already registered. Please login instead.');
          setActiveTab('login');
        } else {
          toast.success('Signup successful! Please check your email for verification link or try to login directly.');
          setActiveTab('login');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@examify.com');
    setPassword('admin123');
    setUsername('admin');
    setName('Admin User');
    toast.info('Admin credentials filled. You can sign up or login now.');
  };

  const fillStudentCredentials = () => {
    setEmail('student@examify.com');
    setPassword('student123');
    setUsername('student');
    setName('Student User');
    toast.info('Student credentials filled. You can sign up or login now.');
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="glass-panel">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-medium">Examify</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input"
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-2 w-full">
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Demo Credentials
            </p>
            <div className="flex gap-2 justify-between w-full">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fillAdminCredentials}
                className="flex-1"
              >
                Admin Demo
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fillStudentCredentials}
                className="flex-1"
              >
                Student Demo
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Note: Use demo credentials to sign up with predefined roles
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
