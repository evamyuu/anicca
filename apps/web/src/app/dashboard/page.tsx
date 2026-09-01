'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';
import {
  Search, Bell, AlertTriangle, Activity, Calendar, Settings,
  ChevronRight, Users, LayoutDashboard, Filter, ChevronDown,
  FileText, ChevronLeft, Brain, BookOpen, ExternalLink, Send,
  Loader2, Plus, MessageSquare, Map, Thermometer, HeartPulse,
  Scale, Clipboard, Heart, Zap, PanelLeftClose, PanelLeftOpen,
  ChevronUp, X, Stethoscope, Clock, Pin, File, FolderOpen,
  MoreHorizontal, PlusCircle, Paperclip, User, Sparkles, ArrowRight, ArrowUp
} from 'lucide-react';

/* ─── TYPES ─── */
interface Patient {
  id: string;
  name: string;
  cancer_type: string;
  cancer_stage: string;
  protocol: string;
  risk_level: 'Alto' | 'Médio' | 'Baixo';
}

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  clinical?: string;
  sources?: string;
  timestamp: Date;
}

interface Session {
  id: string;
  patientId?: string;
  preview: string;
  date: string;
  messages: ChatMsg[];
}

/* ─── HELPERS ─── */
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}
function parseAni(raw: string) {
  const t = raw.match(/\*\*\[PENSAMENTO\]\*\*\s*([\s\S]*?)(?=\*\*\[RESPOSTA|$)/i)?.[1]?.trim() ?? '';
  const c = raw.match(/\*\*\[RESPOSTA CLÍNICA\]\*\*\s*([\s\S]*?)(?=\*\*\[FONTES|$)/i)?.[1]?.trim() ?? raw;
  const s = raw.match(/\*\*\[FONTES E REFERÊNCIAS\]\*\*\s*([\s\S]*?)$/i)?.[1]?.trim() ?? '';
  return { thinking: t, clinical: c, sources: s };
}

const RISK_CFG = {
  'Alto':  { badge: 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca]', dot: 'bg-[#ef4444]', avatar: 'bg-[#fef2f2] border-[#fecaca] text-[#ef4444]' },
  'Médio': { badge: 'bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]', dot: 'bg-[#f28b50]', avatar: 'bg-[#fde8d9] border-[#f5c9a0] text-[#e67e22]' },
  'Baixo': { badge: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]', dot: 'bg-[#22c55e]', avatar: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]' },
} as const;

/* ─── CHAT INPUT REUSABLE COMPONENT ─── */
const ChatInputBox = ({ chatInput, setChatInput, handleSend, isLoading, placeholder }: {
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSend: (q: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}) => {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    e.target.style.height = '140px'; 
    e.target.style.height = Math.max(140, Math.min(e.target.scrollHeight, 300)) + 'px';
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSend(chatInput); }} className="relative bg-white border border-[#e5e0dc] rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus-within:border-[#FF9A5C] focus-within:shadow-[0_4px_20px_rgba(255,154,92,0.1)] transition-all flex flex-col w-full">
      <textarea
        value={chatInput}
        onChange={handleInput}
        placeholder={placeholder || "Descreva a tarefa ou pergunta..."}
        className="w-full min-h-[140px] max-h-[300px] overflow-y-auto bg-transparent resize-none p-6 pb-16 text-[15px] text-[#3d2b1f] placeholder-[#a3988e] focus:outline-none leading-relaxed whitespace-pre-wrap break-words"
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(chatInput); } }}
        style={{ height: '140px' }}
      />
      <div className="absolute bottom-3 left-4 right-3 flex justify-between items-center">
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f8f4f0] text-[#8c8078] hover:text-[#3d2b1f] hover:bg-[#e5e0dc] transition-colors text-[13px] font-bold">
            <Plus size={14} /> Anexos
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f8f4f0] text-[#8c8078] hover:text-[#3d2b1f] hover:bg-[#e5e0dc] transition-colors text-[13px] font-bold">
            <Activity size={14} /> Protocolos
          </button>
        </div>
        <button type="submit" disabled={!chatInput.trim() || isLoading} className="w-10 h-10 flex justify-center items-center rounded-full bg-[#3d2b1f] text-white hover:bg-[#5a4a42] transition-colors disabled:opacity-30 disabled:hover:bg-[#3d2b1f]">
          <ArrowRight size={18} className="-rotate-90" />
        </button>
      </div>
    </form>
  );
};
/* ─── MICRO COMPONENTS ─── */
function MarkdownText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-[#3d2b1f] mt-3 mb-1 pb-1 border-b border-[#f3ece5]">{line.slice(3)}</h3>;
        if (line.startsWith('### ')) return <h4 key={i} className="text-xs font-bold text-[#5a4a42] mt-2 uppercase tracking-wider">{line.slice(4)}</h4>;
        const ord = line.match(/^(\d+)\.\s/);
        if (ord) return (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-[11px] font-bold bg-[#fde8d9] text-[#e67e22] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{ord[1]}</span>
            <span className="text-sm text-[#3d2b1f] leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(\d+)\]/g, '<sup class="text-[#FF9A5C] font-bold">[$1]</sup>') }} />
          </div>
        );
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-[#FF9A5C] mt-1.5 shrink-0 text-xs">•</span>
            <span className="text-sm text-[#3d2b1f] leading-relaxed" dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(\d+)\]/g, '<sup class="text-[#FF9A5C] font-bold">[$1]</sup>') }} />
          </div>
        );
        return <p key={i} className="text-sm text-[#3d2b1f] leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(\d+)\]/g, '<sup class="text-[#FF9A5C] font-bold">[$1]</sup>') }} />;
      })}
    </div>
  );
}

