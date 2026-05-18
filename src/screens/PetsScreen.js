import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { api } from '../api';
import PetCard from '../components/PetCard';

export default function PetsScreen({ navigation }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPets = useCallback(async () => {
    try {
      const res = await api.getPets();
      setPets(res.pets || []);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadPets);
    return unsubscribe;
  }, [navigation, loadPets]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Pets</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddPet')}>
          <Text style={styles.addBtnText}>+ Add Pet</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#f97316" /></View>
      ) : pets.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyTitle}>No pets yet!</Text>
          <Text style={styles.emptySubtitle}>Add your first pet to get started</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('AddPet')}>
            <Text style={styles.ctaBtnText}>Add Your Pet →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={p => p.id}
          renderItem={({ item }) => <PetCard pet={item} onPress={() => navigation.navigate('PetDetail', { pet: item })} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '900', color: '#1f2937' },
  addBtn: { backgroundColor: '#f97316', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 20, paddingTop: 8, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  ctaBtn: { backgroundColor: '#f97316', borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
