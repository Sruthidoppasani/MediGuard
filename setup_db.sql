-- PostgreSQL (pgAdmin) SQL Setup
-- Note: Create the database (e.g., 'agent_db') in pgAdmin first, then run this script in that database.

-- 1. Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Ensure your connection user has permissions for this table.
