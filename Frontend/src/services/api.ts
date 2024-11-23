import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  password: string;
  new_password: string;
}

export const api = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
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
      const response = await axios.post<RegisterResponse>(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        username
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending password change request:', {
        password: currentPassword,
        new_password: newPassword
      }); 
  
      const response = await axios.put(
        `${API_BASE_URL}/auth/change-password`, 
        {
          password: currentPassword,
          new_password: newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};