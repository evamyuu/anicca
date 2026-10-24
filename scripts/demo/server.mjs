#!/usr/bin/env node
/**
 * Anicca — servidor de demonstração OFFLINE.
 *
 * Substitui a API FastAPI (porta 8000) com dados mockados em memória para
 * demonstrar o fluxo WhatsApp → App → Painel web sem internet:
 *
 *   • /whatsapp               Simulador de WhatsApp (conversa com a Ani + roteiro da demo)
 *   • /api/v1/...             Endpoints usados pelo app (rotina, body map, docs, chat, login)
 *   • /api/v1/doctor/...      Endpoints usados pelo painel do médico (Next.js)
 *   • /api/v1/events/stream   SSE — o app atualiza na hora quando chega mensagem no WhatsApp
 *
 * Uso:  node scripts/demo/server.mjs        (sem dependências — só Node 18+)
 *
 * Author:    Evelin Brandão Cordeiro
 * Copyright: 2026 Anicca. All rights reserved.
 * License:   MIT
 */

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number(process.env.PORT ?? 8000);
const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ════════════════════════════════════════════════════════════════════════════
 * PERSONAS
 * ════════════════════════════════════════════════════════════════════════════ */

const ROSA_ID = '7f3c2a10-5b8e-4d21-9c6a-2e4f8b1d0a37';

const ROSA = {
  id: ROSA_ID,
  name: 'Rosa Maria Andrade',
  firstName: 'Rosa',
  age: 52,
  phone: '5511987654321',
  cancer_type: 'Câncer de mama (CDI RH+/HER2−)',
  cancer_stage: 'IIB',
  protocol: 'AC-T — Ciclo 2/6, D8',
};

const CAREGIVER = { name: 'Lucas Andrade', firstName: 'Lucas', relationship: 'filho' };
const DOCTOR = { name: 'Dra. Sandra Motta', specialty: 'Oncologia Clínica' };

const OTHER_PATIENTS = [
  {
    id: 'b8e1d2c3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
    name: 'Ana Clara Nogueira',
    cancer_type: 'Colo do útero (CEC)',
    cancer_stage: 'IIIB',
    protocol: 'Cisplatina semanal + Radioterapia',
    risk_level: 'Alto',
    temp: '37,4 °C',
    bp: '104x68 mmHg',
    weight: '51.2 kg',
    risk: 0.81,
    factors: ['Faltou a 2 sessões de RT', 'Mora a 68 km do CACON', 'Sem cuidador cadastrado'],
    alerts: ['Náusea grau 3 relatada via WhatsApp há 2 dias (Intensidade: 3/5)', 'Diarreia grau 2 — orientada hidratação oral'],
    briefing:
      'Paciente de 41 anos com CEC de colo uterino IIIB em quimiorradiação (semana 4/6). Náusea grau 3 e diarreia grau 2 nos últimos 3 dias, com 2 faltas à radioterapia. Alto risco de abandono — sugerido acionamento do Serviço Social para TFD.',
  },
  {
    id: 'c9f2e3d4-5a6b-4c7d-9e8f-0a1b2c3d4e5f',
    name: 'Marcos Vinícius Lima',
    cancer_type: 'Adenocarcinoma de cólon',
    cancer_stage: 'III',
    protocol: 'FOLFOX — Ciclo 5/12',
    risk_level: 'Médio',
    temp: '36,6 °C',
    bp: '132x84 mmHg',
    weight: '78.0 kg',
    risk: 0.46,
    factors: ['Neuropatia periférica grau 1 em progressão', 'Adesão à rotina 71%'],
    alerts: ['Formigamento nas mãos e pés (Intensidade: 1/5) — piora com frio'],
    briefing:
      'Paciente de 58 anos, adenocarcinoma de cólon estádio III em FOLFOX adjuvante (C5/12). Neuropatia sensitiva grau 1 induzida por oxaliplatina, estável. Sinais vitais normais; avaliar redução de dose se progredir para grau 2.',
  },
  {
    id: 'd0a3f4e5-6b7c-4d8e-8f9a-1b2c3d4e5f6a',
    name: 'Helena Sato',
    cancer_type: 'Pulmão — adenocarcinoma (CPNPC)',
    cancer_stage: 'IV',
    protocol: 'Pembrolizumabe — Ciclo 8',
    risk_level: 'Médio',
    temp: '36,9 °C',
    bp: '128x78 mmHg',
    weight: '55.4 kg',
    risk: 0.39,
    factors: ['Fadiga grau 2', 'Cuidadora ativa (filha)'],
    alerts: ['Tosse seca há 5 dias — investigar pneumonite (Intensidade: 2/5)'],
    briefing:
      'Paciente de 72 anos com CPNPC estádio IV (PD-L1 80%) em imunoterapia com pembrolizumabe (C8). Tosse seca persistente há 5 dias: considerar pneumonite imunomediada — solicitar TC de tórax antes do próximo ciclo.',
  },
  {
    id: 'e1b4a5f6-7c8d-4e9f-9a0b-2c3d4e5f6a7b',
    name: 'João Batista Ferreira',
    cancer_type: 'Próstata (adenocarcinoma)',
    cancer_stage: 'III',
    protocol: 'Docetaxel — Ciclo 3/6',
    risk_level: 'Baixo',
    temp: '36,4 °C',
    bp: '138x86 mmHg',
    weight: '82.3 kg',
    risk: 0.18,
    factors: ['Adesão à rotina 96%', 'Esposa cuidadora ativa'],
    alerts: ['Nenhum sintoma grave reportado recentemente.'],
    briefing:
      'Paciente de 67 anos com adenocarcinoma de próstata estádio III em docetaxel (C3/6), boa tolerância. Sem eventos adversos relevantes; manter seguimento.',
  },
  {
    id: 'f2c5b6a7-8d9e-4f0a-8b1c-3d4e5f6a7b8c',
    name: 'Paulo Henrique Souza',
    cancer_type: 'Linfoma de Hodgkin',
    cancer_stage: 'II',
    protocol: 'ABVD — Ciclo 4/6',
    risk_level: 'Baixo',
    temp: '36,8 °C',
    bp: '120x80 mmHg',
    weight: '70.1 kg',
    risk: 0.22,
    factors: ['PET interino negativo (Deauville 2)', 'Adesão à rotina 92%'],
    alerts: ['Fadiga leve pós-ciclo (Intensidade: 1/5)'],
    briefing:
      'Paciente de 49 anos com linfoma de Hodgkin estádio II em ABVD (C4/6), PET interino negativo. Fadiga leve pós-infusão. Evolução favorável.',
  },
];

/* ════════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ════════════════════════════════════════════════════════════════════════════ */

const DAY_MS = 86_400_000;
const FEVER = 37.8;

const now = () => new Date();
const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d, hour = 10, minute = 0) => {
  const t = new Date(Date.now() - d * DAY_MS);
  t.setHours(hour, minute, 0, 0);
  return t.toISOString();
};
const hhmm = (iso = now().toISOString()) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const fmtTemp = (t) => `${String(t).replace('.', ',')}°C`;

const REGION_LABELS = {
  front: {
    cabeca: 'Cabeça', trapezio: 'Pescoço / Trapézio', ombro_dir: 'Ombro direito', ombro_esq: 'Ombro esquerdo',
    peito_dir: 'Peito (lado direito)', peito_esq: 'Peito (lado esquerdo)', biceps_dir: 'Braço direito',
    biceps_esq: 'Braço esquerdo', antebraco_dir: 'Antebraço direito', antebraco_esq: 'Antebraço esquerdo',
    mao_dir: 'Mão direita', mao_esq: 'Mão esquerda', abdomen: 'Abdômen',
    obliquo_dir: 'Lateral do abdômen (direita)', obliquo_esq: 'Lateral do abdômen (esquerda)',
    coxa_dir: 'Coxa direita', coxa_esq: 'Coxa esquerda', panturrilha_dir: 'Perna direita', panturrilha_esq: 'Perna esquerda',
  },
  back: {
    cabeca: 'Nuca', trapezio: 'Cervical / Trapézio', abdomen: 'Lombar',
    peito_dir: 'Costas superiores (esquerda)', peito_esq: 'Costas superiores (direita)',
  },
};
const regionLabel = (id, view = 'front') => REGION_LABELS[view]?.[id] ?? REGION_LABELS.front[id] ?? id;

const SYMPTOM_LABELS = {
  dor: 'dor', dormencia: 'dormência', inchaco: 'inchaço', vermelhidao: 'vermelhidão',
  ferida: 'ferida', formigamento: 'formigamento', outro: 'sintoma',
};

const svgDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const PHOTO_HEMOGRAMA = svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="#cfc6bd"/><g transform="rotate(-4 160 100)"><rect x="40" y="18" width="240" height="180" rx="4" fill="#fff"/><text x="58" y="48" font-family="Arial" font-size="12" font-weight="700" fill="#403229">HEMOGRAMA COMPLETO</text><rect x="58" y="62" width="170" height="6" rx="3" fill="#d9d2cc"/><rect x="58" y="78" width="200" height="6" rx="3" fill="#d9d2cc"/><rect x="58" y="94" width="150" height="6" rx="3" fill="#d9d2cc"/><rect x="58" y="112" width="110" height="7" rx="3" fill="#ff9a5c"/><rect x="58" y="130" width="190" height="6" rx="3" fill="#d9d2cc"/><rect x="58" y="146" width="140" height="6" rx="3" fill="#d9d2cc"/></g></svg>`);

const PHOTO_MAO = svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="#efe4da"/><path d="M110 190 C100 140 92 110 96 86 C98 72 112 72 114 86 L120 120 L118 52 C118 36 136 36 136 52 L140 112 L144 40 C144 24 162 24 162 40 L164 112 L170 50 C171 34 188 36 187 52 L184 122 L196 100 C204 86 222 94 214 110 L188 168 C182 182 176 190 170 190 Z" fill="#e8b996" stroke="#b88563" stroke-width="2"/><ellipse cx="152" cy="150" rx="34" ry="24" fill="#e0695a" opacity="0.45"/><ellipse cx="128" cy="62" rx="9" ry="7" fill="#e0695a" opacity="0.4"/><ellipse cx="153" cy="50" rx="9" ry="7" fill="#e0695a" opacity="0.4"/><text x="12" y="20" font-family="Arial" font-size="11" fill="#736760">palma da mão direita</text></svg>`);

/* ════════════════════════════════════════════════════════════════════════════
 * STATE (em memória — reinicia com o servidor ou POST /demo/reset)
 * ════════════════════════════════════════════════════════════════════════════ */

let state;
let revision = 0;

/* ── Referências usadas pela IA clínica (simuladas como resultado da busca no PubMed) ── */
const PUBMED = {
  febrile: '**Taplitz RA, Kennedy EB, Bow EJ, et al.** Outpatient Management of Fever and Neutropenia in Adults Treated for Malignancy: ASCO and IDSA Clinical Practice Guideline Update. J Clin Oncol, 2018. — PubMed',
  esmoFn: '**Klastersky J, de Naurois J, Rolston K, et al.** Management of febrile neutropaenia: ESMO Clinical Practice Guidelines. Ann Oncol, 2016. — PubMed',
  idsa: '**Freifeld AG, Bow EJ, Sepkowitz KA, et al.** Clinical practice guideline for the use of antimicrobial agents in neutropenic patients with cancer: 2010 update by the IDSA. Clin Infect Dis, 2011. — PubMed',
  gcsf: '**Aapro MS, Bohlius J, Cameron DA, et al.** 2010 update of EORTC guidelines for the use of granulocyte-colony stimulating factor to reduce the incidence of chemotherapy-induced febrile neutropenia. Eur J Cancer, 2011. — PubMed',
  esc: '**Lyon AR, López-Fernández T, Couch LS, et al.** 2022 ESC Guidelines on cardio-oncology. Eur Heart J, 2022. — PubMed',
  cardinale: '**Cardinale D, Colombo A, Bacchiani G, et al.** Early detection of anthracycline cardiotoxicity and improvement with heart failure therapy. Circulation, 2015. — PubMed',
  createx: '**Masuda N, Lee SJ, Ohtani S, et al.** Adjuvant Capecitabine for Breast Cancer after Preoperative Chemotherapy (CREATE-X). N Engl J Med, 2017. — PubMed',
  basch2016: '**Basch E, Deal AM, Kris MG, et al.** Symptom Monitoring With Patient-Reported Outcomes During Routine Cancer Treatment: A Randomized Controlled Trial. J Clin Oncol, 2016. — PubMed',
  basch2017: '**Basch E, Deal AM, Dueck AC, et al.** Overall Survival Results of a Trial Assessing Patient-Reported Outcomes for Symptom Monitoring During Routine Cancer Treatment. JAMA, 2017. — PubMed',
  ctcae: '**NCI.** Common Terminology Criteria for Adverse Events (CTCAE) v5.0, 2017. — Diretriz',
  extravasation: '**Pérez Fidalgo JA, García Fabregat L, Cervantes A, et al.** Management of chemotherapy extravasation: ESMO-EONS Clinical Practice Guidelines. Ann Oncol, 2012. — PubMed',
};

