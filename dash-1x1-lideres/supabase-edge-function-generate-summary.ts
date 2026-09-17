// Supabase Edge Function: generate-summary
//
// Gera o resumo executivo semanal do Rotina Comercial usando a API da Anthropic.
// Cole este arquivo no editor de Edge Functions do Supabase (Project > Edge Functions >
// New function > nome "generate-summary" > cole o código > Deploy).
//
// Antes de rodar, configure o secret ANTHROPIC_API_KEY em
// Project > Edge Functions > Secrets (nunca cole a chave em nenhum arquivo do projeto).
//
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já são injetados automaticamente pelo
// runtime da Supabase em toda Edge Function — não precisa cadastrar esses dois.

import Anthropic from "npm:@anthropic-ai/sdk";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------------- Roster (mesma fonte do dash-1x1-lideres/index.html) ----------------
const ADVISORS: { nome: string; equipe: string }[] = [{"nome":"Adilson Bonvino","equipe":"Maximus - SOR"},{"nome":"Adriano de Araujo","equipe":"Gold11 - SBC"},{"nome":"Alencar Bonifácio Leite","equipe":"Desbravadores JK - SP"},{"nome":"Alexandre Andreazzi Barnabe","equipe":"Staff"},{"nome":"Alexandre Selencovich Bandeira","equipe":"Macanudos - POA"},{"nome":"Alexanndre Kevin de Souza Puglisi","equipe":"Mesa proprietária"},{"nome":"Allan Mendes Pereira","equipe":"Nasdaq - SP"},{"nome":"Ana Lucia de Araujo Nunes","equipe":"Highlanders - SP"},{"nome":"Andre Castro","equipe":"AV Anywhere"},{"nome":"Andre Figueiredo Siqueira Cunha","equipe":"Highlanders - SP"},{"nome":"Andre Francisco Ferreira Miguel","equipe":"Rota 100"},{"nome":"Andrea de Oliveira Nogueira Berna","equipe":"Desbravadores JK - SP"},{"nome":"Andreia Cristina Tupy","equipe":"Gold11 - SBC"},{"nome":"Ângelo de la Costa Junior","equipe":"Nasdaq - SP"},{"nome":"Apostolos Demadis","equipe":"AV Anywhere"},{"nome":"Audilene Timoteo Lima Rodrigues","equipe":"Rota 100"},{"nome":"Beatriz de Melo Spilack","equipe":"Nasdaq - SP"},{"nome":"Bruno Cauduro Maciel","equipe":"Vikings - POA"},{"nome":"Bruno dos Santos de Sa","equipe":"Mesa proprietária"},{"nome":"Bruno Mendes Augusto","equipe":"Mesa proprietária"},{"nome":"Camila Caparelli","equipe":"Maximus - SOR"},{"nome":"Carla Baima da Silva","equipe":"Zênite - SP"},{"nome":"Carlos Alexandre Golfeto Junior","equipe":"Maximus - SOR"},{"nome":"Carlos Ivan Sturzbecher","equipe":"Rota 100"},{"nome":"Carlos Roberto Figueira Junior","equipe":"Nasdaq - SP"},{"nome":"Carmen Luce Oliveira Da Silva","equipe":"Macanudos - POA"},{"nome":"Caue Glorigiano Ribeiro","equipe":"Vikings - POA"},{"nome":"Celia Maciel Marques","equipe":"Rota 100"},{"nome":"Celso Alves Gonçalves Dias","equipe":"Dendê Equity - SSA"},{"nome":"Celso Arras Minchillo","equipe":"Highlanders - SP"},{"nome":"Christiane Hoerde Manfrin","equipe":"Vikings - POA"},{"nome":"Christianne Martins Fedeli Stoll","equipe":"Rota 100"},{"nome":"Cintia Manhani di Luccio","equipe":"Nasdaq - SP"},{"nome":"Cintia Oliveira Faria Sidiropoulos","equipe":"Zênite - SP"},{"nome":"Clara Maria Ribeiro de Souza","equipe":"Gold11 - SBC"},{"nome":"Claudio Augusto Mauad","equipe":"Highlanders - SP"},{"nome":"Claudio Diogenes Ferreira de Oliveira","equipe":"Rota 100"},{"nome":"Dalécio Guimares Papim","equipe":"Rota 100"},{"nome":"Daniel Assis de Almeida","equipe":"Dendê Equity - SSA"},{"nome":"Daniel Ignacio","equipe":"Rota 100"},{"nome":"Daniel Martelozzo Otavani","equipe":"Desbravadores JK - SP"},{"nome":"Daniel Miranda de Abreu Salum","equipe":"Gold11 - SBC"},{"nome":"Daniela Ferreira Midena","equipe":"Desbravadores JK - SP"},{"nome":"Daniele Mota Rodrigues de Almeida","equipe":"Zênite - SP"},{"nome":"Danielle Martini Scroback","equipe":"Zênite - SP"},{"nome":"Denise Guimarães Printes","equipe":"Nasdaq - SP"},{"nome":"Denys Labonia Ferreira Da Luz","equipe":"Maximus - SOR"},{"nome":"Diego Chaves Franco","equipe":"Gold11 - SBC"},{"nome":"Diego Lucio Martins","equipe":"AV Anywhere"},{"nome":"Diniz Braga Pires","equipe":"Sparta - SP"},{"nome":"Diogo Alejandro Hoffmann","equipe":"Rota 100"},{"nome":"Diogo Silvestre Scariot","equipe":"Macanudos - POA"},{"nome":"Domingos Eduardo Di Pietro","equipe":"Nasdaq - SP"},{"nome":"Edgar Endo","equipe":"Desbravadores JK - SP"},{"nome":"Eduardo Nunes Tavares","equipe":"Staff"},{"nome":"Eliana Bastos Martins","equipe":"Macanudos - POA"},{"nome":"Erick Teruhiko Katayama","equipe":"Rota 100"},{"nome":"Felipe Araujo Ribeiro","equipe":"Rota 100"},{"nome":"Felipe Chamarelli Pavanelli","equipe":"Staff"},{"nome":"Felipe Galan Baptistella","equipe":"Staff"},{"nome":"Felipe Nicolau Batista","equipe":"Gold11 - SBC"},{"nome":"Fernanda Priscila Pedroso Salgado","equipe":"Highlanders - SP"},{"nome":"Fernando Marchetti Encinas","equipe":"Gold11 - SBC"},{"nome":"Fernando Svitras de Oliveira","equipe":"Gold11 - SBC"},{"nome":"Fernando Yonehara Junior","equipe":"Highlanders - SP"},{"nome":"Filipe Costa de Araujo Santos","equipe":"Dendê Equity - SSA"},{"nome":"Filipe Sales Baptista da Costa Machado","equipe":"Dendê Equity - SSA"},{"nome":"Flavio Caravieri batista","equipe":"Nasdaq - SP"},{"nome":"Gabriel Corrente De Andrade","equipe":"Staff"},{"nome":"Gabriel Silvestre Scariot","equipe":"Vikings - POA"},{"nome":"Gabrielle Ramos Couto","equipe":"Staff"},{"nome":"Gabriel Ângelo Fuentes","equipe":"Sparta - SP"},{"nome":"Gisele Pazotti Souza","equipe":"Sparta - SP"},{"nome":"Raiane Fernanda Sassati","equipe":"Sparta - SP"},{"nome":"Rosana Muniz de Abreu","equipe":"Sparta - SP"},{"nome":"Luis Augusto","equipe":"Sparta - SP"},{"nome":"Meiriele Germano","equipe":"Sparta - SP"},{"nome":"Jessica Tomaz","equipe":"Sparta - SP"},{"nome":"Cristiane Bortolanza","equipe":"Sparta - SP"},{"nome":"Gianfranco Martini Frasson","equipe":"Vikings - POA"},{"nome":"Giovanni Avilla","equipe":"Highlanders - SP"},{"nome":"Giovanni DAngelo Guimarães Leite","equipe":"Staff"},{"nome":"Gisele Bervian Pinto Ribeiro","equipe":"Macanudos - POA"},{"nome":"Gislene Lepri de Medeiros","equipe":"Vikings - POA"},{"nome":"Gláucia de Oliveira Santos","equipe":"Gold11 - SBC"},{"nome":"Glauco Henrique Pinheiro Maciel","equipe":"Maximus - SOR"},{"nome":"Gregory de Oliveira Pagot","equipe":"Macanudos - POA"},{"nome":"Guilherme Bastos Hildebrand","equipe":"Vikings - POA"},{"nome":"Guilherme Jung Bittencourt","equipe":"Staff"},{"nome":"Guilherme Luis Bizarro dos Reis","equipe":"Macanudos - POA"},{"nome":"Gustavo Bercito Caruso","equipe":"Zênite - SP"},{"nome":"Gustavo Ferreira Soares Azevedo","equipe":"Zênite - SP"},{"nome":"Gustavo Martins Correia","equipe":"AV Anywhere"},{"nome":"Hariton Gomes Inacio Andrade","equipe":"Maximus - SOR"},{"nome":"Henrique Guedes Prohaska","equipe":"Maximus - SOR"},{"nome":"Henry Massaaki Ito","equipe":"AV Anywhere"},{"nome":"Ingrid Landgraf","equipe":"Gold11 - SBC"},{"nome":"Isaac Newton Ferreira Castelo","equipe":"Dendê Equity - SSA"},{"nome":"Ivancler Bruns Camacho","equipe":"Thunders - CX"},{"nome":"João Gilberto Martins Mello","equipe":"AV Anywhere"},{"nome":"João Lucas Albieri de Almeida","equipe":"Mesa proprietária"},{"nome":"João Lucas da Silva","equipe":"Rota 100"},{"nome":"João Paulo Teixeira Cardoso","equipe":"Maximus - SOR"},{"nome":"José Luciano Costa Maia","equipe":"Zênite - SP"},{"nome":"Juliana Honda Domingues","equipe":"Desbravadores JK - SP"},{"nome":"Kaio Henrique Colone Rodrigues","equipe":"Maximus - SOR"},{"nome":"Karine Urack Krug","equipe":"Vikings - POA"},{"nome":"Keilla Gomes","equipe":"AV Anywhere"},{"nome":"Laura Figueiredo Vieira","equipe":"Staff"},{"nome":"Leandro Hirt Rassier","equipe":"Macanudos - POA"},{"nome":"Leonardo Governo Faviere","equipe":"Nasdaq - SP"},{"nome":"Leontina Fernandes Codesseira","equipe":"Rota 100"},{"nome":"Lincoln de Lucio Medeiros","equipe":"Rota 100"},{"nome":"Lisiane Nitschke","equipe":"Vikings - POA"},{"nome":"Luan Gustavo Schmidt","equipe":"AV Anywhere"},{"nome":"Lucas Rodrigues Coura Junior","equipe":"Vikings - POA"},{"nome":"Luciane Andrade Prado Ribeiro","equipe":"Desbravadores JK - SP"},{"nome":"Lucio Beiersdorf Flor","equipe":"Vikings - POA"},{"nome":"Luiz Fernando Da Silva Guimarães","equipe":"Vikings - POA"},{"nome":"Luiz Pedro da Cunha Albornoz","equipe":"Zênite - SP"},{"nome":"Maikon Souza Oliveira","equipe":"Vikings - POA"},{"nome":"Manoel Soares de Gouveia Horta Neto","equipe":"Rota 100"},{"nome":"Marcelo Roth Kunzler","equipe":"Macanudos - POA"},{"nome":"Marcelo Santiago","equipe":"Nasdaq - SP"},{"nome":"Marcelo Sartor","equipe":"Thunders - CX"},{"nome":"Marcelo Serrano","equipe":"Maximus - SOR"},{"nome":"Marcos Corte Campos","equipe":"Highlanders - SP"},{"nome":"Mariana Sena Brito Gonçalves","equipe":"Dendê Equity - SSA"},{"nome":"Mariano Michalska Pereira Scalco","equipe":"Macanudos - POA"},{"nome":"Marisa de Oliveira","equipe":"Desbravadores JK - SP"},{"nome":"Matheus Gonçalo Antunes","equipe":"Staff"},{"nome":"Matheus Vargas Martins","equipe":"Vikings - POA"},{"nome":"Mauricio Manfron Santos","equipe":"Macanudos - POA"},{"nome":"Michael Martins da Silva","equipe":"Vikings - POA"},{"nome":"Miriam Reiko Takara","equipe":"Staff"},{"nome":"Murilo dos Santos Medeiros","equipe":"Desbravadores JK - SP"},{"nome":"Murilo Godoi Vecchi","equipe":"Gold11 - SBC"},{"nome":"Murilo Simões Gonçalves de Sousa","equipe":"Mesa proprietária"},{"nome":"Nataly Ferreira da Silva Sothe","equipe":"Zênite - SP"},{"nome":"Nelson Nicastro Jnior","equipe":"Rota 100"},{"nome":"Paloma Aparecida Pinheiro Brito","equipe":"Staff"},{"nome":"Patrick de Lima Rodrigues","equipe":"Macanudos - POA"},{"nome":"Paula Ribeiro Campos","equipe":"Rota 100"},{"nome":"Paulo André Bertone Faneco","equipe":"AV Anywhere"},{"nome":"Paulo Marcus Kudler","equipe":"Rota 100"},{"nome":"Paulo Rogerio Chrispim de Oliveira","equipe":"Rota 100"},{"nome":"Pedro Serravalle de Sá","equipe":"Dendê Equity - SSA"},{"nome":"Piero Boschi","equipe":"Nasdaq - SP"},{"nome":"Rafael Carini","equipe":"Thunders - CX"},{"nome":"Rafael de Freitas Costa","equipe":"Dendê Equity - SSA"},{"nome":"Rafael Girardi Fassarella","equipe":"Nasdaq - SP"},{"nome":"Rafael Papp Pereira","equipe":"Desbravadores JK - SP"},{"nome":"Rafael Quintana Da Rosa","equipe":"Macanudos - POA"},{"nome":"Rafael Ramalho De Souza","equipe":"Thunders - CX"},{"nome":"Ramiro Inocencio Filho","equipe":"Staff"},{"nome":"Renan Nogueira Hoffmann","equipe":"Maximus - SOR"},{"nome":"Renato de Almeida Silva","equipe":"Maximus - SOR"},{"nome":"Renato Jun Yoshioka","equipe":"Nasdaq - SP"},{"nome":"Renato Tavares Vulcano","equipe":"Maximus - SOR"},{"nome":"Rene Almeida Sampaio Santos","equipe":"Zênite - SP"},{"nome":"Ricardo Antonello","equipe":"AV Anywhere"},{"nome":"Riuji Augusto Kiyohara","equipe":"Highlanders - SP"},{"nome":"Roberta Tronco Nunes","equipe":"Thunders - CX"},{"nome":"Roberto Pedroso Garcia","equipe":"Nasdaq - SP"},{"nome":"Rodrigo de Oliveira Mascher","equipe":"Gold11 - SBC"},{"nome":"Rodrigo Mota Mello Rodriguez","equipe":"Staff"},{"nome":"Rômulo Arpini da Rosa","equipe":"Vikings - POA"},{"nome":"Ronie Silva De Carvalho","equipe":"Rota 100"},{"nome":"Roselene Mello Milani","equipe":"Zênite - SP"},{"nome":"Sabrina Roberta Stefani","equipe":"Maximus - SOR"},{"nome":"Silmara Pires de Sousa","equipe":"Maximus - SOR"},{"nome":"Tamires Angelica Vidal","equipe":"Desbravadores JK - SP"},{"nome":"Thiago Vicente Rentz","equipe":"Thunders - CX"},{"nome":"Thiago Vicentin Pereira","equipe":"AV Anywhere"},{"nome":"Tiago Camilo Teixeira","equipe":"Maximus - SOR"},{"nome":"Tiago Sigillo Pellegrini","equipe":"Highlanders - SP"},{"nome":"Victor Dib","equipe":"Maximus - SOR"},{"nome":"Victor Gomes Delfini","equipe":"Vikings - POA"},{"nome":"Victor Romano","equipe":"Staff"},{"nome":"Vinícius Torres Carnelós","equipe":"Rota 100"},{"nome":"Vinicius Xavier Parra","equipe":"Zênite - SP"},{"nome":"Vitor Fernando Matioli Guerra","equipe":"Desbravadores JK - SP"}].filter((a) => a.equipe !== "Staff");

