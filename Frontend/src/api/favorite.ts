import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api/favorite"

// 創建收藏清單
export const createFavoriteList = async (user_id: string, list_title: string): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, {
      user_id,
      list_title,
    })
    return response.data
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
    }
  }
}

// 插入動畫到某一清單
export const insertAnimeToList = async (user_id: string, list_title: string, anime_id: number): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/insert`, {
      user_id,
      list_title,
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

// 刪除某一清單
export const deleteFavoriteList = async (user_id: string, list_title: string): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/deleteList`, {
      user_id,
      list_title,
    })
    return response.data
  } catch (error: any) {
    return {
      msg: "failure",
      error: error.message,
    }
  }
}

// 刪除清單中的某一動畫
export const deleteAnimeFromList = async (user_id: string, list_title: string, anime_id: number): Promise<{ msg: string; error: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/deleteAnime`, {
      user_id,
      list_title,
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

// 查看清單中有哪些動畫
export const getFavoriteList = async (user_id: string, list_title: string): Promise<{ anime_id: number[]; anime_name: string[]; error?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getList`, {
      user_id,
      list_title,
    })
    return response.data
  } catch (error: any) {
    return {
      anime_id: [],
      anime_name: [],
      error: error.message,
    }
  }
}

export const getUsersList = async (user_id: string): Promise<{ list_titles: string[]; error?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getUsersList`, {
      user_id,
    })
    return response.data
  } catch (error: any) {
    return {
      list_titles: [],
      error: error.message,
    }
  }
}

export const deleteList = async (userId: string, listTitle: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deleteList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, list_title: listTitle }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting list:', error);
    return { error: 'Failed to delete list' };
  }
};