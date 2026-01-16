-- Create the professor_entries table
CREATE TABLE IF NOT EXISTS professor_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE professor_entries;
