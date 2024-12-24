import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

export const fetchAnime = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/anime/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch anime data:", error);
  }
}