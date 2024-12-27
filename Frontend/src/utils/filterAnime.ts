import { fetchAnimeById } from "@/api/anime"

interface Anime {
  id: number
  Image_URL: string
}

// 過濾條件
const filterUrls = ["https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png"]
const filterIds = [13405, 10742, 31586]
const maxResults = 50

/**
 * 判斷是否需要排除的動畫。
 * @param anime - 動畫物件。
 * @returns 是否需要排除。
 */
function shouldExcludeAnime(anime: Anime): boolean {
  // 檢查 id 或 Image_URL 是否符合過濾條件
  return filterIds.includes(anime.id) || filterUrls.includes(anime.Image_URL)
}

/**
 * 檢查圖片 URL 是否有效
 * @param url - 圖片 URL。
 * @returns 如果圖片有效則回傳 true，否則回傳 false。
 */
async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'GET' })  // 不使用 `mode: 'no-cors'`，允許正常 CORS 檢查
    if (response.ok) {
      console.log("Image is available")
      return true
    } else {
      console.log("Image not available")
      return false
    }
  } catch (error) {
    console.error("Error during fetch:", error)
    return false
  }
}

/**
 * 過濾動畫 ID 清單。
 * @param animeIds - 要處理的動畫 ID 清單。
 * @returns 過濾後的動畫 ID，最多 50 筆。
 */
export async function filterAnime(animeIds: number[]): Promise<number[]> {
  const filteredIds: number[] = []
  let currentIndex = 0

  while (filteredIds.length < maxResults && currentIndex < animeIds.length) {
    const chunk = animeIds.slice(currentIndex, currentIndex + 20)
    currentIndex += 20

    const animeDetails = await Promise.all(
      chunk.map(async (id) => {
        try {
          const anime = await fetchAnimeById(id)
          return anime || null
        } catch (error) {
          console.error(`Failed to fetch anime ID ${id}:`, error)
          return null
        }
      })
    )

    // 過濾資料
    const validDetails = animeDetails.filter((anime): anime is Anime => anime !== null)
    // 在這裡使用 `await` 確保 `checkUrl` 在進行過濾前完成
    const filtered = await Promise.all(validDetails.map(async (anime) => {
      // 等待 checkUrl 結果
      const isImageValid = await checkUrl(anime.Image_URL)
      return !shouldExcludeAnime(anime) && isImageValid ? anime.id : null
    })).then(filteredResults => filteredResults.filter((id): id is number => id !== null))

    // 加入結果，最多 50 筆
    filteredIds.push(...filtered)

    if (filteredIds.length >= maxResults) break
  }

  return filteredIds.slice(0, maxResults)
}