const LIDER_MAP: Record<string, string> = {
  "Zênite - SP": "Paulo Alberto Pessotti Tavares",
  "Dendê Equity - SSA": "Manoel Francisco Bastos Neto",
  "Desbravadores JK - SP": "Rodrigo Vinicius Cavalcante Piombo",
  "Gold11 - SBC": "Renan Guelbali Perton",
  "Highlanders - SP": "Martinho De Oliveira Fernandes",
  "Macanudos - POA": "Lucas Martins Braga",
  "Maximus - SOR": "Caique Antonio Bizoni",
  "Nasdaq - SP": "Pedro Santos Gumiel",
  "Rota 100": "Alex de Souza Dias",
  "Sparta - SP": "George Isaias Melo",
  "Mesa proprietária": "George Isaias Melo",
  "Thunders - CX": "Leonardo Baumgarten",
  "Vikings - POA": "Julio Alberto Passos Baez",
};

const TEAMS = Array.from(new Set(ADVISORS.map((a) => a.equipe))).sort();

// ---------------- Semana ISO (mesma lógica do front-end) ----------------
function pad2(n: number) { return String(n).padStart(2, "0"); }
function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function isoWeekInfo(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const fDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fDayNum + 3);
  const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 864e5));
  return { year: t.getUTCFullYear(), week };
}
function weekKeyFor(monday: Date) {
  const info = isoWeekInfo(monday);
  return `${info.year}-W${pad2(info.week)}`;
}
function fmtRange(monday: Date) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const f = (d: Date) => `${d.getDate()} ${months[d.getMonth()]}`;
  return monday.getMonth() === sunday.getMonth()
    ? `${monday.getDate()}–${f(sunday)}`
    : `${f(monday)} – ${f(sunday)}`;
}

