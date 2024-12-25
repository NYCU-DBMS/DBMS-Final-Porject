import { useState, useEffect } from "react"
import { fetchAnimeById } from "@/api/anime"

interface AnimeImageProps {
  animeId: number
}

export default function AnimeImage({animeId}: AnimeImageProps) {
  interface Anime {
    Image_URL: string
    Name: string
  }

  const [anime, setAnime] = useState<Anime | null>(null)
  useEffect(() => {
    const fetchAndSetAnime = async () => {
      if (animeId) setAnime(await fetchAnimeById(animeId))
    }
    fetchAndSetAnime()
  }, [animeId])
  if (!anime) return <div>Loading...</div>

  return (
    <img src={anime.Image_URL} alt={anime.Name} className="w-full max-h-screen max-w-full object-contain"/>
  )
}
  