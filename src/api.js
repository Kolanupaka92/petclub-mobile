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
  let data = {};
  try {
    const text = await res.text();
    if (text) data = JSON.parse(text);
  } catch {
    if (!res.ok) throw new Error(`Server error (${res.status}). Please try again.`);
    return {};
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

export const api = {
  // Auth — Email OTP (phone OTP via old endpoints has been removed)
  sendEmailOTP:   (email)       => req('POST', '/auth/send-email-otp',   { email }),
  verifyEmailOTP: (email, otp)  => req('POST', '/auth/verify-email-otp', { email, otp }),

  // User
  getMe:     ()      => req('GET',  '/users/me',      null, true),
  updateMe:  (data)  => req('PUT',  '/users/me',      data, true),

  // Pets
  getPets:   ()          => req('GET',  '/pets',       null, true),
  addPet:    (data)      => req('POST', '/pets',       data, true),
  updatePet: (id, data)  => req('PUT',  `/pets/${id}`, data, true),

  // Records
  getRecords: (petId, type)       => req('GET',  `/pets/${petId}/records/${type}`, null, true),
  addRecord:  (petId, type, data) => req('POST', `/pets/${petId}/records/${type}`, data, true),

  // Bookings
  getBookings:  ()     => req('GET', '/bookings', null, true),

  // Professionals
  getProfessionals: (city, role) => req('GET', `/professionals?city=${city || ''}&sub_role=${role || ''}`),

  // Health
  health: () => req('GET', '/health'),
};

export const saveToken  = (token) => AsyncStorage.setItem('petclub_token', token);
export const clearToken = ()      => AsyncStorage.removeItem('petclub_token');
export const hasToken   = async () => !!(await getToken());
