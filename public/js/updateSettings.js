/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// 🔁 Env-based API base URL
const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.mysite.com'
    : '';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? `${API_URL}/api/v1/users/updateMyPassword`
        : `${API_URL}/api/v1/users/updateMe`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Update failed');
  }
};