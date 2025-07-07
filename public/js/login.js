/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// ✅ Add API_URL logic at the top
const API_URL =
  process.env.NODE_ENV === 'production'
    ? '' // 🔁 replace with your real domain later
    : ''; // empty = current origin (localhost)

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/v1/users/login`, {
      email,
      password,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      setTimeout(() => location.assign('/'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Login failed');
  }
};

export const logout = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/users/logout`);
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
