import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api/favorite"

// 創建收藏清單
export const createFavoriteList = async (user_id: number, list_title: string): Promise<{ msg: string; error: string }> => {
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
export const insertAnimeToList = async (user_id: number, list_title: string, anime_id: number): Promise<{ msg: string; error: string }> => {
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
export const deleteFavoriteList = async (user_id: number, list_title: string): Promise<{ msg: string; error: string }> => {
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
export const deleteAnimeFromList = async (user_id: number, list_title: string, anime_id: number): Promise<{ msg: string; error: string }> => {
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
export const getFavoriteList = async (user_id: number, list_title: string): Promise<{ anime_id: number[]; anime_name: string[]; error?: string }> => {
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


// 模擬 /api/favorite/create
export function test_create_favorite(user_id: string, list_title: string) {
  console.log(`test_create_favorite: user_id=${user_id}, list_title=${list_title}`)
  return { msg: "success" }
}

// 模擬 /api/favorite/insert
export function test_insert_anime(user_id: string, list_title: string, anime_id: string) {
  console.log(`test_insert_anime: user_id=${user_id}, list_title=${list_title}, anime_id=${anime_id}`)
  return { msg: "success" }
}

// 模擬 /api/favorite/deleteList
export function test_delete_favorite(user_id: string, list_title: string) {
  console.log(`test_delete_favorite: user_id=${user_id}, list_title=${list_title}`)
  return { msg: "success" }
}

// 模擬 /api/favorite/deleteAnime
export function test_delete_anime(user_id: string, list_title: string, anime_id: string) {
  console.log(`test_delete_anime: user_id=${user_id}, list_title=${list_title}, anime_id=${anime_id}`)
  return { msg: "success" }
}

// 模擬 /api/favorite/getList
export function test_get_favorite(user_id: string, list_title: string) {
  console.log(`test_get_favorite: user_id=${user_id}, list_title=${list_title}`)
  return { anime_id: [1, 2, 3], anime_name: ["a", "b", "c"] }
}