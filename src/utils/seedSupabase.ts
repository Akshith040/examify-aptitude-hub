
import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../integrations/supabase/types';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function seedQuestions(numberOfQuestions: number = 50) {
  console.log(`Seeding ${numberOfQuestions} questions...`);

  const topics = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'General Knowledge'];

  for (let i = 0; i < numberOfQuestions; i++) {
    const questionText = faker.lorem.sentence();
    const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];
    const correctOption = faker.number.int({ min: 0, max: 3 });
    const explanation = faker.lorem.sentence();
    const topic = faker.helpers.arrayElement(topics);

    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          text: questionText,
          options: options,
          correct_option: correctOption,
          explanation: explanation,
          topic: topic,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting question:', error);
    } else {
      console.log(`Inserted question ${i + 1}/${numberOfQuestions}`);
    }
  }

  console.log('Questions seeding completed.');
}

async function seedUsers(numberOfUsers: number = 10) {
  console.log(`Seeding ${numberOfUsers} users...`);

  for (let i = 0; i < numberOfUsers; i++) {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const name = faker.person.fullName();

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          username: username,
          email: email,
          name: name,
          role: 'student',
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting user profile:', error);
    } else {
      console.log(`Inserted user ${i + 1}/${numberOfUsers}`);
    }
  }

  console.log('Users seeding completed.');
}

async function seedTestResults(numberOfResults: number = 20) {
  console.log(`Seeding ${numberOfResults} test results...`);

  // Fetch all users to assign test results to them
  const { data: users, error: usersError } = await supabase.from('profiles').select('id');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  if (!users || users.length === 0) {
    console.warn('No users found, skipping test results seeding.');
    return;
  }

  // Fetch all questions to generate answers
  const { data: questions, error: questionsError } = await supabase.from('questions').select('id');

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    return;
  }

  if (!questions || questions.length === 0) {
    console.warn('No questions found, skipping test results seeding.');
    return;
  }

  for (let i = 0; i < numberOfResults; i++) {
    const userId = faker.helpers.arrayElement(users).id;
    const testDate = faker.date.past().toISOString();
    const score = faker.number.int({ min: 0, max: 100 });
    const totalQuestions = questions.length;
    const timeSpent = faker.number.int({ min: 60, max: 3600 }); // Time spent in seconds

    // Generate answers for each question
    const answers = questions.map(question => ({
      questionId: question.id,
      selectedOption: faker.number.int({ min: 0, max: 3 }),
      isCorrect: faker.datatype.boolean(),
      timeSpent: faker.number.int({ min: 1, max: 30 }), // Time spent on each question in seconds
    }));

    const { data, error } = await supabase
      .from('test_results')
      .insert([
        {
          user_id: userId,
          test_date: testDate,
          score: score,
          total_questions: totalQuestions,
          time_spent: timeSpent,
          answers: answers,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting test result:', error);
    } else {
      console.log(`Inserted test result ${i + 1}/${numberOfResults}`);
    }
  }

  console.log('Test results seeding completed.');
}

async function seedScheduledTests(numberOfTests: number = 5) {
  console.log(`Seeding ${numberOfTests} scheduled tests...`);

  const topics = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'General Knowledge'];

  for (let i = 0; i < numberOfTests; i++) {
    const title = faker.lorem.sentence();
    const description = faker.lorem.paragraph();
    const startDate = faker.date.future().toISOString();
    const endDate = faker.date.future().toISOString();
    const duration = faker.number.int({ min: 30, max: 120 });
    const questionCount = faker.number.int({ min: 10, max: 50 });
    const testTopics = faker.helpers.arrayElements(topics, faker.number.int({ min: 1, max: topics.length }));
    const isActive = faker.datatype.boolean();

    const { data, error } = await supabase
      .from('scheduled_tests')
      .insert([
        {
          title: title,
          description: description,
          start_date: startDate,
          end_date: endDate,
          duration: duration,
          question_count: questionCount,
          topics: testTopics,
          is_active: isActive,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting scheduled test:', error);
    } else {
      console.log(`Inserted scheduled test ${i + 1}/${numberOfTests}`);
    }
  }

  console.log('Scheduled tests seeding completed.');
}

async function seedAdminUser() {
  console.log('Seeding admin user...');

  const username = 'admin';
  const email = 'admin@example.com';
  const name = 'Administrator';

  // Check if the admin user already exists
  const { data: existingAdmin, error: existingAdminError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username);

  if (existingAdminError) {
    console.error('Error checking for existing admin:', existingAdminError);
    return;
  }

  if (existingAdmin && existingAdmin.length > 0) {
    console.log('Admin user already exists, skipping creation.');
    return;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        username: username,
        email: email,
        name: name,
        role: 'admin',
      },
    ])
    .select();

  if (error) {
    console.error('Error inserting admin user:', error);
  } else {
    console.log('Admin user seeded successfully.');
  }
}

async function seedAll() {
  try {
    await seedAdminUser();
    await seedQuestions();
    await seedUsers();
    await seedTestResults();
    await seedScheduledTests();
    console.log('All seeding operations completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

// Function to seed scheduled tests with specific data
async function seedSpecificScheduledTests() {
  console.log('Seeding specific scheduled tests...');

  const tests = [
    {
      title: 'Mathematics Exam - Algebra Basics',
      description: 'Test your knowledge on basic algebra concepts.',
      startDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 1 week from now
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 2 weeks from now
      duration: 60,
      questionCount: 25,
      topics: ['Mathematics'],
      isActive: true,
    },
    {
      title: 'Science Quiz - Introduction to Biology',
      description: 'A quiz covering the fundamental concepts of biology.',
      startDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), // 10 days from now
      endDate: new Date(new Date().setDate(new Date().getDate() + 17)).toISOString(), // 17 days from now
      duration: 45,
      questionCount: 20,
      topics: ['Science'],
      isActive: true,
    },
    {
      title: 'English Literature - Understanding Shakespeare',
      description: 'Explore the works of Shakespeare and test your comprehension.',
      startDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 2 weeks from now
      endDate: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString(), // 3 weeks from now
      duration: 75,
      questionCount: 30,
      topics: ['English'],
      isActive: true,
    },
    {
      title: 'History Test - World War II',
      description: 'Test your knowledge of the major events and figures of World War II.',
      startDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // 3 days from now
      endDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), // 10 days from now
      duration: 90,
      questionCount: 40,
      topics: ['History'],
      isActive: true,
    },
    {
      title: 'Geography Challenge - Mapping the World',
      description: 'A challenge to identify countries, capitals, and geographical landmarks.',
      startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // 5 days from now
      endDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(), // 12 days from now
      duration: 50,
      questionCount: 22,
      topics: ['Geography'],
      isActive: true,
    },
  ];

  for (const test of tests) {
    const { title, description, startDate, endDate, duration, questionCount, topics, isActive } = test;

    const { data, error } = await supabase
      .from('scheduled_tests')
      .insert([
        {
          title: title,
          description: description,
          start_date: startDate,
          end_date: endDate,
          duration: duration,
          question_count: questionCount,
          topics: topics,
          is_active: isActive,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting specific scheduled test:', error);
    } else {
      console.log(`Inserted specific scheduled test: ${title}`);
    }
  }

  console.log('Specific scheduled tests seeding completed.');
}

// Export all seeding functions for use in other files
export { seedQuestions, seedUsers, seedTestResults, seedScheduledTests, seedAdminUser, seedAll, seedSpecificScheduledTests };

// Only run the seeding functions if the script is run directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] === import.meta.url) {
  seedAll().then(() => console.log('Seeding complete.'));
  seedSpecificScheduledTests().then(() => console.log('Specific scheduled tests seeding complete.'));
}
