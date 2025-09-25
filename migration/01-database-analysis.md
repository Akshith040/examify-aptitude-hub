# Database Analysis Report

## Overview
This document provides a comprehensive analysis of the Supabase database backup for the Examify Aptitude Hub application.

## Database Structure

### Core Application Tables (public schema)

#### 1. profiles
- **Purpose**: User profile management
- **Columns**:
  - `id` (uuid, NOT NULL, PRIMARY KEY) - References auth.users(id)
  - `username` (text, NOT NULL, UNIQUE)
  - `name` (text, nullable)
  - `email` (text, nullable)
  - `role` (text, NOT NULL) - 'admin' or 'student'
  - `created_at` (timestamp with time zone, DEFAULT now())
  - `updated_at` (timestamp with time zone, DEFAULT now())

#### 2. questions
- **Purpose**: Question bank for tests
- **Columns**:
  - `id` (uuid, DEFAULT gen_random_uuid(), NOT NULL, PRIMARY KEY)
  - `text` (text, NOT NULL) - Question content
  - `options` (jsonb, NOT NULL) - Array of answer choices
  - `correct_option` (integer, NOT NULL) - Index of correct answer
  - `explanation` (text, nullable) - Answer explanation
  - `topic` (text, nullable) - Subject category
  - `created_at` (timestamp with time zone, DEFAULT now())
  - `updated_at` (timestamp with time zone, DEFAULT now())

#### 3. scheduled_tests
- **Purpose**: Test scheduling and management
- **Columns**:
  - `id` (uuid, DEFAULT gen_random_uuid(), NOT NULL, PRIMARY KEY)
  - `title` (text, NOT NULL) - Test name
  - `description` (text, nullable) - Test description
  - `start_date` (timestamp with time zone, NOT NULL) - When test becomes available
  - `end_date` (timestamp with time zone, NOT NULL) - When test expires
  - `duration` (integer, NOT NULL) - Test duration in minutes
  - `question_count` (integer, NOT NULL) - Number of questions
  - `topics` (text[], NOT NULL, DEFAULT '{}') - Array of topics to include
  - `is_active` (boolean, NOT NULL, DEFAULT true) - Test availability status
  - `created_at` (timestamp with time zone, DEFAULT now())

#### 4. test_results
- **Purpose**: Store test results and performance tracking
- **Columns**:
  - `id` (uuid, DEFAULT gen_random_uuid(), NOT NULL, PRIMARY KEY)
  - `user_id` (uuid, NOT NULL) - References auth.users(id)
  - `user_name` (text, nullable) - Cached user name
  - `test_id` (uuid, nullable) - References scheduled_tests(id)
  - `test_date` (timestamp with time zone, DEFAULT now())
  - `score` (integer, NOT NULL) - Correct answers count
  - `total_questions` (integer, NOT NULL) - Total questions in test
  - `time_spent` (integer, NOT NULL) - Total time in seconds
  - `answers` (jsonb, NOT NULL) - Detailed answer data
  - `created_at` (timestamp with time zone, DEFAULT now())

### Foreign Key Relationships

1. **profiles.id** → **auth.users.id** (CASCADE DELETE)
2. **test_results.user_id** → **auth.users.id** (CASCADE DELETE)
3. **test_results.test_id** → **scheduled_tests.id** (NO ACTION)

### Custom Functions

#### 1. get_current_user_role()
- **Purpose**: Returns the current user's role from profiles table
- **Security**: SECURITY DEFINER
- **Returns**: text (role)

#### 2. handle_new_user()
- **Purpose**: Trigger function to create profile when new user signs up
- **Security**: SECURITY DEFINER
- **Trigger**: ON INSERT to auth.users

### Indexes and Constraints

#### Primary Keys
- All tables have UUID primary keys with gen_random_uuid() defaults

#### Unique Constraints
- `profiles.username` - UNIQUE
- `profiles.email` - UNIQUE (if not null)

#### Check Constraints
- Role validation on profiles table (admin/student)

### Supabase-Specific Features Used

1. **Authentication System** (auth schema)
   - Complete user management with auth.users table
   - Session management
   - MFA support
   - Social login capabilities

2. **Row Level Security (RLS)**
   - Enabled on all public tables
   - Role-based access control

3. **Real-time Subscriptions**
   - Available for all tables
   - Used for live updates

4. **Storage System** (storage schema)
   - File upload capabilities
   - Bucket management

5. **Extensions Used**:
   - `uuid-ossp` - UUID generation
   - `pgcrypto` - Cryptographic functions
   - `pgjwt` - JWT token handling
   - `pg_graphql` - GraphQL API
   - `pgsodium` - Advanced cryptography

### Data Types Used

- **UUID**: Primary keys and foreign keys
- **TEXT**: String data with no length limit
- **JSONB**: Structured data (questions.options, test_results.answers)
- **INTEGER**: Numeric data (scores, durations)
- **BOOLEAN**: True/false flags
- **TIMESTAMP WITH TIME ZONE**: Date/time data
- **TEXT[]**: Arrays of text (topics)

### Security Features

1. **Row Level Security Policies**
   - Users can only access their own data
   - Admins have broader access
   - Anonymous users have limited read access

2. **Function Security**
   - SECURITY DEFINER functions for privileged operations
   - Proper role-based access control

3. **Database Roles**
   - `anon` - Anonymous access
   - `authenticated` - Logged-in users
   - `service_role` - Backend operations
   - Various admin roles for different services

## Migration Considerations

### Challenges
1. **Authentication System**: Need to replace Supabase Auth
2. **Row Level Security**: Need to implement application-level security
3. **Real-time Features**: Need alternative for live updates
4. **UUID Generation**: Need to ensure UUID support
5. **JSONB Support**: Ensure target database supports JSONB

### Recommendations
1. Use **Neon** as the target database (free PostgreSQL with good features)
2. Implement **NextAuth.js** or **Auth0** for authentication
3. Use **WebSockets** or **Server-Sent Events** for real-time features
4. Maintain the same schema structure for minimal code changes
5. Implement application-level security instead of RLS

## Data Volume Analysis

Based on the backup structure:
- **Small dataset**: Suitable for development and testing
- **Core tables**: profiles, questions, scheduled_tests, test_results
- **Sample data**: Includes test questions and user profiles
- **No large binary data**: Text-based content only

## Next Steps

1. Set up Neon PostgreSQL database
2. Create schema migration scripts
3. Implement authentication replacement
4. Update application connection strings
5. Test data migration and application functionality