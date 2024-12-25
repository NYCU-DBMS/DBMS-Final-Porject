import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import AnimeGallery from "./AnimeGallery"
import { fetchAnimeBySort } from "@/fetchAPI/fetchAnime"


export default function AnimeDisplayed() {
  const [sort, setSort] = useState("score_asc")
  const [animeIds, setAnimeIds] = useState<number[]>([])

  useEffect(() => {
    const fetchAnimeIds = async () => {
      setAnimeIds(await fetchAnimeBySort(sort))
    }
    fetchAnimeIds()
  }, [sort])

  return (
    <div>
      <div className="flex justify-center gap-5">
        <Input
          type="text"
          placeholder="Search anime..."
          className="w-full"
        />
        <select name="sort" id="sort" className="dark:bg-gray-800" onChange={(e) => setSort(e.target.value)}>
          <option value="score_asc">score_asc</option>
          <option value="score_desc">score_desc</option>
          <option value="year_asc">year_asc</option>
          <option value="year_desc">year_desc</option>
        </select>
      </div>
      <AnimeGallery animeIds={animeIds} />
    </div>
  )
}
