import axios from "axios"
import { useAuthStore } from "@/store"

const API_BASE_URL = "http://localhost:8000/api/auth"

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchUser = async (username: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search/${username}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Register a new user
 * @param username - Username for the new user
 * @param email - Email address for the new user
 * @param password - Password for the new user
 * @returns Registration response or error
 */

export const registerUser = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      email,
      password,
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error('註冊失敗，請稍後再試')
  }
}

export const updatePassword = async (oldPW: string, newPW: string) => {
  try {
    const user = useAuthStore.getState().user
    if (!user) {
      throw new Error('請先登入')
    }

    const response = await axios.patch(`${API_BASE_URL}/update-password`, {
      oldPW,
      newPW,
      userID: user.user_id
    }, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })

    if (response.data.error) {
      throw new Error(response.data.error)
    }

    return response.data

  } catch (error: any) {
    // 處理特定的錯誤情況
    if (error.response?.status === 401) {
      throw new Error('身份驗證失敗，請重新登入')
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    // 其他錯誤情況
    console.error('Password update error:', error)
    throw new Error('密碼更新失敗，請稍後再試')
  }
}