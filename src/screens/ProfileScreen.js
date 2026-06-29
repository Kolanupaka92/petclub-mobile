import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

const ORANGE = '#f97316';

export default function ProfileScreen({ session, onLogout }) {
  const name = session?.name || 'Pet Parent';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff7ed' }}>
      <View style={{ padding: 24, alignItems: 'center', flex: 1 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 32 }}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 4 }}>{name}</Text>
        <Text style={{ color: '#6b7280', marginBottom: 40 }}>{session?.email || 'Pet owner'}</Text>
        <TouchableOpacity
          onPress={onLogout}
          style={{ borderWidth: 1.5, borderColor: ORANGE, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 }}
        >
          <Text style={{ color: ORANGE, fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
