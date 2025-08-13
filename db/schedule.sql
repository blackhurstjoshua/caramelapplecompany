-- Simple schedule table for blocked dates only
CREATE TABLE schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  delivery_blocked BOOLEAN DEFAULT TRUE,
  pickup_blocked BOOLEAN DEFAULT TRUE,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your current blocked dates
INSERT INTO schedule (blocked_date, delivery_blocked, pickup_blocked, reason) VALUES
  ('2024-12-01', TRUE, TRUE, 'Holiday closure'),
  ('2024-12-08', TRUE, TRUE, 'Holiday closure'),
  ('2024-12-15', TRUE, TRUE, 'Holiday closure'),
  ('2024-12-22', TRUE, TRUE, 'Holiday closure'),
  ('2024-12-24', TRUE, TRUE, 'Christmas Eve'),
  ('2024-12-25', TRUE, TRUE, 'Christmas Day'),
  ('2024-12-26', TRUE, TRUE, 'Boxing Day'),
  ('2024-12-29', TRUE, TRUE, 'Holiday closure'),
  ('2024-12-31', TRUE, TRUE, 'New Year''s Eve'),
  ('2025-01-01', TRUE, TRUE, 'New Year''s Day'),
  ('2025-01-05', TRUE, TRUE, 'Holiday closure'),
  ('2025-01-12', TRUE, TRUE, 'Holiday closure'),
  ('2025-01-19', TRUE, TRUE, 'Holiday closure');

-- Create index for fast date lookups
CREATE INDEX idx_schedule_blocked_date ON schedule(blocked_date);

--! Need a clean up method of OLD dates that aren't necessary anymore