// ---------------- Checklist ratio (mesma lógica do front-end) ----------------
type ChecklistItem = { k: "check" | "scale" | "value" };
const MEETING_SECTIONS: ChecklistItem[][] = [
  [{ k: "check" }, { k: "check" }, { k: "check" }, { k: "check" }, { k: "check" }],
  [{ k: "check" }, { k: "check" }, { k: "check" }, { k: "check" }],
  [{ k: "check" }, { k: "check" }, { k: "check" }],
  [{ k: "check" }, { k: "check" }, { k: "scale" }, { k: "check" }],
];
const INDICATORS_SECTIONS: ChecklistItem[][] = [
  Array.from({ length: 11 }, () => ({ k: "value" as const })),
];

function buildChecklist(sections: ChecklistItem[][]) {
  const flat: ChecklistItem[] = [];
  const sectionRanges: { start: number; end: number; count: number }[] = [];
  sections.forEach((sec) => {
    const start = flat.length;
    sec.forEach((it) => flat.push(it));
    sectionRanges.push({ start, end: flat.length, count: sec.length });
  });
  return { flat, sectionRanges };
}
const CHECKLISTS = {
  reuniao11: buildChecklist(MEETING_SECTIONS),
  indicadoresResultado: buildChecklist(INDICATORS_SECTIONS),
};

