// api/authService.js
import axios from './axiosConfig';

export const login = async (email, password) => {
  const response = await axios.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  await axios.post('/logout');
  localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  const response = await axios.get('/me');
  return response.data;
};
