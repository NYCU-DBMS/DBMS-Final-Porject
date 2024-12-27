import { Link } from "react-router-dom"
import AnimeImage from "./AnimeImage"
import { useEffect, useState } from "react"
import { filterAnime } from "@/utils/filterAnime"

type AnimeIds = number[] | undefined

interface AnimeGalleryProps {
  animeIds: AnimeIds
}

export default function AnimeGallery({ animeIds }: AnimeGalleryProps) {
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
    <div className="gallery grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {
        currAnimeIds.map((id) => (
          <div key={id} className="group relative flex flex-col items-center transform transition-all duration-300 hover:scale-105">
            <Link to={`/anime/${id}`} className="w-full">
              <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-[3/4]">
                  <AnimeImage animeId={id} />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
              </div>
            </Link>
          </div>
        ))
      }
    </div>
  )
}