'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, Brain, BookOpen, ExternalLink, Send, Loader2,
  ChevronDown, ChevronUp, Plus, MessageSquare, FileText,
  Activity, Heart, Map, Zap, AlertTriangle, Check,
  MoreHorizontal, Thermometer, HeartPulse, Scale, Clipboard
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  clinical?: string;
  sources?: string;
  artifacts?: Artifact[];
  timestamp: Date;
}

interface Artifact {
  title: string;
  type: 'table' | 'protocol' | 'timeline' | 'trials';
  content: string;
}

interface Session {
  id: string;
  label: string;
  date: string;
  preview: string;
}

function parseAniResponse(raw: string): { thinking: string; clinical: string; sources: string } {
  const thinkingMatch = raw.match(/\*\*\[PENSAMENTO\]\*\*\s*([\s\S]*?)(?=\*\*\[RESPOSTA|$)/i);
  const clinicalMatch = raw.match(/\*\*\[RESPOSTA CLÍNICA\]\*\*\s*([\s\S]*?)(?=\*\*\[FONTES|$)/i);
  const sourcesMatch = raw.match(/\*\*\[FONTES E REFERÊNCIAS\]\*\*\s*([\s\S]*?)$/i);
  return {
    thinking: thinkingMatch?.[1]?.trim() || '',
    clinical: clinicalMatch?.[1]?.trim() || raw,
    sources: sourcesMatch?.[1]?.trim() || '',
  };
}

function addInlineCitations(text: string, sources: string): { annotated: string; refs: string[] } {
  const lines = sources.split('\n').filter(l => l.trim().startsWith('-'));
  const refs = lines.map(l => l.replace(/^-\s*/, '').trim());
  let annotated = text;
  refs.forEach((ref, i) => {
    const num = `[${i + 1}]`;
    const firstWords = ref.split(' ').slice(0, 3).join(' ').toLowerCase();
    const pattern = new RegExp(`(${firstWords.split(' ').join('\\s+')})`, 'gi');
    if (i < 3) annotated = annotated.replace(pattern, `$1${num}`);
  });
  return { annotated, refs };
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith('## ')) return (
          <h3 key={i} className="text-sm font-bold text-[#3d2b1f] mt-4 mb-2 pb-1 border-b border-[#f3ece5]">
            {line.replace('## ', '')}
          </h3>
        );
        if (line.startsWith('### ')) return (
          <h4 key={i} className="text-xs font-bold text-[#5a4a42] mt-3 mb-1 uppercase tracking-wider">
            {line.replace('### ', '')}
          </h4>
        );
        if (line.match(/^\d+\.\s/)) {
          const content = line.replace(/^\d+\.\s/, '');
          const num = line.match(/^(\d+)\./)?.[1];
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="text-[11px] font-bold bg-[#fde8d9] text-[#e67e22] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{num}</span>
              <span className="text-sm text-[#3d2b1f] leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(\d+)\]/g, '<sup class="text-[#f28b50] font-bold cursor-pointer hover:underline">[$1]</sup>') }} />
            </div>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const content = line.replace(/^[-*] /, '');
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[#f28b50] mt-1.5 shrink-0 text-xs">•</span>
              <span className="text-sm text-[#3d2b1f] leading-relaxed" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(\d+)\]/g, '<sup class="text-[#f28b50] font-bold">[$1]</sup>') }} />
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-[#3d2b1f] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(\d+)\]/g, '<sup class="text-[#f28b50] font-bold">[$1]</sup>') }}
          />
        );
      })}
    </div>
  );
}

