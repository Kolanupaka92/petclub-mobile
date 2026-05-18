import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { api } from '../api';

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];
const GENDERS = ['Male', 'Female'];

export default function AddPetScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', color: '' });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleAdd = async () => {
    if (!form.name.trim()) { Alert.alert('Name required', 'Please enter your pet\'s name'); return; }
    setLoading(true);
    try {
      await api.addPet({ ...form, name: form.name.trim() });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add pet');
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add a New Pet</Text>

        <Text style={styles.label}>Pet Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Bruno" value={form.name} onChangeText={v => set('name', v)} />

        <Text style={styles.label}>Species</Text>
        <View style={styles.chips}>
          {SPECIES.map(s => <Chip key={s} label={s} selected={form.species === s} onPress={() => set('species', s)} />)}
        </View>

        <Text style={styles.label}>Breed</Text>
        <TextInput style={styles.input} placeholder="e.g. Labrador" value={form.breed} onChangeText={v => set('breed', v)} />

        <Text style={styles.label}>Age</Text>
        <TextInput style={styles.input} placeholder="e.g. 2 years" value={form.age} onChangeText={v => set('age', v)} />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.chips}>
          {GENDERS.map(g => <Chip key={g} label={g} selected={form.gender === g} onPress={() => set('gender', g)} />)}
        </View>

        <Text style={styles.label}>Color / Coat</Text>
        <TextInput style={styles.input} placeholder="e.g. Golden" value={form.color} onChangeText={v => set('color', v)} />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleAdd} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Pet 🐾</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', color: '#1f2937', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  chipSelected: { backgroundColor: '#f97316', borderColor: '#f97316' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipTextSelected: { color: '#fff' },
  btn: { backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
