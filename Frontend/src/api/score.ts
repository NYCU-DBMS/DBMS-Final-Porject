import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api/score"

interface ScoreResponse {
  msg: string;
  error: string;
  totalScore?: number;
}

export const addScore = async (user_id: string, anime_id: number, score: number): Promise<ScoreResponse> => {
  // remove score first
  const getResult = await getScore(user_id, anime_id)
  if (getResult.score !== null) {
    const result = await removeScore(user_id, anime_id)
      if (result.msg === "failure") {
        return {
          msg: "failure",
          error: result.error,
          totalScore: undefined
        }
      }
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/add`, {
      user_id,
      anime_id,
      score,
    })
    return {
      ...response.data,
      totalScore: response.data.totalScore // 確保返回 totalScore
    }
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
      totalScore: undefined
    }
  }
}

export const removeScore = async (user_id: string, anime_id: number): Promise<ScoreResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/remove`, {
      user_id,
      anime_id,
    })
    return {
      ...response.data,
      totalScore: response.data.totalScore // 確保返回 totalScore
    }
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
      totalScore: undefined
    }
  }
}

export const getScore = async (user_id: string, anime_id: number): Promise<{ score: number | null }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getScore`, {
      userID: user_id,
      animeID: anime_id,
    })
    return response.data
  } catch (error: any) {
    return {
      score: null
    }
  }
}