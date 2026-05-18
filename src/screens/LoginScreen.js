import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { api, saveToken } from '../api';

const ORANGE = '#f97316';
const DEMO_PHONE = '9876543210';

export default function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('phone'); // phone | otp | signup
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [pendingSession, setPendingSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const sendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await api.sendOTP(cleaned);
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
      const res = await api.verifyOTP(phone.replace(/\D/g, ''), code);
      await saveToken(res.token);
      const session = { phone: res.user.phone, name: res.user.name, id: res.user.id, token: res.token };
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
      await api.updateMe({ name: signupName.trim(), email: signupEmail.trim() || undefined });
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
          <Text style={styles.logo}>🐾 PETclub</Text>
          <Text style={styles.tagline}>
            {step === 'phone' ? 'Sign in or create account' : step === 'otp' ? 'Enter verification code' : 'Complete your profile'}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {step === 'phone' && (
            <>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}><Text style={styles.countryCodeText}>🇮🇳 +91</Text></View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  keyboardType="numeric"
                  maxLength={10}
                  value={phone}
                  onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                  onSubmitEditing={sendOtp}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={sendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP →</Text>}
              </TouchableOpacity>
              <View style={styles.demoBox}>
                <Text style={styles.demoText}>Demo: <Text style={styles.demoBold}>9876543210</Text> · OTP: <Text style={styles.demoBold}>123456</Text></Text>
              </View>
            </>
          )}

          {step === 'otp' && (
            <>
              <Text style={styles.label}>Enter OTP sent to +91 {phone.slice(0,5)}XXXXX</Text>
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
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Sign In 🐾</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('phone'); setOtp(['','','','','','']); }} style={styles.linkBtn}>
                <Text style={styles.linkText}>← Change number</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendOtp} style={styles.linkBtn}>
                <Text style={styles.linkTextGray}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}

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
              <Text style={styles.label}>Email (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Let's Go 🐾</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onLogin(pendingSession)} style={styles.linkBtn}>
                <Text style={styles.linkTextGray}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.terms}>By continuing, you agree to PETclub&apos;s Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 32, fontWeight: '900', color: '#1f2937', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  phoneRow: { flexDirection: 'row', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  countryCode: { backgroundColor: '#f9fafb', paddingHorizontal: 14, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  countryCodeText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  btn: { backgroundColor: ORANGE, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  demoBox: { marginTop: 16, backgroundColor: '#fff7ed', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fed7aa' },
  demoText: { fontSize: 12, color: '#92400e', textAlign: 'center' },
  demoBold: { fontWeight: '700', fontFamily: 'monospace' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  otpBox: { width: 46, height: 52, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '700' },
  otpBoxFilled: { borderColor: ORANGE, backgroundColor: '#fff7ed' },
  linkBtn: { alignItems: 'center', paddingVertical: 10 },
  linkText: { color: ORANGE, fontWeight: '700', fontSize: 14 },
  linkTextGray: { color: '#9ca3af', fontSize: 13 },
  terms: { textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 24, paddingHorizontal: 20 },
});
