import { Link } from "react-router-dom"
import AnimeImage from "./AnimeImage"
import { useEffect, useState } from "react"

interface AnimeGalleryProps {
  animeIds: number[]
}

export default function AnimeGallery({ animeIds }: AnimeGalleryProps) {
  if (animeIds.length === 0) {
    return <div>Loading...</div>
  }
  const [currAnimeIds, setCurrAnimeIds] = useState(animeIds.slice(0, 50))
  useEffect(() => {
    setCurrAnimeIds(animeIds.slice(0, 50))
  }, [animeIds])
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