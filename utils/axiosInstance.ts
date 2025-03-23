import axios from 'axios';
import { getCookie } from 'cookies-next';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URI,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getCookie('token')}`,
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;

      // Map kode status HTTP ke pesan yang lebih jelas
      let errorMessage = "An unexpected error occurred";

      switch (status) {
        case 400:
          errorMessage = data.message || "Bad Request";
          break;
        case 422:
          errorMessage = data.errors || "Bad Request";
          break;
        case 401:
          errorMessage = "Unauthorized. Please log in again.";
          break;
        case 403:
          errorMessage = data.message || "Access Denied";
          break;
        case 404:
          errorMessage = "Resource not found";
          break;
        case 500:
          errorMessage = "Internal Server Error";
          break;
        default:
          errorMessage = data.message || errorMessage;
      }

      // Kembalikan pesan error
      return Promise.reject(errorMessage);
    } else {
      // Jika tidak ada respon dari server
      return Promise.reject("Network error. Please check your connection.");
    }
  }
);


export default axiosInstance;