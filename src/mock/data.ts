
import { Question, TestResult, User } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@example.com' },
  { id: '2', username: 'student1', password: 'student123', role: 'student', name: 'John Doe', email: 'john@example.com' },
  { id: '3', username: 'student2', password: 'student123', role: 'student', name: 'Jane Smith', email: 'jane@example.com' },
];

// Mock Questions
export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'If a train travels at 60 km/h, how long will it take to cover 180 km?',
    options: ['2 hours', '3 hours', '4 hours', '5 hours'],
    correctOption: 1,
    explanation: 'Time = Distance / Speed = 180 km / 60 km/h = 3 hours'
  },
  {
    id: '2',
    text: 'Find the next number in the sequence: 3, 6, 12, 24, ...',
    options: ['30', '36', '48', '60'],
    correctOption: 2,
    explanation: 'Each number is multiplied by 2 to get the next number. So, 24 × 2 = 48.'
  },
  {
    id: '3',
    text: 'If 5 workers can build a wall in 10 days, how many days will it take for 10 workers to build the same wall?',
    options: ['5 days', '10 days', '15 days', '20 days'],
    correctOption: 0,
    explanation: 'This is an inverse proportion. If workers double, time halves. So 10 days / 2 = 5 days.'
  },
  {
    id: '4',
    text: 'What is the probability of getting a sum of 7 when rolling two dice?',
    options: ['1/6', '1/8', '1/12', '1/36'],
    correctOption: 0,
    explanation: 'Favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 outcomes. Total outcomes: 36. Probability = 6/36 = 1/6.'
  },
  {
    id: '5',
    text: 'A shopkeeper gives a discount of 20% on the marked price of an item and still makes a profit of 20%. If the cost price is $100, what is the marked price?',
    options: ['$120', '$125', '$150', '$180'],
    correctOption: 2,
    explanation: 'Let the marked price be x. After 20% discount, selling price is 0.8x. For 20% profit, selling price = 1.2 × 100 = $120. So, 0.8x = 120, which gives x = $150.'
  },
  {
    id: '6',
    text: 'If x² + y² = 25 and x + y = 7, what is the value of xy?',
    options: ['12', '10', '8', '6'],
    correctOption: 0,
    explanation: 'Using the formula (x+y)² = x² + y² + 2xy. We have (7)² = 25 + 2xy, which gives 49 = 25 + 2xy, so 2xy = 24, meaning xy = 12.'
  },
  {
    id: '7',
    text: 'A car uses 7 liters of fuel to travel 100 km. How many liters will it need for a 250 km journey?',
    options: ['14.5 liters', '17.5 liters', '20 liters', '25 liters'],
    correctOption: 1,
    explanation: 'This is a direct proportion. If 100 km needs 7 liters, then 250 km needs (7 × 250 ÷ 100) = 17.5 liters.'
  },
  {
    id: '8',
    text: 'Which of the following numbers is prime?',
    options: ['91', '87', '51', '89'],
    correctOption: 3,
    explanation: '89 is a prime number because it cannot be divided evenly by any number other than 1 and itself.'
  },
  {
    id: '9',
    text: 'If log₁₀(x) = 3, what is the value of x?',
    options: ['30', '300', '1000', '3000'],
    correctOption: 2,
    explanation: 'If log₁₀(x) = 3, then x = 10³ = 1000.'
  },
  {
    id: '10',
    text: 'A rectangular field has a perimeter of 100 meters. If the length is 10 meters more than the width, what is the area of the field?',
    options: ['600 m²', '500 m²', '480 m²', '450 m²'],
    correctOption: 2,
    explanation: 'Let the width be w and length be w+10. Then 2(w + w+10) = 100, so 4w + 20 = 100, which gives w = 20. The length is 30. So the area is 20 × 30 = 600 m².'
  },
];

// Mock Test Results
export const mockTestResults: TestResult[] = [
  {
    id: '1',
    userId: '2',
    userName: 'John Doe',
    testDate: '2023-10-15T14:30:00Z',
    score: 4,
    totalQuestions: 5,
    timeSpent: 270, // 4 min 30 sec
    answers: [
      { questionId: '1', selectedOption: 1, isCorrect: true, timeSpent: 45 },
      { questionId: '2', selectedOption: 2, isCorrect: true, timeSpent: 58 },
      { questionId: '3', selectedOption: 0, isCorrect: true, timeSpent: 52 },
      { questionId: '4', selectedOption: 1, isCorrect: false, timeSpent: 60 },
      { questionId: '5', selectedOption: 2, isCorrect: true, timeSpent: 55 }
    ]
  },
  {
    id: '2',
    userId: '3',
    userName: 'Jane Smith',
    testDate: '2023-10-16T10:15:00Z',
    score: 3,
    totalQuestions: 5,
    timeSpent: 285, // 4 min 45 sec
    answers: [
      { questionId: '1', selectedOption: 1, isCorrect: true, timeSpent: 50 },
      { questionId: '2', selectedOption: 3, isCorrect: false, timeSpent: 60 },
      { questionId: '3', selectedOption: 0, isCorrect: true, timeSpent: 55 },
      { questionId: '4', selectedOption: 0, isCorrect: true, timeSpent: 58 },
      { questionId: '5', selectedOption: 3, isCorrect: false, timeSpent: 62 }
    ]
  },
  {
    id: '3',
    userId: '2',
    userName: 'John Doe',
    testDate: '2023-11-10T09:45:00Z',
    score: 7,
    totalQuestions: 10,
    timeSpent: 540, // 9 min
    answers: [
      { questionId: '1', selectedOption: 1, isCorrect: true, timeSpent: 48 },
      { questionId: '2', selectedOption: 2, isCorrect: true, timeSpent: 55 },
      { questionId: '3', selectedOption: 0, isCorrect: true, timeSpent: 50 },
      { questionId: '4', selectedOption: 0, isCorrect: true, timeSpent: 52 },
      { questionId: '5', selectedOption: 2, isCorrect: true, timeSpent: 58 },
      { questionId: '6', selectedOption: 2, isCorrect: false, timeSpent: 60 },
      { questionId: '7', selectedOption: 1, isCorrect: true, timeSpent: 54 },
      { questionId: '8', selectedOption: 2, isCorrect: false, timeSpent: 56 },
      { questionId: '9', selectedOption: 2, isCorrect: true, timeSpent: 53 },
      { questionId: '10', selectedOption: 1, isCorrect: false, timeSpent: 54 }
    ]
  },
  {
    id: '4',
    userId: '2',
    userName: 'John Doe',
    testDate: '2023-12-05T16:20:00Z',
    score: 8,
    totalQuestions: 10,
    timeSpent: 520, // 8 min 40 sec
    answers: [
      { questionId: '1', selectedOption: 1, isCorrect: true, timeSpent: 42 },
      { questionId: '2', selectedOption: 2, isCorrect: true, timeSpent: 50 },
      { questionId: '3', selectedOption: 0, isCorrect: true, timeSpent: 48 },
      { questionId: '4', selectedOption: 0, isCorrect: true, timeSpent: 50 },
      { questionId: '5', selectedOption: 2, isCorrect: true, timeSpent: 52 },
      { questionId: '6', selectedOption: 0, isCorrect: true, timeSpent: 58 },
      { questionId: '7', selectedOption: 1, isCorrect: true, timeSpent: 50 },
      { questionId: '8', selectedOption: 2, isCorrect: false, timeSpent: 56 },
      { questionId: '9', selectedOption: 1, isCorrect: false, timeSpent: 55 },
      { questionId: '10', selectedOption: 2, isCorrect: true, timeSpent: 59 }
    ]
  }
];

