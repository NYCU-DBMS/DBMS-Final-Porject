import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api/score"

export const addScore = async (user_id: string, anime_id: number, score: string): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add`, {
      user_id,
      anime_id,
      score,
    })
    return response.data
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
    }
  }
}

export const removeScore = async (user_id: string, anime_id: number): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/remove`, {
      user_id,
      anime_id,
    })
    return response.data
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
    }
  }
}