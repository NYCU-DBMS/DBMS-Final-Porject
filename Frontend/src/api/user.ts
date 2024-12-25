import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api/auth"

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    })
    return response.data // { message: 'Login successful', token }
  } catch (error: any) {
    return { error: error.response?.data?.error || "Login failed" }
  }
}
/**
 * Search for a user by username
 * @param username - Username to search for
 * @returns User data or error
 */
export const searchUser = async (username: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search/${username}`)
    return response.data // { id, username, email, token }
  } catch (error: any) {
    return { error: error.response?.data?.error || "User not found" }
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
      username: username,
      email: email,
      password: password,
    })
    // console.log(response.data.error)
    return response.data
  } catch (error: any) {
    // throw error?.response?.data?.error || 'Registration failed'
  }
}

/**
 * Update user password
 * @param oldPW - Current password
 * @param newPW - New password
 * @returns Password update response or error
 */
export const updatePassword = async (oldPW: string, newPW: string) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/update-password`, {
      oldPW,
      newPW,
    })
    return response.data // { message: 'Password updated successfully' }
  } catch (error: any) {
    return { error: error.response?.data?.error || "Password update failed" }
  }
}

/**
 * Update user email
 * @param PW - Current password
 * @param newEmail - New email address
 * @returns Email update response or error
 */
export const updateEmail = async (PW: string, newEmail: string) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/update-email`, {
      PW,
      newEmail,
    })
    return response.data // { message: 'Email updated successfully' }
  } catch (error: any) {
    return { error: error.response?.data?.error || "Email update failed" }
  }
}