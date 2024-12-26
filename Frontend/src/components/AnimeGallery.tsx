import { Link } from "react-router-dom"
import AnimeImage from "./AnimeImage"
import { useEffect, useState } from "react"
import { filterAnime } from "@/utils/filterAnime"

type AnimeIds = number[] | undefined

interface AnimeGalleryProps {
  animeIds: AnimeIds
}

export default function AnimeGallery({ animeIds }: AnimeGalleryProps) {
  // AnimeGallery.tsx:15 Uncaught TypeError: animeIds.slice is not a function at AnimeGallery

  if (!animeIds) {
    return <div>Loading...</div>
  }
  const [currAnimeIds, setCurrAnimeIds] = useState<AnimeIds>([])
  useEffect(() => {
    const fetchAndSetAnime = async () => {
      if (Array.isArray(animeIds)) {
        const shownAnimeIds = await filterAnime(animeIds)
        setCurrAnimeIds(shownAnimeIds)
      }
    }
    fetchAndSetAnime()
  }, [animeIds])
  if (!currAnimeIds) return <div>Loading...</div>
  return (
    <div className="gallery grid grid-cols-3 gap-4">
      {
        currAnimeIds.map((id) => (
          <div key={id} className="flex flex-col items-center">
            <Link to={`/anime/${id}`}>
              <AnimeImage animeId={id} />
            </Link>
          </div>
        ))
      }
    </div>
  )
}