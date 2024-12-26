import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchAnimeById } from "@/api/anime"
import AnimeImage from "@/components/AnimeImage"

interface Anime {
  Name: string
  Score: number
  Category: string[]
  Description: string
  Type: string
  Episodes: number
  Air_Date: string
  End_Date: string
  Image_URL: string
}

export default function AnimePage() {
  const { id } = useParams<{id: string}>()
  const numberId = Number(id)
  const [currentAnime, setCurrentAnime] = useState<Anime>()
  useEffect(() => {
    const fetchAndSetAnime = async () => {
      if (id) setCurrentAnime(await fetchAnimeById(numberId))
    }
    fetchAndSetAnime()
  }, [id, fetchAnimeById])
  
  if (!currentAnime) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse">Loading...</div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl mx-auto">
        <div className="w-full md:w-1/3">
          <AnimeImage animeId={numberId} />
        </div>
        <div className="flex flex-col gap-4 w-full md:w-2/3">
          <h1 className="text-2xl font-bold">{currentAnime.Name}</h1>
          <div className="grid grid-cols-1 gap-3">
            <p className="text-sm text-gray-600">ID: {numberId}</p>
            <p><strong>Score:</strong> {currentAnime.Score}</p>
            <p><strong>Category:</strong> {currentAnime.Category}</p>
            <p className="max-w-prose"><strong>Description:</strong> {currentAnime.Description}</p>
            <p><strong>Type:</strong> {currentAnime.Type}</p>
            <p><strong>Episodes:</strong> {currentAnime.Episodes === -1 ? "Ongoing" : currentAnime.Episodes}</p>
            <p><strong>Air Date:</strong> {currentAnime.Air_Date}</p>
            <p><strong>End Date:</strong> {currentAnime.End_Date === "?" ? "Not yet ended" : currentAnime.End_Date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
