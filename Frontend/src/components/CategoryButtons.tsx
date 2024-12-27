import { useState, useEffect } from 'react'
import { fetchCategory, fetchAnimeByCategoryAndSort } from '@/api/category'
import { ChevronDown } from 'lucide-react'

interface CategoryButtonsProps {
  onCategorySelect: (ids: number[], category: string) => void
  selectedCategory: string
  sortType: string
  isDisabled: boolean
}

const CategoryButtons = ({ onCategorySelect, selectedCategory, sortType, isDisabled }: CategoryButtonsProps) => {
  const [categories, setCategories] = useState<string[]>([])
  const MAX_BUTTONS = 9

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
    if (isDisabled) return
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
      category !== "" && selectedCategory === category && !isDisabled
        ? 'bg-blue-600 hover:bg-blue-700'
        : 'bg-gray-700 hover:bg-gray-600'
    } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`
  }

  const visibleCategories = categories.slice(0, MAX_BUTTONS)
  const remainingCategories = categories.slice(MAX_BUTTONS)
  
  // 檢查所選類別是否在剩餘類別中
  const isSelectedInRemainingCategories = remainingCategories.includes(selectedCategory)

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
              disabled={isDisabled}
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
              disabled={isDisabled}
            >
              {truncateText(category)}
            </button>
          ))}

          <div className="relative">
            <select
              className={`${getButtonClass(
                isSelectedInRemainingCategories ? selectedCategory : ""
              )} w-full appearance-none pr-10 text-center`}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue !== "") {
                  handleCategorySelect(selectedValue);
                }
              }}
              value={isSelectedInRemainingCategories ? selectedCategory : ""}
              disabled={isDisabled}
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