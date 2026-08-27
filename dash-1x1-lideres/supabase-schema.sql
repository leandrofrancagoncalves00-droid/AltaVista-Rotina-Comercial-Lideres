-- 1x1 com Líderes: tabela adicional no MESMO projeto Supabase do Rotina Comercial.
-- Rode isso no SQL Editor do Supabase (Project > SQL Editor > New query > Run).

create table if not exists leader_weekly_notes (
  id bigint generated always as identity primary key,
  equipe text not null,
  week_key text not null,
  prontuario text default '',
  plano_acao text default '',
  plano_status text default '',
  updated_at timestamptz not null default now(),
  unique (equipe, week_key)
);

-- Se a tabela já existia (sem essas colunas), isso adiciona elas sem apagar nada:
alter table leader_weekly_notes add column if not exists plano_acao text default '';
alter table leader_weekly_notes add column if not exists plano_status text default '';

-- Mesmo padrão das outras tabelas do Rotina Comercial: ferramenta interna sem login,
-- então liberamos leitura/escrita para a chave publica (anon).
alter table leader_weekly_notes enable row level security;

create policy "anon full access" on leader_weekly_notes
  for all using (true) with check (true);
