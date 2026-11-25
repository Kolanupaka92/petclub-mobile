// Author: Sai Kolanupaka
import * as SecureStore from 'expo-secure-store';

const BASE = __DEV__ ? 'http://localhost:5001/api' : 'https://api.mypetclub.app/api';

const getToken        = () => SecureStore.getItemAsync('petclub_token');
const getRefreshToken = () => SecureStore.getItemAsync('petclub_refresh_token');

let _refreshPromise = null;

const _silentRefresh = async () => {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'X-Refresh-Token': refreshToken },
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token)        await SecureStore.setItemAsync('petclub_token', data.token);
      if (data.refreshToken) await SecureStore.setItemAsync('petclub_refresh_token', data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
};

const req = async (method, path, body, requireAuth = false, _refreshed = false) => {
  const headers = { 'Content-Type': 'application/json', 'X-Client-Type': 'mobile' };
  if (requireAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !_refreshed) {
    const ok = await _silentRefresh();
    if (ok) return req(method, path, body, requireAuth, true);
    await SecureStore.deleteItemAsync('petclub_token');
    await SecureStore.deleteItemAsync('petclub_refresh_token');
    throw new Error('Your session has expired. Please sign in again.');
  }

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
  // Auth
  sendEmailOTP:   (email)      => req('POST', '/auth/send-email-otp',   { email }),
  verifyEmailOTP: (email, otp) => req('POST', '/auth/verify-email-otp', { email, otp }),
  logout:         ()           => req('POST', '/auth/logout', null, true),

  // User
  getMe:    ()     => req('GET', '/users/me', null, true).then(d => d.user || d),
  updateMe: (data) => req('PUT', '/users/me', data, true),
  setRole:  (data) => req('POST', '/users/set-role', data, true),

  // Pets
  getPets:   ()         => req('GET',    '/pets',       null, true),
  addPet:    (data)     => req('POST',   '/pets',       data, true),
  updatePet: (id, data) => req('PUT',    `/pets/${id}`, data, true),
  deletePet: (id)       => req('DELETE', `/pets/${id}`, null, true),

  // Records
  getRecords: (petId, type)       => req('GET',  `/pets/${petId}/records/${type}`, null, true),
  addRecord:  (petId, type, data) => req('POST', `/pets/${petId}/records/${type}`, data, true),

  // Bookings — customer
  getBookings:    ()     => req('GET',  '/bookings',           null, true),
  createBooking:  (data) => req('POST', '/bookings',           data, true),
  cancelBooking:  (id)   => req('POST', `/bookings/${id}/cancel`, null, true),
  rateBooking:    (id, data) => req('POST', `/bookings/${id}/rate`, data, true),
  getTracking:    (id)   => req('GET',  `/bookings/${id}/tracking`, null, true),

  // Bookings — professional
  getIncomingBookings: () => req('GET',  '/bookings/incoming', null, true),
  respondBooking: (id, data) => req('POST', `/bookings/${id}/respond`, data, true),
  updateBookingStatus: (id, data) => req('PUT', `/bookings/${id}/status`, data, true),
  startJourney:   (id)   => req('POST', `/bookings/${id}/start-journey`, null, true),
  updateLocation: (id, data) => req('POST', `/bookings/${id}/location`, data, true),

  // Professionals
  getProfessionals:  (city, role) => req('GET', `/professionals?city=${city || ''}&sub_role=${role || ''}`),
  getMyProProfile:   ()           => req('GET', '/professionals/me', null, true),
  updateProProfile:  (data)       => req('PUT', '/professionals/me', data, true),
  getEarnings:       ()           => req('GET', '/professionals/earnings', null, true),
  requestPayout:     (data)       => req('POST', '/professionals/payout', data, true),

  // Loyalty
  getLoyalty: () => req('GET', '/users/loyalty', null, true),

  // FCM
  saveFcmToken: (token) => req('POST', '/users/fcm-token', { token }, true),

  // Health
  health: () => req('GET', '/health'),
};

export const saveToken = async (token, refreshToken) => {
  await SecureStore.setItemAsync('petclub_token', token);
  if (refreshToken) await SecureStore.setItemAsync('petclub_refresh_token', refreshToken);
};

export const clearToken = async () => {
  await SecureStore.deleteItemAsync('petclub_token');
  await SecureStore.deleteItemAsync('petclub_refresh_token');
};

export const hasToken = async () => !!(await getToken());
