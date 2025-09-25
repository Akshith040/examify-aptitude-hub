# Application Updates for Database Migration

## Overview
This document outlines all the code changes needed to migrate from Supabase to Neon PostgreSQL with NextAuth.js authentication.

## File Changes Required

### 1. Environment Variables (.env.local)

**Replace existing Supabase variables with:**
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
DIRECT_URL="postgresql://username:password@hostname/database?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-a-strong-one"

# Application Settings
NODE_ENV="development"
```

### 2. Package.json Dependencies

**Add new dependencies:**
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "@types/pg": "^8.10.9",
    "next-auth": "^4.24.5",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

**Remove Supabase dependency:**
```bash
npm uninstall @supabase/supabase-js
```

### 3. Database Client (lib/db.ts)

**Create new file:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool };

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helper functions for common operations
export async function getUserById(id: string) {
  const result = await query(
    'SELECT u.*, p.username, p.name, p.role FROM users u JOIN profiles p ON u.id = p.id WHERE u.id = $1',
    [id]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await query(
    'SELECT u.*, p.username, p.name, p.role FROM users u JOIN profiles p ON u.id = p.id WHERE u.email = $1',
    [email]
  );
  return result.rows[0];
}

export async function createUser(email: string, passwordHash: string, userData: any) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, $3) RETURNING id',
      [email, passwordHash, true]
    );
    
    const userId = userResult.rows[0].id;
    
    // Insert profile
    await client.query(
      'INSERT INTO profiles (id, username, name, email, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, userData.username, userData.name, email, userData.role || 'student']
    );
    
    await client.query('COMMIT');
    return userId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 4. NextAuth Configuration (pages/api/auth/[...nextauth].ts)

**Create new file:**
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '../../../lib/db';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        action: { label: 'Action', type: 'text' }, // 'signin' or 'signup'
        username: { label: 'Username', type: 'text' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          if (credentials.action === 'signup') {
            // Sign up logic
            const existingUser = await getUserByEmail(credentials.email);
            if (existingUser) {
              throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(credentials.password, 12);
            const userId = await createUser(credentials.email, hashedPassword, {
              username: credentials.username,
              name: credentials.name,
              role: credentials.role || 'student'
            });

            const newUser = await getUserByEmail(credentials.email);
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              username: newUser.username,
              role: newUser.role
            };
          } else {
            // Sign in logic
            const user = await getUserByEmail(credentials.email);
            if (!user) {
              return null;
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              username: user.username,
              role: user.role
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  }
});
```

### 5. Updated AuthForm Component

**Replace src/components/AuthForm.tsx:**
```typescript
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        action: 'signin',
        redirect: false
      });

      if (result?.error) {
        toast.error('Login failed. Please check your credentials.');
        return;
      }

      toast.success('Login successful');
      
      // Redirect based on role (you'll need to get this from the session)
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      if (session?.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const role = email.includes('admin') ? 'admin' : 'student';
      
      const result = await signIn('credentials', {
        email,
        password,
        username,
        name,
        role,
        action: 'signup',
        redirect: false
      });

      if (result?.error) {
        toast.error('Signup failed. User may already exist.');
        return;
      }

      toast.success('Account created successfully!');
      setActiveTab('login');
    } catch (error) {
      toast.error('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@examify.com');
    setPassword('admin123');
    setUsername('admin');
    setName('Admin User');
    toast.info('Admin credentials filled.');
  };

  const fillStudentCredentials = () => {
    setEmail('student1@examify.com');
    setPassword('student123');
    setUsername('student1');
    setName('John Doe');
    toast.info('Student credentials filled.');
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
```

### 6. Database Service Layer (lib/database-service.ts)

