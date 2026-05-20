import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = 'https://api.mypetclub.app/api';

const getToken = () => AsyncStorage.getItem('petclub_token');

const req = async (method, path, body, requireAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  sendOTP: (phone, countryCode = '91') => req('POST', '/auth/send-otp', { phone, countryCode }),
  verifyOTP: (phone, otp, countryCode = '91') => req('POST', '/auth/verify-otp', { phone, otp, countryCode }),
  getMe: () => req('GET', '/users/me', null, true),
  updateMe: (data) => req('PUT', '/users/me', data, true),
  getPets: () => req('GET', '/pets', null, true),
  addPet: (data) => req('POST', '/pets', data, true),
  updatePet: (id, data) => req('PUT', `/pets/${id}`, data, true),
  getRecords: (petId, type) => req('GET', `/pets/${petId}/records/${type}`, null, true),
  addRecord: (petId, type, data) => req('POST', `/pets/${petId}/records/${type}`, data, true),
  getBookings: () => req('GET', '/bookings', null, true),
  getProfessionals: (city, role) => req('GET', `/professionals?city=${city || ''}&sub_role=${role || ''}`),
  health: () => req('GET', '/health'),
};

export const saveToken = (token) => AsyncStorage.setItem('petclub_token', token);
export const clearToken = () => AsyncStorage.removeItem('petclub_token');
export const hasToken = async () => !!(await getToken());
