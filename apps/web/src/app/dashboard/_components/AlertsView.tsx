'use client';

import React, { useState } from 'react';
import { Bell, ChevronRight, Check, RotateCcw, Search as SearchIcon, Sparkles, Map as MapIcon, Activity } from 'lucide-react';

import { SEVERITY_CFG, initials, timeAgo, type AlertSeverity, type AlertStatus, type ClinicalAlert } from './types';

type StatusFilter = 'abertos' | 'resolvidos' | 'todos';

const CATEGORY_LABEL: Record<ClinicalAlert['category'], string> = {
  sintoma: 'Sintoma',
  sinal_vital: 'Sinal vital',
  adesao: 'Adesão',
  emocional: 'Emocional',
  exame: 'Exame',
  abandono: 'Risco de abandono',
};

interface AlertsViewProps {
  alerts: ClinicalAlert[];
  onSelectPatient: (patientId: string) => void;
  onUpdate: (id: string, patch: { status?: AlertStatus; note?: string }) => Promise<void>;
}

export function AlertsView({ alerts, onSelectPatient, onUpdate }: AlertsViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('abertos');
  const [severity, setSeverity] = useState<AlertSeverity | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  const open = alerts.filter(a => a.status !== 'resolvido');
  const visible = alerts.filter(a => {
    const statusOk = statusFilter === 'todos' ? true : statusFilter === 'abertos' ? a.status !== 'resolvido' : a.status === 'resolvido';
    return statusOk && (!severity || a.severity === severity);
  });

  const resolve = async (a: ClinicalAlert) => {
    await onUpdate(a.id, { status: 'resolvido', note: note.trim() });
    setResolvingId(null);
    setNote('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfaf8] overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-[#e5e0dc] bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#3d2b1f] mb-1">Alertas</h2>
          <p className="text-sm text-[#8c8078]">Triagem em tempo real do que os pacientes relatam no WhatsApp, no app, pelo cuidador e pelo smartwatch.</p>
        </div>
        <div className="flex shrink-0 whitespace-nowrap items-center gap-2 text-xs text-[#16a34a] font-bold bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" /> Ao vivo
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Severity summary (also filters) */}
          <div className="grid grid-cols-4 gap-3">
            {(Object.keys(SEVERITY_CFG) as AlertSeverity[]).map(s => {
              const n = open.filter(a => a.severity === s).length;
              const active = severity === s;
              return (
                <button
                  key={s}
                  onClick={() => setSeverity(active ? null : s)}
                  className={`text-left bg-white border rounded-3xl p-4 shadow-sm transition-colors ${active ? 'border-[#3d2b1f]' : 'border-[#e5e0dc] hover:border-[#FF9A5C]'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${SEVERITY_CFG[s].bar}`} />
                    <span className="text-[11px] font-bold text-[#8c8078] uppercase tracking-wider">{SEVERITY_CFG[s].label}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#3d2b1f]">{n}</p>
                  <p className="text-[10px] text-[#a3988e]">em aberto</p>
                </button>
              );
            })}
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            {([
              ['abertos', `Abertos (${open.length})`],
              ['resolvidos', `Resolvidos (${alerts.length - open.length})`],
              ['todos', 'Todos'],
            ] as [StatusFilter, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setStatusFilter(id)}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition-colors ${statusFilter === id ? 'bg-[#3d2b1f] text-white border-[#3d2b1f]' : 'bg-white text-[#5a4a42] border-[#e5e0dc] hover:border-[#FF9A5C]'}`}
              >
                {label}
              </button>
            ))}
            {severity && (
              <button onClick={() => setSeverity(null)} className="text-xs font-bold px-3 py-2 text-[#FF9A5C]">Limpar filtro de gravidade</button>
            )}
          </div>

          {visible.length === 0 && (
            <div className="bg-white border border-[#e5e0dc] rounded-[24px] p-10 text-center">
              <Bell size={28} className="mx-auto text-[#c9bfb8] mb-3" />
              <p className="text-sm font-bold text-[#3d2b1f]">Nenhum alerta aqui</p>
              <p className="text-xs text-[#8c8078] mt-1">Quando um paciente relatar algo pelo WhatsApp ou pelo app, o alerta aparece na hora.</p>
            </div>
          )}

          {visible.map(a => {
            const cfg = SEVERITY_CFG[a.severity];
            const isNew = a.status === 'novo' && Date.now() - new Date(a.created_at).getTime() < 15 * 60_000;
            return (
              <div key={a.id} className={`bg-white border border-[#e5e0dc] rounded-[24px] shadow-sm overflow-hidden flex ${a.status === 'resolvido' ? 'opacity-70' : ''}`}>
                <div className={`w-1.5 shrink-0 ${cfg.bar}`} />
                <div className="flex-1 p-5 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#faf7f4] text-[#8c8078] border border-[#e5e0dc]">{CATEGORY_LABEL[a.category]}</span>
                        {isNew && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF9A5C] text-white animate-pulse">NOVO</span>}
                        {a.status === 'em_analise' && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">Em análise</span>}
                        {a.status === 'resolvido' && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">Resolvido</span>}
                      </div>
                      <p className="text-sm font-bold text-[#3d2b1f]">{a.title}</p>
                      <p className="text-xs text-[#5a4a42] leading-relaxed">{a.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-bold text-[#8c8078]">{timeAgo(a.created_at)}</p>
                      <p className="text-[10px] text-[#a3988e]">via {a.source}</p>
                    </div>
                  </div>

                  {(a.photo_url || a.clinical_note) && (
                    <div className="mt-3 bg-[#faf7f4] border border-[#f3ece5] rounded-2xl p-3 flex gap-3">
                      {a.photo_url && (
                        <a href={a.photo_url} target="_blank" rel="noreferrer" className="shrink-0">
                          <img src={a.photo_url} alt="Foto enviada pela paciente" className="w-20 h-20 object-cover rounded-xl border border-[#e5e0dc]" />
                        </a>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-[#6d28d9] bg-white px-1.5 py-0.5 rounded uppercase inline-flex items-center gap-1 mb-1">
                          <MapIcon size={10} /> Visão computacional
                        </span>
                        {a.clinical_note && (
                          <>
                            <p className={`text-[11px] text-[#5a4a42] leading-snug whitespace-pre-line ${openNotes[a.id] ? '' : 'line-clamp-2'}`}>{a.clinical_note}</p>
                            <button onClick={() => setOpenNotes(prev => ({ ...prev, [a.id]: !prev[a.id] }))} className="text-[10px] font-bold text-[#FF9A5C] mt-1">
                              {openNotes[a.id] ? 'Ocultar nota clínica' : 'Ver nota clínica completa'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {a.note && a.status === 'resolvido' && (
                    <p className="mt-3 text-xs text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3 py-2 flex gap-2">
                      <Check size={12} className="shrink-0 mt-0.5" /> Conduta: {a.note}
                    </p>
                  )}

                  {resolvingId === a.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Conduta (opcional) — ex.: orientada a ir ao PS, ligar amanhã"
                        className="flex-1 bg-[#faf7f4] border border-[#e5e0dc] rounded-xl px-3 py-2 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#FF9A5C]"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && resolve(a)}
                      />
                      <button onClick={() => resolve(a)} className="text-xs font-bold bg-[#16a34a] text-white px-4 py-2 rounded-xl">Resolver</button>
                      <button onClick={() => setResolvingId(null)} className="text-xs font-bold text-[#8c8078] px-2">Cancelar</button>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button onClick={() => onSelectPatient(a.patient_id)} className="flex items-center gap-2 group">
                      <span className="w-7 h-7 rounded-full bg-[#faf7f4] border border-[#e5e0dc] flex items-center justify-center text-[10px] font-bold text-[#5a4a42] group-hover:border-[#FF9A5C]">{initials(a.patient_name)}</span>
                      <span className="text-[13px] font-medium text-[#5a4a42] group-hover:text-[#FF9A5C]">{a.patient_name}</span>
                      <span className="text-[11px] font-bold text-[#FF9A5C] flex items-center">Abrir prontuário <ChevronRight size={12} /></span>
                    </button>
                    <div className="flex gap-2">
                      {a.status === 'novo' && (
                        <button onClick={() => onUpdate(a.id, { status: 'em_analise' })} className="flex items-center gap-1.5 text-[11px] font-bold border border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#eff6ff] px-3 py-1.5 rounded-xl">
                          <SearchIcon size={12} /> Em análise
                        </button>
                      )}
                      {a.status !== 'resolvido' ? (
                        <button onClick={() => { setResolvingId(a.id); setNote(''); }} className="flex items-center gap-1.5 text-[11px] font-bold border border-[#bbf7d0] text-[#16a34a] hover:bg-[#f0fdf4] px-3 py-1.5 rounded-xl">
                          <Check size={12} /> Resolver
                        </button>
                      ) : (
                        <button onClick={() => onUpdate(a.id, { status: 'novo', note: '' })} className="flex items-center gap-1.5 text-[11px] font-bold border border-[#e5e0dc] text-[#5a4a42] hover:bg-[#faf7f4] px-3 py-1.5 rounded-xl">
                          <RotateCcw size={12} /> Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {visible.length > 0 && (
            <p className="text-[11px] text-[#a3988e] flex items-center gap-1.5 justify-center pt-2">
              <Sparkles size={12} className="text-[#FF9A5C]" /> Ordenado por gravidade e horário • <Activity size={12} /> atualiza sozinho quando chega um relato novo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
