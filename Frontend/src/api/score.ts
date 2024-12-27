import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api/score"

export const addScore = async (user_id: string, anime_id: number, score: number): Promise<{ msg: string; error: string }> => {
  // remove score first
  const getResult = await getScore(user_id, anime_id)
  if (getResult.score !== -1) {
    const result = await removeScore(user_id, anime_id)
      if (result.msg === "failure") {
        return {
          msg: "failure",
          error: result.error,
        }
      }
  }
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


export const getScore = async (user_id: string, anime_id: number): Promise<{ score: number }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getScore`, {
      userID: user_id,
      animeID: anime_id,
    })
    return response.data
  } catch (error: any) {
    return {
      score: -1,
    }
  }
}