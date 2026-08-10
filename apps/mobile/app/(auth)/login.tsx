/**
 * @fileoverview Implementation of login.
 *
 * @module app/(auth)/loginx
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, AtSign, Lock, User, Phone, CheckSquare, Square } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../src/shared/ui/Input';
import { GradientButton } from '../../src/shared/ui/GradientButton';
import { loginUser, registerUser, loginWithGoogle } from '../../src/shared/api/auth';
import { useAuthStore, useOnboardingStore } from '../../src/shared/lib/zustand-persist';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import DetailsBackground from '../../assets/images/login/details-background.svg';

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'COLOQUE_SEU_WEB_CLIENT_ID_AQUI.apps.googleusercontent.com',
  });
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isRegister } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(isRegister === 'true' ? 'register' : 'login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthAction = async () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setUsernameError('');
    setErrorMsg('');

    if (!email) {
      setEmailError('Preencha este campo obrigatório');
      isValid = false;
    } else if (activeTab === 'register' && !email.includes('@')) {
      setEmailError('Digite um e-mail válido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('A senha é obrigatória');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      isValid = false;
    }

    if (activeTab === 'register') {
      if (!username) {
        setUsernameError('Como devemos te chamar?');
        isValid = false;
      }
    }

    if (!isValid) return;

    setLoading(true);
    try {
      if (activeTab === 'login') {
        const data = await loginUser(email, password);
        useAuthStore.getState().signIn(data.patient_id || 'unknown', data.role || 'patient', data.access_token);
      } else {
        const obState = useOnboardingStore.getState();
        const selectedRole = obState.profileType || 'patient';
        
        await registerUser({
           email,
           password,
           username: username,
           phone: phone || undefined,
           role: selectedRole,
           crm_number: obState.crmNumber || undefined,
           patient_link_code: obState.caregiverInviteCode || undefined,
           cancer_type: obState.cancerType,
           journey_phase: obState.journeyPhase,
           treatment_modality: obState.careModality,
           ani_personality: obState.aniPersonality,
           avatar_config: { type: 'initial', color: '#403229', text: username[0]?.toUpperCase() || 'A' },
           consents: { 
             notifications: obState.consentNotifications, 
             camera: obState.consentCamera, 
             calendar: obState.consentCalendar,
             watch: obState.consentWatch,
             research: obState.lgpdResearchConsent
           },
           birth_year: obState.birthYear,
           gender: obState.gender,
           stage: obState.stage,
           diagnosis_date: obState.diagnosisDate,
           zip_code: obState.zipCode,
           treatments: obState.treatments,
           concerns: obState.concerns,
           caregiver_name: obState.caregiverName,
           caregiver_relationship: obState.caregiverRelationship,
           doctor_specialty: obState.doctorSpecialty,
           doctor_interests: obState.doctorInterests,
        });
        
        const data = await loginUser(email, password);
        useAuthStore.getState().signIn(data.patient_id || 'unknown', selectedRole as 'patient' | 'caregiver' | 'doctor', data.access_token);
      }
    } catch (err: any) {
      console.warn('Auth Error:', err);
      setErrorMsg(err.response?.data?.detail || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (Platform.OS === 'web') {
        alert('O login do Google na Web requer a versão Native. Teste pelo Emulador!');
        return;
      }
      setLoading(true);
      setErrorMsg('');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      
      if (!idToken) throw new Error('Não foi possível obter o token do Google.');
      const data = await loginWithGoogle(idToken);
      useAuthStore.getState().signIn(data.patient_id || 'unknown', data.role || 'patient', data.access_token);
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        setErrorMsg('Erro ao logar com Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradients & SVG */}
      <LinearGradient colors={['#403229', '#A6826A']} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.detailsBackground}>
        <DetailsBackground width="100%" height="100%" preserveAspectRatio="xMidYMin slice" />
      </View>
      <TouchableOpacity 
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 20 }]}
      >
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, minHeight: 40 }} />
        {/* Mascot sits directly above the card but takes 0 height to avoid pushing the card down */}
        <View 
          style={[styles.mascotAnchor, Platform.OS === 'web' ? { pointerEvents: 'none' } as any : undefined]} 
          pointerEvents={Platform.OS === 'web' ? undefined : 'none'}
        >
          <Image source={require('../../assets/images/login/ani-login.png')} style={styles.mascotImage} resizeMode="contain" />
        </View>
        <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              
              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                  onPress={() => setActiveTab('login')}
                >
                  <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                    Entrar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                  onPress={() => setActiveTab('register')}
                >
                  <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                    Cadastrar-se
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Form Fields */}
              <View style={styles.formSpacing}>
                {activeTab === 'register' && (
                  <>
                    <Input 
                      placeholder="Nome de usuário"
                      value={username}
                      onChangeText={(val) => { setUsername(val); setUsernameError(''); }}
                      error={usernameError}
                      leftIcon={<User size={20} color="#FF9A5C" />}
                      containerStyle={styles.inputHeight}
                      wrapperStyle={{ marginBottom: 0 }}
                    />
                    <Input 
                      placeholder="Telefone (Opcional)"
                      value={phone}
                      onChangeText={(val) => setPhone(val)}
                      leftIcon={<Phone size={20} color="#FF9A5C" />}
                      keyboardType="phone-pad"
                      containerStyle={styles.inputHeight}
                      wrapperStyle={{ marginBottom: 0 }}
                    />
                  </>
                )}
                <Input 
                  placeholder={activeTab === 'register' ? "E-mail" : "E-mail, telefone ou nome de usuário"}
                  value={email}
                  onChangeText={(val) => { setEmail(val); setEmailError(''); }}
                  error={emailError}
                  leftIcon={<AtSign size={20} color="#FF9A5C" />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={styles.inputHeight}
                  wrapperStyle={{ marginBottom: 0 }}
                />
                
                <Input 
                  placeholder="Senha"
                  value={password}
                  onChangeText={(val) => { setPassword(val); setPasswordError(''); }}
                  error={passwordError}
                  leftIcon={<Lock size={20} color="#FF9A5C" />}
                  isPassword={true}
                  containerStyle={styles.inputHeight}
                  wrapperStyle={{ marginBottom: 0 }}
                />
              </View>
              {/* Lembrar-me & Esqueceu a senha */}
              {activeTab === 'login' && (
                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                    {rememberMe ? (
                      <CheckSquare size={20} color="rgba(64, 50, 41, 0.7)" />
                    ) : (
                      <Square size={20} color="rgba(64, 50, 41, 0.7)" />
                    )}
                    <Text style={styles.checkboxText}>Lembrar-me</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                  </TouchableOpacity>
                </View>
              )}
              {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
              ) : null}
              <GradientButton
                title={loading ? "Carregando..." : activeTab === 'register' ? "CRIAR CONTA" : "ENTRAR"}
                onPress={handleAuthAction}
                colors={['#FF9A5C', '#E87A3E']}
                disabled={loading}
                style={{ marginTop: 25 }}
              />
              {/* OU Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>
              {/* Social Logins */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome5 name="facebook-f" size={24} color="#403229" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn} disabled={loading}>
                  <FontAwesome5 name="google" size={24} color="#403229" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome5 name="instagram" size={24} color="#403229" />
                </TouchableOpacity>
              </View>
              {/* Terms */}
              <Text style={styles.termsText}>
                Ao entrar no Anicca, você concorda com os nossos <Text style={styles.termsBold}>Termos</Text> e <Text style={styles.termsBold}>Política de Privacidade</Text>.
              </Text>
              
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%', // Forces the background to stay at the top and stretch well
    opacity: 0.8,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 20,
    padding: 12,
  },
  mascotAnchor: {
    alignItems: 'center',
    width: '100%',
    height: 0,
    zIndex: 20,
    elevation: 20, // Must be higher than the card's 10 to show on Android
    overflow: 'visible',
  },
  mascotImage: {
    position: 'absolute',
    bottom: -20, // Sobrepõe apenas a borda do card, sem encostar nos botões
    width: 250,
    height: 250,
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flexShrink: 1, // Wraps content but shrinks if keyboard opens
    maxHeight: '65%', // Guarantee space above for the mascot
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8DDD9',
    borderRadius: 20, 
    padding: 4,
    height: 41, // Same height as inputs
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 33, // 41 minus 8px padding
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: 'rgba(64, 50, 41, 0.5)',
  },
  activeTabText: {
    fontFamily: 'Nunito_700Bold',
    color: '#3d2b1f',
  },
  formSpacing: {
    gap: 25, 
  },
  inputHeight: {
    height: 41,
    borderRadius: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    color: 'rgba(64, 50, 41, 0.7)',
    fontWeight: '600',
    marginLeft: 8,
  },
  forgotText: {
    fontSize: 16,
    color: '#FF9A5C',
    fontWeight: '600',
  },
  errorText: {
    color: '#E83752',
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e0dc',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 16,
    color: 'rgba(64, 50, 41, 0.7)',
    fontWeight: 'bold',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 25,
    marginTop: 25,
    marginBottom: 25,
  },
  socialButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E8DDD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(64, 50, 41, 0.7)',
    lineHeight: 24,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  termsBold: {
    fontWeight: 'bold',
    color: 'rgba(64, 50, 41, 0.9)',
  }
});