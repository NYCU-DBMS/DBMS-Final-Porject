import { useAnimeStore } from "@/store"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { fetchAnimeById } from "@/fetchAPI/fetchAnime"
import AnimeImage from "@/components/AnimeImage"


export default function AnimePage() {

  const { currentAnime, setCurrentAnime } = useAnimeStore()
  const { id } = useParams<{id: string}>()
  const numberId = Number(id)
  useEffect(() => {
    const fetchAndSetAnime = async () => {
      if (id) setCurrentAnime(await fetchAnimeById(numberId))
    }
    fetchAndSetAnime()
  }, [id, fetchAnimeById])
  
  if (!currentAnime) return <div>No anime found</div>
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