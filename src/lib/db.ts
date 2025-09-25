// Mock database service for client-side use
// This simulates database operations without requiring server-side code

// Mock users data
const mockUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@examify.com',
    password: 'admin123', // In real app, this would be hashed
    username: 'admin',
    name: 'Administrator',
    role: 'admin'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'student1@examify.com',
    password: 'student123',
    username: 'student1',
    name: 'John Doe',
    role: 'student'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'student2@examify.com',
    password: 'student123',
    username: 'student2',
    name: 'Jane Smith',
    role: 'student'
  }
];

// Mock questions data
const mockQuestions = [
  {
    id: '1',
    text: 'If a train travels at 60 km/h, how long will it take to cover 180 km?',
    options: ['2 hours', '3 hours', '4 hours', '5 hours'],
    correctOption: 1,
    explanation: 'Time = Distance / Speed = 180 km / 60 km/h = 3 hours',
    topic: 'Mathematics'
  },
  {
    id: '2',
    text: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctOption: 2,
    explanation: 'The chemical symbol for gold is Au, derived from the Latin word "aurum".',
    topic: 'Science'
  },
  {
    id: '3',
    text: 'Which of the following is a synonym for "abundant"?',
    options: ['Scarce', 'Plentiful', 'Rare', 'Limited'],
    correctOption: 1,
    explanation: 'Abundant means existing in large quantities, so plentiful is the correct synonym.',
    topic: 'English'
  },
  {
    id: '4',
    text: 'In which year did World War II end?',
    options: ['1944', '1945', '1946', '1947'],
    correctOption: 1,
    explanation: 'World War II ended in 1945 with the surrender of Japan in September.',
    topic: 'History'
  },
  {
    id: '5',
    text: 'What is the capital of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctOption: 2,
    explanation: 'Canberra is the capital city of Australia, not Sydney or Melbourne which are larger cities.',
    topic: 'Geography'
  }
];

// Mock scheduled tests
const mockScheduledTests = [
  {
    id: '1',
    title: 'Mathematics Fundamentals Test',
    description: 'Test your basic mathematics skills including arithmetic, algebra, and problem-solving.',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    duration: 45,
    questionCount: 15,
    topics: ['Mathematics'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Science and General Knowledge Quiz',
    description: 'A comprehensive quiz covering basic science concepts and general knowledge.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    questionCount: 20,
    topics: ['Science', 'Geography'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Mock test results (stored in localStorage)
function getStoredTestResults() {
  const stored = localStorage.getItem('testResults');
  return stored ? JSON.parse(stored) : [];
}

function saveTestResults(results: any[]) {
  localStorage.setItem('testResults', JSON.stringify(results));
}

// Authentication functions
export async function loginUser(email: string, password: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
}

export async function signupUser(email: string, password: string, username: string, name: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const role = email.includes('admin') ? 'admin' : 'student';
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    username,
    name,
    role
  };
  
  mockUsers.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  return { user: userWithoutPassword };
}

// Database operations
export async function getQuestions() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockQuestions;
}

export async function getScheduledTests() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockScheduledTests;
}

export async function getActiveScheduledTests() {
  await new Promise(resolve => setTimeout(resolve, 200));
  const now = new Date();
  return mockScheduledTests.filter(test => 
    test.isActive && 
    new Date(test.startDate) <= now && 
    new Date(test.endDate) >= now
  );
}

export async function getScheduledTestById(id: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockScheduledTests.find(test => test.id === id) || null;
}

export async function getQuestionsByTopics(topics: string[], limit?: number) {
  await new Promise(resolve => setTimeout(resolve, 200));
  let filtered = mockQuestions.filter(q => topics.includes(q.topic || ''));
  
  if (limit && filtered.length > limit) {
    // Shuffle and take limited number
    filtered = filtered.sort(() => Math.random() - 0.5).slice(0, limit);
  }
  
  return filtered;
}

export async function getTestResults(userId?: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const results = getStoredTestResults();
  
  if (userId) {
    return results.filter((result: any) => result.userId === userId);
  }
  
  return results;
}

export async function createTestResult(result: any) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const results = getStoredTestResults();
  const newResult = {
    ...result,
    id: Date.now().toString()
  };
  
  results.push(newResult);
  saveTestResults(results);
  
  return newResult.id;
}

export async function getUsers() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockUsers.map(({ password, ...user }) => user);
}

export async function getTopics() {
  await new Promise(resolve => setTimeout(resolve, 200));
  const topics = [...new Set(mockQuestions.map(q => q.topic).filter(Boolean))];
  return topics;
}