function isAnswered(val: unknown, kind: string) {
  if (kind === "scale" || kind === "value") return val !== undefined && val !== null && val !== "";
  return !!val;
}
function checklistRatio(answers: unknown[], cl: { flat: ChecklistItem[]; sectionRanges: { start: number; end: number; count: number }[] }) {
  if (!cl.sectionRanges.length) return 0;
  let sum = 0;
  cl.sectionRanges.forEach((r) => {
    let answered = 0;
    for (let i = r.start; i < r.end; i++) if (isAnswered(answers[i], cl.flat[i].k)) answered++;
    const target = Math.min(2, r.count) || 1;
    sum += Math.min(answered / target, 1);
  });
  return sum / cl.sectionRanges.length;
}
function checklistTouched(answers: unknown[], flat: ChecklistItem[]) {
  for (let i = 0; i < flat.length; i++) {
    const val = answers[i];
    const k = flat[i].k;
    if (k === "scale" || k === "value") { if (val !== undefined && val !== null && val !== "") return true; }
    else if (val) return true;
  }
  return false;
}

type WeeklyRow = { equipe: string; nome: string; items: any; notes: string };
type WeeksIndex = Record<string, Record<string, Record<string, { items: any; notes: string }>>>; // week->equipe->nome

function computeStatus(weeks: WeeksIndex, weekKey: string, equipe: string, nome: string) {
  const entry = weeks[weekKey]?.[equipe]?.[nome];
  if (!entry) return { status: "pend" as const, pct: null as number | null };
  const items = entry.items || {};
  let anyTouched = false, sum = 0;
  (["reuniao11", "indicadoresResultado"] as const).forEach((key) => {
    const cl = CHECKLISTS[key];
    const obj = items[key] || {};
    const answers = obj.answers || [];
    if (checklistTouched(answers, cl.flat)) anyTouched = true;
    sum += checklistRatio(answers, cl);
  });
  if (!anyTouched) return { status: "pend" as const, pct: null as number | null };
  const pct = Math.round((sum / 2) * 100);
  const status = pct >= 80 ? "ok" : pct >= 50 ? "warn" : "crit";
  return { status: status as "ok" | "warn" | "crit", pct };
}

