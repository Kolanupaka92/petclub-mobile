import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const SERVICES = [
  { icon: '✂️', label: 'Grooming', color: '#fff7ed', border: '#fed7aa' },
  { icon: '🎓', label: 'Training', color: '#fffbeb', border: '#fde68a' },
  { icon: '🏥', label: 'Vet Care', color: '#fff1f2', border: '#fecdd3' },
  { icon: '🍖', label: 'Pet Food', color: '#f0fdf4', border: '#bbf7d0' },
];

export default function HomeScreen({ session, navigation }) {
  const name = session?.name || 'Pet Parent';
  const firstName = name.split(' ')[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey {firstName}! 🐾</Text>
            <Text style={styles.subGreeting}>What does your pet need today?</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileInitial}>{firstName[0]?.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🌟 All Services Available</Text>
          <Text style={styles.bannerSub}>Verified professionals · Insured · Real-time tracking</Text>
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.servicesGrid}>
          {SERVICES.map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.serviceCard, { backgroundColor: s.color, borderColor: s.border }]}
              onPress={() => navigation.navigate('BookService', { service: s.label })}
            >
              <Text style={styles.serviceIcon}>{s.icon}</Text>
              <Text style={styles.serviceLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Pets')}>
            <Text style={styles.quickBtnIcon}>🐕</Text>
            <Text style={styles.quickBtnText}>My Pets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, styles.quickBtnOutline]} onPress={() => navigation.navigate('BookService', {})}>
            <Text style={styles.quickBtnIcon}>📅</Text>
            <Text style={[styles.quickBtnText, { color: '#f97316' }]}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '900', color: '#1f2937' },
  subGreeting: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  profileInitial: { color: '#fff', fontSize: 18, fontWeight: '800' },
  banner: { backgroundColor: '#f97316', borderRadius: 20, padding: 20, marginBottom: 24 },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  bannerSub: { color: '#ffedd5', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 14 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  serviceCard: { width: '47%', borderWidth: 1.5, borderRadius: 20, padding: 20, alignItems: 'center' },
  serviceIcon: { fontSize: 36, marginBottom: 10 },
  serviceLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickBtn: { flex: 1, backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  quickBtnOutline: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#f97316' },
  quickBtnIcon: { fontSize: 18 },
  quickBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