function AniMessage({ msg }: { msg: ChatMsg }) {
  const p = msg.thinking !== undefined
    ? { thinking: msg.thinking ?? '', clinical: msg.clinical ?? msg.content, sources: msg.sources ?? '' }
    : parseAni(msg.content);
  return (
    <div className="flex gap-4 items-start mb-8">
      <div className="w-8 h-8 rounded-full border border-[#e5d8cc] bg-[#fdfaf7] shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
        <Image src="/images/ani-geral/ani-profile-icon.svg" width={32} height={32} alt="Ani" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-[#3d2b1f]">Ani</span>
          <span className="text-[10px] text-[#c9bfb8] ml-2">{msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <MarkdownText text={p.clinical} />
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex justify-end mb-8">
      <div className="max-w-[80%] bg-[#f8f4f0] text-[#3d2b1f] border border-[#e5e0dc] px-5 py-4 rounded-3xl rounded-tr-sm shadow-sm text-sm leading-relaxed">
        {msg.content}
      </div>
    </div>
  );
}

/* ─── NEW: GLOBAL DASHBOARD (Centro de Comando) ─── */
function GlobalDashboard({ patients, onSelect }: { patients: Patient[]; onSelect: (p: Patient) => void }) {
  const highRisk = patients.filter(p => p.risk_level === 'Alto');

  return (
    <div className="flex-1 flex h-full bg-[#fcfaf8] overflow-y-auto">
      <div className="p-10 max-w-6xl mx-auto w-full space-y-8">
        
        {/* Banner */}
        <div className="bg-[#fde8d9] rounded-[32px] p-8 flex justify-between items-center relative overflow-hidden shadow-sm">
          <div className="z-10">
            <h2 className="text-3xl font-bold text-[#c2410c] mb-2">Bom dia, Dra. Renata</h2>
            <p className="text-sm text-[#e67e22]">Centro de comando clínico atualizado. Você tem 3 alertas prioritários hoje.</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <Stethoscope size={160} className="text-[#c2410c] -mr-8 -mb-8" />
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-[#e5e0dc] p-5 rounded-3xl shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#f8f4f0] rounded-lg flex items-center justify-center text-[#5a4a42]"><Users size={16}/></div>
              <p className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider">Total Pacientes</p>
            </div>
            <p className="text-2xl font-bold text-[#3d2b1f]">{patients.length}</p>
          </div>
          <div className="bg-[#fef2f2] border border-[#fecaca] p-5 rounded-3xl shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-[#ef4444]"><AlertTriangle size={16}/></div>
              <p className="text-[11px] font-bold text-[#b91c1c] uppercase tracking-wider">Risco Alto (ML)</p>
            </div>
            <p className="text-2xl font-bold text-[#b91c1c]">{highRisk.length}</p>
          </div>
          <div className="bg-white border border-[#e5e0dc] p-5 rounded-3xl shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#f8f4f0] rounded-lg flex items-center justify-center text-[#5a4a42]"><Calendar size={16}/></div>
              <p className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider">Agenda Hoje</p>
            </div>
            <p className="text-2xl font-bold text-[#3d2b1f]">4</p>
          </div>
          <div className="bg-white border border-[#e5e0dc] p-5 rounded-3xl shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#f8f4f0] rounded-lg flex items-center justify-center text-[#5a4a42]"><FileText size={16}/></div>
              <p className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider">Pendências</p>
            </div>
            <p className="text-2xl font-bold text-[#3d2b1f]">12</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Col: Agenda / Fila */}
          <div className="col-span-7 bg-white border border-[#e5e0dc] rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#3d2b1f]">Fila de Atendimento (Hoje)</h3>
              <button className="text-xs font-bold text-[#FF9A5C] hover:text-[#e67e22]">Ver Agenda Completa</button>
            </div>
            <div className="space-y-3">
              {[
                { time: '09:00', type: 'Retorno', patient: patients[0] },
                { time: '10:30', type: 'Primeira Vez', patient: patients[1] },
                { time: '11:15', type: 'Análise de Exames', patient: patients[2] }
              ].map((apt, i) => apt.patient && (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#faf7f4] border border-[#f3ece5]">
                  <div className="text-center w-12 shrink-0">
                    <p className="text-sm font-bold text-[#3d2b1f]">{apt.time}</p>
                    <p className="text-[9px] text-[#a3988e] uppercase mt-0.5">{apt.type}</p>
                  </div>
                  <div className="h-8 w-px bg-[#e5e0dc] mx-2" />
                  <div className="flex-1 flex items-center gap-3 cursor-pointer group" onClick={() => onSelect(apt.patient)}>
                    <div className="w-8 h-8 rounded-full bg-white border border-[#e5e0dc] flex items-center justify-center text-xs font-bold text-[#5a4a42] group-hover:border-[#FF9A5C] transition-colors">{initials(apt.patient.name)}</div>
                    <div>
                      <p className="text-sm font-bold text-[#3d2b1f] group-hover:text-[#FF9A5C] transition-colors">{apt.patient.name}</p>
                      <p className="text-[11px] text-[#8c8078]">{apt.patient.cancer_type}</p>
                    </div>
                  </div>
                  <button onClick={() => onSelect(apt.patient)} className="w-8 h-8 rounded-full bg-white border border-[#e5e0dc] flex items-center justify-center text-[#a3988e] hover:text-[#FF9A5C] hover:border-[#FF9A5C] transition-colors">
                    <ChevronRight size={14}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Alertas & Pendências */}
          <div className="col-span-5 space-y-6">
            
            {/* Alertas */}
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[32px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 text-[#b91c1c]">
                  <AlertTriangle size={18} />
                  <h3 className="text-lg font-bold">Alertas Clínicos (Triagem)</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/80 p-4 rounded-2xl border border-[#fecaca]">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-[#3d2b1f]">{patients[0]?.name || 'Paciente'}</span>
                    <span className="text-[10px] text-[#ef4444] font-bold">Há 2 horas</span>
                  </div>
                  <p className="text-xs text-[#5a4a42] leading-relaxed mb-2">Relato de dor intensa (9/10) no abdômen via Body Map.</p>
                  <button onClick={() => patients[0] && onSelect(patients[0])} className="text-[11px] font-bold text-[#b91c1c] flex items-center gap-1 hover:underline">
                    Abrir Prontuário <ChevronRight size={12}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Pendências */}
            <div className="bg-white border border-[#e5e0dc] rounded-[32px] p-6 shadow-sm">
               <div className="flex items-center gap-2 text-[#3d2b1f] mb-5">
                  <Clipboard size={18} />
                  <h3 className="text-lg font-bold">Pendências</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#faf7f4] cursor-pointer transition-colors border border-transparent hover:border-[#e5e0dc]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f8f4f0] flex items-center justify-center text-[#a3988e]"><FileText size={14}/></div>
                      <div>
                        <p className="text-sm font-medium text-[#3d2b1f]">3 Exames Processados</p>
                        <p className="text-[10px] text-[#8c8078]">Aguardando assinatura médica</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#c9bfb8]" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#faf7f4] cursor-pointer transition-colors border border-transparent hover:border-[#e5e0dc]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f8f4f0] flex items-center justify-center text-[#a3988e]"><MessageSquare size={14}/></div>
                      <div>
                        <p className="text-sm font-medium text-[#3d2b1f]">2 Mensagens Não Lidas</p>
                        <p className="text-[10px] text-[#8c8078]">Dúvidas institucionais</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#c9bfb8]" />
                  </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── NEW: PATIENTS TAB (Directory) ─── */
function PatientsDirectory({ patients, onSelect }: { patients: Patient[]; onSelect: (p: Patient) => void }) {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfaf8] overflow-hidden">
      <div className="p-8 border-b border-[#e5e0dc] bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#3d2b1f] mb-1">Pacientes</h2>
          <p className="text-sm text-[#8c8078]">Gerencie todos os seus pacientes em acompanhamento.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3988e]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome ou CPF..." className="w-full bg-[#faf7f4] border border-[#e5e0dc] rounded-full py-2.5 pl-12 pr-4 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#FF9A5C] transition-colors" />
          </div>
          <button className="flex items-center gap-2 bg-[#f8f4f0] border border-[#e5e0dc] hover:bg-[#f0e9e4] text-[#3d2b1f] px-4 py-2.5 rounded-full text-xs font-bold transition-colors">
            <Filter size={14} /> Filtros
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-[24px] border border-[#e5e0dc] shadow-sm max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#f3ece5] text-[11px] font-bold text-[#a3988e] uppercase tracking-wider bg-[#faf7f4] rounded-t-[24px]">
            <div className="col-span-4">Paciente</div>
            <div className="col-span-3">Diagnóstico</div>
            <div className="col-span-2">Risco (ML)</div>
            <div className="col-span-2">Protocolo</div>
            <div className="col-span-1 text-right">Ação</div>
          </div>
          <div>
            {patients.map((p, i) => {
              const cfg = RISK_CFG[p.risk_level];
              return (
                <div key={p.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#faf7f4] transition-colors cursor-pointer ${i !== patients.length - 1 ? 'border-b border-[#f3ece5]' : ''}`} onClick={() => onSelect(p)}>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${cfg.avatar}`}>{initials(p.name)}</div>
                    <div>
                      <span className="text-sm font-bold text-[#3d2b1f] block">{p.name}</span>
                      <span className="text-[10px] text-[#8c8078]">ID: {p.id.split('-')[0]}</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs text-[#3d2b1f] block">{p.cancer_type}</span>
                    <span className="text-[10px] text-[#a3988e]">Estágio {p.cancer_stage}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>{p.risk_level}</span>
                  </div>
                  <div className="col-span-2 text-xs text-[#a3988e] truncate">{p.protocol || 'Sem protocolo'}</div>
                  <div className="col-span-1 flex justify-end">
                    <button className="p-1.5 rounded-lg text-[#a3988e] hover:bg-[#e5e0dc] hover:text-[#3d2b1f] transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── IMPROVED: GLOBAL CHAT VIEW ─── */
function GlobalChatView({ session, onSendMsg }: { session: Session | null; onSendMsg: (q: string) => Promise<void>; }) {
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [session?.messages, isLoading]);

  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return;
    setChatInput('');
    setIsLoading(true);
    await onSendMsg(query);
    setIsLoading(false);
  };

  const suggestions = [
    "Analisar interações de Tamoxifeno",
    "Quais as diretrizes NCCN 2026 para Mama?",
    "Gerar modelo de laudo padrão",
    "Pesquisar estudos recentes sobre imunoterapia"
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {!session || session.messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-10">
          <div className="flex items-center justify-center gap-4 mb-10">
            <img src="/ani-profile-icon.svg" alt="Ani" className="w-12 h-12 object-cover rounded-xl shadow-sm" />
            <h1 className="text-[32px] font-serif text-[#3d2b1f]">Bom dia, Dra. Renata. Como posso ajudar?</h1>
          </div>
          
          <div className="w-full max-w-3xl mb-8">
            <ChatInputBox 
              chatInput={chatInput} 
              setChatInput={setChatInput} 
              handleSend={handleSend} 
              isLoading={isLoading} 
              placeholder="No que posso ajudar hoje? (ex: 'Resuma os exames recentes da paciente X')" 
            />
          </div>

          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3 px-1">
               <span className="text-sm font-bold text-[#3d2b1f]">Sugestões para você</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {suggestions.slice(0, 3).map((text, i) => (
                <button key={i} onClick={() => handleSend(text)} className="bg-white border border-[#e5e0dc] hover:border-[#FF9A5C] text-[#5a4a42] p-4 rounded-[20px] text-[13px] font-medium shadow-sm transition-all flex flex-col items-start gap-4 h-[100px] relative group text-left">
                  <MessageSquare size={16} className="text-[#a3988e] group-hover:text-[#FF9A5C] transition-colors" />
                  <span className="leading-snug pr-4">{text}</span>
                  <ArrowUp size={14} className="absolute top-4 right-4 text-[#c9bfb8] group-hover:text-[#FF9A5C] rotate-45 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative h-full">
          <div className="flex-1 overflow-y-auto px-10 py-6 max-w-3xl mx-auto w-full mt-6">
            {session.messages.map(msg => (msg.role === 'user' ? <UserMessage key={msg.id} msg={msg} /> : <AniMessage key={msg.id} msg={msg} />))}
            {isLoading && (
              <div className="flex gap-4 items-start mb-8">
                <div className="w-8 h-8 rounded-full bg-[#f0e9e4] flex items-center justify-center"><Loader2 size={16} className="animate-spin text-[#FF9A5C]" /></div>
                <div className="px-5 py-4 bg-white border border-[#e5e0dc] rounded-2xl rounded-tl-sm text-sm text-[#8c8078]">Pensando...</div>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
          <div className="p-6 bg-gradient-to-t from-white to-transparent">
            <div className="max-w-3xl mx-auto w-full">
              <form onSubmit={e => { e.preventDefault(); handleSend(chatInput); }} className="relative bg-white border border-[#e5e0dc] rounded-2xl shadow-lg focus-within:border-[#FF9A5C] transition-all overflow-hidden">
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="w-full bg-transparent resize-none px-6 pt-5 pb-14 text-[15px] text-[#3d2b1f] focus:outline-none"
                  rows={1}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(chatInput); } }}
                />
                <div className="absolute bottom-3 right-3 left-3 flex justify-between items-center">
                  <PlusCircle size={18} className="text-[#a3988e] ml-2" />
                  <button type="submit" disabled={isLoading || !chatInput.trim()} className="w-9 h-9 rounded-lg bg-[#403229] text-white hover:bg-[#5a4a42] disabled:opacity-30 flex items-center justify-center"><Send size={16} /></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PATIENT WORKSPACE (MANUS/CLAUDE STYLE) ─── */
function PatientWorkspace({ patient, dashboardData, session, onBack, onSendMsg }: { 
  patient: Patient; dashboardData: any; session: Session | null; 
  onBack: () => void; onSendMsg: (q: string) => Promise<void>;
}) {
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPinned, setContextPinned] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [session?.messages, isLoading]);

  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return;
    setChatInput('');
    setIsLoading(true);
    await onSendMsg(query);
    setIsLoading(false);
  };

  const renderCard = (title: string, icon: any, content: React.ReactNode, isPinned: boolean) => (
    <div className={`bg-white rounded-[20px] p-5 mb-4 border border-[#e5e0dc] shadow-sm relative transition-all ${isPinned ? 'max-h-[160px] overflow-hidden group' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[13px] font-bold text-[#3d2b1f]">{title}</span>
        {icon}
      </div>
      {content}
      {isPinned && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-3">
          <button 
            onClick={() => setContextOpen(true)} 
            className="text-[11px] font-bold text-[#3d2b1f] bg-[#faf7f4] border border-[#e5e0dc] hover:border-[#FF9A5C] hover:text-[#FF9A5C] px-4 py-1.5 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          >
            Ver mais
          </button>
        </div>
      )}
    </div>
  );

  const getCardsData = () => {
    const alerts = dashboardData?.alerts || [];
    const mlRisk = dashboardData?.ml_insights;

    return {
      resumo: renderCard(
        'Resumo Clínico',
        <BookOpen size={14} className="text-[#a3988e]" />,
        <div className="space-y-3">
          <p className="text-[13px] text-[#5a4a42] leading-relaxed">
            {dashboardData?.briefing || "Resumo não disponível. A IA precisa processar mais dados deste paciente."}
          </p>
          <button className="w-full flex justify-center items-center gap-2 bg-[#f8f4f0] text-[#3d2b1f] hover:bg-[#f0e9e4] text-[11px] font-bold py-2 rounded-xl border border-[#e5e0dc] transition-colors">
            <Plus size={14} /> Atualizar IA
          </button>
        </div>,
        false // Will override later
      ),
      protocolo: renderCard(
        'Protocolo',
        <Activity size={14} className="text-[#a3988e]" />,
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-[#faf7f4] p-3 rounded-xl border border-[#e5e0dc]">
            <Activity size={16} className="text-[#FF9A5C]" />
            <span className="text-[13px] font-medium text-[#5a4a42]">{patient.protocol || 'Sem protocolo'}</span>
          </div>
        </div>,
        false
      ),
      sinais: renderCard(
        'Sinais Vitais',
        <HeartPulse size={14} className="text-[#a3988e]" />,
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-[#faf7f4] p-2.5 rounded-xl border border-[#e5e0dc]">
            <span className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider">Temp</span>
            <span className="text-[13px] font-bold text-[#FF9A5C]">{dashboardData?.vitals?.temperature || '--'}</span>
          </div>
          <div className="flex justify-between items-center bg-[#faf7f4] p-2.5 rounded-xl border border-[#e5e0dc]">
            <span className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider">PA</span>
            <span className="text-[13px] font-bold text-[#FF9A5C]">{dashboardData?.vitals?.blood_pressure || '--'}</span>
          </div>
        </div>,
        false
      ),
      sintomas: renderCard(
        'Sintomas Recentes',
        <AlertTriangle size={14} className="text-[#ef4444]" />,
        <div className="space-y-3">
          {alerts.length > 0 ? alerts.map((a: any, idx: number) => (
            <div key={idx} className="bg-[#fef2f2] border border-[#fecaca] p-3.5 rounded-xl">
              <p className="text-[13px] text-[#b91c1c] font-medium leading-relaxed mb-1.5">{a.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#ef4444] font-bold">{new Date(a.date).toLocaleDateString('pt-BR')}</span>
                {a.cv_data && <span className="text-[9px] font-bold text-[#b91c1c] bg-white/60 px-1.5 py-0.5 rounded uppercase flex items-center gap-1"><Map size={10}/> IA CV</span>}
              </div>
            </div>
          )) : (
            <p className="text-[13px] text-[#8c8078] italic">Nenhum sintoma reportado.</p>
          )}
        </div>,
        false
      ),
      risco: mlRisk ? renderCard(
        'Risco ML',
        <Brain size={14} className="text-[#a3988e]" />,
        <div className="flex flex-col gap-2 bg-[#faf7f4] p-4 rounded-xl border border-[#e5e0dc]">
          <div className="flex justify-between items-center">
            <span className="text-4xl font-bold text-[#3d2b1f] tracking-tight">{(mlRisk.risk_probability * 100).toFixed(0)}%</span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${mlRisk.risk_probability > 0.5 ? 'bg-[#fef2f2] text-[#ef4444]' : 'bg-[#f0fdf4] text-[#16a34a]'}`}>
              {mlRisk.risk_probability > 0.5 ? 'ALTO RISCO' : 'BAIXO RISCO'}
            </span>
          </div>
          <p className="text-[11px] text-[#8c8078] leading-tight mt-1">{mlRisk.risk_factors?.join(', ')}</p>
        </div>,
        false
      ) : null
    };
  };

  const DrawerPanel = () => {
    const [activeFilter, setActiveFilter] = useState('Mostrar Tudo');
    const [filterOpen, setFilterOpen] = useState(false);
    const cards = getCardsData();
    const filters = ['Mostrar Tudo', 'Visão Geral', 'Sinais', 'Preditivo', 'Histórico'];

    const showBlock = (blockName: string) => {
      if (activeFilter === 'Mostrar Tudo') return true;
      if (activeFilter === 'Visão Geral') return ['resumo', 'sintomas', 'risco'].includes(blockName);
      if (activeFilter === 'Sinais') return ['sinais', 'sintomas'].includes(blockName);
      if (activeFilter === 'Preditivo') return ['risco', 'resumo'].includes(blockName);
      if (activeFilter === 'Histórico') return ['protocolo', 'resumo'].includes(blockName);
      return true;
    };

    return (
      <>
        {/* Dark Backdrop */}
        <div className="absolute inset-0 bg-[#3d2b1f]/30 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={() => setContextOpen(false)} />
        
        {/* Large Rounded Drawer */}
        <div className="absolute top-0 right-0 bottom-0 w-[520px] bg-[#faf7f4] shadow-2xl border-l border-[#e5e0dc] rounded-l-[40px] p-8 z-50 animate-in slide-in-from-right-8 duration-500 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <div>
              <h3 className="text-2xl font-bold text-[#3d2b1f] mb-1">Ficha Clínica</h3>
              <p className="text-xs text-[#8c8078]">Informações completas do paciente</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setContextPinned(true); setContextOpen(false); }} 
                className="p-2.5 rounded-full bg-white border border-[#e5e0dc] hover:border-[#FF9A5C] text-[#a3988e] hover:text-[#FF9A5C] shadow-sm transition-all"
                title="Fixar painel ao lado do chat"
              >
                <Pin size={18}/>
              </button>
              <button onClick={() => setContextOpen(false)} className="p-2.5 rounded-full bg-white border border-[#e5e0dc] hover:border-[#FF9A5C] text-[#a3988e] hover:text-[#FF9A5C] shadow-sm transition-all">
                <X size={18}/>
              </button>
            </div>
          </div>

          <div className="relative mb-6 z-20 shrink-0">
            <button 
              onClick={() => setFilterOpen(!filterOpen)} 
              className="flex items-center justify-between w-full bg-white border border-[#e5e0dc] hover:border-[#FF9A5C] transition-colors p-4 rounded-2xl shadow-sm text-[13px] font-bold text-[#3d2b1f]"
            >
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-[#FF9A5C]" />
                {activeFilter}
              </div>
              <ChevronDown size={16} className={`text-[#a3988e] transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white border border-[#e5e0dc] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filters.map(f => (
                  <button key={f} onClick={() => { setActiveFilter(f); setFilterOpen(false); }} className={`w-full text-left px-5 py-3.5 text-[13px] transition-colors border-b border-[#f3ece5] last:border-0 flex items-center justify-between ${activeFilter === f ? 'bg-[#faf7f4] font-bold text-[#FF9A5C]' : 'text-[#5a4a42] hover:bg-[#faf7f4]'}`}>
                    {f}
                    {activeFilter === f && <div className="w-2 h-2 rounded-full bg-[#FF9A5C]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-4">
            {showBlock('resumo') && React.cloneElement(cards.resumo as React.ReactElement, { isPinned: false })}
            {showBlock('protocolo') && React.cloneElement(cards.protocolo as React.ReactElement, { isPinned: false })}
            {showBlock('sinais') && React.cloneElement(cards.sinais as React.ReactElement, { isPinned: false })}
            {showBlock('sintomas') && React.cloneElement(cards.sintomas as React.ReactElement, { isPinned: false })}
            {showBlock('risco') && cards.risco && React.cloneElement(cards.risco as React.ReactElement, { isPinned: false })}
          </div>
        </div>
      </>
    );
  };

  const PinnedSidebar = () => {
    const cards = getCardsData();
    return (
      <aside className="w-[320px] bg-[#faf7f4] border-l border-[#e5e0dc] p-5 shrink-0 overflow-y-auto flex flex-col relative z-20">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <span className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider flex items-center gap-2">
            <Pin size={12} className="fill-[#8c8078]" /> Fixado
          </span>
          <button 
            onClick={() => setContextPinned(false)} 
            className="p-1.5 rounded-lg border border-transparent hover:bg-white hover:border-[#e5e0dc] text-[#a3988e] hover:text-[#3d2b1f] transition-all"
            title="Desafixar painel"
          >
            <X size={14}/>
          </button>
        </div>
        <div className="flex-1 space-y-4">
          {React.cloneElement(cards.resumo as React.ReactElement, { isPinned: true })}
          {cards.risco && React.cloneElement(cards.risco as React.ReactElement, { isPinned: true })}
          {React.cloneElement(cards.sintomas as React.ReactElement, { isPinned: true })}
        </div>
      </aside>
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-white relative">
      <div className="flex-1 flex flex-col relative h-full">
        <div className="pt-8 px-12 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 text-sm">
            <button onClick={onBack} className="text-[#a3988e] hover:text-[#3d2b1f] font-semibold transition-colors">Casos</button>
            <span className="text-[#c9bfb8]">/</span>
            <span className="text-[#3d2b1f] font-bold">{patient.name}</span>
          </div>
          <button 
            onClick={() => setContextOpen(!contextOpen)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm border ${contextOpen ? 'bg-[#403229] text-white border-[#403229] shadow-md' : 'bg-white text-[#5a4a42] border-[#e5e0dc] hover:border-[#FF9A5C] hover:text-[#FF9A5C]'}`}
          >
            <Activity size={16} /> Ficha Clínica
          </button>
        </div>
        {contextOpen && <DrawerPanel />}
        {!session || session.messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto px-12 pb-12 flex flex-col items-center">
            <div className="w-full max-w-3xl mt-16 mb-12 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-2">
                <User size={28} className="text-[#a3988e]" />
                <h1 className="text-4xl font-bold text-[#3d2b1f]">{patient.name}</h1>
              </div>
              <p className="text-[15px] text-[#8c8078] ml-10">{patient.cancer_type} · Estágio {patient.cancer_stage}</p>
            </div>
            <div className="w-full max-w-3xl mb-14">
              <ChatInputBox 
                chatInput={chatInput} 
                setChatInput={setChatInput} 
                handleSend={handleSend} 
                isLoading={isLoading} 
                placeholder="Descreva a tarefa ou pergunta sobre este paciente..." 
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col relative h-full">
            <div className="flex-1 overflow-y-auto px-10 py-6 max-w-3xl mx-auto w-full mt-6">
              {session.messages.map(msg => (msg.role === 'user' ? <UserMessage key={msg.id} msg={msg} /> : <AniMessage key={msg.id} msg={msg} />))}
              {isLoading && (
                <div className="flex gap-4 items-start mb-8">
                  <div className="w-8 h-8 rounded-full bg-[#f0e9e4] flex items-center justify-center"><Loader2 size={16} className="animate-spin text-[#FF9A5C]" /></div>
                  <div className="px-5 py-4 bg-white border border-[#e5e0dc] rounded-2xl rounded-tl-sm text-sm text-[#8c8078]">Pensando...</div>
                </div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>
            <div className="p-6 bg-gradient-to-t from-white via-white to-transparent">
              <div className="max-w-3xl mx-auto w-full">
                <ChatInputBox 
                  chatInput={chatInput} 
                  setChatInput={setChatInput} 
                  handleSend={handleSend} 
                  isLoading={isLoading} 
                  placeholder="Descreva a tarefa ou pergunta sobre este paciente..." 
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {contextPinned && <PinnedSidebar />}
    </div>
  );
}

/* ─── ROOT / SHELL ─── */
export default function ClinicalDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState<'dashboard' | 'patients_tab' | 'global_chat'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  // All sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Sidebar toggles
  const [patientsOpen, setPatientsOpen] = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const patientsRes = await axios.get('/api/v1/doctor/patients');
        setPatients(patientsRes.data);
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
      }
      
      try {
        const sessionsRes = await axios.get('/api/v1/doctor/sessions');
        const realSessions: Session[] = sessionsRes.data.map((s: any) => ({
          ...s,
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(realSessions);
      } catch (err) {
        console.error("Erro ao carregar sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleSelectPatient = async (p: Patient) => {
    setSelectedPatient(p);
    setActiveSessionId(null);
    try { const r = await axios.get(`/api/v1/doctor/patients/${p.id}/dashboard`); setDashboardData(r.data); }
    catch { setDashboardData(null); }
  };

  const startGlobalChat = () => {
    setSelectedPatient(null);
    setActiveSessionId(null);
    setActiveNav('global_chat');
  };

  const selectSession = (id: string, pId?: string) => {
    if (pId) {
      const pat = patients.find(p => p.id === pId);
      if (pat) {
        setSelectedPatient(pat);
        setActiveSessionId(id);
      }
    } else {
      setSelectedPatient(null);
      setActiveSessionId(id);
      setActiveNav('global_chat');
    }
  };

  const handleSendMsg = async (query: string) => {
    let sIdToUse = activeSessionId;
    const pId = selectedPatient?.id;
    
    setSessions(prev => {
      if (!sIdToUse) {
        sIdToUse = Date.now().toString();
        const newSession: Session = { id: sIdToUse, patientId: pId, preview: query.slice(0, 30) + '...', date: 'Agora', messages: [] };
        return [newSession, ...prev];
      }
      return prev;
    });

    if (!activeSessionId && sIdToUse) setActiveSessionId(sIdToUse);
    const finalSId = sIdToUse as string;
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: query, timestamp: new Date() };
    
    setSessions(prev => prev.map(s => s.id === finalSId ? { ...s, messages: [...s.messages, userMsg] } : s));

    try {
      const history = sessions.find(s => s.id === finalSId)?.messages.map(m => ({ role: m.role, content: m.content })) || [];
      const res = await axios.post('/api/v1/doctor/ai-chat', { query, chat_history: history });
      const raw = res.data.response;
      const astMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: raw, timestamp: new Date() };
      setSessions(prev => prev.map(s => s.id === finalSId ? { ...s, messages: [...s.messages, astMsg] } : s));
    } catch {
      const astMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Desculpe, ocorreu um erro de conexão com a IA Clínica.', timestamp: new Date() };
      setSessions(prev => prev.map(s => s.id === finalSId ? { ...s, messages: [...s.messages, astMsg] } : s));
    }
  };

  const globalSessions = sessions.filter(s => !s.patientId);

  return (
    <div className="min-h-screen h-screen bg-[#403229] flex font-sans">
      {/* ── CLAUDE STYLE SIDEBAR ── */}
      <aside className={`bg-[#403229] flex flex-col pt-6 pb-4 transition-all duration-300 shrink-0 ${collapsed ? 'w-[72px] px-2' : 'w-[260px]'} overflow-y-auto overflow-x-hidden border-r border-white/5`}>
        <div className={`flex items-center mb-6 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <Image src="/images/brand/logo-wordmark-white.svg" alt="Anicca" width={90} height={22} className="opacity-90" />}
          <button onClick={() => setCollapsed(v => !v)} className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors shrink-0">
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        {/* TOP TABS */}
        <div className="px-3 space-y-0.5 mb-6">
          <button onClick={startGlobalChat} className={`flex items-center gap-3 w-full rounded-xl transition-all font-bold ${collapsed ? 'justify-center h-10' : 'px-3 py-2 text-[13px]'} text-[#FF9A5C] hover:bg-white/5`}>
            <Plus size={16} />{!collapsed && <span>Nova Sessão</span>}
          </button>
          
          <button onClick={() => { setSelectedPatient(null); setActiveSessionId(null); setActiveNav('dashboard'); }} className={`flex items-center gap-3 w-full rounded-xl transition-all font-medium ${collapsed ? 'justify-center h-10' : 'px-3 py-2 text-[13px]'} ${!selectedPatient && activeNav === 'dashboard' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={16} />{!collapsed && <span>Painel Geral</span>}
          </button>
          
          <button onClick={() => { setSelectedPatient(null); setActiveSessionId(null); setActiveNav('patients_tab'); }} className={`flex items-center gap-3 w-full rounded-xl transition-all font-medium ${collapsed ? 'justify-center h-10' : 'px-3 py-2 text-[13px]'} ${!selectedPatient && activeNav === 'patients_tab' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <Users size={16} />{!collapsed && <span>Pacientes</span>}
          </button>

          <button className={`flex items-center gap-3 w-full rounded-xl transition-all font-medium ${collapsed ? 'justify-center h-10' : 'px-3 py-2 text-[13px]'} text-white/70 hover:bg-white/5 hover:text-white`}>
            <Calendar size={16} />{!collapsed && <span>Agenda</span>}
          </button>
          <button className={`flex items-center gap-3 w-full rounded-xl transition-all font-medium ${collapsed ? 'justify-center h-10' : 'px-3 py-2 text-[13px]'} text-white/70 hover:bg-white/5 hover:text-white`}>
            <Bell size={16} />{!collapsed && <span>Alertas</span>}
          </button>
        </div>

        {/* MEUS CASOS (Active Projects Sidebar Section) */}
        <div className="px-3 mb-6">
          {!collapsed ? (
            <div className="flex items-center justify-between px-3 mb-1 group cursor-pointer" onClick={() => setPatientsOpen(!patientsOpen)}>
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider group-hover:text-white/70 transition-colors">Meus Pacientes</span>
              {patientsOpen ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
            </div>
          ) : (
             <div className="flex justify-center mb-2 text-white/30"><User size={16}/></div>
          )}
          
          {(!collapsed && patientsOpen) && (
            <div className="flex flex-col mt-1">
              {patients.slice(0,5).map(p => {
                const patSessions = sessions.filter(s => s.patientId === p.id);
                const isSelectedPat = selectedPatient?.id === p.id;
                return (
                  <div key={p.id}>
                    <button onClick={() => handleSelectPatient(p)} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors ${isSelectedPat && !activeSessionId ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                      <User size={14} className={isSelectedPat ? 'text-[#FF9A5C]' : 'text-white/40'} />
                      <span className="truncate">{p.name}</span>
                    </button>
                    {isSelectedPat && patSessions.length > 0 && (
                      <div className="ml-[22px] border-l border-white/10 pl-3 mt-1 mb-2 space-y-1">
                        {patSessions.map(s => (
                          <button key={s.id} onClick={() => selectSession(s.id, p.id)} className={`w-full text-left text-[12px] truncate px-2 py-1 rounded-lg transition-colors ${activeSessionId === s.id ? 'bg-white/10 text-white font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                            {s.preview}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RECENTES (Global Chats) */}
        <div className="px-3 flex-1">
          {!collapsed ? (
            <div className="flex items-center justify-between px-3 mb-1 group cursor-pointer" onClick={() => setRecentsOpen(!recentsOpen)}>
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider group-hover:text-white/70 transition-colors">Recentes</span>
              {recentsOpen ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
            </div>
          ) : (
             <div className="flex justify-center mb-2 text-white/30"><MessageSquare size={16}/></div>
          )}
          {(!collapsed && recentsOpen) && (
            <div className="flex flex-col mt-1 space-y-0.5">
              {globalSessions.map(s => (
                <button key={s.id} onClick={() => selectSession(s.id)} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors ${activeSessionId === s.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                  <MessageSquare size={14} className="text-white/40 shrink-0" />
                  <span className="truncate">{s.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN SHELL ── */}
      <div className="flex-1 flex flex-col bg-white rounded-[32px] overflow-hidden shadow-2xl relative my-2 mr-2">
        {selectedPatient ? (
          <PatientWorkspace 
            patient={selectedPatient} 
            dashboardData={dashboardData} 
            session={sessions.find(s => s.id === activeSessionId) || null}
            onBack={() => { setSelectedPatient(null); setActiveSessionId(null); setActiveNav('patients_tab'); }}
            onSendMsg={handleSendMsg}
          />
        ) : activeNav === 'patients_tab' ? (
          <PatientsDirectory patients={patients} onSelect={handleSelectPatient} />
        ) : activeNav === 'global_chat' ? (
          <GlobalChatView 
            session={sessions.find(s => s.id === activeSessionId) || null} 
            onSendMsg={handleSendMsg} 
          />
        ) : (
          <GlobalDashboard patients={patients} onSelect={handleSelectPatient} />
        )}
      </div>
    </div>
  );
}
