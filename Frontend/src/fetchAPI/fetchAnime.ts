import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api"

export const fetchAnimeById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/anime/${id}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch anime data by Id:", error)
  }
}

export const fetchAnimeBySort = async (sort: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/anime/all?sort=${sort}`)
    return response.data.ID
  } catch (error) {
    console.error("Failed to fetch animeIds by sorting:", error)
  }
}