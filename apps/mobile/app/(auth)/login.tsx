/**
 * @fileoverview Main Login/Registration screen mirroring Figma design.
 *
 * @module pages/auth/login
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AtSign, Lock } from 'lucide-react-native';

import { Button } from '../../src/shared/ui/Button';
import { Input } from '../../src/shared/ui/Input';
import { loginUser, registerUser } from '../../src/shared/api/auth';
import { useAuthStore, useOnboardingStore } from '../../src/shared/lib/zustand-persist';

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthAction = async () => {
    if (!email || !password) {
      setErrorMsg('Preencha email e senha');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      if (activeTab === 'login') {
        const data = await loginUser(email, password);
        useAuthStore.getState().signIn(data.user_id || 'unknown', data.role || 'patient', data.access_token);
      } else {
        // Fetch role from Onboarding Store if user passed there, fallback to patient
        const selectedRole = useOnboardingStore.getState().profileType || 'patient';
        // Mock a CRM if doctor for MVP test
        const crmPayload = selectedRole === 'doctor' ? 'CRM-12345' : undefined;
        
        await registerUser({
           email: email,
           password: password,
           role: selectedRole,
           crm_number: crmPayload
        });
        
        // After register, automatically log them in
        const data = await loginUser(email, password);
        useAuthStore.getState().signIn(data.user_id || 'unknown', selectedRole as 'patient' | 'caregiver' | 'doctor', data.access_token);
      }
    } catch (err: any) {
      console.warn('Auth Error:', err);
      setErrorMsg(err.response?.data?.detail || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        
        {/* TOP BRAND AREA - Brown Background */}
        <View style={styles.topArea}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=Ani&background=c4b5fd&color=fff&size=256' }} 
            style={styles.mascotImage}
            defaultSource={{uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='}} // Transparent 1x1 fallback
          />
        </View>

        {/* BOTTOM AUTH CARD - White Area */}
        <View style={styles.bottomArea}>
          
          {/* Custom Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
              accessibilityRole="tab"
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                Entrar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'register' && styles.activeTab]}
              onPress={() => setActiveTab('register')}
              accessibilityRole="tab"
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                Cadastrar-se
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Input 
              placeholder="E-mail, telefone ou nome de usuário"
              value={email}
              onChangeText={setEmail}
              leftIcon={<AtSign size={18} color="#f28b50" />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input 
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color="#f28b50" />}
              isPassword={true}
            />

            {/* Checkbox & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.checkboxContainer} accessibilityRole="checkbox">
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>Lembrar-me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {/* Primary Action Button */}
            <Button 
              title={loading ? "Carregando..." : "Acessar minha jornada"}
              onPress={handleAuthAction}
              style={{ marginTop: 12, marginBottom: 32 }}
              disabled={loading}
            />

            {/* Social Logins */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} accessibilityRole="button" accessibilityLabel="Entrar com Facebook">
                <Text style={styles.socialIconText}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} accessibilityRole="button" accessibilityLabel="Entrar com Google">
                <Text style={styles.socialIconText}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} accessibilityRole="button" accessibilityLabel="Entrar com Instagram">
                <Text style={styles.socialIconText}>ig</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              Ao entrar no Anicca, você concorda com os nossos <Text style={styles.termsBold}>Termos</Text> e <Text style={styles.termsBold}>Política de Privacidade</Text>.
            </Text>
            
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a3931', // Brown background for the whole screen
  },
  scrollContent: {
    flexGrow: 1,
  },
  topArea: {
    height: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 20,
  },
  mascotImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: -30, // Overlaps with the white card below
    zIndex: 10,
  },
  bottomArea: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 48,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#efe9e4',
    borderRadius: 30,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a3988e',
  },
  activeTabText: {
    color: '#3d2b1f',
  },
  formContainer: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#a3988e',
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: '#5a4a42',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    color: '#f28b50',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e0dc',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#a3988e',
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#efe9e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d2b1f',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a3988e',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 40,
    paddingBottom: 40,
  },
  termsBold: {
    fontWeight: 'bold',
    color: '#8c8078',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold'
  }
});