**Create new file:**
```typescript
import { query } from './db';
import { Question, TestResult, ScheduledTest, User } from '@/types';

export class DatabaseService {
  // Questions
  static async getQuestions(): Promise<Question[]> {
    const result = await query('SELECT * FROM questions ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id,
      text: row.text,
      options: row.options,
      correctOption: row.correct_option,
      explanation: row.explanation,
      topic: row.topic
    }));
  }

  static async getQuestionsByTopic(topic: string): Promise<Question[]> {
    const result = await query('SELECT * FROM questions WHERE topic = $1', [topic]);
    return result.rows.map(row => ({
      id: row.id,
      text: row.text,
      options: row.options,
      correctOption: row.correct_option,
      explanation: row.explanation,
      topic: row.topic
    }));
  }

  static async createQuestion(question: Omit<Question, 'id'>): Promise<string> {
    const result = await query(
      'INSERT INTO questions (text, options, correct_option, explanation, topic) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [question.text, JSON.stringify(question.options), question.correctOption, question.explanation, question.topic]
    );
    return result.rows[0].id;
  }

  // Scheduled Tests
  static async getScheduledTests(): Promise<ScheduledTest[]> {
    const result = await query('SELECT * FROM scheduled_tests ORDER BY created_at DESC');
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      duration: row.duration,
      topics: row.topics,
      questionCount: row.question_count,
      isActive: row.is_active,
      createdAt: row.created_at
    }));
  }

  static async createScheduledTest(test: Omit<ScheduledTest, 'id' | 'createdAt'>): Promise<string> {
    const result = await query(
      'INSERT INTO scheduled_tests (title, description, start_date, end_date, duration, question_count, topics, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [test.title, test.description, test.startDate, test.endDate, test.duration, test.questionCount, test.topics, test.isActive]
    );
    return result.rows[0].id;
  }

  // Test Results
  static async getTestResults(userId?: string): Promise<TestResult[]> {
    let queryText = 'SELECT * FROM test_results';
    let params: any[] = [];
    
    if (userId) {
      queryText += ' WHERE user_id = $1';
      params = [userId];
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      testDate: row.test_date,
      score: row.score,
      totalQuestions: row.total_questions,
      timeSpent: row.time_spent,
      answers: row.answers,
      testId: row.test_id
    }));
  }

  static async createTestResult(result: Omit<TestResult, 'id'>): Promise<string> {
    const queryResult = await query(
      'INSERT INTO test_results (user_id, user_name, test_id, test_date, score, total_questions, time_spent, answers) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [result.userId, result.userName, result.testId, result.testDate, result.score, result.totalQuestions, result.timeSpent, JSON.stringify(result.answers)]
    );
    return queryResult.rows[0].id;
  }

  // Users and Profiles
  static async getUsers(): Promise<User[]> {
    const result = await query(
      'SELECT u.id, p.username, u.email, p.name, p.role FROM users u JOIN profiles p ON u.id = p.id ORDER BY p.created_at DESC'
    );
    return result.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      name: row.name,
      role: row.role,
      password: '' // Don't return password
    }));
  }

  static async getUserRole(userId: string): Promise<string | null> {
    const result = await query('SELECT role FROM profiles WHERE id = $1', [userId]);
    return result.rows[0]?.role || null;
  }
}
```

## Files to Update

### 1. Remove Supabase Integration Files
- Delete `src/integrations/supabase/` directory
- Remove all imports of `@supabase/supabase-js`

### 2. Update Component Files
- Replace all `supabase` imports with database service calls
- Update authentication logic in all components
- Replace `supabase.auth` calls with NextAuth.js session management

### 3. Update App.tsx
```typescript
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

## Migration Steps

1. **Install Dependencies**
   ```bash
   npm install pg @types/pg next-auth bcryptjs @types/bcryptjs
   npm uninstall @supabase/supabase-js
   ```

2. **Update Environment Variables**
   - Replace Supabase variables with Neon database URL
   - Add NextAuth.js configuration

3. **Create New Files**
   - `lib/db.ts` - Database connection
   - `lib/database-service.ts` - Database operations
   - `pages/api/auth/[...nextauth].ts` - Authentication

4. **Update Existing Files**
   - Replace AuthForm component
   - Update all dashboard components to use new database service
   - Remove Supabase client usage

5. **Test Authentication**
   - Test login/signup flows
   - Verify role-based access control
   - Test session management

6. **Test Database Operations**
   - Verify all CRUD operations work
   - Test question management
   - Test test scheduling and results

This migration maintains the same functionality while replacing Supabase with a free PostgreSQL solution and NextAuth.js for authentication.