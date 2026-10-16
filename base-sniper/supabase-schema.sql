-- Base Sniper + Open Investments: tabelas adicionais no MESMO projeto Supabase do Rotina Comercial.
-- Rode isso inteiro no SQL Editor do Supabase (Project > SQL Editor > New query > Run).

-- Situacao atual de cada cliente/conta em cada base ('sniper' ou 'opin').
create table if not exists sniper_status (
  base text not null default 'sniper',
  cod_cliente text not null,
  assessor text not null,
  status text not null default 'Não abordado',
  ultimo_contato date,
  proximo_passo text default '',
  responsavel text default '',
  valor_captado numeric default 0,
  observacoes text default '',
  updated_at timestamptz not null default now(),
  primary key (base, cod_cliente)
);

-- Historico de mudancas de status/valor, para o acompanhamento semanal
-- (o que andou na semana por assessor/equipe).
create table if not exists sniper_log (
  id bigint generated always as identity primary key,
  base text not null default 'sniper',
  cod_cliente text not null,
  assessor text not null,
  status_de text,
  status_para text,
  valor_captado numeric,
  changed_at timestamptz not null default now()
);

-- Mesmo padrao das outras tabelas do Rotina Comercial: ferramenta interna sem login,
-- entao liberamos leitura/escrita para a chave publica (anon).
alter table sniper_status enable row level security;
alter table sniper_log enable row level security;

create policy "anon full access" on sniper_status
  for all using (true) with check (true);
create policy "anon full access" on sniper_log
  for all using (true) with check (true);
