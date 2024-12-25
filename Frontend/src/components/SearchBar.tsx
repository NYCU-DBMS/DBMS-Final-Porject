import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import AnimeGallery from "./AnimeGallery"
import { fetchAnimeBySort } from "@/fetchAPI/fetchAnime"

// pass data as props
type SearchBarProps = {
  data: string[]
}

export default function SearchBar({ data }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState(data)
  const [sort, setSort] = useState("score_asc")
  const [animeIds, setAnimeIds] = useState<number[]>([])

  const handleSearch = (e: any) => {
    const value = e.target.value
    setSearchTerm(value)
    setResults(data.filter((item) => item.toLowerCase().includes(value.toLowerCase())))
  }

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
          value={searchTerm}
          onChange={handleSearch}
          className="w-full"
        />
        <select name="sort" id="sort" className="dark:bg-gray-800" onChange={(e) => setSort(e.target.value)}>
          <option value="score_asc">score_asc</option>
          <option value="score_desc">score_desc</option>
          <option value="year_asc">year_asc</option>
          <option value="year_desc">year_desc</option>
        </select>
      </div>
      {/* <div>
        {results.length === 0 && searchTerm.length > 0 && <div>No results found</div>}
        {results.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div> */}
      <AnimeGallery animeIds={animeIds} />
    </div>
  )
}
