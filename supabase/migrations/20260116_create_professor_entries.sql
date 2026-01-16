-- Tabela para armazenar os professores (Alimentada pelo n8n)
CREATE TABLE IF NOT EXISTS professor_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    discipline TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime
-- Observe: logic to avoid error if already exists in publication
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'professor_entries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE professor_entries;
  END IF;
END $$;

-- RLS (Segurança)
ALTER TABLE professor_entries ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (Leitura para telão, Escrita para n8n)
-- Check if policies exist before creating them to be safe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read' AND tablename = 'professor_entries') THEN
        CREATE POLICY "Public Read" ON professor_entries FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert' AND tablename = 'professor_entries') THEN
        CREATE POLICY "Public Insert" ON professor_entries FOR INSERT WITH CHECK (true);
    END IF;
END $$;
