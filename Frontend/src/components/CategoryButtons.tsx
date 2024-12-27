import { useState, useEffect } from 'react'
import { fetchCategory, fetchAnimeByCategoryAndSort } from '@/api/category'
import { ChevronDown } from 'lucide-react'

interface CategoryButtonsProps {
  onCategorySelect: (ids: number[], category: string) => void;
  selectedCategory: string;
  sortType: string;
}

const CategoryButtons = ({ onCategorySelect, selectedCategory, sortType }: CategoryButtonsProps) => {
  const [categories, setCategories] = useState<string[]>([])
  const MAX_BUTTONS = 9
  // when the sortType changes, the animeIds will be updated based on the selected category and sortType
  // the code below does not handle the case where the sortType changes
  // updated code:

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await fetchCategory()
        setCategories(Array.isArray(fetchedCategories.genres) ? fetchedCategories.genres : [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [sortType])

  const handleCategorySelect = async (category: string) => {
    try {
      const newAnimeIds = await fetchAnimeByCategoryAndSort(category, sortType)
      if (Array.isArray(newAnimeIds)) {
        onCategorySelect(newAnimeIds, category)
      }
    } catch (error) {
      console.error('Error fetching anime by category:', error)
    }
  }

  const truncateText = (text: string, maxLength = 10) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const getButtonClass = (category: string) => {
    const baseClass = 'h-10 min-w-[120px] flex items-center justify-center rounded transition-all text-sm font-medium truncate px-4'
    return `${baseClass} ${
      selectedCategory === category 
        ? 'bg-blue-600 hover:bg-blue-700' 
        : 'bg-gray-700 hover:bg-gray-600'
    }`
  }

  const visibleCategories = categories.slice(0, MAX_BUTTONS)
  const remainingCategories = categories.slice(MAX_BUTTONS)

  return (
    <div className="text-white">
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {visibleCategories.slice(0, 5).map((category) => (
            <button
              key={category}
              className={getButtonClass(category)}
              title={category}
              onClick={() => handleCategorySelect(category)}
            >
              {truncateText(category)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          {visibleCategories.slice(5).map((category) => (
            <button
              key={category}
              className={getButtonClass(category)}
              title={category}
              onClick={() => handleCategorySelect(category)}
            >
              {truncateText(category)}
            </button>
          ))}

          <div className="relative">
            <select
              className={`${getButtonClass(selectedCategory)} w-full appearance-none pr-10 text-center`}
              onChange={(e) => handleCategorySelect(e.target.value)}
              value={selectedCategory}
            >
              <option value="">More</option>
              {remainingCategories.map((category) => (
                <option key={category} value={category}>
                  {truncateText(category)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryButtons