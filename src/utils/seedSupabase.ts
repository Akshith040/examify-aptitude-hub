
import { supabase } from '@/integrations/supabase/client';
import { mockQuestions } from '@/mock/data';

/**
 * Seeds the Supabase database with mock data
 * Run this function from a button click or in development
 */
export const seedSupabase = async () => {
  try {
    console.log('Starting to seed Supabase...');
    
    // Common question topics
    const topics = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'General Knowledge'];
    
    // Create expanded set of sample questions for each topic
    const expandedQuestions = [
      // Mathematics questions
      {
        text: 'Solve for x: 3x + 7 = 22',
        options: ['x = 5', 'x = 7', 'x = 8', 'x = 15'],
        correct_option: 0,
        explanation: 'Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5',
        topic: 'Mathematics'
      },
      {
        text: 'If f(x) = 2x² - 3x + 1, what is f(2)?',
        options: ['3', '5', '7', '9'],
        correct_option: 1,
        explanation: 'f(2) = 2(2)² - 3(2) + 1 = 2(4) - 6 + 1 = 8 - 6 + 1 = 3',
        topic: 'Mathematics'
      },
      {
        text: 'What is the slope of the line passing through points (3, 5) and (7, 9)?',
        options: ['0.5', '1', '2', '4'],
        correct_option: 1,
        explanation: 'Slope = (y₂ - y₁)/(x₂ - x₁) = (9 - 5)/(7 - 3) = 4/4 = 1',
        topic: 'Mathematics'
      },
      {
        text: 'What is the area of a circle with radius 6 cm?',
        options: ['12π cm²', '36π cm²', '18π cm²', '24π cm²'],
        correct_option: 1,
        explanation: 'Area of a circle = πr² = π(6)² = 36π cm²',
        topic: 'Mathematics'
      },
      {
        text: 'What is the volume of a cube with side length 4 units?',
        options: ['16 units³', '32 units³', '64 units³', '128 units³'],
        correct_option: 2,
        explanation: 'Volume of a cube = s³ = 4³ = 64 units³',
        topic: 'Mathematics'
      },
      
      // Science questions
      {
        text: 'Which of the following is NOT a type of electromagnetic radiation?',
        options: ['X-rays', 'Microwaves', 'Sound waves', 'Gamma rays'],
        correct_option: 2,
        explanation: 'Sound waves are mechanical waves that require a medium to travel, not electromagnetic waves',
        topic: 'Science'
      },
      {
        text: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gl', 'Au', 'Ag'],
        correct_option: 2,
        explanation: 'The chemical symbol for gold is Au, from its Latin name "aurum"',
        topic: 'Science'
      },
      {
        text: 'Which planet has the Great Red Spot?',
        options: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
        correct_option: 1,
        explanation: 'The Great Red Spot is a persistent high-pressure region in Jupiter\'s atmosphere',
        topic: 'Science'
      },
      {
        text: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
        correct_option: 2,
        explanation: 'Mitochondria are organelles that generate most of the cell\'s supply of ATP, used as a source of energy',
        topic: 'Science'
      },
      {
        text: 'What is the pH of a neutral solution?',
        options: ['0', '7', '10', '14'],
        correct_option: 1,
        explanation: 'A neutral solution has a pH of 7, with acids below 7 and bases above 7',
        topic: 'Science'
      },
      
      // English questions
      {
        text: 'Which of the following is a proper noun?',
        options: ['City', 'Happiness', 'London', 'Beautiful'],
        correct_option: 2,
        explanation: 'London is a proper noun because it names a specific city',
        topic: 'English'
      },
      {
        text: 'What is the past tense of "swim"?',
        options: ['Swam', 'Swimmed', 'Swimming', 'Swum'],
        correct_option: 0,
        explanation: 'The past tense of "swim" is "swam". "Swum" is the past participle',
        topic: 'English'
      },
      {
        text: 'Who wrote "Romeo and Juliet"?',
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        correct_option: 1,
        explanation: 'William Shakespeare wrote the tragedy "Romeo and Juliet" around 1595',
        topic: 'English'
      },
      {
        text: 'What literary device involves giving human qualities to non-human things?',
        options: ['Metaphor', 'Simile', 'Personification', 'Alliteration'],
        correct_option: 2,
        explanation: 'Personification is the attribution of human characteristics to something non-human',
        topic: 'English'
      },
      {
        text: 'What is the term for a comparison using "like" or "as"?',
        options: ['Metaphor', 'Simile', 'Personification', 'Hyperbole'],
        correct_option: 1,
        explanation: 'A simile makes a comparison using "like" or "as," such as "brave as a lion" or "eyes like stars"',
        topic: 'English'
      },
      
      // History questions
      {
        text: 'Which event marked the beginning of World War I?',
        options: ['The attack on Pearl Harbor', 'The assassination of Archduke Franz Ferdinand', 'The fall of the Berlin Wall', 'The bombing of Hiroshima'],
        correct_option: 1,
        explanation: 'World War I began after the assassination of Archduke Franz Ferdinand of Austria in June 1914',
        topic: 'History'
      },
      {
        text: 'Who was the first President of the United States?',
        options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'],
        correct_option: 2,
        explanation: 'George Washington served as the first President of the United States from 1789 to 1797',
        topic: 'History'
      },
      {
        text: 'The French Revolution began in what year?',
        options: ['1776', '1789', '1804', '1812'],
        correct_option: 1,
        explanation: 'The French Revolution began in 1789 with the storming of the Bastille',
        topic: 'History'
      },
      {
        text: 'Which amendment to the U.S. Constitution abolished slavery?',
        options: ['10th Amendment', '13th Amendment', '15th Amendment', '19th Amendment'],
        correct_option: 1,
        explanation: 'The 13th Amendment, ratified in 1865, abolished slavery in the United States',
        topic: 'History'
      },
      {
        text: 'What was the name of the 1803 land deal in which the United States purchased territory from France?',
        options: ['Gadsden Purchase', 'Louisiana Purchase', 'Missouri Compromise', 'Treaty of Paris'],
        correct_option: 1,
        explanation: 'In the Louisiana Purchase, the United States bought about 828,000 square miles of territory from France for $15 million',
        topic: 'History'
      },
      
      // Geography questions
      {
        text: 'What is the longest river in the world?',
        options: ['Amazon River', 'Nile River', 'Mississippi River', 'Yangtze River'],
        correct_option: 1,
        explanation: 'The Nile River in Africa is the longest river in the world at approximately 6,650 kilometers (4,130 miles)',
        topic: 'Geography'
      },
      {
        text: 'Which ocean is the largest?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correct_option: 3,
        explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth, covering about one-third of the Earth\'s surface',
        topic: 'Geography'
      },
      {
        text: 'What is the capital of Japan?',
        options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
        correct_option: 2,
        explanation: 'Tokyo is the capital and largest city of Japan',
        topic: 'Geography'
      },
      {
        text: 'Which of these is the smallest continent by land area?',
        options: ['Africa', 'Europe', 'Australia', 'South America'],
        correct_option: 2,
        explanation: 'Australia is the smallest continent by land area, covering about 5.3 million square miles',
        topic: 'Geography'
      },
      {
        text: 'What causes the seasons on Earth?',
        options: ['The Earth\'s rotation on its axis', 'The Earth\'s distance from the Sun', 'The Earth\'s tilt on its axis', 'The Moon\'s gravity'],
        correct_option: 2,
        explanation: 'The seasons are caused by the Earth\'s axial tilt as it orbits the Sun, not by the Earth\'s distance from the Sun',
        topic: 'Geography'
      },
      
      // General Knowledge questions
      {
        text: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        correct_option: 1,
        explanation: 'The Mona Lisa was painted by Leonardo da Vinci in the early 16th century',
        topic: 'General Knowledge'
      },
      {
        text: 'Which planet is known as the "Red Planet"?',
        options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
        correct_option: 2,
        explanation: 'Mars is known as the "Red Planet" due to the reddish appearance caused by iron oxide (rust) on its surface',
        topic: 'General Knowledge'
      },
      {
        text: 'What is the chemical formula for water?',
        options: ['CO2', 'H2O', 'CH4', 'O2'],
        correct_option: 1,
        explanation: 'The chemical formula for water is H2O, representing two hydrogen atoms and one oxygen atom',
        topic: 'General Knowledge'
      },
      {
        text: 'In what year did the Titanic sink?',
        options: ['1905', '1912', '1920', '1931'],
        correct_option: 1,
        explanation: 'The Titanic sank on April 15, 1912, during its maiden voyage from Southampton to New York City',
        topic: 'General Knowledge'
      },
      {
        text: 'Which of the following is NOT a primary color of light?',
        options: ['Red', 'Green', 'Yellow', 'Blue'],
        correct_option: 2,
        explanation: 'The primary colors of light are red, green, and blue (RGB). Yellow is a secondary color created by mixing red and green light',
        topic: 'General Knowledge'
      }
    ];
    
    // Generate additional questions for each topic to reach about 25-30 per topic
    const questionsToGenerate = 25; // Number of questions per topic
    const allQuestions = [];
    
    // Add original mockQuestions and the expanded questions
    allQuestions.push(...mockQuestions.map(q => ({
      text: q.text,
      options: q.options,
      correct_option: q.correctOption,
      explanation: q.explanation,
      topic: q.topic || topics[Math.floor(Math.random() * topics.length)]
    })));
    
    // Add expanded questions
    allQuestions.push(...expandedQuestions);
    
    // Insert questions
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .upsert(
        allQuestions.map(q => ({
          id: q.id || undefined, // Allow Supabase to generate IDs for new questions
          text: q.text,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          topic: q.topic
        }))
      );
    
    if (questionError) throw questionError;
    console.log('Successfully added questions:', questionData ? questionData.length : 'unknown count');
    
    return { success: true, message: 'Sample questions added successfully!' };
  } catch (error) {
    console.error('Error seeding Supabase:', error);
    return { success: false, message: 'Error seeding data', error };
  }
};
