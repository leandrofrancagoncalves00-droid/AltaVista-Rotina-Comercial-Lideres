-- Rotina Comercial: schema Supabase
-- Rode isso inteiro no SQL Editor do Supabase (Project > SQL Editor > New query > Run)

create table if not exists weekly_entries (
  id bigint generated always as identity primary key,
  equipe text not null,
  nome text not null,
  week_key text not null,
  items jsonb not null default '{}'::jsonb,
  notes text default '',
  updated_at timestamptz not null default now(),
  unique (equipe, nome, week_key)
);

create table if not exists advisor_meta (
  equipe text not null,
  nome text not null,
  quadrant text,
  schedule_day text,
  schedule_time text,
  updated_at timestamptz not null default now(),
  primary key (equipe, nome)
);

create table if not exists pipeline_deals (
  id bigint generated always as identity primary key,
  deal_id text not null unique,
  equipe text not null,
  nome text not null,
  cliente text default '',
  tipo text default '',
  tipo_outro text default '',
  valor numeric,
  estagio text default '',
  previsao text default '',
  updated_at timestamptz not null default now()
);

-- Row Level Security: esta e uma ferramenta interna sem login de usuario,
-- entao liberamos leitura/escrita para a chave publica (anon). Isso significa
-- que qualquer pessoa com a URL + chave anon do projeto consegue ler/escrever
-- nessas 3 tabelas -- aceitavel para uso interno de equipe, nao para dados sensiveis.

alter table weekly_entries enable row level security;
alter table advisor_meta enable row level security;
alter table pipeline_deals enable row level security;

create policy "anon full access" on weekly_entries
  for all using (true) with check (true);

create policy "anon full access" on advisor_meta
  for all using (true) with check (true);

create policy "anon full access" on pipeline_deals
  for all using (true) with check (true);