/** Ani clinical answer in the format the panel parses (raciocínio / resposta / fontes). */
function aniClinical(thinking, clinical, context, pubmed) {
  return [
    `**[PENSAMENTO]** ${thinking}`,
    `**[RESPOSTA CLÍNICA]** ${clinical}`,
    `**[FONTES E REFERÊNCIAS]**\n## Contexto da paciente (Anicca)\n${context.map((c) => `- ${c}`).join('\n')}\n## PubMed\n${pubmed.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
  ].join('\n\n');
}

function seedDoctorSessions() {
  const session = (id, preview, dayOffset, hour, question, answer, patientId = ROSA_ID) => ({
    id,
    ...(patientId ? { patientId } : {}),
    preview,
    date: new Date(Date.now() - dayOffset * DAY_MS).toLocaleDateString('pt-BR'),
    messages: [
      { id: `${id}-q`, role: 'user', content: question, timestamp: daysAgo(dayOffset, hour, 2) },
      { id: `${id}-a`, role: 'assistant', content: answer, timestamp: daysAgo(dayOffset, hour, 3) },
    ],
  });

  return [
    session(
      'sess-rosa-briefing', 'Briefing para a consulta de quinta...', 0, 7,
      'Prepare o briefing da consulta de quinta com a Rosa.',
      aniClinical(
        'Consolidei os últimos 30 dias dos canais WhatsApp, app, smartwatch e documentos. Priorizei eventos com impacto na decisão do C3.',
        'Rosa, 52 anos, CDI de mama RH+/HER2− IIB, AC-T C2D8.\n- **Hematológico:** neutrófilos 1.200/mm³ no D7 (nadir esperado), sem febre até agora.\n- **Sintomas (PRO):** dor torácica leve relatada no app, fadiga grau 2 e náusea grau 1 (CTCAE autorreferido).\n- **Adesão:** 2/5 medicamentos tomados hoje até 8h; hidratação 4/8 copos.\n- **Psicossocial:** humor 3/5 no diário; cuidador ativo (filho Lucas).\n- **Pendências:** ecocardiograma de controle aguardando regulação (chamado SUS aberto).\n**Sugestões para a consulta:** revisar dor torácica antes da 3ª dose de doxorrubicina, confirmar eco, discutir G-CSF profilático se houver neutropenia febril.',
        ['Hemograma de ontem (Docs, enviado pelo WhatsApp)', 'Body Map e escala CTCAE (app)', 'Diário emocional (app)', 'Chamado SUS-2026-118734 (ecocardiograma)', 'Smartwatch: FC média 82 bpm, 1.333 passos'],
        [PUBMED.basch2016, PUBMED.basch2017],
      ),
    ),
    session(
      'sess-rosa-neutro', 'Conduta na neutropenia do D8...', 1, 18,
      'Conduta na neutropenia do D8 da Rosa?',
      aniClinical(
        'Neutrófilos 1.200/mm³ no D7–D8 de AC correspondem ao nadir esperado (neutropenia grau 2), sem febre. Busquei diretrizes de neutropenia febril e uso de G-CSF.',
        'Neutropenia grau 2 assintomática **não exige G-CSF terapêutico** [1]. Manter orientação de febre ≥ 37,8°C → PS e precauções de exposição; repetir hemograma no D15 ou antes do C3. Considerar **profilaxia primária com G-CSF** nos próximos ciclos se houver neutropenia febril neste ciclo [3].',
        ['Hemograma 23/10 — neutrófilos 1.200/mm³', 'Protocolo AC-T, ciclo 2/6, D8', 'Temperatura 36,7 °C (rotina do app)'],
        [PUBMED.febrile, PUBMED.esmoFn, PUBMED.gcsf],
      ),
    ),
    session(
      'sess-rosa-torax', 'Dor torácica em uso de doxorrubicina...', 1, 20,
      'A Rosa marcou dor no peito no Body Map. Preciso investigar cardiotoxicidade?',
      aniClinical(
        'Dor torácica grau 2 registrada ontem às 20h15 no Body Map (peito, lado direito, piora ao respirar fundo). Paciente em antraciclina (dose acumulada ~120 mg/m²). Diferenciais: cardiotoxicidade, TEP, dor musculoesquelética/pleurítica.',
        'Sim, vale investigar antes da próxima dose de doxorrubicina. Sugestão: **ECG, troponina e BNP**; **ecocardiograma com FEVE e strain (GLS)** comparando com o basal [1][2]. Se dispneia ou taquicardia, considerar angio-TC para TEP. Queda de FEVE > 10 pontos para < 53% ou queda relativa do GLS > 15% indica cardiotoxicidade — discutir com cardio-oncologia.',
        ['Body Map: peito (lado direito), dor grau 2, "piora ao respirar fundo"', 'Smartwatch: FC 82 bpm, sem arritmia registrada', 'Chamado aberto: ecocardiograma aguardando regulação'],
        [PUBMED.esc, PUBMED.cardinale],
      ),
    ),
    session(
      'sess-rosa-maope', 'Síndrome mão-pé com capecitabina...', 0, 6,
      'Se a Rosa tiver síndrome mão-pé com a capecitabina, como ajusto a dose?',
      aniClinical(
        'Busquei a tabela de ajuste de dose da capecitabina e dados de toxicidade do CREATE-X (capecitabina adjuvante em mama HER2−).',
        '- **Grau 1:** manter dose; emoliente com ureia 10%, evitar calor e atrito.\n- **Grau 2:** suspender até regredir para grau ≤ 1 e retomar na mesma dose (1º episódio).\n- **Grau 3:** suspender e reduzir a dose em 25% na retomada.\nA síndrome mão-pé foi o evento adverso mais comum no CREATE-X [1]. Peça para a Rosa mandar foto pelo WhatsApp: a visão computacional classifica o grau e gera a nota clínica no painel.',
        ['Prescrição: Capecitabina 500 mg, 2 cp 2x/dia (rotina do app)', 'Escala CTCAE: sem registro de mão-pé até agora'],
        [PUBMED.createx, PUBMED.ctcae],
      ),
    ),
    session(
      'sess-geral-pro', 'Evidência do monitoramento por PRO...', 2, 16,
      'Qual a evidência de que monitorar sintomas pelo paciente (PRO) melhora desfechos?',
      aniClinical(
        'Pergunta geral, sem paciente selecionado. Busquei ensaios randomizados de PRO em oncologia.',
        'O ensaio de Basch et al. randomizou pacientes em quimioterapia para relato eletrônico de sintomas vs. cuidado usual: houve **melhor qualidade de vida, menos idas ao PS** [1] e **ganho de sobrevida global mediana de ~5 meses** [2]. É a base do modelo da Anicca: sintomas relatados pelo WhatsApp/app viram alertas no painel em tempo real.',
        ['Base Anicca: 6 pacientes ativos, 18 relatos de sintomas nos últimos 7 dias'],
        [PUBMED.basch2016, PUBMED.basch2017],
      ),
      null,
    ),
  ];
}

function createState() {
  const today = now().toISOString().slice(0, 10);
  const greeting = {
    id: randomUUID(),
    from: 'ani',
    text: `Bom dia, ${ROSA.firstName}! ☀️ Hoje é o dia 8 do seu ciclo 2. Seus neutrófilos estão baixos, então evite aglomerações e use máscara em lugares fechados.\n\nJá tomou a Ondansetrona da manhã?`,
    at: daysAgo(0, 8, 2),
  };

  return {
    routine: {
      id: randomUUID(),
      patient_id: ROSA_ID,
      date: today,
      temperature: 36.7,
      temperature_alert: false,
      hydration_glasses: 4,
      sleep_hours: 7,
      sleep_quality: 5,
      medications: [
        { name: 'Capecitabina', period: 'morning', taken: true, dose: '500mg • 2 comprimidos', instructions: 'Com o café da manhã', type: 'Quimio oral' },
        { name: 'Dexametasona', period: 'morning', taken: true, dose: '4mg • 1 comprimido', instructions: 'Com o café da manhã', type: 'Anti-náusea' },
        { name: 'Ondansetrona', period: 'morning', taken: false, dose: '8mg • 1 comprimido', instructions: 'Em jejum ou com água', type: 'Anti-náusea' },
        { name: 'Omeprazol', period: 'afternoon', taken: false, dose: '20mg • 1 cápsula', instructions: '30 min antes do almoço', type: 'Suporte' },
        { name: 'Ondansetrona', period: 'afternoon', taken: false, dose: '8mg • 1 comprimido', instructions: 'Se náusea', type: 'Anti-náusea', as_needed: true },
        { name: 'Capecitabina', period: 'night', taken: false, dose: '500mg • 2 comprimidos', instructions: 'Com o jantar', type: 'Quimio oral' },
      ],
      wearable_steps: 1333,
      wearable_hrv: 38,
      wearable_heart_rate: 82,
      updated_at: now().toISOString(),
    },
    temperatureSource: 'app',
    temperatureAt: daysAgo(0, 7, 40),
    bodyMap: [
      {
        id: randomUUID(), patient_id: ROSA_ID, body_region: 'peito_dir', body_view: 'front', intensity: 2,
        symptom_types: ['dor'], description: 'Dor em pontada no peito ao respirar fundo', suggested_ctcae_grade: 2,
        registered_at: daysAgo(1, 20, 15), source: 'app',
      },
      {
        id: randomUUID(), patient_id: ROSA_ID, body_region: 'obliquo_dir', body_view: 'front', intensity: 1,
        symptom_types: ['dormencia'], description: 'Desconforto leve na lateral, piora deitada', suggested_ctcae_grade: 1,
        registered_at: daysAgo(2, 9, 30), source: 'caregiver',
      },
    ],
    documents: [
      {
        id: randomUUID(), patient_id: ROSA_ID, document_type: 'hemograma', title: 'Hemograma — pré-ciclo 2',
        source_channel: 'upload', summary: 'Neutrófilos 2.900/mm³, hemoglobina 11,8 g/dL. Liberada para o ciclo 2.',
        key_finding: 'Liberada para quimioterapia', ai_questions: [], file_url: PHOTO_HEMOGRAMA, created_at: daysAgo(9, 7, 50),
      },
      {
        id: randomUUID(), patient_id: ROSA_ID, document_type: 'relatorio_consulta', title: 'Consulta — Dra. Sandra Motta',
        source_channel: 'chat', summary: 'Início do AC-T. Orientada sobre febre ≥ 37,8°C e sinais de alerta.',
        key_finding: 'Plano: 6 ciclos', ai_questions: [], file_url: '', created_at: daysAgo(41, 14, 0),
      },
      {
        id: randomUUID(), patient_id: ROSA_ID, document_type: 'receita', title: 'Receita — antieméticos e suporte',
        source_channel: 'camera', summary: 'Ondansetrona 8mg, Dexametasona 4mg, Omeprazol 20mg.',
        key_finding: '', ai_questions: [], file_url: '', created_at: daysAgo(41, 14, 30),
      },
      {
        id: randomUUID(), patient_id: ROSA_ID, document_type: 'laudo_biopsia', title: 'Laudo de biópsia — mama direita',
        source_channel: 'camera', summary: 'Carcinoma ductal invasivo grau 2, RE+ RP+ HER2−, Ki-67 22%.',
        key_finding: 'CDI RH+/HER2−', ai_questions: [], file_url: '', created_at: daysAgo(83, 11, 0),
      },
    ],
    whatsapp: [greeting],
    aniMessages: [
      { id: randomUUID(), session_id: 'rosa-memoria', role: 'ani', text: greeting.text, cards: [], channel: 'whatsapp', created_at: greeting.at },
    ],
    doctorSessions: seedDoctorSessions(),
    tickets: [
      {
        id: randomUUID(), patient_id: ROSA_ID, protocol: 'SUS-2026-118734', type: 'exame', channel: 'sus',
        title: 'Agendar ecocardiograma de controle',
        description: 'Pedido da Dra. Sandra antes do 3º ciclo de doxorrubicina. Aguardando vaga na Central de Regulação.',
        status: 'aberto', created_at: daysAgo(3, 10, 12), updated_at: daysAgo(1, 16, 40),
      },
      {
        id: randomUUID(), patient_id: ROSA_ID, protocol: 'SUS-2026-104512', type: 'medicamento', channel: 'hospital',
        title: 'Retirada do Filgrastim na farmácia de alto custo',
        description: 'Medicamento liberado e retirado pelo Lucas.',
        status: 'resolvido', created_at: daysAgo(12, 9, 0), updated_at: daysAgo(9, 14, 20),
      },
      {
        id: randomUUID(), patient_id: ROSA_ID, protocol: 'TFD-2026-00871', type: 'transporte', channel: 'sus',
        title: 'TFD — transporte para as sessões de quimioterapia',
        description: 'Transporte aprovado pela Secretaria de Saúde para os 6 ciclos.',
        status: 'resolvido', created_at: daysAgo(30, 11, 0), updated_at: daysAgo(24, 15, 0),
      },
    ],
    journal: [
      {
        id: randomUUID(), patient_id: ROSA_ID, mood: 3, emotions: ['Cansada', 'Esperançosa'], source: 'app',
        text: 'Dia puxado depois da quimio, mas a visita da minha neta me deu ânimo.', created_at: daysAgo(1, 21, 10),
      },
      {
        id: randomUUID(), patient_id: ROSA_ID, mood: 4, emotions: ['Tranquila', 'Grata'], source: 'app',
        text: 'Consegui caminhar 15 minutos no parque com o Lucas.', created_at: daysAgo(3, 19, 30),
      },
    ],
    symptoms: [
      { id: randomUUID(), patient_id: ROSA_ID, symptom_id: 'nausea', symptom_label: 'Náusea', grade: 1, notes: 'Melhora com a Ondansetrona', registered_at: daysAgo(1, 9, 15) },
      { id: randomUUID(), patient_id: ROSA_ID, symptom_id: 'fadiga', symptom_label: 'Fadiga', grade: 2, notes: '', registered_at: daysAgo(1, 9, 15) },
    ],
    appointments: seedAppointments(),
    /** Status changes the doctor made on derived alerts: { [alertId]: { status, note, updated_at } } */
    alertStatus: {},
    caregivers: [{ id: 'cg-lucas', name: 'Lucas Andrade', email: 'lucas@anicca.demo' }],
    doctors: [{ id: 'dr-sandra', name: 'Dra. Sandra Motta', crm: 'CRM-SP 123.456' }],
    feed: [],
  };
}

function touch(eventType, payload) {
  revision += 1;
  state.routine.updated_at = now().toISOString();
  const event = { type: eventType, payload, user_id: ROSA_ID, at: now().toISOString() };
  state.feed.unshift({ ...event, rev: revision });
  state.feed = state.feed.slice(0, 30);
  broadcast(event);
}

/* ════════════════════════════════════════════════════════════════════════════
 * SSE
 * ════════════════════════════════════════════════════════════════════════════ */

const sseClients = new Set();

function broadcast(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of sseClients) res.write(data);
}

setInterval(() => {
  for (const res of sseClients) res.write(': keepalive\n\n');
}, 15_000).unref();

/* ════════════════════════════════════════════════════════════════════════════
 * "ANI" DO WHATSAPP (regras simples — sem LLM, funciona offline)
 * ════════════════════════════════════════════════════════════════════════════ */

const BODY_KEYWORDS = [
  { re: /\b(cabeca|enxaqueca)\b/, region: 'cabeca' },
  { re: /\bnuca\b/, region: 'cabeca', view: 'back' },
  { re: /\b(pescoco|garganta)\b/, region: 'trapezio' },
  { re: /\b(lombar|costas|coluna)\b/, region: 'abdomen', view: 'back' },
  { re: /\bombro\b/, region: 'ombro' },
  { re: /\b(peito|torax|mama|seio)\b/, region: 'peito' },
  { re: /\b(costela|lateral|flanco)\b/, region: 'obliquo' },
  { re: /\b(barriga|abdomen|estomago|abdominal)\b/, region: 'abdomen' },
  { re: /\bantebraco\b/, region: 'antebraco' },
  { re: /\bbraco\b/, region: 'biceps' },
  { re: /\b(mao|maos|palma|dedos?)\b/, region: 'mao' },
  { re: /\b(coxa|quadril)\b/, region: 'coxa' },
  { re: /\b(perna|pernas|panturrilha|joelho|pe|pes)\b/, region: 'panturrilha' },
];

const BILATERAL = new Set(['ombro', 'peito', 'obliquo', 'antebraco', 'biceps', 'mao', 'coxa', 'panturrilha']);

function detectRegion(t) {
  for (const k of BODY_KEYWORDS) {
    if (!k.re.test(t)) continue;
    let region = k.region;
    if (BILATERAL.has(region)) region += /\besquerd/.test(t) ? '_esq' : '_dir';
    return { region, view: k.view ?? 'front' };
  }
  return null;
}

function detectSymptomType(t) {
  if (/dormen|dormente/.test(t)) return 'dormencia';
  if (/formig/.test(t)) return 'formigamento';
  if (/inchad|inchac/.test(t)) return 'inchaco';
  if (/vermelh/.test(t)) return 'vermelhidao';
  if (/ferida|machucad/.test(t)) return 'ferida';
  if (/\b(dor|doi|doendo|dores|pontada|queimacao|latejando)\b/.test(t)) return 'dor';
  return null;
}

function detectGrade(t) {
  const score = t.match(/\b(\d{1,2})\s*(?:\/|de)\s*10\b/) ?? t.match(/\bnota\s*(\d{1,2})\b/);
  if (score) return Math.min(5, Math.max(1, Math.ceil(Number(score[1]) / 2)));
  if (/insuportavel|muito forte|fortissima/.test(t)) return 5;
  if (/\b(muita|forte|bastante)\b/.test(t)) return 4;
  if (/\b(leve|pouca|pouquinho|fraca)\b/.test(t)) return 1;
  return 2;
}

function routineProgress() {
  const scheduled = state.routine.medications.filter((m) => !m.as_needed);
  return { taken: scheduled.filter((m) => m.taken).length, total: scheduled.length };
}

function addBodyEntry({ region, view, intensity, type, description, source, cv }) {
  const entry = {
    id: randomUUID(),
    patient_id: ROSA_ID,
    body_region: region,
    body_view: view,
    intensity,
    symptom_types: [type],
    description,
    suggested_ctcae_grade: Math.min(4, intensity),
    registered_at: now().toISOString(),
    source,
    ...(cv ? { photo_url: cv.photo_url, cv_classification: { clinical_notes: cv.notes } } : {}),
  };
  state.bodyMap.push(entry);
  return entry;
}

/**
 * Interpreta a mensagem de WhatsApp, altera o estado e devolve as respostas da Ani.
 * @param {string} text
 * @param {{ attachment?: 'hemograma' | 'mao' }} [opts]
 */
function handleWhatsApp(text, opts = {}) {
  const t = norm(text ?? '');
  const replies = [];
  const events = [];
  const name = ROSA.firstName;

  /* ── Anexos ── */
  if (opts.attachment === 'hemograma') {
    const doc = {
      id: randomUUID(), patient_id: ROSA_ID, document_type: 'hemograma', title: 'Hemograma completo',
      source_channel: 'whatsapp',
      summary: 'Neutrófilos 1.200/mm³ (baixo — normal 1.800–7.500). Hemoglobina 11,2 g/dL, plaquetas 168.000/mm³.',
      key_finding: 'Neutrófilos baixos (nadir esperado do D8)',
      ai_questions: ['Preciso adiar a próxima quimio?', 'Que cuidados devo ter em casa?'],
      file_url: PHOTO_HEMOGRAMA, created_at: now().toISOString(),
    };
    state.documents.push(doc);
    replies.push(
      `Oi, ${name}! Seus neutrófilos estão baixos (1.200/mm³). Eles são as células de defesa do corpo, então o risco de infecção aumenta. Isso é esperado nesta fase do ciclo.`,
      { text: '*Leva essas perguntas pra sua consulta:*\n• Preciso adiar a próxima quimio?\n• Que cuidados devo ter em casa?' },
      { doc: 'Hemograma · salvo em Meus Documentos' },
    );
    events.push(['document_added', { document_id: doc.id, title: doc.title }]);
  }

  /* Foto do corpo: exemplo pronto ("mao") ou qualquer imagem escolhida no computador ("photo"). */
  if (opts.attachment === 'mao' || opts.attachment === 'photo') {
    const where = (opts.attachment === 'photo' && detectRegion(t)) || { region: 'mao_dir', view: 'front' };
    const vision = visionAnalysis(where.region, where.view, text);
    const entry = addBodyEntry({
      region: where.region, view: where.view, intensity: vision.grade, type: 'vermelhidao', source: 'whatsapp',
      description: `${vision.finding} (foto enviada pelo WhatsApp)`,
      cv: { photo_url: opts.image ?? PHOTO_MAO, notes: vision.note },
    });
    const label = regionLabel(where.region, where.view);
    replies.push(
      `Recebi a foto, ${name} 📷 A visão computacional analisou a imagem: ${vision.patientText}`,
      { text: vision.care },
      { doc: `Body Map · ${label} (grau ${vision.grade}) · nota clínica enviada à ${DOCTOR.name}` },
    );
    events.push(['body_map_updated', { entry_id: entry.id, region: entry.body_region, intensity: vision.grade }]);
  }

  /* Laudo/exame escolhido no computador (foto ou PDF) → OCR de demonstração. */
  if (opts.attachment === 'exam') {
    const ocr = demoOcr(opts.fileName);
    const doc = {
      id: randomUUID(), patient_id: ROSA_ID, ...ocr, source_channel: 'whatsapp',
      ai_questions: ['Esse resultado muda meu tratamento?', 'Preciso repetir esse exame? Quando?'],
      file_url: opts.image && opts.image.startsWith('data:image') ? opts.image : PHOTO_HEMOGRAMA, created_at: now().toISOString(),
    };
    state.documents.push(doc);
    replies.push(
      `Recebi o documento, ${name}! Li com o OCR: *${ocr.title}*. ${ocr.summary}`,
      { doc: `${ocr.title} · salvo em Meus Documentos` },
    );
    events.push(['document_added', { document_id: doc.id, title: doc.title }]);
  }

  /* ── Temperatura ── */
  const tempMatch = t.match(/\b(3[4-9]|4[0-2])(?:[.,](\d))?\s*(?:°|graus|c\b|º)?/);
  const mentionsFever = /\bfebre|temperatura|termometro\b/.test(t);
  if (tempMatch && (mentionsFever || tempMatch[2])) {
    const temp = Number(`${tempMatch[1]}.${tempMatch[2] ?? '0'}`);
    state.routine.temperature = temp;
    state.routine.temperature_alert = temp >= FEVER;
    state.temperatureSource = 'whatsapp';
    state.temperatureAt = now().toISOString();
    events.push(['routine_synced', { temperature: temp }]);
    if (temp >= FEVER) {
      replies.push(
        `🚨 ${name}, ${fmtTemp(temp)} é febre — e com os neutrófilos baixos isso é *urgência*.\n\n1. Vá agora ao Pronto-Socorro e diga que faz quimioterapia.\n2. Não tome antitérmico antes de ser avaliada.\n3. Leve a carteirinha do tratamento.`,
        { text: `Já avisei a ${DOCTOR.name} e o ${CAREGIVER.firstName}. Registrei ${fmtTemp(temp)} na sua rotina. 💛` },
      );
    } else {
      replies.push(`Anotei ${fmtTemp(temp)} na sua rotina ✅ Está dentro do normal. Se passar de 37,8°C, vá ao Pronto-Socorro.`);
    }
  } else if (mentionsFever && /febre/.test(t)) {
    replies.push(`${name}, consegue medir a temperatura agora com o termômetro? Me manda o número (ex: 37,9).`);
  }

  /* ── Sintomas no corpo ── */
  const symptomType = detectSymptomType(t);
  const nausea = /enjo|nausea|vomit|ansia/.test(t);
  // A photo's caption only locates the region; the photo handler already registered the symptom.
  const photoHandled = opts.attachment === 'mao' || opts.attachment === 'photo';
  if ((symptomType || nausea) && !photoHandled) {
    const where = detectRegion(t) ?? (nausea ? { region: 'abdomen', view: 'front' } : null);
    if (where) {
      const grade = detectGrade(t);
      const type = symptomType ?? 'outro';
      const entry = addBodyEntry({
        region: where.region, view: where.view, intensity: grade, type, source: 'whatsapp',
        description: nausea && !symptomType ? 'Náusea relatada pelo WhatsApp' : `Relatado pelo WhatsApp: "${text.trim()}"`,
      });
      const label = regionLabel(where.region, where.view);
      events.push(['body_map_updated', { entry_id: entry.id, region: entry.body_region, intensity: grade }]);
      if (nausea && !symptomType) {
        replies.push(
          `Sinto muito pelo enjoo, ${name} 💛 Você tem *Ondansetrona 8mg "se náusea"* na sua prescrição — pode tomar agora. Beba água em goles pequenos.`,
          { doc: `Body Map · ${label} (náusea)` },
        );
      } else {
        const chest = where.region.startsWith('peito');
        replies.push(
          `Sinto muito, ${name} 💛 Registrei *${SYMPTOM_LABELS[type]} grau ${grade === 5 ? '4+' : grade}* em *${label}* no seu Body Map.`,
          state.routine.temperature_alert && events.some(([type, p]) => type === 'routine_synced' && p.temperature)
            ? { text: `Com a febre, isso reforça: vá ao Pronto-Socorro agora. A ${DOCTOR.name} já está vendo no painel dela.` }
            : chest
              ? { text: `Se vier junto com falta de ar, palpitação ou dor que irradia para o braço, vá ao Pronto-Socorro. Avisei a ${DOCTOR.name} para avaliar na consulta.` }
              : { text: `Se piorar ou aparecer febre, me avise. A ${DOCTOR.name} vai ver isso no painel dela.` },
          { doc: `Body Map · ${label} (grau ${grade === 5 ? '4+' : grade})` },
        );
      }
    } else if (symptomType) {
      replies.push(`Entendi, ${name}. Onde é ${SYMPTOM_LABELS[symptomType] === 'dor' ? 'a dor' : 'isso'}? (ex: "dor na cabeça", "no peito", "na barriga")`);
    }
  }

  /* ── Medicamentos ── */
  if (/\btomei\b|\bja tomei\b|\btomado\b/.test(t)) {
    const meds = state.routine.medications;
    const named = meds.filter((m) => t.includes(norm(m.name)) && !m.taken && !m.as_needed);
    let marked = [];
    if (named.length) {
      marked = [named[0]];
    } else if (/manha|tudo|todos|remedios/.test(t)) {
      const period = /noite|jantar/.test(t) ? 'night' : /tarde|almoco/.test(t) ? 'afternoon' : 'morning';
      marked = meds.filter((m) => m.period === period && !m.taken && !m.as_needed);
    }
    marked.forEach((m) => (m.taken = true));
    if (marked.length) {
      const p = routineProgress();
      replies.push(`Anotado ✅ ${marked.map((m) => m.name).join(' e ')} marcada na sua rotina. Você já tomou ${p.taken} de ${p.total} remédios hoje.`);
      events.push(['routine_synced', { medications: marked.map((m) => m.name) }]);
    } else {
      replies.push('Esse remédio já estava marcado na sua rotina de hoje 👍');
    }
  }

  /* ── Água ── */
  const water = t.match(/bebi\s*(\d+|um|uma|dois|duas|tres)?\s*(copos?|garrafa)?\s*(de\s*)?agua/) ?? (/(\bagua\b)/.test(t) && /bebi/.test(t) ? [] : null);
  if (water) {
    const words = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3 };
    const n = Number(water[1]) || words[water[1]] || (water[2] === 'garrafa' ? 3 : 1);
    state.routine.hydration_glasses = Math.min(8, state.routine.hydration_glasses + n);
    events.push(['routine_synced', { hydration_glasses: state.routine.hydration_glasses }]);
    const g = state.routine.hydration_glasses;
    replies.push(g >= 8 ? `Meta de água batida! 💧 8/8 copos hoje. Seus rins agradecem.` : `💧 Anotado! ${g}/8 copos hoje. ${8 - g === 1 ? 'Falta 1 copo' : `Faltam ${8 - g} copos`} para a meta.`);
  }

  /* ── Sono ── */
  const sleep = /\bdormi\b/.test(t) ? t.match(/(\d{1,2})\s*(?:h\b|hs\b|horas?)/) : null;
  if (sleep || /dormi (mal|bem|pessimo)/.test(t)) {
    const hours = sleep ? Number(sleep[1]) : /mal|pessimo/.test(t) ? 4 : 8;
    const quality = /mal|pessimo|pouco/.test(t) ? 2 : hours >= 7 ? 5 : 3;
    state.routine.sleep_hours = hours;
    state.routine.sleep_quality = quality;
    events.push(['routine_synced', { sleep_hours: hours }]);
    replies.push(
      quality <= 2
        ? `Sinto muito pela noite difícil, ${name}. Registrei ${hours}h de sono. Cansaço é comum na quimio — se continuar, vamos falar com a ${DOCTOR.name}.`
        : `Registrei ${hours}h de sono 😴 Ótimo! O descanso acelera a recuperação.`,
    );
  }

  /* ── Emoções → diário ── */
  const FEELINGS = [
    [/\btriste|tristeza\b/, 'Triste'],
    [/\bansios/, 'Ansiosa'],
    [/\bmedo\b/, 'Com medo'],
    [/\bdesanimad/, 'Desanimada'],
    [/\bsozinh/, 'Sozinha'],
    [/\bchor(ei|ando|o)\b/, 'Triste'],
  ];
  const feelings = [...new Set(FEELINGS.filter(([re]) => re.test(t)).map(([, label]) => label))];
  if (feelings.length) {
    const entry = {
      id: randomUUID(), patient_id: ROSA_ID, mood: 2, emotions: feelings, text: text.trim(), source: 'whatsapp', created_at: now().toISOString(),
    };
    state.journal.push(entry);
    events.push(['journaling_synced', { entry_id: entry.id }]);
    replies.push(
      `Obrigada por dividir isso comigo, ${name} 💛 É muito comum sentir isso no meio do tratamento — você não está sozinha.`,
      { text: 'Guardei no seu *Diário* para acompanharmos juntas. Quer conversar com a psicóloga do hospital? Posso abrir o pedido pra você.' },
      { doc: `Diário · ${feelings.join(', ')}` },
    );
  }

  /* ── Agenda: confirmar ou pedir para remarcar o próximo agendamento pendente ── */
  const pendingApt = state.appointments
    .filter((a) => a.patient_id === ROSA_ID && a.status === 'agendado' && new Date(a.start) > now())
    .sort((a, b) => a.start.localeCompare(b.start))[0];
  if (pendingApt && /\b(confirmo|confirmado|confirmar|confirma|estarei la|vou sim)\b/.test(t)) {
    pendingApt.status = 'confirmado';
    pendingApt.confirmed_via = 'WhatsApp';
    replies.push(`Perfeito, ${name}! ✅ Confirmei *${pendingApt.title}*: ${whenLabel(pendingApt.start)}, ${pendingApt.location}. Te lembro um dia antes.`);
    events.push(['agenda_synced', { appointment_id: pendingApt.id }]);
  } else if (pendingApt && !replies.length && /\b(remarcar|reagendar|nao vou poder|nao consigo ir|outro horario|outro dia)\b/.test(t)) {
    pendingApt.notes = [pendingApt.notes, 'Paciente pediu para remarcar pelo WhatsApp.'].filter(Boolean).join('\n');
    replies.push(`Sem problema, ${name}. Avisei a ${DOCTOR.name} que você precisa de outro horário. Assim que a equipe remarcar, te mando aqui. 💛`);
    events.push(['agenda_synced', { appointment_id: pendingApt.id, reschedule_requested: true }]);
  }

  /* ── Saudação / fallback ── */
  if (!replies.length) {
    if (/\b(oi|ola|bom dia|boa tarde|boa noite|e ai)\b/.test(t)) {
      const p = routineProgress();
      replies.push(`Oi, ${name}! 💛 Hoje é o dia 8 do ciclo 2. Você já tomou ${p.taken} de ${p.total} remédios. Como está se sentindo?`);
    } else if (/obrigad/.test(t)) {
      replies.push(`Imagina, ${name}! Estou aqui 24h. 💛`);
    } else {
      replies.push(`Entendi, ${name}. Guardei isso no seu histórico para a ${DOCTOR.name}. Se for um sintoma, me conta onde e a intensidade de 0 a 10.`);
    }
  }

  return { replies, events };
}

/** Images sent through the simulator, served at /demo/media/:id so the thread stays light. */
const media = new Map();

/**
 * Simulated computer-vision read of a skin photo + a SOAP-style clinical note draft for the doctor.
 * The finding depends on the body region (the presenter can attach any picture).
 */
function visionAnalysis(region, view, caption = '') {
  const label = regionLabel(region, view);
  const reported = caption.trim() ? `"${caption.trim()}"` : 'Foto enviada sem descrição.';
  const confidence = (0.82 + Math.random() * 0.12).toFixed(2).replace('.', ',');
  const area = 20 + Math.floor(Math.random() * 25);

  let finding, assessment, plan, patientText, care;
  if (/^(mao|panturrilha)/.test(region)) {
    finding = `Eritema difuso em ${label.toLowerCase()}, sem bolhas ou descamação`;
    assessment = 'Compatível com síndrome mão-pé (eritrodisestesia palmo-plantar) grau 1 — CTCAE v5, associada à Capecitabina.';
    plan = 'Manter dose. Emoliente com ureia 10% 2x/dia, evitar calor e atrito. Nova foto em 72 h; suspender capecitabina se evoluir para grau 2.';
    patientText = 'vermelhidão sem bolhas — parece *síndrome mão-pé grau 1*, um efeito comum da Capecitabina.';
    care = '*Cuidados agora:*\n• Hidratante com ureia 2x ao dia\n• Evite água quente e sapatos apertados\n• Se aparecer bolha ou dor para andar, me avise';
  } else if (/^(biceps|antebraco)/.test(region)) {
    finding = `Eritema linear em ${label.toLowerCase()}, no trajeto venoso da infusão`;
    assessment = 'Sugestivo de flebite química grau 1 pós-infusão de AC. Diferencial: extravasamento de doxorrubicina (vesicante).';
    plan = 'Compressa fria 15 min 4x/dia e elevação do membro. Avaliação presencial hoje se houver dor intensa, bolha ou endurecimento.';
    patientText = 'vermelhidão no caminho da veia onde foi a quimio — parece uma *irritação da veia (flebite) leve*.';
    care = '*Cuidados agora:*\n• Compressa fria 15 min, 4x ao dia\n• Deixe o braço elevado\n• Se doer muito, inchar ou fizer bolha, vá ao hospital hoje';
  } else {
    finding = `Lesão eritematosa macular em ${label.toLowerCase()}, sem secreção`;
    assessment = 'Compatível com dermatite / rash cutâneo grau 1 (CTCAE v5). Sem sinais de infecção na imagem.';
    plan = 'Hidratação da pele, evitar sol e produtos com perfume. Reavaliar na consulta ou antes se surgir febre, dor ou secreção.';
    patientText = 'uma área avermelhada leve, sem sinais de infecção — parece uma *irritação de pele grau 1*.';
    care = '*Cuidados agora:*\n• Hidrate a pele com creme sem perfume\n• Evite sol na região\n• Se aparecer febre, dor ou secreção, me avise';
  }

  const note = [
    'NOTA CLÍNICA — rascunho gerado pela Ani (revisar antes de assinar)',
    `S: Paciente relata pelo WhatsApp: ${reported}`,
    `O: ${finding}. Visão computacional: área afetada ≈ ${area}% da região; confiança ${confidence}.`,
    `A: ${assessment}`,
    `P: ${plan}`,
  ].join('\n');

  return { grade: 1, finding, note, patientText, care };
}

function processWhatsApp(text, opts = {}) {
  const at = now().toISOString();
  let mediaUrl;
  if (opts.image) {
    const id = randomUUID();
    media.set(id, opts.image);
    mediaUrl = `/demo/media/${id}`;
  }
  const userMsg = { id: randomUUID(), from: 'patient', text, attachment: opts.attachment, media: mediaUrl, fileName: opts.fileName, at };
  state.whatsapp.push(userMsg);
  state.aniMessages.push({ id: userMsg.id, session_id: 'rosa-memoria', role: 'user', text: text || '📷 Foto', cards: [], channel: 'whatsapp', created_at: at });

  const { replies, events } = handleWhatsApp(text, opts);
  const aniMsgs = replies.map((r) => {
    const msg = { id: randomUUID(), from: 'ani', at: now().toISOString(), ...(typeof r === 'string' ? { text: r } : r) };
    state.whatsapp.push(msg);
    if (msg.text) {
      state.aniMessages.push({ id: msg.id, session_id: 'rosa-memoria', role: 'ani', text: msg.text.replace(/\*/g, ''), cards: [], channel: 'whatsapp', created_at: msg.at });
    }
    return msg;
  });

  for (const [type, payload] of events) touch(type, { ...payload, channel: 'whatsapp' });
  if (!events.length) revision += 1;
  return { user: userMsg, replies: aniMsgs, events: events.map(([type]) => type) };
}

/* Mensagem ativa da Ani (sem a paciente perguntar), ex.: aviso de agenda vindo do painel. */
function aniNotify(text) {
  const msg = { id: randomUUID(), from: 'ani', at: now().toISOString(), text };
  state.whatsapp.push(msg);
  state.aniMessages.push({ id: msg.id, session_id: 'rosa-memoria', role: 'ani', text: text.replace(/\*/g, ''), cards: [], channel: 'whatsapp', created_at: msg.at });
}

const whenLabel = (iso) =>
  `${new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}, às ${hhmm(iso)}`;

/* ════════════════════════════════════════════════════════════════════════════
 * PAINEL DO MÉDICO
 * ════════════════════════════════════════════════════════════════════════════ */

function rosaRisk() {
  const maxGrade = Math.max(0, ...state.bodyMap.map((e) => e.intensity));
  const fever = state.routine.temperature >= FEVER;
  if (fever || maxGrade >= 4) return 'Alto';
  return 'Médio';
}

function doctorPatients() {
  return [
    { id: ROSA.id, name: ROSA.name, cancer_type: ROSA.cancer_type, cancer_stage: ROSA.cancer_stage, protocol: ROSA.protocol, risk_level: rosaRisk(), leukocytes: '1.200/mm³' },
    ...OTHER_PATIENTS.map((p) => ({ id: p.id, name: p.name, cancer_type: p.cancer_type, cancer_stage: p.cancer_stage, protocol: p.protocol, risk_level: p.risk_level, leukocytes: 'N/A' })),
  ];
}

function rosaDashboard() {
  const r = state.routine;
  const fever = r.temperature >= FEVER;
  const entries = [...state.bodyMap].sort((a, b) => b.registered_at.localeCompare(a.registered_at)).slice(0, 5);
  const via = { whatsapp: 'via WhatsApp', app: 'via App', caregiver: 'pelo cuidador' };

  const alerts = entries.map((e) => ({
    text:
      `Sintoma relatado: ${e.symptom_types.map((s) => SYMPTOM_LABELS[s] ?? s).join(', ')} na região ${regionLabel(e.body_region, e.body_view)} ` +
      `(Intensidade: ${e.intensity}/5) — ${via[e.source] ?? 'via App'}${e.cv_classification ? ' [Análise Visual Concluída]' : ''}`,
    cv_data: e.cv_classification ? { photo_url: e.photo_url, classification: e.cv_classification.clinical_notes } : null,
    date: e.registered_at,
  }));
  const recentCtcae = [...state.symptoms]
    .filter((s) => s.grade >= 2 && Date.now() - new Date(s.registered_at).getTime() < 3 * DAY_MS)
    .sort((a, b) => b.registered_at.localeCompare(a.registered_at));
  for (const s of recentCtcae.slice(0, 3)) {
    alerts.push({
      text: `CTCAE (autoavaliação no app): ${s.symptom_label} grau ${s.grade}${s.notes ? ` — "${s.notes}"` : ''}`,
      cv_data: null,
      date: s.registered_at,
    });
  }
  alerts.sort((a, b) => b.date.localeCompare(a.date));

  if (fever) {
    alerts.unshift({
      text: `🌡️ FEBRE ${fmtTemp(r.temperature)} informada ${state.temperatureSource === 'whatsapp' ? 'via WhatsApp' : 'no app'} às ${hhmm(state.temperatureAt)} — neutrófilos 1.200/mm³: protocolo de neutropenia febril acionado, paciente orientada a ir ao PS.`,
      cv_data: null,
      date: state.temperatureAt,
    });
  }

  const top = entries[0];
  const p = routineProgress();
  const lastMood = [...state.journal].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const lowMood = lastMood && lastMood.mood <= 2;
  const risk = Math.min(
    0.92,
    0.31 + (fever ? 0.28 : 0) + Math.max(0, ...entries.map((e) => e.intensity)) * 0.05 + (p.taken < 2 ? 0.08 : 0) + (lowMood ? 0.07 : 0),
  );

  const briefing = [
    `Rosa, 52 anos, CDI de mama RH+/HER2− estádio IIB em AC-T (C2D8).`,
    `Hemograma de ontem com neutrófilos 1.200/mm³ (nadir esperado).`,
    fever
      ? `Febre de ${fmtTemp(r.temperature)} relatada há pouco — tratar como neutropenia febril até prova em contrário (hemoculturas + antibiótico em até 60 min).`
      : `Afebril (${fmtTemp(r.temperature)}).`,
    top
      ? `Último sintoma: ${SYMPTOM_LABELS[top.symptom_types[0]] ?? 'sintoma'} grau ${top.intensity} em ${regionLabel(top.body_region, top.body_view).toLowerCase()} ${via[top.source] ?? ''}.`
      : '',
    entries.some((e) => e.body_region.startsWith('peito') && e.intensity >= 3)
      ? 'Dor torácica em uso de doxorrubicina: considerar ECG, troponina e ecocardiograma.'
      : `Adesão aos medicamentos hoje: ${p.taken}/${p.total}.`,
  ].filter(Boolean).join(' ');

  return {
    vitals: {
      temperature: fmtTemp(r.temperature).replace('°C', ' °C'),
      blood_pressure: '118x76 mmHg',
      weight: '64.5 kg',
      heart_rate: `${r.wearable_heart_rate} bpm (smartwatch)`,
    },
    alerts: alerts.length ? alerts : [{ text: 'Nenhum sintoma grave reportado recentemente.', cv_data: null, date: now().toISOString() }],
    ml_insights: {
      model: 'XGBoost Classifier (Federated Learning)',
      risk_probability: Number(risk.toFixed(2)),
      risk_level: risk > 0.5 ? 'Alto' : 'Moderado',
      risk_factors: [
        fever ? 'Febre durante nadir (+28%)' : 'Neutropenia grau 2 no D8',
        `Adesão aos medicamentos hoje ${p.taken}/${p.total}`,
        ...(lowMood ? [`Humor baixo no diário (${lastMood.emotions.join(', ') || 'sem emoções marcadas'}) (+7%)`] : []),
        'Cuidador ativo (filho) (−18%)',
        'Mora a 22 km do centro de tratamento',
      ],
      recommendation: fever ? 'Contato imediato com a paciente e o cuidador; acionar PS de referência.' : 'Reforçar orientações de neutropenia e hidratação.',
    },
    briefing,
  };
}

/* ════════════════════════════════════════════════════════════════════════════
 * AGENDA E ALERTAS DO MÉDICO
 * ════════════════════════════════════════════════════════════════════════════ */

const PATIENT_NAMES = Object.fromEntries([[ROSA_ID, ROSA.name], ...OTHER_PATIENTS.map((p) => [p.id, p.name])]);
const [ANA, MARCOS, HELENA, JOAO, PAULO] = OTHER_PATIENTS.map((p) => p.id);

/** ISO date `dayOffset` days from today at hh:mm (negative = past). */
const atDay = (dayOffset, hour, minute = 0) => daysAgo(-dayOffset, hour, minute);

function seedAppointments() {
  const apt = (patientId, dayOffset, hour, minute, type, title, extra = {}) => ({
    id: randomUUID(),
    patient_id: patientId,
    patient_name: PATIENT_NAMES[patientId],
    type,
    title,
    start: atDay(dayOffset, hour, minute),
    duration_min: type === 'quimioterapia' ? 180 : type === 'exame' ? 60 : 30,
    location: type === 'teleconsulta' ? 'Teleconsulta (vídeo)' : type === 'quimioterapia' ? 'Sala de infusão 2' : type === 'exame' ? 'Centro de Diagnóstico' : 'Consultório 4',
    status: 'agendado',
    confirmed_via: null,
    notes: '',
    ...extra,
  });
  return [
    apt(ANA, 0, 8, 30, 'retorno', 'Retorno — toxicidade da quimiorradiação', { status: 'confirmado', confirmed_via: 'WhatsApp', notes: 'Náusea grau 3 e 2 faltas na RT. Avaliar TFD com o Serviço Social.' }),
    apt(MARCOS, 0, 10, 0, 'quimioterapia', 'FOLFOX — ciclo 6/12', { status: 'confirmado', confirmed_via: 'App', notes: 'Checar neuropatia antes de liberar oxaliplatina.' }),
    apt(HELENA, 0, 11, 30, 'teleconsulta', 'Teleconsulta — tosse seca há 5 dias', { notes: 'Investigar pneumonite imunomediada; TC de tórax pedida.' }),
    apt(JOAO, 0, 14, 0, 'retorno', 'Retorno pós-docetaxel C3', { status: 'confirmado', confirmed_via: 'WhatsApp' }),
    apt(PAULO, 1, 9, 0, 'exame', 'PET-CT de reestadiamento', { notes: 'Jejum de 6 h. Glicemia capilar antes do exame.' }),
    apt(ANA, 1, 13, 0, 'exame', 'Radioterapia — sessão 21/28'),
    apt(HELENA, 2, 15, 0, 'exame', 'TC de tórax', { status: 'confirmado', confirmed_via: 'Cuidador' }),
    apt(MARCOS, 3, 9, 30, 'retorno', 'Retorno — avaliação de neuropatia'),
    apt(PAULO, 4, 10, 0, 'consulta', 'Consulta — resultado do PET interino'),
    apt(ROSA_ID, 6, 9, 0, 'consulta', 'Consulta pré-C3 — Dra. Sandra Motta', {
      status: 'confirmado', confirmed_via: 'WhatsApp',
      notes: 'Briefing da Ani pronto. Revisar dor torácica antes da 3ª dose de doxorrubicina e confirmar ecocardiograma.',
    }),
    apt(ROSA_ID, 14, 8, 0, 'quimioterapia', 'AC-T — ciclo 3/6 (D1)', { notes: 'Liberar se neutrófilos ≥ 1.500/mm³ e FEVE preservada.' }),
    apt(JOAO, -1, 9, 0, 'retorno', 'Retorno — PSA de controle', { status: 'realizado' }),
    apt(ANA, -2, 10, 0, 'exame', 'Radioterapia — sessão 19/28', { status: 'falta', notes: 'Paciente não compareceu (transporte).' }),
  ];
}

const SEVERITY_ORDER = { critica: 0, alta: 1, media: 2, baixa: 3 };
const SOURCE_NAME = { whatsapp: 'WhatsApp', app: 'App', caregiver: 'Cuidador' };

/** Alerts derived from everything the patients reported (live) + seeded alerts for the other patients. */
function doctorAlerts() {
  const list = [];
  const push = (a) => list.push({ status: 'novo', note: '', ...a, ...(state.alertStatus[a.id] ?? {}) });

  const r = state.routine;
  if (r.temperature >= FEVER) {
    push({
      id: `fever-${state.temperatureAt}`, patient_id: ROSA_ID, severity: 'critica', category: 'sinal_vital',
      title: `Febre ${fmtTemp(r.temperature)} durante neutropenia`,
      description: 'Neutrófilos 1.200/mm³ no D8 de AC. Paciente orientada a ir ao PS — tratar como neutropenia febril.',
      source: SOURCE_NAME[state.temperatureSource] ?? 'App', created_at: state.temperatureAt,
    });
  }
  for (const e of state.bodyMap) {
    const severity = e.intensity >= 4 ? 'alta' : e.intensity >= 3 ? 'media' : 'baixa';
    const chest = e.body_region.startsWith('peito') && e.intensity >= 3;
    push({
      id: `bm-${e.id}`, patient_id: ROSA_ID, severity: chest ? 'alta' : severity, category: 'sintoma',
      title: `${(SYMPTOM_LABELS[e.symptom_types[0]] ?? 'Sintoma').replace(/^./, (c) => c.toUpperCase())} grau ${e.intensity} — ${regionLabel(e.body_region, e.body_view)}`,
      description: chest
        ? 'Dor torácica em uso de doxorrubicina: considerar ECG, troponina e ecocardiograma.'
        : e.description || 'Registrado no Body Map.',
      source: SOURCE_NAME[e.source] ?? 'App', created_at: e.registered_at,
      ...(e.cv_classification ? { photo_url: e.photo_url, clinical_note: e.cv_classification.clinical_notes } : {}),
    });
  }
  for (const s of state.symptoms.filter((x) => x.grade >= 2)) {
    push({
      id: `ctcae-${s.id}`, patient_id: ROSA_ID, severity: s.grade >= 3 ? 'alta' : 'media', category: 'sintoma',
      title: `CTCAE: ${s.symptom_label} grau ${s.grade}`,
      description: s.notes ? `Autoavaliação: "${s.notes}"` : 'Autoavaliação na escala CTCAE do app.',
      source: 'App', created_at: s.registered_at,
    });
  }
  for (const j of state.journal.filter((x) => x.mood <= 2)) {
    push({
      id: `mood-${j.id}`, patient_id: ROSA_ID, severity: 'media', category: 'emocional',
      title: `Humor baixo no diário (${j.emotions.join(', ') || 'sem emoções marcadas'})`,
      description: j.text ? `"${j.text}" — considerar encaminhamento à Psico-oncologia.` : 'Considerar encaminhamento à Psico-oncologia.',
      source: SOURCE_NAME[j.source] ?? 'App', created_at: j.created_at,
    });
  }
  const p = routineProgress();
  if (p.taken < p.total) {
    push({
      id: `meds-${r.date}`, patient_id: ROSA_ID, severity: 'baixa', category: 'adesao',
      title: `Adesão hoje: ${p.taken}/${p.total} medicamentos`,
      description: 'Capecitabina da noite e Omeprazol ainda pendentes. A Ani vai lembrar a paciente e o cuidador.',
      source: 'IA', created_at: daysAgo(0, 7, 0),
    });
  }

  push({ id: 'seed-ana-nausea', patient_id: ANA, severity: 'alta', category: 'sintoma', title: 'Náusea grau 3 há 3 dias', description: 'Relatada pelo WhatsApp; ingesta oral reduzida. Avaliar antiemético de resgate e hidratação.', source: 'WhatsApp', created_at: daysAgo(1, 19, 40) });
  push({ id: 'seed-ana-abandono', patient_id: ANA, severity: 'alta', category: 'abandono', title: 'Risco de abandono 81% (ML)', description: '2 faltas na radioterapia; mora a 68 km do CACON. Acionar Serviço Social para TFD.', source: 'IA', created_at: daysAgo(0, 6, 30) });
  push({ id: 'seed-helena-tosse', patient_id: HELENA, severity: 'media', category: 'sintoma', title: 'Tosse seca há 5 dias em imunoterapia', description: 'Possível pneumonite imunomediada. TC de tórax agendada.', source: 'Cuidador', created_at: daysAgo(1, 10, 15) });
  push({ id: 'seed-marcos-neuro', patient_id: MARCOS, severity: 'media', category: 'sintoma', title: 'Neuropatia grau 1 em progressão', description: 'Formigamento nas mãos e pés, piora com frio. Avaliar antes do FOLFOX C6.', source: 'App', created_at: daysAgo(2, 21, 5) });
  push({ id: 'seed-paulo-fadiga', patient_id: PAULO, severity: 'baixa', category: 'sintoma', title: 'Fadiga leve pós-ciclo', description: 'Autorrelato no app; sem impacto nas atividades.', source: 'App', created_at: daysAgo(3, 18, 0), status: 'resolvido' });

  return list
    .map((a) => ({ ...a, patient_name: PATIENT_NAMES[a.patient_id] }))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.created_at.localeCompare(a.created_at));
}

function otherDashboard(p) {
  return {
    vitals: { temperature: p.temp, blood_pressure: p.bp, weight: p.weight },
    alerts: p.alerts.map((text, i) => ({ text, cv_data: null, date: daysAgo(i + 1, 15, 20) })),
    ml_insights: { model: 'XGBoost Classifier (Federated Learning)', risk_probability: p.risk, risk_factors: p.factors },
    briefing: p.briefing,
  };
}

function doctorAiAnswer(query) {
  const q = norm(query);
  const r = state.routine;
  const p = routineProgress();
  const fever = r.temperature >= FEVER;
  const lastEntries = [...state.bodyMap].sort((a, b) => b.registered_at.localeCompare(a.registered_at)).slice(0, 3);
  const entryLine = (e) =>
    `Body Map: ${regionLabel(e.body_region, e.body_view).toLowerCase()}, ${SYMPTOM_LABELS[e.symptom_types[0]] ?? 'sintoma'} grau ${e.intensity} (${e.source === 'whatsapp' ? 'WhatsApp' : 'app'}, ${hhmm(e.registered_at)})`;
  const vitals = `Temperatura ${fmtTemp(r.temperature)} (${state.temperatureSource === 'whatsapp' ? 'WhatsApp' : 'app'}, ${hhmm(state.temperatureAt)})`;

  if (/febre|neutropen|neutrofil|antibiot/.test(q)) {
    return aniClinical(
      `Rosa está no D8 de AC (nadir), neutrófilos 1.200/mm³${fever ? ` e relatou febre de ${fmtTemp(r.temperature)} pelo WhatsApp` : ''}. Estratifiquei o risco pelo escore MASCC e busquei as diretrizes no PubMed.`,
      fever
        ? 'Tratar como **neutropenia febril**: avaliação presencial imediata, hemograma, 2 pares de hemoculturas, lactato e função renal; **antibiótico de amplo espectro em até 60 minutos** (ex.: cefepime) [1][2]. Se MASCC ≥ 21 e sem comorbidades, considerar manejo ambulatorial com amoxicilina-clavulanato + ciprofloxacino após observação [1][3]. Avaliar G-CSF profilático nos próximos ciclos.'
        : 'Neutropenia grau 2 assintomática: **sem indicação de G-CSF terapêutico** [1]. Manter orientação de febre ≥ 37,8°C → PS e repetir hemograma antes do C3. Considerar G-CSF profilático se ocorrer neutropenia febril [4].',
      ['Hemograma de ontem — neutrófilos 1.200/mm³', vitals, `Adesão aos medicamentos hoje: ${p.taken}/${p.total}`],
      [PUBMED.febrile, PUBMED.esmoFn, PUBMED.idsa, PUBMED.gcsf],
    );
  }
  if (/peito|torac|cardio|doxorrub|eco/.test(q)) {
    const chest = lastEntries.find((e) => e.body_region.startsWith('peito'));
    return aniClinical(
      'Dor torácica em paciente sob antraciclina exige excluir cardiotoxicidade e evento tromboembólico. Cruzei o Body Map com os dados do smartwatch.',
      'Solicitar **ECG, troponina e BNP**; **ecocardiograma com FEVE e strain (GLS)** comparando com o basal [1][2]. Se dispneia ou taquicardia, considerar angio-TC para TEP. Queda de FEVE > 10 pontos para < 53% indica cardiotoxicidade — discutir com cardio-oncologia antes do próximo ciclo.',
      [chest ? entryLine(chest) : 'Body Map: sem dor torácica recente', `Smartwatch: FC ${r.wearable_heart_rate} bpm`, 'Chamado aberto: ecocardiograma aguardando regulação'],
      [PUBMED.esc, PUBMED.cardinale],
    );
  }
  const photo = lastEntries.find((e) => e.cv_classification);
  if (/braco|veia|flebite|extravas/.test(q) || (/foto|imagem/.test(q) && photo && /^(biceps|antebraco)/.test(photo.body_region))) {
    return aniClinical(
      'A foto do braço enviada pelo WhatsApp mostra eritema linear no trajeto venoso. Paciente recebe doxorrubicina (vesicante) por acesso periférico: o diferencial importante é extravasamento.',
      [
        '- **Flebite química grau 1** (mais provável): compressa fria, elevação do membro e reavaliação em 24–48 h.',
        '- **Sinais de extravasamento** (dor intensa, bolha, endurecimento, mudança de cor): avaliação presencial no mesmo dia; para antraciclinas, compressa fria e considerar dexrazoxano em até 6 h [1].',
        '- Avaliar **cateter central (PICC/port)** para os próximos ciclos de AC.',
      ].join('\n'),
      [photo ? `${entryLine(photo)} — análise visual concluída` : 'Body Map: sem foto recente', 'Protocolo AC-T, acesso venoso periférico'],
      [PUBMED.extravasation, PUBMED.ctcae],
    );
  }
  if (/mao|pe |pele|capecitab|eritrodis|foto|imagem/.test(q)) {
    return aniClinical(
      photo
        ? 'A foto enviada pelo WhatsApp foi analisada pela visão computacional; usei a nota clínica gerada e a tabela de ajuste da capecitabina.'
        : 'Ainda não há foto recente; respondi com a tabela de ajuste de dose da capecitabina.',
      '- **Grau 1:** manter dose; emoliente com ureia 10%, evitar calor e atrito.\n- **Grau 2:** suspender até regredir para grau ≤ 1 e retomar na mesma dose (1º episódio).\n- **Grau 3:** suspender e reduzir a dose em 25% na retomada [1][2].',
      [photo ? `${entryLine(photo)} — análise visual concluída` : 'Body Map: sem foto recente', 'Prescrição: Capecitabina 500 mg, 2 cp 2x/dia'],
      [PUBMED.createx, PUBMED.ctcae],
    );
  }
  return aniClinical(
    'Consolidando os dados dos canais WhatsApp, app e smartwatch da paciente Rosa.',
    `${rosaDashboard().briefing} Medicamentos hoje: ${p.taken}/${p.total}. Hidratação ${r.hydration_glasses}/8 copos, sono ${r.sleep_hours}h, FC ${r.wearable_heart_rate} bpm. Próxima consulta em 6 dias.`,
    [vitals, ...lastEntries.map(entryLine), `Diário: ${state.journal.length} registros`],
    [PUBMED.basch2016, PUBMED.basch2017],
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * HTTP
 * ════════════════════════════════════════════════════════════════════════════ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
};

function send(res, status, body, headers = {}) {
  const isString = typeof body === 'string';
  res.writeHead(status, {
    ...CORS,
    'Content-Type': isString ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isString ? body : JSON.stringify(body));
}

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

async function readBody(req) {
  const raw = await readRaw(req);
  if ((req.headers['content-type'] ?? '').includes('application/json') && raw.length) {
    try {
      return JSON.parse(raw.toString('utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

/** Extrai a primeira imagem de um multipart/form-data como data URI (fotos do Body Map / Docs). */
async function readUploadedImage(req) {
  return fileFromMultipart(await readRaw(req), req.headers['content-type'], /image\/[\w.+-]+/);
}

/** First file part whose content type matches `typeRe`, as a data URI. */
function fileFromMultipart(raw, contentType = '', typeRe = /[\w-]+\/[\w.+-]+/) {
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  if (!boundary) return null;
  const marker = Buffer.from(`--${boundary[1] ?? boundary[2]}`);
  let start = raw.indexOf(marker);
  while (start !== -1) {
    const next = raw.indexOf(marker, start + marker.length);
    if (next === -1) break;
    const part = raw.subarray(start + marker.length, next);
    const headerEnd = part.indexOf('\r\n\r\n');
    const headers = part.subarray(0, headerEnd).toString('utf8');
    const type = headers.match(/content-type:\s*([\w-]+\/[\w.+-]+)/i);
    if (type && /filename=/i.test(headers) && typeRe.test(type[1])) {
      const data = part.subarray(headerEnd + 4, part.length - 2);
      return `data:${type[1]};base64,${data.toString('base64')}`;
    }
    start = next;
  }
  return null;
}

function login(body = {}) {
  const email = norm(String(body.email ?? body.username ?? ''));
  const role = /lucas|cuidador|caregiver|familia/.test(email)
    ? 'caregiver'
    : /sandra|medic|doctor|dra/.test(email)
      ? 'doctor'
      : body.role ?? 'patient';
  const profile = {
    profileType: role,
    name: role === 'caregiver' ? CAREGIVER.name : ROSA.name,
    caregiverName: CAREGIVER.name,
    birthYear: '1974',
    gender: 'Feminino',
    cancerType: 'mama',
    stage: 'Estádio IIB',
    careModality: 'sus',
    treatmentModality: 'sus',
    journeyPhase: 'Tratamento ativo',
    treatments: ['Quimioterapia'],
    cpf: '123.456.789-09',
    dateOfBirth: '1974-03-12',
  };
  return { access_token: `demo-token-${role}`, token_type: 'bearer', is_new_user: false, patient_id: ROSA_ID, role, profile };
}

/** Next sequential protocol number for a new ticket. */
function nextProtocol(channel) {
  const prefix = { sus: 'SUS', convenio: 'CONV', hospital: 'HOSP', ouvidoria: 'OUV' }[channel] ?? 'ANI';
  return `${prefix}-2026-${String(120000 + state.tickets.length * 37 + Math.floor(Math.random() * 30)).padStart(6, '0')}`;
}

/** Demo OCR: infers the document type and a plain-language summary from the file name. */
function demoOcr(fileName = '') {
  const n = norm(fileName);
  if (/tomograf|\btc\b|ct_/.test(n)) return { document_type: 'imagem_tc', title: 'Tomografia de tórax', summary: 'Sem nódulos pulmonares ou derrame. Sem sinais de metástase.', key_finding: 'Exame sem alterações' };
  if (/resson|\brm\b/.test(n)) return { document_type: 'imagem_rm', title: 'Ressonância magnética', summary: 'Redução de 30% da lesão em relação ao exame anterior.', key_finding: 'Resposta parcial ao tratamento' };
  if (/eco|ecocard/.test(n)) return { document_type: 'imagem_eco', title: 'Ecocardiograma', summary: 'Fração de ejeção 62%, função cardíaca preservada.', key_finding: 'Coração sem sinais de cardiotoxicidade' };
  if (/receita|prescri/.test(n)) return { document_type: 'receita', title: 'Receita médica', summary: 'Prescrição registrada. A Ani atualizou sua rotina de medicamentos.', key_finding: '' };
  if (/biops|anatomo|patolog/.test(n)) return { document_type: 'anatomia_patologica', title: 'Laudo anatomopatológico', summary: 'Laudo registrado e enviado para a equipe.', key_finding: '' };
  return {
    document_type: 'hemograma', title: 'Hemograma completo',
    summary: 'Neutrófilos 1.200/mm³ (baixo — normal 1.800–7.500). Hemoglobina 11,2 g/dL, plaquetas 168.000/mm³.',
    key_finding: 'Neutrófilos baixos (nadir esperado do D8)',
  };
}

/** Reads a text field from a multipart body (e.g. `source_channel`). */
function multipartField(raw, name) {
  const m = raw.toString('latin1').match(new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)`));
  return m ? m[1] : undefined;
}

