import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  id: number;
  email: string;
  username: string;
  // Add any other user properties that your API returns
}

// Define the LoginResponse type
export interface LoginResponse {
  token: string;
  user: User;
}

// Define the RegisterResponse type (if different from LoginResponse)
export interface RegisterResponse {
  token: string;
  user: User;
}

export const api = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (email: string, password: string, username: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        username
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};