import { useAnimeStore } from "@/store"
import { useEffect } from "react"
import { useParams } from "react-router-dom"


export default function AnimePage() {

  const { id } = useParams<{id: string}>()
  const { currentAnime, fetchAnime } = useAnimeStore()

  useEffect(() => {
    if (id) fetchAnime(id)
  }, [id, fetchAnime])

  if (!currentAnime) return <div>Loading...</div>

  console.log(currentAnime)
  
  return (
    <div className="flex items-center p-10 w-screen">
      <img src={currentAnime.Image_URL} alt={currentAnime.Name} className="w-[20%] max-h-screen max-w-full object-contain"/>
      <div className="flex flex-col mx-10 gap-3">
        <h2><b>Anime name:</b> {currentAnime.Name}</h2>
        <p><strong>Score:</strong> {currentAnime.Score}</p>
        <p><strong>Description:</strong> {currentAnime.Description}</p>
        <p><strong>Type:</strong> {currentAnime.Type}</p>
        <p><strong>Episodes:</strong> {currentAnime.Episodes === -1 ? "Ongoing" : currentAnime.Episodes}</p>
      </div>
    </div>
  )
}