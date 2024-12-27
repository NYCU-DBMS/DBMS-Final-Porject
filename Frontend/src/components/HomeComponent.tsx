import { useEffect, useState } from "react"
import AnimeGallery from "./AnimeGallery"
import { fetchAnimeBySort, fetchAnimeBySearchAndSort } from "@/api/anime"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CategoryButtons from "./CategoryButtons"

import { useSearchStore } from "@/store"

export default function HomeComponent() {
  const { 
    animeIds: savedAnimeIds, 
    searchKeyword: savedKeyword, 
    sortMethod: savedSort,
    setSearchResults,
    clearSearchResults 
  } = useSearchStore()

  const [sort, setSort] = useState(savedSort)
  const [search, setSearch] = useState(savedKeyword)
  const [animeIds, setAnimeIds] = useState<number[]>(savedAnimeIds)

  const handleSubmit = async () => {
    if (search === "") return
    try {
      const results = await fetchAnimeBySearchAndSort(search, sort)
      setAnimeIds(results)
      setSearchResults(results, search, sort)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  useEffect(() => {
    const fetchAnimes = async () => {
      if (search === "") {
        try {
          const results = await fetchAnimeBySort(sort)
          setAnimeIds(results)
          setSearchResults(results, "", sort)
        } catch (error) {
          console.error("Fetch error:", error)
        }
      }
    }
    fetchAnimes()
  }, [sort, search, setSearchResults])

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleClear = () => {
    setSearch("")
    setSort("score_desc")
    clearSearchResults()
  }

  return (
    <div>
      <div className="flex flex-col justify-center gap-5">
        <CategoryButtons />
        <div className="flex justify-center gap-5">
          <Input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search anime..."
            className="w-full"
          />
          <select 
            name="sort" 
            id="sort" 
            value={sort}
            className="dark:bg-gray-800 rounded-sm" 
            onChange={handleSortChange}
          >
            <option value="score_desc">Score (High to Low)</option>
            <option value="score_asc">Score (Low to High)</option>
            <option value="year_desc">Year (New to Old)</option>
            <option value="year_asc">Year (Old to New)</option>
          </select>
          <Button className="theme--dark" onClick={handleSubmit}>
            Search
          </Button>
          {(search !== "" || sort !== "score_desc") && (
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="dark:text-gray-300"
            >
              Clear
            </Button>
          )}
        </div>
        <AnimeGallery animeIds={animeIds} />
      </div>
    </div>
  )
}