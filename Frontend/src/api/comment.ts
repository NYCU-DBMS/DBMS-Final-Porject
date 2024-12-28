import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api/comment"

export const addComment = async (user_id: string, anime_id: number, content: string): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add`, {
      user_id,
      anime_id,
      content,
    })
    return response.data
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
    }
  }
}

export const getComment = async (anime_id: number): Promise<{ user_id: number[], username: string[], content: string[], comment_id: number[] }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/get`, {
      anime_id,
    })
    return response.data
  } catch (error: any) {
    return {
      user_id: [],
      username: [],
      content: [],
      comment_id: []
    }
  }
}

export const deleteCommentByID = async (comment_id: number): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/deleteByID`, {
      comment_id,
    })
    return response.data
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
    }
  }
}

export const deleteCommentByInfo = async (user_id: string, anime_id: number, content: string): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/deleteByInfo`, {
      user_id,
      anime_id,
      content,
    })
    return response.data
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
    }
  }
}