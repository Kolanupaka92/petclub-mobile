import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SPECIES_EMOJI = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇' };

export default function PetCard({ pet, onPress }) {
  const emoji = SPECIES_EMOJI[pet.species?.toLowerCase()] || '🐾';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.meta}>{[pet.breed, pet.age, pet.gender].filter(Boolean).join(' · ')}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 30 },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '800', color: '#1f2937', marginBottom: 3 },
  meta: { fontSize: 13, color: '#6b7280' },
  arrow: { fontSize: 24, color: '#d1d5db' },
});
