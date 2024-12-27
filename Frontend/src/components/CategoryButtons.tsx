import { useState, useEffect } from 'react'
import { fetchCategory } from '@/api/category'
import { ChevronDown } from 'lucide-react'

const CategoryButtons = () => {
  const [categories, setCategories] = useState([])
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
  }, [])

  const visibleCategories = categories.slice(0, MAX_BUTTONS)
  const remainingCategories = categories.slice(MAX_BUTTONS)

  // Function to truncate text
  const truncateText = (text: string, maxLength = 10) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  // Common button styles with truncation
  const buttonBaseClass =
    'h-10 min-w-[120px] flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 transition-all text-sm font-medium truncate px-4'

  return (
    <div className="text-white">
      <div className="space-y-4">
        {/* First row - 5 buttons */}
        <div className="grid grid-cols-5 gap-4">
          {visibleCategories.slice(0, 5).map((category) => (
            <button
              key={category}
              className={buttonBaseClass}
              title={category} // Show full text on hover
            >
              {truncateText(category)}
            </button>
          ))}
        </div>

        {/* Second row - 4 buttons + select */}
        <div className="grid grid-cols-5 gap-4">
          {visibleCategories.slice(5).map((category) => (
            <button
              key={category}
              className={buttonBaseClass}
              title={category} // Show full text on hover
            >
              {truncateText(category)}
            </button>
          ))}

          {/* Select with custom arrow */}
          <div className="relative">
            <select
              className={`${buttonBaseClass} w-full appearance-none pr-10 text-center`}
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