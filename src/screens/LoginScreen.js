import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { api, saveToken } from '../api';

const ORANGE = '#f97316';

export default function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('email');  // email | otp | signup
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [signupName, setSignupName] = useState('');
  const [pendingSession, setPendingSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const sendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await api.sendEmailOTP(trimmed);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (codeOverride) => {
    const code = codeOverride || otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const res = await api.verifyEmailOTP(email.trim().toLowerCase(), code);
      await saveToken(res.token);
      const session = { email: res.user.email, name: res.user.name, id: res.user.id, token: res.token };
      if (res.isNew) {
        setPendingSession(session);
        setStep('signup');
      } else {
        onLogin(session);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.join('').length === 6) verifyOtp(next.join(''));
  };

  const handleSignup = async () => {
    if (!signupName.trim()) { Alert.alert('Name required', 'Please enter your name'); return; }
    setLoading(true);
    try {
      await api.updateMe({ name: signupName.trim() });
      onLogin({ ...pendingSession, name: signupName.trim() });
    } catch {
      onLogin({ ...pendingSession, name: signupName.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={require('../../../assets/icon.png')} style={styles.logoIcon} />
            <Text style={styles.logo}>PET<Text style={styles.logoOrange}>club</Text></Text>
          </View>
          <Text style={styles.tagline}>
            {step === 'email'  ? 'Sign in or create account'  :
             step === 'otp'    ? 'Enter verification code'    :
                                 'Complete your profile'}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* ── STEP: EMAIL ── */}
          {step === 'email' && (
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={sendOtp}
                returnKeyType="done"
              />

              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={sendOtp} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Send OTP →</Text>}
              </TouchableOpacity>

              <View style={styles.demoBox}>
                <Text style={styles.demoText}>
                  📧 A 6-digit OTP will be sent to your email.{'\n'}
                  <Text style={styles.demoBold}>Demo OTP: 123456</Text>
                </Text>
              </View>
            </>
          )}

          {/* ── STEP: OTP ── */}
          {step === 'otp' && (
            <>
              <View style={styles.otpLabelRow}>
                <Text style={styles.label}>OTP sent to  </Text>
                <Text style={styles.label}>{email}</Text>
              </View>
              <View style={styles.otpRow}>
                {otp.map((d, i) => (
                  <TextInput
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    style={[styles.otpBox, d && styles.otpBoxFilled]}
                    keyboardType="numeric"
                    maxLength={1}
                    value={d}
                    onChangeText={v => handleOtpChange(i, v)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !d && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                  />
                ))}
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={() => verifyOtp()} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Verify & Sign In 🐾</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('email'); setOtp(['','','','','','']); }} style={styles.linkBtn}>
                <Text style={styles.linkText}>← Change email</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendOtp} style={styles.linkBtn}>
                <Text style={styles.linkTextGray}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP: SIGNUP ── */}
          {step === 'signup' && (
            <>
              <Text style={styles.label}>Your Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Arjun Mehta"
                value={signupName}
                onChangeText={setSignupName}
                autoComplete="name"
              />
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSignup} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Let's Go 🐾</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onLogin(pendingSession)} style={styles.linkBtn}>
                <Text style={styles.linkTextGray}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.terms}>By continuing, you agree to PETclub's Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff7ed' },
  scroll:          { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header:          { alignItems: 'center', marginBottom: 32 },
  logoRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  logoIcon:        { width: 40, height: 40, borderRadius: 9 },
  logo:            { fontSize: 28, fontWeight: '900', color: '#1f2937' },
  logoOrange:      { color: '#f97316' },
  tagline:         { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  card:            { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  label:           { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:           { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  btn:             { backgroundColor: ORANGE, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled:     { opacity: 0.6 },
  btnText:         { color: '#fff', fontSize: 16, fontWeight: '800' },
  demoBox:         { marginTop: 16, backgroundColor: '#fff7ed', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fed7aa' },
  demoText:        { fontSize: 12, color: '#92400e', textAlign: 'center' },
  demoBold:        { fontWeight: '700', fontFamily: 'monospace' },
  otpLabelRow:     { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
  otpRow:          { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  otpBox:          { width: 46, height: 52, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '700' },
  otpBoxFilled:    { borderColor: ORANGE, backgroundColor: '#fff7ed' },
  linkBtn:         { alignItems: 'center', paddingVertical: 10 },
  linkText:        { color: ORANGE, fontWeight: '700', fontSize: 14 },
  linkTextGray:    { color: '#9ca3af', fontSize: 13 },
  terms:           { textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 24, paddingHorizontal: 20 },
});
