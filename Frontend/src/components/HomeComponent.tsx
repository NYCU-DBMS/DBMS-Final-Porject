import { useEffect, useState } from "react"
import AnimeGallery from "./AnimeGallery"
import { fetchAnimeBySort, fetchAnimeBySearchAndSort } from "@/api/anime"
import { fetchAnimeByCategoryAndSort } from "@/api/category"
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
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const handleSubmit = async () => {
    // two cases: search is empty and selectedCategory is empty
    // if search is empty and selectedCategory is not empty, we should fetch anime by category
    // if search is not empty, we should fetch anime by search

    if (search === "" && selectedCategory !== "") {
      try {
        const results = await fetchAnimeByCategoryAndSort(selectedCategory, sort)
        setAnimeIds(results)
        setSearchResults(results, "", sort)
      } catch (error) {
        console.error("Category error:", error)
      }
    } else {
      try {
        const results = await fetchAnimeBySearchAndSort(search, sort)
        setAnimeIds(results)
        setSearchResults(results, search, sort)
        setSelectedCategory("")
      } catch (error) {
        console.error("Search error:", error)
      }
    }
  }

  useEffect(() => {
    const fetchAnimes = async () => {
      if (search === "" && selectedCategory === "") {
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
  }, [sort, search, setSearchResults, selectedCategory])

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleClear = () => {
    setSearch("")
    setSort("score_desc")
    setSelectedCategory("")
    clearSearchResults()
  }

  const handleCategorySelect = (newIds: number[], category: string) => {
    setAnimeIds(newIds)
    setSelectedCategory(category)
    setSearchResults(newIds, "", sort) // Update store with category results
    setSearch("") // Clear search when category is selected
  }


  return (
    <div>
      <div className="flex flex-col justify-center gap-5">
        <CategoryButtons 
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
          sortType={sort}
          isDisabled={search !== ""}
        />
        <div className="flex justify-center gap-5">
          <Input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search anime..."
            className="w-full"
            disabled={selectedCategory !== ""}
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
          {(search !== "" || sort !== "score_desc" || selectedCategory !== "") && (
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