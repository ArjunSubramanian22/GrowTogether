import axios from 'axios';

// Update this URL when backend is deployed
export const API_BASE_URL = 'https://qjh9iec7p858.manus.space';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