function ThinkingBlock({ thinking }: { thinking: string }) {
  const [open, setOpen] = useState(false);
  if (!thinking) return null;
  const steps = thinking.split('\n').filter(l => l.trim());
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-xs text-[#a3988e] hover:text-[#5a4a42] transition-colors">
        <Brain size={13} className="text-[#f28b50]" />
        <span className="font-medium">Raciocínio clínico</span>
        <span className="text-[#c9bfb8]">·</span>
        <span className="text-[#c9bfb8]">{open ? 'ocultar' : 'ver'}</span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && (
        <div className="mt-2 ml-5 pl-3 border-l-2 border-[#f5dece] space-y-1">
          {steps.map((step, i) => (
            <p key={i} className="text-xs text-[#a3988e] leading-relaxed italic">{step}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesFootnotes({ refs }: { refs: string[] }) {
  if (!refs.length) return null;
  return (
    <div className="mt-4 pt-3 border-t border-[#f3ece5]">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={12} className="text-[#a3988e]" />
        <span className="text-[10px] font-bold text-[#a3988e] uppercase tracking-wider">Referências</span>
      </div>
      <div className="space-y-1">
        {refs.map((ref, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[10px] font-bold text-[#f28b50] min-w-[18px]">[{i + 1}]</span>
            <span className="text-[11px] text-[#8c8078] leading-relaxed flex-1">{ref}</span>
            <ExternalLink size={10} className="text-[#c9bfb8] mt-0.5 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AniMessage({ msg }: { msg: ChatMessage }) {
  const parsed = msg.thinking !== undefined
    ? { thinking: msg.thinking || '', clinical: msg.clinical || msg.content, sources: msg.sources || '' }
    : parseAniResponse(msg.content);

  const sourceLines = parsed.sources.split('\n').filter(l => l.trim().startsWith('-'));
  const refs = sourceLines.map(l => l.replace(/^-\s*/, '').trim());
  const hasNoCitations = parsed.sources.includes('Nenhuma publicação') || !refs.length;

  return (
    <div className="flex gap-4 items-start max-w-4xl">
      <div className="w-8 h-8 rounded-full border border-[#e5d8cc] bg-white shrink-0 overflow-hidden mt-0.5">
        <Image src="/images/ani-geral/ani-profile-icon.svg" width={32} height={32} alt="Ani" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px] font-bold text-[#3d2b1f]">Ani</span>
          <span className="text-[10px] bg-[#fde8d9] text-[#c2410c] px-2 py-0.5 rounded-full font-semibold">Gemini 3.6 · PubMed</span>
          <span className="text-[10px] text-[#c9bfb8] ml-auto">
            {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <ThinkingBlock thinking={parsed.thinking} />

        <div className="prose prose-sm max-w-none">
          <MarkdownText text={parsed.clinical} />
        </div>

        {!hasNoCitations && <SourcesFootnotes refs={refs} />}
        {hasNoCitations && parsed.sources && (
          <div className="mt-3 text-[11px] text-[#a3988e] italic border-t border-[#f3ece5] pt-2">
            Resposta baseada em conhecimento médico interno — validação clínica obrigatória.
          </div>
        )}
      </div>
    </div>
  );
}

function PatientBriefing({ dashboardData, patient }: { dashboardData: any; patient: any }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !dashboardData) return null;

  return (
    <div className="bg-gradient-to-br from-[#fff8f4] to-[#fdf6f0] border border-[#f5dece] rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clipboard size={15} className="text-[#f28b50]" />
          <span className="text-sm font-bold text-[#3d2b1f]">Briefing Pré-Consulta</span>
          <span className="text-[10px] bg-[#fde8d9] text-[#e67e22] px-2 py-0.5 rounded-full">gerado pela Ani</span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-[#c9bfb8] hover:text-[#8c8078] transition-colors text-xs">
          dispensar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#e5e0dc] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={13} className="text-[#ea580c]" />
            <span className="text-[11px] font-bold text-[#5a4a42] uppercase tracking-wider">Temperatura</span>
          </div>
          <p className="text-xl font-bold text-[#3d2b1f]">{dashboardData.vitals?.temperature || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e0dc] p-3">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse size={13} className="text-[#16a34a]" />
            <span className="text-[11px] font-bold text-[#5a4a42] uppercase tracking-wider">Pressão</span>
          </div>
          <p className="text-xl font-bold text-[#3d2b1f]">{dashboardData.vitals?.blood_pressure || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e0dc] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={13} className="text-[#5a4a42]" />
            <span className="text-[11px] font-bold text-[#5a4a42] uppercase tracking-wider">Peso</span>
          </div>
          <p className="text-xl font-bold text-[#3d2b1f]">{dashboardData.vitals?.weight || 'N/A'}</p>
        </div>
      </div>

      {dashboardData.alerts && dashboardData.alerts.filter((a: any) => a.text !== 'Nenhum sintoma grave reportado recentemente.').length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider">Alertas Body Map</p>
          {dashboardData.alerts.slice(0, 3).map((alert: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-[#ef4444]">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">{alert.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const QUICK_PROMPTS = [
  { icon: <Activity size={15} />, label: 'Diretrizes para neutropenia febril neste protocolo', query: 'Quais as diretrizes ASCO 2024 para manejo de neutropenia febril considerando o protocolo atual desta paciente?' },
  { icon: <Zap size={15} />, label: 'Ajuste de dose por toxicidade GI grau 3', query: 'Critérios CTCAE para ajuste de dose por toxicidade gastrointestinal grau 3 no protocolo atual. Quais as recomendações?' },
  { icon: <Heart size={15} />, label: 'Knowledge Graph: perfil genômico × terapia', query: 'Com base no perfil oncológico desta paciente, quais são os links do Knowledge Graph entre o tipo de câncer, mutações esperadas e terapias de segunda linha disponíveis?' },
  { icon: <BookOpen size={15} />, label: 'Ensaios clínicos ativos para este perfil', query: 'Existem ensaios clínicos ativos no ClinicalTrials.gov para este tipo de câncer e estágio? Quais os critérios de elegibilidade típicos?' },
];

const PATIENT_TABS = [
  { id: 'chat', label: 'Conversa', icon: <MessageSquare size={14} /> },
  { id: 'bodymap', label: 'Body Map', icon: <Map size={14} /> },
  { id: 'docs', label: 'Documentos', icon: <FileText size={14} /> },
  { id: 'vitals', label: 'Rotina', icon: <Activity size={14} /> },
];

export default function PatientWorkspace() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('current');

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get('/api/v1/doctor/patients')
      .then(r => {
        const found = r.data.find((p: any) => p.id === patientId);
        setPatient(found || null);
      })
      .catch(console.error);

    axios.get(`/api/v1/doctor/patients/${patientId}/dashboard`)
      .then(r => setDashboardData(r.data))
      .catch(() => setDashboardData(null));

    setSessions([
      { id: 'current', label: 'Sessão atual', date: 'Hoje', preview: 'Nova conversa' },
    ]);
  }, [patientId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isAiLoading) return;
    setChatInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const res = await axios.post('/api/v1/doctor/ai-chat', {
        query,
        chat_history: chatHistory.map(m => ({ role: m.role, content: m.content }))
      });
      const raw: string = res.data.response;
      const parsed = parseAniResponse(raw);
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: raw,
        thinking: parsed.thinking,
        clinical: parsed.clinical,
        sources: parsed.sources,
        timestamp: new Date(),
      }]);

      if (sessions[0]?.preview === 'Nova conversa') {
        setSessions(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], preview: query.substring(0, 50) + '...' };
          return updated;
        });
      }
    } catch {
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        thinking: '',
        clinical: 'Desculpe, ocorreu um erro de conexão com o agente clínico.',
        sources: '',
        timestamp: new Date(),
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#8c8078]">
          <Loader2 size={18} className="animate-spin text-[#f28b50]" />
          <span className="text-sm">Carregando workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-[#fbf9f6] flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <header className="h-[56px] bg-white border-b border-[#e5e0dc] flex items-center px-4 gap-4 shrink-0 z-10">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-xs text-[#8c8078] hover:text-[#3d2b1f] transition-colors group">
          <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Pacientes</span>
        </button>
        <span className="text-[#e5e0dc]">/</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#fde8d9] border border-[#f5c9a0] flex items-center justify-center text-[10px] font-bold text-[#e67e22]">
            {patient.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-bold text-[#3d2b1f]">{patient.name}</span>
          <span className="text-[11px] text-[#8c8078]">—</span>
          <span className="text-xs text-[#8c8078]">{patient.cancer_type} · Estágio {patient.cancer_stage}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1 ${
            patient.risk_level === 'Alto' ? 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca]' :
            patient.risk_level === 'Médio' ? 'bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]' :
            'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'
          }`}>{patient.risk_level}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Image src="/images/brand/logo-wordmark.svg" alt="Anicca" width={90} height={22} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar — Sessions */}
        <aside className="w-[240px] bg-white border-r border-[#e5e0dc] flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-[#e5e0dc]">
            <button
              onClick={() => {
                const newId = Date.now().toString();
                setSessions(prev => [{ id: newId, label: 'Nova sessão', date: 'Hoje', preview: 'Nova conversa' }, ...prev]);
                setActiveSessionId(newId);
                setChatHistory([]);
              }}
              className="w-full flex items-center gap-2 bg-[#fde8d9] hover:bg-[#fdd5b8] text-[#e67e22] px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus size={14} />
              Nova sessão
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e5e0dc]">
            {PATIENT_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#f28b50] text-[#f28b50]'
                    : 'border-transparent text-[#a3988e] hover:text-[#3d2b1f]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'chat' && (
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <p className="text-[10px] font-bold text-[#c9bfb8] uppercase tracking-wider px-2 py-1">Sessões</p>
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSessionId(s.id); if (s.id !== activeSessionId) setChatHistory([]); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                    activeSessionId === s.id ? 'bg-[#fde8d9]' : 'hover:bg-[#f3ece5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-semibold ${activeSessionId === s.id ? 'text-[#e67e22]' : 'text-[#3d2b1f]'}`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-[#c9bfb8]">{s.date}</span>
                  </div>
                  <p className="text-[11px] text-[#a3988e] truncate">{s.preview}</p>
                </button>
              ))}
            </div>
          )}

          {activeTab !== 'chat' && (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <div className="text-[#c9bfb8]">
                <FileText size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Em breve</p>
              </div>
            </div>
          )}

          {/* MCP Status */}
          <div className="p-3 border-t border-[#e5e0dc]">
            <p className="text-[10px] font-bold text-[#c9bfb8] uppercase tracking-wider mb-2">Fontes ativas</p>
            {[
              { name: 'PubMed', active: true },
              { name: 'OncoKB', active: true },
              { name: 'ClinicalTrials', active: false },
            ].map(mcp => (
              <div key={mcp.name} className="flex items-center justify-between py-1">
                <span className="text-xs text-[#5a4a42]">{mcp.name}</span>
                <div className={`w-2 h-2 rounded-full ${mcp.active ? 'bg-green-500' : 'bg-[#e5e0dc]'}`} />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Patient Briefing */}
            {chatHistory.length === 0 && <PatientBriefing dashboardData={dashboardData} patient={patient} />}

            {/* Quick Prompts */}
            {chatHistory.length === 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold text-[#a3988e] uppercase tracking-wider mb-3">Consultas rápidas</p>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(qp.query)}
                      className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-[#e5e0dc] hover:border-[#f28b50] hover:shadow-sm text-left transition-all group"
                    >
                      <span className="text-[#f28b50] mt-0.5 shrink-0">{qp.icon}</span>
                      <span className="text-sm text-[#3d2b1f] font-medium leading-tight">{qp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-8">
              {chatHistory.map((msg) => (
                <div key={msg.id}>
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[70%] bg-[#f28b50] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <AniMessage msg={msg} />
                  )}
                </div>
              ))}
            </div>

            {/* Loading */}
            {isAiLoading && (
              <div className="flex gap-4 items-start mt-8 max-w-4xl">
                <div className="w-8 h-8 rounded-full border border-[#e5d8cc] bg-white shrink-0 overflow-hidden">
                  <Image src="/images/ani-geral/ani-profile-icon.svg" width={32} height={32} alt="Ani" className="animate-pulse" />
                </div>
                <div className="flex items-center gap-3 bg-white border border-[#e5e0dc] rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                  <Loader2 size={14} className="animate-spin text-[#f28b50]" />
                  <span className="text-xs text-[#8c8078]">Consultando PubMed e Knowledge Graph...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#e5e0dc] bg-white px-8 py-4">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(chatInput); }}
              className="flex items-center gap-3 bg-[#fbf9f6] border border-[#e5e0dc] rounded-2xl px-4 py-3 focus-within:border-[#f28b50] focus-within:bg-white transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-full border border-[#e5d8cc] overflow-hidden shrink-0">
                <Image src="/images/ani-geral/ani-profile-icon.svg" width={24} height={24} alt="Ani" />
              </div>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={`Pergunte à Ani sobre ${patient.name}... (PubMed + Knowledge Graph)`}
                className="flex-1 bg-transparent text-sm text-[#3d2b1f] placeholder-[#a3988e] focus:outline-none"
                disabled={isAiLoading}
              />
              <button
                type="submit"
                disabled={isAiLoading || !chatInput.trim()}
                className="w-8 h-8 rounded-xl bg-[#f28b50] hover:bg-[#e07040] disabled:opacity-40 text-white flex items-center justify-center transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
            <p className="text-[10px] text-[#c9bfb8] text-center mt-2">
              Ani é um sistema de suporte à decisão clínica — não substitui o julgamento médico.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