/** File name of the first uploaded file part. */
function multipartFileName(raw) {
  const m = raw.toString('utf8').match(/filename="([^"]*)"/);
  return m ? m[1] : '';
}

const routes = [
  /* ── Demo / simulador ── */
  ['GET', /^\/$/, async (_req, res) => send(res, 302, '', { Location: '/whatsapp' })],
  ['GET', /^\/whatsapp\/?$/, async (_req, res) => send(res, 200, await readFile(path.join(HERE, 'whatsapp.html'), 'utf8'))],
  ['GET', /^\/demo\/assets\/(ani|logo|logo-icon)\.svg$/, async (_req, res, m) => {
    const file = { ani: 'ani-geral/ani-profile-icon.svg', logo: 'brand/logo-wordmark.svg', 'logo-icon': 'brand/logo-dark.svg' }[m[1]];
    const svg = await readFile(path.join(HERE, '../../apps/mobile/assets/images', file));
    res.writeHead(200, { ...CORS, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'max-age=3600' });
    res.end(svg);
  }],
  ['GET', /^\/demo\/state$/, async (_req, res) =>
    send(res, 200, { revision, app_clients: sseClients.size, whatsapp: state.whatsapp, feed: state.feed.slice(0, 8), routine: state.routine, risk: rosaRisk() })],
  ['POST', /^\/demo\/whatsapp$/, async (req, res) => {
    const body = await readBody(req);
    const image = typeof body.image === 'string' && body.image.startsWith('data:') ? body.image : undefined;
    send(res, 200, processWhatsApp(String(body.text ?? ''), { attachment: body.attachment, image, fileName: body.fileName }));
  }],
  ['GET', /^\/demo\/media\/([^/]+)$/, async (_req, res, m) => {
    const uri = media.get(m[1]);
    const parsed = uri?.match(/^data:([^;]+);base64,(.*)$/);
    if (!parsed) return send(res, 404, { detail: 'Media not found' });
    res.writeHead(200, { ...CORS, 'Content-Type': parsed[1], 'Cache-Control': 'max-age=3600' });
    res.end(Buffer.from(parsed[2], 'base64'));
  }],
  ['POST', /^\/demo\/reset$/, async (_req, res) => {
    state = createState();
    touch('routine_synced', { reset: true });
    touch('body_map_updated', { reset: true });
    touch('document_added', { reset: true });
    send(res, 200, { ok: true });
  }],
  ['GET', /^\/api\/v1\/demo\/revision$/, async (_req, res) => send(res, 200, { revision })],

  /* ── WhatsApp (mesmo payload do webhook Whatsmiau) ── */
  ['POST', /^\/api\/v1\/whatsapp\/webhook$/, async (req, res) => {
    const body = await readBody(req);
    const item = Array.isArray(body.data) ? body.data[0] : body.data ?? body;
    const msg = item?.message ?? {};
    const text = msg.conversation ?? msg.extendedTextMessage?.text ?? msg.interactiveResponseMessage?.body?.text ?? '';
    send(res, 200, { status: 'processed', ...processWhatsApp(String(text)) });
  }],

  /* ── Auth ── */
  ['POST', /^\/api\/v1\/auth\/(login|register|google)$/, async (req, res) => send(res, 200, login(await readBody(req)))],

  /* ── SSE ── */
  ['GET', /^\/api\/v1\/events\/stream\/[^/]+$/, async (req, res) => {
    res.writeHead(200, { ...CORS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(`data: ${JSON.stringify({ type: 'connected', user_id: ROSA_ID })}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
  }],

  /* ── Rotina ── */
  ['GET', /^\/api\/v1\/routine\/today\/[^/]+$/, async (_req, res) => send(res, 200, state.routine)],
  ['POST', /^\/api\/v1\/routine\/temperature$/, async (req, res) => {
    const { temperature } = await readBody(req);
    state.routine.temperature = Number(temperature);
    state.routine.temperature_alert = Number(temperature) >= FEVER;
    state.temperatureSource = 'app';
    state.temperatureAt = now().toISOString();
    touch('routine_synced', { temperature, channel: 'app' });
    send(res, 200, state.routine);
  }],
  ['POST', /^\/api\/v1\/routine\/hydration$/, async (req, res) => {
    const { glasses } = await readBody(req);
    state.routine.hydration_glasses = Math.max(0, Math.min(8, Number(glasses)));
    touch('routine_synced', { hydration_glasses: glasses, channel: 'app' });
    send(res, 200, state.routine);
  }],
  ['POST', /^\/api\/v1\/routine\/sleep$/, async (req, res) => {
    const { hours, quality } = await readBody(req);
    Object.assign(state.routine, { sleep_hours: Number(hours), sleep_quality: Number(quality) });
    touch('routine_synced', { sleep_hours: hours, channel: 'app' });
    send(res, 200, state.routine);
  }],
  ['POST', /^\/api\/v1\/routine\/wearables$/, async (req, res) => {
    const { steps, hrv } = await readBody(req);
    if (steps !== undefined) state.routine.wearable_steps = Number(steps);
    if (hrv !== undefined) state.routine.wearable_hrv = Number(hrv);
    touch('routine_synced', { wearables: true, channel: 'app' });
    send(res, 200, state.routine);
  }],
  ['POST', /^\/api\/v1\/routine\/medications$/, async (req, res) => {
    const { medications } = await readBody(req);
    if (Array.isArray(medications)) state.routine.medications = medications;
    touch('routine_synced', { medications: 'updated', channel: 'app' });
    send(res, 200, state.routine);
  }],

  /* ── Body map ── */
  ['GET', /^\/api\/v1\/body-map\/[^/]+\/history$/, async (_req, res) => send(res, 200, state.bodyMap)],
  ['POST', /^\/api\/v1\/body-map$/, async (req, res) => {
    const b = await readBody(req);
    const entry = addBodyEntry({
      region: b.body_region, view: b.body_view ?? 'front', intensity: Number(b.intensity ?? 0),
      type: b.symptom_types?.[0] ?? 'outro', description: b.description ?? '', source: 'app',
    });
    touch('body_map_updated', { entry_id: entry.id, region: entry.body_region, channel: 'app' });
    send(res, 200, entry);
  }],
  ['POST', /^\/api\/v1\/body-map\/([^/]+)\/photo$/, async (req, res, m) => {
    const photo = (await readUploadedImage(req)) ?? PHOTO_MAO;
    const entry = state.bodyMap.find((e) => e.id === m[1]);
    if (entry) {
      entry.photo_url = photo;
      entry.cv_classification = {
        clinical_notes: `Imagem analisada (${regionLabel(entry.body_region, entry.body_view)}): eritema leve, sem bolhas, secreção ou sinais de infecção. Sugerido acompanhamento e nova foto em 48h.`,
      };
      touch('body_map_updated', { entry_id: entry.id, channel: 'app' });
    }
    send(res, 200, { photo_url: photo, cv_classification: entry?.cv_classification ?? null });
  }],
  ['GET', /^\/api\/v1\/body-map\/entry\/([^/]+)$/, async (_req, res, m) => send(res, 200, state.bodyMap.find((e) => e.id === m[1]) ?? {})],
  ['PUT', /^\/api\/v1\/body-map\/([^/]+)$/, async (req, res, m) => {
    const b = await readBody(req);
    const entry = state.bodyMap.find((e) => e.id === m[1]);
    if (!entry) return send(res, 404, { detail: 'Entry not found' });
    for (const k of ['intensity', 'symptom_types', 'description']) if (b[k] !== undefined) entry[k] = b[k];
    entry.suggested_ctcae_grade = Math.min(4, Number(entry.intensity));
    touch('body_map_updated', { entry_id: m[1], channel: 'app' });
    send(res, 200, entry ?? {});
  }],
  ['DELETE', /^\/api\/v1\/body-map\/([^/]+)$/, async (_req, res, m) => {
    state.bodyMap = state.bodyMap.filter((e) => e.id !== m[1]);
    touch('body_map_updated', { entry_id: m[1], channel: 'app' });
    send(res, 200, { ok: true });
  }],

  /* ── Documentos ── */
  ['GET', /^\/api\/v1\/documents\/[^/]+$/, async (_req, res) =>
    send(res, 200, [...state.documents].sort((a, b) => b.created_at.localeCompare(a.created_at)))],
  ['POST', /^\/api\/v1\/documents\/upload$/, async (req, res) => {
    const raw = await readRaw(req);
    const fileName = multipartFileName(raw);
    const file = fileFromMultipart(raw, req.headers['content-type']);
    const ocr = demoOcr(fileName);
    const doc = {
      id: randomUUID(), patient_id: ROSA_ID, ...ocr, source_channel: multipartField(raw, 'source_channel') ?? 'upload',
      ai_questions: ['Esse resultado muda meu tratamento?', 'Preciso repetir esse exame? Quando?'],
      file_url: file && file.startsWith('data:image') ? file : PHOTO_HEMOGRAMA, created_at: now().toISOString(),
    };
    state.documents.push(doc);
    touch('document_added', { document_id: doc.id, channel: 'app' });
    send(res, 200, doc);
  }],
  ['DELETE', /^\/api\/v1\/documents\/([^/]+)$/, async (_req, res, m) => {
    const before = state.documents.length;
    state.documents = state.documents.filter((d) => d.id !== m[1]);
    if (state.documents.length === before) return send(res, 404, { detail: 'Document not found' });
    touch('document_added', { document_id: m[1], deleted: true, channel: 'app' });
    send(res, 204, '');
  }],

  /* ── Chamados (CRUD) ── */
  ['GET', /^\/api\/v1\/tickets\/?$/, async (_req, res) =>
    send(res, 200, [...state.tickets].sort((a, b) => b.updated_at.localeCompare(a.updated_at)))],
  ['POST', /^\/api\/v1\/tickets\/?$/, async (req, res) => {
    const b = await readBody(req);
    const at = now().toISOString();
    const ticket = {
      id: randomUUID(), patient_id: ROSA_ID, protocol: nextProtocol(b.channel), type: b.type ?? 'outro', channel: b.channel ?? 'sus',
      title: String(b.title ?? '').trim() || 'Chamado sem título', description: String(b.description ?? ''), status: 'aberto',
      created_at: at, updated_at: at,
    };
    state.tickets.push(ticket);
    touch('tickets_synced', { ticket_id: ticket.id, channel: 'app' });
    send(res, 201, ticket);
  }],
  ['PATCH', /^\/api\/v1\/tickets\/([^/]+)$/, async (req, res, m) => {
    const ticket = state.tickets.find((t) => t.id === m[1]);
    if (!ticket) return send(res, 404, { detail: 'Ticket not found' });
    const b = await readBody(req);
    for (const k of ['type', 'channel', 'title', 'description', 'status']) if (b[k] !== undefined) ticket[k] = b[k];
    ticket.updated_at = now().toISOString();
    touch('tickets_synced', { ticket_id: ticket.id, channel: 'app' });
    send(res, 200, ticket);
  }],
  ['DELETE', /^\/api\/v1\/tickets\/([^/]+)$/, async (_req, res, m) => {
    state.tickets = state.tickets.filter((t) => t.id !== m[1]);
    touch('tickets_synced', { ticket_id: m[1], deleted: true, channel: 'app' });
    send(res, 204, '');
  }],

  /* ── Diário emocional (CRUD) ── */
  ['GET', /^\/api\/v1\/journaling\/history$/, async (_req, res) =>
    send(res, 200, [...state.journal].sort((a, b) => b.created_at.localeCompare(a.created_at)))],
  ['POST', /^\/api\/v1\/journaling\/?$/, async (req, res) => {
    const b = await readBody(req);
    const entry = {
      id: randomUUID(), patient_id: ROSA_ID, mood: Number(b.mood ?? 3), emotions: Array.isArray(b.emotions) ? b.emotions : [],
      text: String(b.text ?? ''), source: 'app', created_at: now().toISOString(),
    };
    state.journal.push(entry);
    touch('journaling_synced', { entry_id: entry.id, channel: 'app' });
    send(res, 201, entry);
  }],
  ['PUT', /^\/api\/v1\/journaling\/([^/]+)$/, async (req, res, m) => {
    const entry = state.journal.find((e) => e.id === m[1]);
    if (!entry) return send(res, 404, { detail: 'Entry not found' });
    const b = await readBody(req);
    if (b.mood !== undefined) entry.mood = Number(b.mood);
    if (Array.isArray(b.emotions)) entry.emotions = b.emotions;
    if (b.text !== undefined) entry.text = String(b.text);
    touch('journaling_synced', { entry_id: entry.id, channel: 'app' });
    send(res, 200, entry);
  }],
  ['DELETE', /^\/api\/v1\/journaling\/([^/]+)$/, async (_req, res, m) => {
    state.journal = state.journal.filter((e) => e.id !== m[1]);
    touch('journaling_synced', { entry_id: m[1], deleted: true, channel: 'app' });
    send(res, 204, '');
  }],

  /* ── Sintomas CTCAE (CRUD) ── */
  ['GET', /^\/api\/v1\/symptoms\/[^/]+\/history$/, async (_req, res) =>
    send(res, 200, [...state.symptoms].sort((a, b) => b.registered_at.localeCompare(a.registered_at)))],
  ['POST', /^\/api\/v1\/symptoms\/?$/, async (req, res) => {
    const b = await readBody(req);
    const at = now().toISOString();
    const created = (Array.isArray(b.items) ? b.items : [b]).map((i) => ({
      id: randomUUID(), patient_id: ROSA_ID, symptom_id: String(i.symptom_id), symptom_label: String(i.symptom_label ?? i.symptom_id),
      grade: Math.max(0, Math.min(4, Number(i.grade ?? 0))), notes: String(i.notes ?? ''), registered_at: at,
    }));
    state.symptoms.push(...created);
    touch('symptoms_synced', { count: created.length, channel: 'app' });
    send(res, 201, created);
  }],
  ['DELETE', /^\/api\/v1\/symptoms\/([^/]+)$/, async (_req, res, m) => {
    state.symptoms = state.symptoms.filter((s) => s.id !== m[1]);
    touch('symptoms_synced', { symptom_id: m[1], deleted: true, channel: 'app' });
    send(res, 204, '');
  }],

  /* ── Rede de apoio: cuidadores e médicos vinculados ── */
  ['GET', /^(?:\/api\/v1)?\/auth\/caregivers\/[^/]+$/, async (_req, res) => send(res, 200, state.caregivers)],
  ['GET', /^(?:\/api\/v1)?\/auth\/doctors\/[^/]+$/, async (_req, res) => send(res, 200, state.doctors)],
  ['POST', /^(?:\/api\/v1)?\/auth\/link-caregiver$/, async (req, res) => {
    const email = new URL(req.url, 'http://x').searchParams.get('email')?.trim() ?? '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(res, 404, { detail: 'Caregiver with given email not found.' });
    if (!state.caregivers.some((c) => c.email === email)) {
      const local = email.split('@')[0].replace(/[._-]+/g, ' ');
      state.caregivers.push({ id: randomUUID(), name: local.replace(/\b\w/g, (c) => c.toUpperCase()), email });
    }
    send(res, 200, { message: 'Caregiver linked successfully' });
  }],
  ['POST', /^(?:\/api\/v1)?\/auth\/unlink-caregiver$/, async (req, res) => {
    const id = new URL(req.url, 'http://x').searchParams.get('caregiver_id');
    state.caregivers = state.caregivers.filter((c) => c.id !== id);
    send(res, 200, { message: 'Unlinked successfully' });
  }],
  ['POST', /^(?:\/api\/v1)?\/auth\/link-doctor$/, async (req, res) => {
    const crm = new URL(req.url, 'http://x').searchParams.get('crm')?.trim() ?? '';
    if (!/\d{4,}/.test(crm)) return send(res, 404, { detail: 'Doctor not found.' });
    if (!state.doctors.some((d) => d.crm.replace(/\D/g, '') === crm.replace(/\D/g, ''))) {
      state.doctors.push({ id: randomUUID(), name: 'Dr(a). — Oncologia', crm: /crm/i.test(crm) ? crm.toUpperCase() : `CRM ${crm}` });
    }
    send(res, 200, { message: 'Doctor linked successfully' });
  }],
  ['POST', /^(?:\/api\/v1)?\/auth\/unlink-doctor$/, async (req, res) => {
    const id = new URL(req.url, 'http://x').searchParams.get('doctor_id');
    state.doctors = state.doctors.filter((d) => d.id !== id);
    send(res, 200, { message: 'Unlinked successfully' });
  }],

  /* ── Chat com a Ani no app (memória compartilhada com o WhatsApp) ── */
  ['POST', /^\/api\/v1\/messages\/session$/, async (_req, res) => send(res, 200, { session_id: 'rosa-memoria' })],
  ['GET', /^\/api\/v1\/messages\/session\/[^/]+$/, async (_req, res) => send(res, 200, state.aniMessages)],
  ['POST', /^\/api\/v1\/messages$/, async (req, res) => {
    const b = await readBody(req);
    const at = now().toISOString();
    const userMessage = { id: randomUUID(), session_id: 'rosa-memoria', role: 'user', text: b.text, cards: [], channel: 'app', created_at: at };
    const { replies, events } = handleWhatsApp(String(b.text ?? ''));
    for (const [type, payload] of events) touch(type, { ...payload, channel: 'app' });
    const text = replies.map((r) => (typeof r === 'string' ? r : r.text ?? `📎 ${r.doc}`)).join('\n\n').replace(/\*/g, '');
    const ani = { id: randomUUID(), sessionId: 'rosa-memoria', role: 'ani', text, cards: [], isStreaming: false, channel: 'app', createdAt: at };
    state.aniMessages.push(
      { ...userMessage },
      { id: ani.id, session_id: 'rosa-memoria', role: 'ani', text, cards: [], channel: 'app', created_at: at },
    );
    send(res, 200, {
      user_message: { id: userMessage.id, sessionId: 'rosa-memoria', role: 'user', text: b.text, cards: [], isStreaming: false, channel: 'app', createdAt: at },
      ani_response: ani,
      session_id: 'rosa-memoria',
    });
  }],

  /* ── Painel do médico ── */
  ['GET', /^\/api\/v1\/doctor\/patients$/, async (_req, res) => send(res, 200, doctorPatients())],
  ['GET', /^\/api\/v1\/doctor\/sessions$/, async (_req, res) => send(res, 200, state.doctorSessions)],

  /* ── Agenda (CRUD) ── */
  ['GET', /^\/api\/v1\/doctor\/agenda$/, async (_req, res) =>
    send(res, 200, [...state.appointments].sort((a, b) => a.start.localeCompare(b.start)))],
  ['POST', /^\/api\/v1\/doctor\/agenda$/, async (req, res) => {
    const b = await readBody(req);
    if (!PATIENT_NAMES[b.patient_id] || !b.start) return send(res, 422, { detail: 'patient_id e start são obrigatórios' });
    const apt = {
      id: randomUUID(), patient_id: b.patient_id, patient_name: PATIENT_NAMES[b.patient_id], type: b.type ?? 'consulta',
      title: String(b.title ?? '').trim() || 'Consulta', start: new Date(b.start).toISOString(), duration_min: Number(b.duration_min ?? 30),
      location: String(b.location ?? 'Consultório 4'), status: 'agendado', confirmed_via: null, notes: String(b.notes ?? ''),
    };
    state.appointments.push(apt);
    if (apt.patient_id === ROSA_ID) {
      aniNotify(`Oi, ${ROSA.firstName}! 📅 A ${DOCTOR.name} agendou *${apt.title}*: ${whenLabel(apt.start)}, ${apt.location}.${apt.notes ? `\n📝 ${apt.notes}` : ''}\nResponda *CONFIRMO* para confirmar ou *REMARCAR* se precisar de outro horário.`);
    }
    touch('agenda_synced', { appointment_id: apt.id, channel: 'web' });
    send(res, 201, apt);
  }],
  ['PATCH', /^\/api\/v1\/doctor\/agenda\/([^/]+)$/, async (req, res, m) => {
    const apt = state.appointments.find((a) => a.id === m[1]);
    if (!apt) return send(res, 404, { detail: 'Appointment not found' });
    const b = await readBody(req);
    const prev = { start: apt.start, status: apt.status };
    for (const k of ['type', 'title', 'duration_min', 'location', 'status', 'notes']) if (b[k] !== undefined) apt[k] = b[k];
    if (b.start) apt.start = new Date(b.start).toISOString();
    if (apt.start !== prev.start) apt.confirmed_via = null;
    if (apt.patient_id === ROSA_ID) {
      if (apt.status === 'cancelado' && prev.status !== 'cancelado') {
        aniNotify(`${ROSA.firstName}, a ${DOCTOR.name} cancelou *${apt.title}* de ${whenLabel(prev.start)}. Qualquer dúvida, é só me chamar aqui. 💛`);
      } else if (apt.start !== prev.start) {
        aniNotify(`📅 ${ROSA.firstName}, *${apt.title}* foi remarcada para ${whenLabel(apt.start)}, ${apt.location}. Responda *CONFIRMO* para confirmar.`);
      }
    }
    touch('agenda_synced', { appointment_id: apt.id, channel: 'web' });
    send(res, 200, apt);
  }],
  ['DELETE', /^\/api\/v1\/doctor\/agenda\/([^/]+)$/, async (_req, res, m) => {
    state.appointments = state.appointments.filter((a) => a.id !== m[1]);
    touch('agenda_synced', { appointment_id: m[1], deleted: true, channel: 'web' });
    send(res, 204, '');
  }],

  /* ── Alertas (derivados dos relatos + status definido pelo médico) ── */
  ['GET', /^\/api\/v1\/doctor\/alerts$/, async (_req, res) => send(res, 200, doctorAlerts())],
  ['PATCH', /^\/api\/v1\/doctor\/alerts\/([^/]+)$/, async (req, res, m) => {
    const b = await readBody(req);
    const id = decodeURIComponent(m[1]);
    state.alertStatus[id] = {
      ...(state.alertStatus[id] ?? {}),
      ...(b.status ? { status: b.status } : {}),
      ...(b.note !== undefined ? { note: String(b.note) } : {}),
      updated_at: now().toISOString(),
    };
    touch('alerts_synced', { alert_id: id, channel: 'web' });
    send(res, 200, doctorAlerts().find((a) => a.id === id) ?? { id, ...state.alertStatus[id] });
  }],
  ['GET', /^\/api\/v1\/doctor\/patients\/([^/]+)\/dashboard$/, async (_req, res, m) => {
    const other = OTHER_PATIENTS.find((p) => p.id === m[1]);
    send(res, 200, other ? otherDashboard(other) : rosaDashboard());
  }],
  ['POST', /^\/api\/v1\/doctor\/ai-chat$/, async (req, res) => {
    const b = await readBody(req);
    send(res, 200, { response: doctorAiAnswer(String(b.query ?? '')) });
  }],
];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') return send(res, 204, '');

  for (const [method, re, handler] of routes) {
    const m = url.pathname.match(re);
    if (method === req.method && m) {
      try {
        return await handler(req, res, m);
      } catch (err) {
        console.error(err);
        return send(res, 500, { detail: String(err) });
      }
    }
  }

  // Fallback amigável: qualquer outro GET devolve lista vazia para a tela não quebrar offline.
  if (url.pathname.startsWith('/api/')) {
    console.log(`  (mock genérico) ${req.method} ${url.pathname}`);
    return send(res, 200, req.method === 'GET' ? [] : { ok: true });
  }
  send(res, 404, { detail: 'Not found' });
});

state = createState();

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ✖ A porta ${PORT} já está em uso — provavelmente pela API FastAPI (uvicorn).`);
    console.error('    O app e o painel falam com a porta 8000, então o servidor de demo precisa dela.');
    console.error('    Feche a API (Ctrl+C no terminal do uvicorn) e rode este comando de novo.\n');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
  console.log('\n  🤎 Anicca — servidor de demo OFFLINE rodando\n');
  console.log(`  Simulador WhatsApp:  http://localhost:${PORT}/whatsapp`);
  console.log(`  API (app + painel):  http://localhost:${PORT}/api/v1`);
  ips.forEach((ip) => console.log(`  Na rede local:       http://${ip}:${PORT}   (use no celular / EXPO_PUBLIC_API_URL)`));
  console.log('\n  Logins do app:  rosa@anicca.demo (paciente)  •  lucas@anicca.demo (cuidador)  •  senha 123456\n');
});
