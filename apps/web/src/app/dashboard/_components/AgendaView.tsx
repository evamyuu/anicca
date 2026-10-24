'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Plus, ChevronRight, X, Check, RotateCcw, Trash2, CalendarClock, MessageSquare, Sparkles } from 'lucide-react';

import {
  STATUS_CFG,
  TYPE_CFG,
  hhmm,
  initials,
  sameDay,
  type Appointment,
  type AppointmentInput,
  type AppointmentStatus,
  type AppointmentType,
  type PatientOption,
} from './types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface AgendaViewProps {
  appointments: Appointment[];
  patients: PatientOption[];
  onSelectPatient: (patientId: string) => void;
  onCreate: (input: AppointmentInput) => Promise<void>;
  onUpdate: (id: string, patch: Partial<Appointment>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AgendaView({ appointments, patients, onSelectPatient, onCreate, onUpdate, onDelete }: AgendaViewProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * 86_400_000)), [today]);

  const [selected, setSelected] = useState<number | 'proximos'>(0);
  const [formOpen, setFormOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState('');

  const visible = appointments
    .filter(a => {
      const start = new Date(a.start);
      if (selected === 'proximos') return start >= today;
      return sameDay(start, days[selected]!);
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  const countFor = (day: Date) => appointments.filter(a => sameDay(new Date(a.start), day) && a.status !== 'cancelado').length;
  const todayItems = appointments.filter(a => sameDay(new Date(a.start), today));
  const confirmedToday = todayItems.filter(a => a.status === 'confirmado' || a.status === 'realizado').length;

  const setStatus = (a: Appointment, status: AppointmentStatus) => onUpdate(a.id, { status });

  const handleDelete = async (a: Appointment) => {
    if (window.confirm(`Excluir "${a.title}" de ${a.patient_name}?`)) await onDelete(a.id);
  };

  const saveReschedule = async (a: Appointment) => {
    if (!rescheduleValue) return;
    await onUpdate(a.id, { start: new Date(rescheduleValue).toISOString(), status: 'agendado' });
    setRescheduleId(null);
  };

  const dayLabel = (d: Date, i: number) => (i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : WEEKDAYS[d.getDay()]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfaf8] overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-[#e5e0dc] bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#3d2b1f] mb-1">Agenda</h2>
          <p className="text-sm text-[#8c8078]">
            Consultas, infusões e exames da equipe • hoje: {todayItems.length} atendimentos, {confirmedToday} confirmados
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-[#FF9A5C] hover:bg-[#f08a4a] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors"
        >
          <Plus size={16} /> Novo agendamento
        </button>
      </div>

      {/* Day strip */}
      <div className="px-8 pt-6 shrink-0">
        <div className="flex gap-2 max-w-5xl mx-auto overflow-x-auto pb-1">
          {days.map((d, i) => {
            const active = selected === i;
            const n = countFor(d);
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`min-w-[92px] rounded-2xl border px-4 py-3 text-left transition-colors ${active ? 'bg-[#3d2b1f] border-[#3d2b1f] text-white' : 'bg-white border-[#e5e0dc] text-[#3d2b1f] hover:border-[#FF9A5C]'}`}
              >
                <p className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'text-white/70' : 'text-[#a3988e]'}`}>{dayLabel(d, i)}</p>
                <p className="text-lg font-bold">{String(d.getDate()).padStart(2, '0')}</p>
                <p className={`text-[11px] ${active ? 'text-[#FF9A5C]' : 'text-[#8c8078]'}`}>{n} {n === 1 ? 'horário' : 'horários'}</p>
              </button>
            );
          })}
          <button
            onClick={() => setSelected('proximos')}
            className={`min-w-[120px] rounded-2xl border px-4 py-3 text-left transition-colors ${selected === 'proximos' ? 'bg-[#3d2b1f] border-[#3d2b1f] text-white' : 'bg-white border-[#e5e0dc] text-[#3d2b1f] hover:border-[#FF9A5C]'}`}
          >
            <p className={`text-[11px] font-bold uppercase tracking-wider ${selected === 'proximos' ? 'text-white/70' : 'text-[#a3988e]'}`}>Lista</p>
            <p className="text-lg font-bold">Próximos</p>
            <p className={`text-[11px] ${selected === 'proximos' ? 'text-[#FF9A5C]' : 'text-[#8c8078]'}`}>todos os futuros</p>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          {visible.length === 0 && (
            <div className="bg-white border border-[#e5e0dc] rounded-[24px] p-10 text-center">
              <Calendar size={28} className="mx-auto text-[#c9bfb8] mb-3" />
              <p className="text-sm font-bold text-[#3d2b1f]">Nenhum horário neste dia</p>
              <p className="text-xs text-[#8c8078] mt-1">Use “Novo agendamento” para marcar uma consulta, infusão ou exame.</p>
            </div>
          )}

          {visible.map(a => {
            const type = TYPE_CFG[a.type];
            const status = STATUS_CFG[a.status];
            const final = a.status === 'realizado' || a.status === 'cancelado' || a.status === 'falta';
            const end = new Date(new Date(a.start).getTime() + a.duration_min * 60000).toISOString();
            return (
              <div key={a.id} className={`bg-white border border-[#e5e0dc] rounded-[24px] p-5 shadow-sm flex gap-5 ${a.status === 'cancelado' ? 'opacity-60' : ''}`}>
                <div className="w-20 shrink-0 text-center border-r border-[#f3ece5] pr-4">
                  {selected === 'proximos' && (
                    <p className="text-[10px] font-bold text-[#FF9A5C] uppercase">
                      {new Date(a.start).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </p>
                  )}
                  <p className="text-lg font-bold text-[#3d2b1f]">{hhmm(a.start)}</p>
                  <p className="text-[11px] text-[#a3988e] flex items-center justify-center gap-1"><Clock size={10} /> até {hhmm(end)}</p>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${type.badge}`}>{type.label}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.badge}`}>{status.label}</span>
                    {a.confirmed_via && a.status === 'confirmado' && (
                      <span className="text-[10px] text-[#16a34a] flex items-center gap-1"><MessageSquare size={10} /> confirmado pela paciente via {a.confirmed_via}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#3d2b1f]">{a.title}</p>
                  <button onClick={() => onSelectPatient(a.patient_id)} className="flex items-center gap-2 group">
                    <span className="w-7 h-7 rounded-full bg-[#faf7f4] border border-[#e5e0dc] flex items-center justify-center text-[10px] font-bold text-[#5a4a42] group-hover:border-[#FF9A5C]">{initials(a.patient_name)}</span>
                    <span className="text-[13px] font-medium text-[#5a4a42] group-hover:text-[#FF9A5C]">{a.patient_name}</span>
                    <ChevronRight size={12} className="text-[#c9bfb8] group-hover:text-[#FF9A5C]" />
                  </button>
                  <p className="text-[11px] text-[#8c8078] flex items-center gap-1"><MapPin size={11} /> {a.location}</p>
                  {a.notes && (
                    <p className="text-xs text-[#5a4a42] bg-[#faf7f4] border border-[#f3ece5] rounded-xl px-3 py-2 flex gap-2">
                      <Sparkles size={12} className="text-[#FF9A5C] shrink-0 mt-0.5" /> {a.notes}
                    </p>
                  )}

                  {rescheduleId === a.id && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="datetime-local"
                        value={rescheduleValue}
                        onChange={e => setRescheduleValue(e.target.value)}
                        className="bg-[#faf7f4] border border-[#e5e0dc] rounded-xl px-3 py-2 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#FF9A5C]"
                      />
                      <button onClick={() => saveReschedule(a)} className="text-xs font-bold bg-[#3d2b1f] text-white px-3 py-2 rounded-xl">Salvar</button>
                      <button onClick={() => setRescheduleId(null)} className="text-xs font-bold text-[#8c8078] px-2 py-2">Cancelar</button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 shrink-0 w-36">
                  {!final ? (
                    <>
                      {a.status === 'agendado' && (
                        <button onClick={() => setStatus(a, 'confirmado')} className="agenda-btn text-[#16a34a] border-[#bbf7d0] hover:bg-[#f0fdf4]"><Check size={12} /> Confirmar</button>
                      )}
                      <button onClick={() => setStatus(a, 'realizado')} className="agenda-btn text-[#1d4ed8] border-[#bfdbfe] hover:bg-[#eff6ff]"><Check size={12} /> Realizado</button>
                      <button onClick={() => setStatus(a, 'falta')} className="agenda-btn text-[#b91c1c] border-[#fecaca] hover:bg-[#fef2f2]"><X size={12} /> Faltou</button>
                      <button
                        onClick={() => { setRescheduleId(a.id); setRescheduleValue(toLocalInput(a.start)); }}
                        className="agenda-btn text-[#5a4a42] border-[#e5e0dc] hover:bg-[#faf7f4]"
                      >
                        <CalendarClock size={12} /> Remarcar
                      </button>
                      <button onClick={() => setStatus(a, 'cancelado')} className="agenda-btn text-[#78716c] border-[#e7e5e4] hover:bg-[#f5f5f4]"><X size={12} /> Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => setStatus(a, 'agendado')} className="agenda-btn text-[#5a4a42] border-[#e5e0dc] hover:bg-[#faf7f4]"><RotateCcw size={12} /> Reabrir</button>
                  )}
                  <button onClick={() => handleDelete(a)} className="agenda-btn text-[#b91c1c] border-transparent hover:bg-[#fef2f2]"><Trash2 size={12} /> Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {formOpen && (
        <NewAppointmentDrawer
          patients={patients}
          defaultDay={selected === 'proximos' ? today : days[selected]!}
          onClose={() => setFormOpen(false)}
          onSave={async input => {
            await onCreate(input);
            setFormOpen(false);
          }}
        />
      )}

      <style>{`.agenda-btn{display:flex;align-items:center;justify-content:center;gap:6px;border-width:1px;border-radius:12px;padding:6px 10px;font-size:11px;font-weight:700;transition:background-color .15s}`}</style>
    </div>
  );
}

function NewAppointmentDrawer({
  patients,
  defaultDay,
  onClose,
  onSave,
}: {
  patients: PatientOption[];
  defaultDay: Date;
  onClose: () => void;
  onSave: (input: AppointmentInput) => Promise<void>;
}) {
  const start = new Date(defaultDay);
  start.setHours(16, 0, 0, 0);
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [type, setType] = useState<AppointmentType>('consulta');
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState(toLocalInput(start.toISOString()));
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState('Consultório 4');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const field = 'w-full bg-[#faf7f4] border border-[#e5e0dc] rounded-xl px-3 py-2.5 text-sm text-[#3d2b1f] focus:outline-none focus:border-[#FF9A5C]';
  const label = 'text-[11px] font-bold text-[#8c8078] uppercase tracking-wider mb-1.5 block';

  const submit = async () => {
    if (!patientId || !when) return;
    setSaving(true);
    try {
      await onSave({
        patient_id: patientId,
        type,
        title: title.trim() || TYPE_CFG[type].label,
        start: new Date(when).toISOString(),
        duration_min: duration,
        location,
        notes: notes.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-[#3d2b1f]/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-[460px] bg-[#faf7f4] shadow-2xl border-l border-[#e5e0dc] rounded-l-[40px] p-8 z-50 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#3d2b1f] mb-1">Novo agendamento</h3>
            <p className="text-xs text-[#8c8078]">A Ani envia a confirmação para a paciente pelo WhatsApp</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white border border-[#e5e0dc] hover:border-[#FF9A5C] text-[#a3988e] hover:text-[#FF9A5C]"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <span className={label}>Paciente</span>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} className={field}>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Tipo</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_CFG) as AppointmentType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${type === t ? 'bg-[#3d2b1f] text-white border-[#3d2b1f]' : 'bg-white text-[#5a4a42] border-[#e5e0dc] hover:border-[#FF9A5C]'}`}
                >
                  {TYPE_CFG[t].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={label}>Título</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={`Ex: ${TYPE_CFG[type].label} — revisão de exames`} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Data e hora</span>
              <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} className={field} />
            </div>
            <div>
              <span className={label}>Duração</span>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} className={field}>
                {[15, 30, 45, 60, 120, 180].map(m => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} h`}</option>)}
              </select>
            </div>
          </div>
          <div>
            <span className={label}>Local</span>
            <input value={location} onChange={e => setLocation(e.target.value)} className={field} />
          </div>
          <div>
            <span className={label}>Observações</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Preparos, exames para trazer, orientações..." className={field} />
          </div>
          <button
            onClick={submit}
            disabled={saving || !patientId}
            className="w-full flex items-center justify-center gap-2 bg-[#FF9A5C] hover:bg-[#f08a4a] disabled:opacity-60 text-white py-3 rounded-2xl text-sm font-bold shadow-sm transition-colors"
          >
            <Calendar size={16} /> {saving ? 'Salvando...' : 'Agendar'}
          </button>
        </div>
      </div>
    </>
  );
}
