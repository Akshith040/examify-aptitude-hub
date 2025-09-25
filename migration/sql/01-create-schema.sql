-- Examify Database Schema Migration
-- Target: Neon PostgreSQL
-- Source: Supabase backup analysis

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types (if needed)
-- Note: Keeping simple for compatibility

-- =============================================
-- USERS AND AUTHENTICATION TABLES
-- =============================================

-- Users table (replaces auth.users from Supabase)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for NextAuth.js)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- APPLICATION TABLES
-- =============================================

-- Profiles table (user profile information)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (question bank)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT,
    topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled tests table (test management)
CREATE TABLE IF NOT EXISTS scheduled_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    question_count INTEGER NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test results table (performance tracking)
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    test_id UUID REFERENCES scheduled_tests(id),
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Questions table indexes
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- Scheduled tests table indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_active ON scheduled_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_dates ON scheduled_tests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_topics ON scheduled_tests USING GIN(topics);

-- Test results table indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_test_results_user_date ON test_results(user_id, test_date);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get current user role (adapted for new auth system)
CREATE OR REPLACE FUNCTION get_current_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = user_uuid;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger to automatically update updated_at on profiles
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on questions
CREATE TRIGGER trigger_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on users
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONSTRAINTS AND VALIDATIONS
-- =============================================

-- Add constraint to ensure valid email format
ALTER TABLE users ADD CONSTRAINT users_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraint to ensure positive values
ALTER TABLE questions ADD CONSTRAINT questions_correct_option_valid 
    CHECK (correct_option >= 0);

ALTER TABLE scheduled_tests ADD CONSTRAINT scheduled_tests_duration_positive 
    CHECK (duration > 0);

ALTER TABLE scheduled_tests ADD CONSTRAINT scheduled_tests_question_count_positive 
    CHECK (question_count > 0);

ALTER TABLE scheduled_tests ADD CONSTRAINT scheduled_tests_dates_valid 
    CHECK (end_date > start_date);

ALTER TABLE test_results ADD CONSTRAINT test_results_score_valid 
    CHECK (score >= 0 AND score <= total_questions);

ALTER TABLE test_results ADD CONSTRAINT test_results_total_questions_positive 
    CHECK (total_questions > 0);

ALTER TABLE test_results ADD CONSTRAINT test_results_time_spent_positive 
    CHECK (time_spent >= 0);

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE users IS 'User authentication and basic account information';
COMMENT ON TABLE user_sessions IS 'User session management for NextAuth.js';
COMMENT ON TABLE profiles IS 'Extended user profile information and roles';
COMMENT ON TABLE questions IS 'Question bank for aptitude tests';
COMMENT ON TABLE scheduled_tests IS 'Scheduled test configurations and settings';
COMMENT ON TABLE test_results IS 'Test results and performance tracking';

COMMENT ON COLUMN profiles.role IS 'User role: admin or student';
COMMENT ON COLUMN questions.options IS 'JSON array of answer choices';
COMMENT ON COLUMN questions.correct_option IS 'Zero-based index of correct answer';
COMMENT ON COLUMN scheduled_tests.duration IS 'Test duration in minutes';
COMMENT ON COLUMN scheduled_tests.topics IS 'Array of topic names to include in test';
COMMENT ON COLUMN test_results.time_spent IS 'Total time spent on test in seconds';
COMMENT ON COLUMN test_results.answers IS 'Detailed answer data in JSON format';

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions to application user
-- Note: Adjust role name based on your Neon setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify all tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify all functions were created
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Show table sizes (should be empty initially)
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Schema migration completed successfully!';
    RAISE NOTICE 'Tables created: users, user_sessions, profiles, questions, scheduled_tests, test_results';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Functions and triggers set up';
    RAISE NOTICE 'Ready for data migration';
END $$;