function teamStats(weeks: WeeksIndex, equipe: string, weekKey: string) {
  const advisors = ADVISORS.filter((a) => a.equipe === equipe);
  const counts = { ok: 0, warn: 0, crit: 0, pend: 0 };
  let sum = 0, withData = 0;
  advisors.forEach((a) => {
    const r = computeStatus(weeks, weekKey, a.equipe, a.nome);
    counts[r.status]++;
    if (r.pct !== null) { sum += r.pct; withData++; }
  });
  const avg = withData ? Math.round(sum / withData) : null;
  return { total: advisors.length, counts, avg };
}

// ---------------- Handler ----------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY não configurado nos secrets da Edge Function." }), {
        status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const sbHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
    const [entriesRes, metaRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/weekly_entries?select=*`, { headers: sbHeaders }),
      fetch(`${SUPABASE_URL}/rest/v1/advisor_meta?select=*`, { headers: sbHeaders }),
    ]);
    const entries: WeeklyRow[] & { week_key: string }[] = await entriesRes.json();
    const metas: { equipe: string; nome: string; quadrant: string | null }[] = await metaRes.json();

    const weeks: WeeksIndex = {};
    (entries as any[]).forEach((row) => {
      weeks[row.week_key] = weeks[row.week_key] || {};
      weeks[row.week_key][row.equipe] = weeks[row.week_key][row.equipe] || {};
      weeks[row.week_key][row.equipe][row.nome] = { items: row.items || {}, notes: row.notes || "" };
    });

    const currentMonday = startOfWeek(new Date());
    const weekKey = weekKeyFor(currentMonday);
    const prevMonday = new Date(currentMonday); prevMonday.setDate(prevMonday.getDate() - 7);
    const prevWeekKey = weekKeyFor(prevMonday);

    // Stats por time (aderência atual + delta vs semana anterior)
    const teamRows = TEAMS.map((equipe) => {
      const s = teamStats(weeks, equipe, weekKey);
      const prev = teamStats(weeks, equipe, prevWeekKey);
      return {
        equipe,
        lider: LIDER_MAP[equipe] || null,
        total: s.total,
        avgPct: s.avg,
        deltaPct: s.avg !== null && prev.avg !== null ? s.avg - prev.avg : null,
        counts: s.counts,
      };
    });

    // Quadrante por time
    const quadByTeam: Record<string, { A: number; B: number; C: number; D: number; semClassificar: number; total: number }> = {};
    TEAMS.forEach((t) => { quadByTeam[t] = { A: 0, B: 0, C: 0, D: 0, semClassificar: 0, total: 0 }; });
    metas.forEach((m) => {
      if (!quadByTeam[m.equipe]) return;
      quadByTeam[m.equipe].total++;
      if (m.quadrant === "A" || m.quadrant === "B" || m.quadrant === "C" || m.quadrant === "D") quadByTeam[m.equipe][m.quadrant]++;
      else quadByTeam[m.equipe].semClassificar++;
    });

    // Conteúdo bruto da semana atual (ata + observações) para leitura qualitativa
    const rawContent: { equipe: string; nome: string; ata: string; notes: string }[] = [];
    (entries as any[]).forEach((row) => {
      if (row.week_key !== weekKey) return;
      const ata = row.items?.reuniao11?.ata || "";
      const notes = row.notes || "";
      if (ata || notes) rawContent.push({ equipe: row.equipe, nome: row.nome, ata, notes });
    });

    const payload = {
      semana_atual: { week_key: weekKey, range: fmtRange(currentMonday) },
      semana_anterior: { week_key: prevWeekKey },
      times: teamRows,
      quadrante_por_time: quadByTeam,
      registros_da_semana: rawContent,
    };

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const system = `Você é um analista que prepara resumos executivos semanais do programa "Rotina Comercial" de um escritório de investimentos, para o comitê executivo da empresa. Escreva em português do Brasil, em Markdown, seguindo EXATAMENTE esta estrutura de seções (use estes títulos):

## Panorama geral
Uma tabela markdown com times por status (Em dia ≥80%, Atenção 50–79%, Crítico <50%, Sem dados) e um parágrafo curto de contexto.

### Práticas de liderança observadas
Analise o conteúdo das atas/observações (campo "registros_da_semana") e caracterize, por líder, a qualidade e o estilo de condução das 1:1s: quem documenta bem (diagnóstico real, específico, com follow-up), quem usa um estilo mais mecânico/numérico, e quem mostra sinais de prática rasa ou superficial (ex.: perguntas-modelo coladas sem resposta, ausência de plano de ação apesar de preencher indicadores). Cite o líder pelo nome.

### Diagnóstico de quadrante (Esforço × Resultado)
Use "quadrante_por_time" para destacar times com concentração alta em quadrante D (Problema) ou C (Em Declínio), times sem nenhuma classificação feita (lacuna de gestão), e qualquer contraste interessante com a seção de práticas de liderança (ex.: líder com boa prática mas time mal diagnosticado).

### Sinais de alerta — pessoal e performance
A partir de "registros_da_semana", identifique casos de: ausências (no-show, féria, doença, emergência familiar), problemas de saúde, sinais de desengajamento ou risco de saída, situações de desligamento/transição, e sinais de interesse em mobilidade interna/carreira. REGRA IMPORTANTE: cite o nome completo do assessor nos itens de performance/carreira/ausências, mas NUNCA cite o nome em casos que envolvam saúde física ou mental — para esses, descreva a situação sem identificar a pessoa (ex.: "Um assessor da equipe X relatou..."), pois são dados sensíveis (LGPD).

## Alinhamento estratégico
Temas comerciais recorrentes nos planos de ação (ex.: fee fixo, reativação de clientes, campanhas) que aparecem em múltiplos times, mostrando (ou não) alinhamento com a diretriz comercial.

## Recomendações
3 a 6 recomendações objetivas e acionáveis, cada uma em uma linha, ligadas aos achados acima.

Seja direto e conciso — este é um documento para executivos lerem em poucos minutos, não um relatório exaustivo. Não invente dados que não estão no payload. Se um campo estiver vazio ou ausente, não force uma conclusão sobre ele.`;

    const response = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 8000,
      output_config: { effort: "high" },
      system,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    const summary = textBlock?.text ?? "";

    return new Response(JSON.stringify({ summary, week_key: weekKey }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
