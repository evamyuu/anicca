'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, AlertTriangle, UserCircle2, Thermometer, Activity, 
  Scale, FileText, CheckCircle2, Circle, Sparkles, MessageSquare, Plus, Loader2
} from 'lucide-react';

export default function ClinicalDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // AI Chat states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch real patients from FastAPI
  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await axios.get('/api/v1/doctor/patients');
        setPatients(response.data);
        if (response.data.length > 0) {
          setSelectedPatientId(response.data[0].id);
        }
      } catch (error) {
        console.error("Failed to load real patients:", error);
      }
    }
    loadPatients();
  }, []);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Send message to PubMed Clinical AI
  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const query = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);
    setIsAiLoading(true);

    try {
      const response = await axios.post('/api/v1/doctor/ai-chat', {
        query: query,
        chat_history: chatHistory
      });

      setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error("Failed to fetch from Clinical AI", error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Desculpe, ocorreu um erro de conexão com o LangGraph/PubMed." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === "Alto") return { bg: "bg-[#fef2f2]", text: "text-[#ef4444]", border: "border-[#f28b50]" };
    if (risk === "Médio") return { bg: "bg-[#fff7ed]", text: "text-[#ea580c]", border: "border-[#e5e0dc]" };
    return { bg: "bg-[#f3f4f6]", text: "text-[#6b7280]", border: "border-transparent" };
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col font-sans text-[#3d2b1f]">
      {/* 1. HEADER (Top Navigation) */}
      <header className="h-16 bg-white border-b border-[#e5e0dc] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-[#3d2b1f]">anicca</span>
            <span className="w-1.5 h-1.5 bg-[#f28b50] rounded-full"></span>
          </div>
          <div className="h-6 w-[1px] bg-[#e5e0dc] mx-2"></div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-[#8c8078] leading-none mb-0.5">Painel Clínico</span>
            <span className="text-[10px] uppercase tracking-wider text-[#a3988e] leading-none">IA Oncológica Real</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-[#3d2b1f]">Dra. Renata Lima</p>
            <p className="text-[11px] text-[#a3988e]">CACON Recife - CRM-PE 45.892</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-800 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-white font-bold">RL</div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT (3 Columns) */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        
        {/* COLUMN 1: Patients Sidebar */}
        <aside className="w-[300px] bg-[#fbf9f6] border-r border-[#e5e0dc] flex flex-col shrink-0">
          <div className="p-5 border-b border-[#e5e0dc]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-[#3d2b1f]">Meus pacientes</h2>
              <span className="bg-[#fde8d9] text-[#e67e22] text-xs font-bold px-2 py-0.5 rounded-full">{patients.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {patients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              const colors = getRiskColor(p.risk_level);
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`bg-white border-2 rounded-xl p-4 shadow-sm cursor-pointer relative overflow-hidden transition-all ${isSelected ? colors.border : 'border-transparent opacity-80'}`}
                >
                  {isSelected && <div className={`absolute top-0 left-0 w-1 h-full bg-[#f28b50]`}></div>}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f3ece5] flex items-center justify-center text-[#8c8078] font-bold text-sm">
                        {p.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#3d2b1f]">{p.name}</h3>
                        <p className="text-xs text-[#8c8078]">{p.cancer_type} - {p.cancer_stage}</p>
                      </div>
                    </div>
                    <span className={`${colors.bg} ${colors.text} text-[10px] font-bold px-2 py-0.5 rounded-full`}>{p.risk_level}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* COLUMN 2: Main Dashboard (Patient Details) */}
        <main className="flex-1 bg-[#efe9e4] overflow-y-auto p-6 relative">
          {selectedPatient ? (
            <>
              {/* Header Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#f3ece5] flex items-center justify-center text-[#3d2b1f] font-bold text-xl">{selectedPatient.name.substring(0,2).toUpperCase()}</div>
                  <div>
                    <h1 className="text-xl font-bold text-[#3d2b1f]">{selectedPatient.name}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#8c8078]">Risco Clínico:</span>
                  <span className={`bg-[#fef2f2] text-[#ef4444] border border-[#fecaca] text-sm font-bold px-4 py-1.5 rounded-full shadow-sm`}>{selectedPatient.risk_level}</span>
                </div>
              </div>

              {/* Diagnosis & Protocol */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e0dc]">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#f28b50] font-bold mb-2">Diagnóstico Oncológico</h4>
                  <p className="text-base font-bold text-[#3d2b1f] mb-2">{selectedPatient.cancer_type} ({selectedPatient.cancer_stage})</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e0dc]">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#f28b50] font-bold mb-2">Protocolo Ativo</h4>
                  <p className="text-base font-bold text-[#3d2b1f] mb-2">{selectedPatient.protocol}</p>
                </div>
              </div>

              {/* Briefing */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e0dc] mb-6">
                <h4 className="text-[11px] uppercase tracking-widest text-[#a3988e] font-bold mb-4">Breve Resumo e Conduta do Caso</h4>
                <div className="bg-[#fbf9f6] p-4 rounded-xl border border-[#e5e0dc]/50 text-sm text-[#5a4a42] leading-relaxed">
                  Os dados ao vivo da rotina de {selectedPatient.name} serão sincronizados aqui pelo backend!
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[#8c8078]">
              Nenhum paciente selecionado.
            </div>
          )}
        </main>

        {/* COLUMN 3: Clinical AI Sidebar with REAL PubMed Integration */}
        <aside className="w-[360px] bg-[#fbf9f6] border-l border-[#e5e0dc] flex flex-col shrink-0 relative">
          <div className="bg-[#4a3931] text-white p-5 shadow-lg z-10 m-0">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h3 className="text-sm font-bold">Ani &bull; Inteligência Clínica Real</h3>
                <p className="text-[10px] text-[#bdae9f]">LangGraph Agent (PubMed API Connected)</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#f28b50] text-white rounded-tr-none' : 'bg-[#efe9e4] text-[#3d2b1f] rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-[#efe9e4] text-[#3d2b1f] p-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#f28b50]" />
                  Pesquisando artigos na PubMed...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#fbf9f6] border-t border-[#e5e0dc]">
            <form onSubmit={handleSendAiMessage} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ex: Conduta neutropenia em uso de FOLFOX..." 
                className="w-full bg-white border border-[#e5e0dc] text-sm rounded-xl py-3 pl-4 pr-12 text-[#3d2b1f] focus:outline-none focus:border-[#f28b50]"
                disabled={isAiLoading}
              />
              <button 
                type="submit"
                disabled={isAiLoading || !chatInput.trim()}
                className="absolute right-2 top-2 bottom-2 w-8 bg-[#f28b50] rounded-lg flex items-center justify-center hover:bg-[#e67e22] transition-colors disabled:opacity-50"
              >
                <Search size={14} className="text-white" />
              </button>
            </form>
          </div>
        </aside>

      </div>
    </div>
  );
}
