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
  console.log(currentAnime)
  
  if (!currentAnime) return <div>Loading...</div>
  return (
    <div className="flex items-center p-10 w-screen">
      <AnimeImage animeId={numberId} />
      <div className="flex flex-col mx-10 gap-3">
        <h2><b>Id: </b>{numberId}</h2>
        <h2><b>Name:</b> {currentAnime.Name}</h2>
        <p><strong>Score:</strong> {currentAnime.Score}</p>
        <p><strong>Category: </strong>{currentAnime.Category}</p>
        <p><strong>Description:</strong> {currentAnime.Description}</p>
        <p><strong>Type:</strong> {currentAnime.Type}</p>
        <p><strong>Episodes:</strong> {currentAnime.Episodes === -1 ? "Ongoing" : currentAnime.Episodes}</p>
        <p><strong>Air Date:</strong> {currentAnime.Air_Date}</p>
        <p><strong>End Date:</strong> {currentAnime.End_Date === "?" ? "Not yet ended" : currentAnime.End_Date}</p>
      </div>
    </div>
  )
}