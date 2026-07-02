import React from 'react';
import Link from 'next/link';
import { ArrowRight, Apple, Play, BrainCircuit, Activity, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function AniccaLandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#3d2b1f] overflow-x-hidden">
      
      {/* 1. HEADER */}
      <header className="w-full h-20 px-6 md:px-12 flex items-center justify-between fixed top-0 bg-white/90 backdrop-blur-md z-50 border-b border-[#e5e0dc]">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-[#4a3931]">anicca</span>
          <span className="w-2 h-2 bg-[#f28b50] rounded-full"></span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-sm font-semibold text-[#8c8078] hover:text-[#f28b50] transition-colors uppercase tracking-wider">
            Já tenho uma conta
          </Link>
          <Link href="/login" className="bg-[#4a3931] text-white text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#3d2b1f] transition-all shadow-sm">
            Entrar
          </Link>
        </nav>
      </header>

      <div className="mt-20">
        
        {/* 2. HERO SECTION (Duolingo Header Equivalent) */}
        <section className="flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto w-full px-6 py-16 md:py-28 gap-12">
          {/* Illustration Box */}
          <div className="flex-1 flex justify-center w-full max-w-[400px] md:max-w-none">
            <div className="w-full aspect-square bg-[#efe9e4] rounded-[50px] flex items-center justify-center p-8 relative overflow-hidden">
                {/* SVG/Placeholder - Figma 1/2 */}
                <div className="text-[140px] z-10 hover:scale-105 transition-transform duration-500">⛵🐱</div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#f28b50]/10 rounded-full blur-3xl"></div>
                <div className="absolute top-10 -left-10 w-40 h-40 bg-[#4a3931]/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4a3931] leading-[1.1] tracking-tight mb-8">
              A forma inteligente, humana e eficaz de navegar pelo tratamento oncológico.
            </h1>
            
            <Link 
              href="/login" 
              className="w-full md:w-auto bg-[#f28b50] text-white font-bold uppercase tracking-wider text-[15px] py-4 px-10 rounded-full flex items-center justify-center gap-3 shadow-lg hover:bg-[#e67e22] hover:-translate-y-1 transition-all"
            >
              Acessar Minha Jornada
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* 3. LANGUAGES/ONCOLOGY TYPES STRIP (Duolingo Language bar equivalent) */}
        <div className="w-full border-y border-[#e5e0dc] bg-[#fbf9f6] py-6 flex overflow-x-auto gap-8 px-6 md:justify-center items-center scrollbar-hide">
          <span className="font-bold text-[#8c8078] whitespace-nowrap uppercase tracking-widest text-xs">Apoio para</span>
          <div className="w-1.5 h-1.5 bg-[#e5e0dc] rounded-full hidden md:block"></div>
          {['Mama', 'Próstata', 'Cólon', 'Pulmão', 'Leucemia', 'Gástrico', 'Pediátrico'].map(cancer => (
            <span key={cancer} className="font-bold text-[#3d2b1f] whitespace-nowrap hover:text-[#f28b50] cursor-pointer transition-colors">
              Câncer de {cancer}
            </span>
          ))}
        </div>

        {/* 4. VALUE PROPOSITION: HUMAN, EFFECTIVE, SCIENTIFIC (Duolingo "grátis, divertido" eq) */}
        <section className="py-24 px-6 bg-white border-b border-[#e5e0dc]">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#4a3931] mb-6">humano. inteligente. prático.</h2>
            <p className="text-lg text-[#8c8078] leading-relaxed">
              O Anicca não é apenas um app, é o seu companheiro digital durante o tratamento. 
              Pesquisas clínicas mostram que pacientes que monitoram ativamente seus sintomas 
              aumentam sua qualidade de vida e têm melhores desfechos no tratamento oncológico.
            </p>
          </div>

          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 md:gap-8 items-center mt-20">
             {/* Left - Image */}
             <div className="flex-1 w-full bg-[#fbf9f6] rounded-[40px] aspect-square flex items-center justify-center">
                 <div className="text-[100px]">🧠</div>
             </div>
             {/* Right - Text */}
             <div className="flex-1 md:pr-12 text-center md:text-left">
                <h3 className="text-3xl font-bold text-[#f28b50] mb-4">Baseado na ciência.</h3>
                <p className="text-[#8c8078] text-lg leading-relaxed">
                  Combinamos inteligência artificial de ponta (RAG LangGraph) conectada à PubMed 
                  com os padrões mundiais do NCI (CTCAE v5.0) para traduzir laudos e sintomas de forma 
                  extremamente técnica para o médico, mas dócil e amigável para você.
                </p>
             </div>
          </div>
        </section>

        {/* 5. KEEP MOTIVATION / TAILORED (Duolingo "mantenha motivação") */}
        <section className="py-24 px-6 bg-[#fbf9f6] border-b border-[#e5e0dc]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse gap-12 md:gap-8 items-center">
             {/* Right - Image */}
             <div className="flex-1 w-full bg-[#efe9e4] rounded-[40px] aspect-[4/3] flex items-center justify-center relative overflow-hidden">
                 <div className="text-[100px] z-10">📱💬</div>
                 <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(242,139,80,0.1)_0,transparent_50%)]"></div>
             </div>
             {/* Left - Text */}
             <div className="flex-1 md:pl-12 text-center md:text-left">
                <h3 className="text-3xl font-bold text-[#4a3931] mb-4">Sempre com você, no WhatsApp.</h3>
                <p className="text-[#8c8078] text-lg leading-relaxed mb-6">
                  Fica fácil criar o hábito de cuidar da saúde quando o app não é um peso. 
                  Você não precisa nem abrir o Anicca: basta mandar um áudio ou a foto de um exame de sangue 
                  no WhatsApp e nossa IA cuida do resto, te acompanhando na sua rotina.
                </p>
             </div>
          </div>
        </section>

        {/* 6. APPS DOWNLOAD (Duolingo "baixe na app store") */}
        <section className="py-24 px-6 bg-white border-b border-[#e5e0dc] text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4a3931] mb-12">Acompanhe onde e quando quiser.</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
             <button className="w-[220px] h-[70px] bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-transform">
               <Apple size={36} />
               <div className="flex flex-col items-start">
                 <span className="text-[10px] uppercase tracking-widest text-[#a3988e]">Baixe na</span>
                 <span className="text-xl font-semibold -mt-1">App Store</span>
               </div>
             </button>
             <button className="w-[220px] h-[70px] bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-transform">
               <Play size={32} />
               <div className="flex flex-col items-start">
                 <span className="text-[10px] uppercase tracking-widest text-[#a3988e]">Disponível no</span>
                 <span className="text-xl font-semibold -mt-1">Google Play</span>
               </div>
             </button>
          </div>
        </section>

        {/* 7. DOCTORS & CLINICS (Duolingo for Schools equivalent) */}
        <section className="py-24 px-6 bg-[#4a3931] text-white">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 w-full flex justify-center">
               <div className="w-48 h-48 rounded-full border-8 border-white/10 flex items-center justify-center text-white/50">
                  <ShieldCheck size={80} />
               </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[#f28b50] font-bold uppercase tracking-widest text-sm mb-4 block">anicca for clinics</span>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Para Clínicas e Doutores</h3>
              <p className="text-[#bdae9f] text-lg leading-relaxed mb-8">
                Oncologistas e enfermeiros navegadores, estamos aqui para ajudar. 
                Nosso painel clínico gratuito apoia sua equipe na triagem de intercorrências graves, 
                gerando alertas preditivos de neutropenia ou hospitalização, antes mesmo que aconteçam.
              </p>
              <Link href="/login" className="inline-block bg-white text-[#4a3931] font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-[#efe9e4] transition-colors">
                Saiba como funciona
              </Link>
            </div>
          </div>
        </section>

        {/* 8. FAMILY & CAREGIVERS (Duolingo ABC equivalent) */}
        <section className="py-24 px-6 bg-[#efe9e4]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="flex-1 w-full flex justify-center">
               <div className="w-48 h-48 rounded-full border-8 border-[#3d2b1f]/10 flex items-center justify-center text-[#4a3931]">
                  <HeartHandshake size={80} />
               </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[#8c8078] font-bold uppercase tracking-widest text-sm mb-4 block">anicca family</span>
              <h3 className="text-3xl md:text-4xl font-bold text-[#4a3931] mb-6">Cuidando de quem cuida</h3>
              <p className="text-[#5a4a42] text-lg leading-relaxed mb-8">
                O câncer não afeta só o paciente. Familiares e cuidadores podem ter acesso compartilhado 
                à jornada do paciente, organizar horários de medicamentos, consultar laudos traduzidos e ter um canal de desabafo seguro.
              </p>
              <Link href="/login" className="inline-block border-2 border-[#4a3931] text-[#4a3931] font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-[#4a3931] hover:text-white transition-colors">
                Explore a rede de apoio
              </Link>
            </div>
          </div>
        </section>

        {/* 9. PRE-FOOTER CTA */}
        <section className="py-32 px-6 bg-white text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-[#4a3931] mb-12">sua jornada. seu ritmo.</h2>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 bg-[#f28b50] text-white font-bold uppercase tracking-wider text-[15px] py-5 px-12 rounded-full shadow-xl hover:bg-[#e67e22] hover:-translate-y-1 transition-all"
          >
            Comece agora
          </Link>
        </section>

        {/* 10. MEGA FOOTER (Duolingo Style Footer) */}
        <footer className="bg-[#fbf9f6] pt-20 pb-10 border-t-2 border-[#e5e0dc]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            
            {/* Col 1 */}
            <div className="col-span-2 md:col-span-1">
               <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-2xl font-bold tracking-tight text-[#4a3931]">anicca</span>
                 <span className="w-1.5 h-1.5 bg-[#f28b50] rounded-full"></span>
               </div>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-3 text-sm text-[#8c8078] font-semibold">
              <h4 className="text-[#a3988e] uppercase tracking-widest text-[11px] font-bold mb-2">Quem somos</h4>
              <a href="#" className="hover:text-[#4a3931]">Nossa Missão</a>
              <a href="#" className="hover:text-[#4a3931]">Metodologia Clínica</a>
              <a href="#" className="hover:text-[#4a3931]">Eficácia Comprovada</a>
              <a href="#" className="hover:text-[#4a3931]">Cultura Anicca</a>
              <a href="#" className="hover:text-[#4a3931]">Pesquisas Científicas</a>
              <a href="#" className="hover:text-[#4a3931]">Contato</a>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col gap-3 text-sm text-[#8c8078] font-semibold">
              <h4 className="text-[#a3988e] uppercase tracking-widest text-[11px] font-bold mb-2">Produtos</h4>
              <a href="#" className="hover:text-[#4a3931]">Anicca para Pacientes</a>
              <a href="#" className="hover:text-[#4a3931]">Anicca for Clinics</a>
              <a href="#" className="hover:text-[#4a3931]">Anicca Family</a>
              <a href="#" className="hover:text-[#4a3931]">API LangGraph Médica</a>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col gap-3 text-sm text-[#8c8078] font-semibold">
              <h4 className="text-[#a3988e] uppercase tracking-widest text-[11px] font-bold mb-2">Ajuda e Suporte</h4>
              <a href="#" className="hover:text-[#4a3931]">Central de Ajuda</a>
              <a href="#" className="hover:text-[#4a3931]">Dúvidas: Pacientes</a>
              <a href="#" className="hover:text-[#4a3931]">Dúvidas: Médicos e Clínicas</a>
              <a href="#" className="hover:text-[#4a3931]">Status do Sistema</a>
            </div>

            {/* Col 5 */}
            <div className="flex flex-col gap-3 text-sm text-[#8c8078] font-semibold">
              <h4 className="text-[#a3988e] uppercase tracking-widest text-[11px] font-bold mb-2">Privacidade</h4>
              <a href="#" className="hover:text-[#4a3931]">Segurança e LGPD</a>
              <a href="#" className="hover:text-[#4a3931]">Termos de Uso</a>
              <a href="#" className="hover:text-[#4a3931]">Política de Privacidade</a>
            </div>

          </div>

          <div className="max-w-6xl mx-auto px-6 border-t border-[#e5e0dc] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-[#a3988e] font-semibold">
               Idioma do site: <span className="text-[#8c8078] hover:text-[#4a3931] cursor-pointer">Português do Brasil</span>
            </div>
            <div className="text-xs text-[#a3988e]">
               © 2026 Anicca. Todos os direitos reservados.
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
