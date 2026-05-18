import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PetsScreen from './src/screens/PetsScreen';
import AddPetScreen from './src/screens/AddPetScreen';
import BookingScreen from './src/screens/BookingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ORANGE = '#f97316';

function MainTabs({ session, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 8, paddingTop: 6, height: 64, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>, tabBarLabel: 'Home' }}
      >
        {props => <HomeTabStack {...props} session={session} />}
      </Tab.Screen>
      <Tab.Screen
        name="Pets"
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🐾</Text>, tabBarLabel: 'My Pets' }}
      >
        {props => <PetsTabStack {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>, tabBarLabel: 'Profile' }}
      >
        {props => <ProfileScreen {...props} session={session} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function HomeTabStack({ session }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">{props => <HomeScreen {...props} session={session} />}</Stack.Screen>
      <Stack.Screen name="BookService" component={BookingScreen} options={{ headerShown: true, title: 'Book Service', headerTintColor: ORANGE, headerStyle: { backgroundColor: '#fff7ed' } }} />
    </Stack.Navigator>
  );
}

function PetsTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PetsMain" component={PetsScreen} />
      <Stack.Screen name="AddPet" component={AddPetScreen} options={{ headerShown: true, title: 'Add Pet', headerTintColor: ORANGE, headerStyle: { backgroundColor: '#fff7ed' } }} />
    </Stack.Navigator>
  );
}

function ProfileScreen({ session, onLogout }) {
  const { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } = require('react-native');
  const name = session?.name || 'Pet Parent';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff7ed' }}>
      <View style={{ padding: 24, alignItems: 'center', flex: 1 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 32 }}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 4 }}>{name}</Text>
        <Text style={{ color: '#6b7280', marginBottom: 40 }}>{session?.phone || 'Pet owner'}</Text>
        <TouchableOpacity
          onPress={onLogout}
          style={{ borderWidth: 1.5, borderColor: '#f97316', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 }}
        >
          <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('petclub_token').then(token => {
      if (token) setSession({ token });
      setLoading(false);
    });
  }, []);

  const handleLogin = (s) => setSession(s);
  const handleLogout = async () => {
    await AsyncStorage.removeItem('petclub_token');
    setSession(null);
  };

  if (loading) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {!session ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <MainTabs session={session} onLogout={handleLogout} />
      )}
    </NavigationContainer>
  );
}
