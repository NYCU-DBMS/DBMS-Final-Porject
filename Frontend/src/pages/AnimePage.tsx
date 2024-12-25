import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchAnimeById } from "@/fetchAPI/fetchAnime"
import AnimeImage from "@/components/AnimeImage"

interface Anime {
  Name: string
  Score: number
  Description: string
  Type: string
  Episodes: number
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
        <h2><b>id: </b>{numberId}</h2>
        <h2><b>Anime name:</b> {currentAnime.Name}</h2>
        <p><strong>Score:</strong> {currentAnime.Score}</p>
        <p><strong>Description:</strong> {currentAnime.Description}</p>
        <p><strong>Type:</strong> {currentAnime.Type}</p>
        <p><strong>Episodes:</strong> {currentAnime.Episodes === -1 ? "Ongoing" : currentAnime.Episodes}</p>
      </div>
    </div>
  )
}