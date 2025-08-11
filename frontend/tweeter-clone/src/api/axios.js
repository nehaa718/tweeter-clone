import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://tweeter-clone-fmm2.onrender.com/api', // ✅ Render backend + /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
