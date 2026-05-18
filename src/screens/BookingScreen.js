import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

export default function BookingScreen({ route, navigation }) {
  const service = route.params?.service || 'Service';
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{
          service === 'Grooming' ? '✂️' : service === 'Training' ? '🎓' : service === 'Vet Care' ? '🏥' : '🍖'
        }</Text>
        <Text style={styles.title}>{service}</Text>
        <Text style={styles.sub}>Find verified {service.toLowerCase()} professionals near you.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Coming Soon</Text>
          <Text style={styles.cardText}>
            Live booking with real-time tracking is launching soon.{'\n\n'}
            For now, use the web app at{'\n'}
            <Text style={styles.link}>localhost:5175</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#1f2937', marginBottom: 8 },
  sub: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: '#fed7aa', marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#f97316', marginBottom: 12 },
  cardText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  link: { color: '#f97316', fontWeight: '700' },
  btn: { paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#f97316', fontWeight: '700', fontSize: 15 },
});
