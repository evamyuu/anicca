'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';

export default function UniversalLoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate navigation to the dashboard logic for the doctor for now
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      
      {/* MOBILE TOP AREA / DESKTOP LEFT SIDE (Brown) */}
      <div className="bg-[#4a3931] w-full md:w-1/2 min-h-[35vh] md:min-h-screen flex flex-col items-center justify-end relative overflow-visible pt-10">
        <div className="absolute top-6 left-6 flex items-baseline gap-1 md:hidden z-20">
          <span className="text-xl font-bold tracking-tight text-white">anicca</span>
          <span className="w-1.5 h-1.5 bg-[#f28b50] rounded-full"></span>
        </div>

        {/* Desktop Branding */}
        <div className="hidden md:block absolute top-1/3 text-center px-10">
          <h1 className="text-4xl font-bold text-white mb-4">Bem-vindo(a) de volta.</h1>
          <p className="text-[#bdae9f] text-lg">Independente do seu papel na jornada, estamos aqui com você.</p>
        </div>
        
        {/* Mascot Placeholder - Positioned exactly like Figma (overlapping the white card) */}
        <div className="z-10 absolute bottom-[-40px] md:bottom-auto md:top-1/2 flex justify-center w-full">
            <div className="w-[200px] h-[200px] bg-black/20 rounded-full flex items-center justify-center text-4xl shadow-xl backdrop-blur-md">
                🐱👋
                <span className="absolute -bottom-6 text-xs text-white/50">ani_hello.png</span>
            </div>
        </div>
      </div>

      {/* BOTTOM AUTH CARD (Mobile) / RIGHT SIDE (Desktop) */}
      <div className="flex-1 bg-white md:bg-[#fbf9f6] w-full md:w-1/2 rounded-t-[40px] md:rounded-none -mt-10 md:mt-0 pt-[60px] md:pt-0 px-6 pb-10 flex flex-col justify-center items-center relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none">
        <div className="w-full max-w-sm">
          
          {/* Custom Tabs */}
          <div className="flex bg-[#efe9e4] rounded-full p-1 mb-8">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 text-[15px] font-semibold rounded-full transition-all ${
                activeTab === 'login' ? 'bg-white text-[#3d2b1f] shadow-sm' : 'text-[#a3988e] hover:text-[#5a4a42]'
              }`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 text-[15px] font-semibold rounded-full transition-all ${
                activeTab === 'register' ? 'bg-white text-[#3d2b1f] shadow-sm' : 'text-[#a3988e] hover:text-[#5a4a42]'
              }`}
            >
              Cadastrar-se
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleAuthAction}>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-[#f28b50]" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-11 pr-4 h-[52px] border border-[#e5e0dc] rounded-full text-[15px] focus:outline-none focus:ring-1 focus:ring-[#f28b50] focus:border-[#f28b50] bg-white text-[#3d2b1f] placeholder-[#a3988e]" 
                placeholder="E-mail, telefone ou nome de usuário"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-[#f28b50]" />
              </div>
              <input 
                type="password" 
                className="block w-full pl-11 pr-4 h-[52px] border border-[#e5e0dc] rounded-full text-[15px] focus:outline-none focus:ring-1 focus:ring-[#f28b50] focus:border-[#f28b50] bg-white text-[#3d2b1f] placeholder-[#a3988e]" 
                placeholder="Senha"
              />
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-[18px] w-[18px] text-[#f28b50] focus:ring-0 border-2 border-[#a3988e] rounded-[4px] cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-[14px] text-[#5a4a42] font-medium cursor-pointer">
                  Lembrar-me
                </label>
              </div>
              <div>
                <a href="#" className="text-[14px] font-semibold text-[#f28b50] hover:text-[#e67e22]">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full flex justify-center items-center h-[52px] border border-transparent rounded-full shadow-sm text-[16px] font-bold text-white bg-[#f28b50] hover:bg-[#e67e22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f28b50] transition-colors">
                Acessar minha jornada
              </button>
            </div>
            
            {/* Social Logins */}
            <div className="pt-6">
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-[#e5e0dc]"></div>
                <span className="px-4 text-[13px] font-bold text-[#a3988e]">OU</span>
                <div className="flex-1 h-px bg-[#e5e0dc]"></div>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <button type="button" className="w-14 h-14 rounded-full bg-[#efe9e4] flex items-center justify-center hover:bg-[#e5e0dc] transition-colors">
                  <span className="font-bold text-xl text-[#3d2b1f]">f</span>
                </button>
                <button type="button" className="w-14 h-14 rounded-full bg-[#efe9e4] flex items-center justify-center hover:bg-[#e5e0dc] transition-colors">
                  <span className="font-bold text-xl text-[#3d2b1f]">G</span>
                </button>
                <button type="button" className="w-14 h-14 rounded-full bg-[#efe9e4] flex items-center justify-center hover:bg-[#e5e0dc] transition-colors">
                  <span className="font-bold text-xl text-[#3d2b1f]">ig</span>
                </button>
              </div>
            </div>

            <p className="text-center text-[12px] text-[#a3988e] px-4 leading-relaxed">
              Ao entrar no Anicca, você concorda com os nossos <span className="font-bold text-[#8c8078] cursor-pointer hover:underline">Termos</span> e <span className="font-bold text-[#8c8078] cursor-pointer hover:underline">Política de Privacidade</span>.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
