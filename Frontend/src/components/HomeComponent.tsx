import { useEffect, useState } from "react"
import AnimeGallery from "./AnimeGallery"
import { fetchAnimeBySort } from "@/fetchAPI/fetchAnime"
import { fetchAnimeBySearchAndSort } from "@/fetchAPI/fetchAnime"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


export default function HomeComponent() {
  const [sort, setSort] = useState("score_asc")
  const [search, setSearch] = useState("")
  const [animeIds, setAnimeIds] = useState<number[]>([])
  const handleSubmit = async () => {
    if (search === "") return
    console.log(search, sort)
    console.log(await fetchAnimeBySearchAndSort(search, sort))
    setAnimeIds(await fetchAnimeBySearchAndSort(search, sort))
  }

  useEffect(() => {
    const fetchAnimes = async () => {
      if (search === "") setAnimeIds(await fetchAnimeBySort(sort))
    }
    fetchAnimes()
  }, [sort, search])

  return (
    <div>
      <div className="flex flex-col justify-center gap-5">
        <div className="flex justify-center gap-5">
          <Input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anime..."
            className="w-full"
          />
          <select name="sort" id="sort" className="dark:bg-gray-800 rounded-sm" onChange={(e) => setSort(e.target.value)}>
            <option value="score_asc">score_asc</option>
            <option value="score_desc">score_desc</option>
            <option value="year_asc">year_asc</option>
            <option value="year_desc">year_desc</option>
          </select>
          <Button className="theme--dark" onClick={handleSubmit}>submit</Button>
        </div>
        <AnimeGallery animeIds={animeIds} />
      </div>
    </div>
  )
}
