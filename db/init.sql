CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO users (email, password_hash)
VALUES
  ('admin@aurelia.com', '$2a$10$IoCC7VdS8sSGsLOmpQC6J.nsM1o2bsDeqKRvvG8f9nO4BWJxJEFFm')
ON CONFLICT (email) DO NOTHING;
