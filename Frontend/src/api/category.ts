import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/category'

export const fetchCategory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch category data:', error)
  }
}

export const fetchAnimeByCategoryAndSort = async (category: string, sort: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${category}?sort=${sort}`)
    return response.data.ID
  } catch (error) {
    console.error('Failed to fetch animeIds by category:', error)
  }
}
