// Author: Sai Kolanupaka
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from './src/api';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PetsScreen from './src/screens/PetsScreen';
import AddPetScreen from './src/screens/AddPetScreen';
import BookingScreen from './src/screens/BookingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ORANGE = '#f97316';

// Global error boundary — prevents a JS crash from showing a blank screen in production
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#fff7ed' }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🐾</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ backgroundColor: ORANGE, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

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
      <Stack.Screen
        name="BookService"
        component={BookingScreen}
        options={{ headerShown: true, title: 'Book Service', headerTintColor: ORANGE, headerStyle: { backgroundColor: '#fff7ed' } }}
      />
    </Stack.Navigator>
  );
}

function PetsTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PetsMain" component={PetsScreen} />
      <Stack.Screen
        name="AddPet"
        component={AddPetScreen}
        options={{ headerShown: true, title: 'Add Pet', headerTintColor: ORANGE, headerStyle: { backgroundColor: '#fff7ed' } }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('petclub_token');
      if (token) {
        try {
          // Validate token server-side; also fetches current user details.
          // Silent refresh fires automatically inside api.getMe() if the token is expired.
          const user = await api.getMe();
          // api.getMe() unwraps the { user: {...} } envelope — user is the profile object directly
          setSession({ token, id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone });
        } catch {
          // Token invalid and refresh failed — clear stored credentials and show login
          await SecureStore.deleteItemAsync('petclub_token');
          await SecureStore.deleteItemAsync('petclub_refresh_token');
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleLogin = (s) => setSession(s);
  const handleLogout = async () => {
    api.logout().catch(() => {}); // revoke refresh token server-side (fire-and-forget)
    await SecureStore.deleteItemAsync('petclub_token');
    await SecureStore.deleteItemAsync('petclub_refresh_token');
    setSession(null);
  };

  if (loading) return null;

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="dark" />
        {!session ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <MainTabs session={session} onLogout={handleLogout} />
        )}
      </NavigationContainer>
    </ErrorBoundary>
  );
}
